/**
 * AI Knowledge Hub — Auth system
 * Login, register, session, password reset (localStorage-based)
 */

(function () {
  const USERS_KEY = "authUsers";
  const SESSION_KEY = "authSession";
  const RESET_TOKENS_KEY = "authResetTokens";
  const RATE_LIMIT_KEY = "authResetRateLimit";
  const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
  const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
  const RATE_LIMIT_MAX = 5;

  function getUsers() {
    try {
      const j = localStorage.getItem(USERS_KEY);
      return j ? JSON.parse(j) : [];
    } catch (_) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getResetTokens() {
    try {
      const j = localStorage.getItem(RESET_TOKENS_KEY);
      return j ? JSON.parse(j) : [];
    } catch (_) {
      return [];
    }
  }

  function saveResetTokens(tokens) {
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
  }

  function generateSalt() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  function generateToken() {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function hashPassword(password, salt) {
    const enc = new TextEncoder();
    const data = enc.encode(password + salt);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  window.Auth = {
    async register(email, password) {
      const emailNorm = (email || "").trim().toLowerCase();
      if (!emailNorm || !password) {
        return { ok: false, error: "Email and password required." };
      }
      if (password.length < 8) {
        return { ok: false, error: "Password must be at least 8 characters." };
      }
      const users = getUsers();
      if (users.some((u) => u.email === emailNorm)) {
        return { ok: false, error: "An account with this email already exists." };
      }
      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);
      const isFirstUser = users.length === 0;
      users.push({
        id: crypto.randomUUID(),
        email: emailNorm,
        passwordHash,
        salt,
        createdAt: Date.now(),
        role: isFirstUser ? "admin" : "limited",
      });
      saveUsers(users);
      return { ok: true };
    },

    async login(email, password) {
      const emailNorm = (email || "").trim().toLowerCase();
      if (!emailNorm || !password) {
        return { ok: false, error: "Email and password required." };
      }
      const users = getUsers();
      const user = users.find((u) => u.email === emailNorm);
      if (!user) {
        return { ok: false, error: "Invalid email or password." };
      }
      const hash = await hashPassword(password, user.salt);
      if (hash !== user.passwordHash) {
        return { ok: false, error: "Invalid email or password." };
      }
      const session = {
        userId: user.id,
        email: user.email,
        role: user.role || "admin",
        expiresAt: Date.now() + SESSION_EXPIRY_MS,
      };
      if (!user.role) {
        user.role = "admin";
        saveUsers(users);
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { ok: true };
    },

    logout() {
      localStorage.removeItem(SESSION_KEY);
      window.dispatchEvent(new CustomEvent("auth-changed"));
    },

    getSession() {
      try {
        const j = localStorage.getItem(SESSION_KEY);
        if (!j) return null;
        const s = JSON.parse(j);
        if (s.expiresAt < Date.now()) {
          localStorage.removeItem(SESSION_KEY);
          return null;
        }
        return s;
      } catch (_) {
        return null;
      }
    },

    isLoggedIn() {
      return !!this.getSession();
    },

    isAdmin() {
      const s = this.getSession();
      return s && s.role === "admin";
    },

    async requestPasswordReset(email) {
      const emailNorm = (email || "").trim().toLowerCase();
      if (!emailNorm) {
        return { ok: false, error: "Email required." };
      }
      try {
        const limitData = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || "{}");
        const entry = limitData[emailNorm];
        const now = Date.now();
        if (entry) {
          if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
            delete limitData[emailNorm];
          } else if (entry.count >= RATE_LIMIT_MAX) {
            const waitMin = Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW_MS - now) / 60000);
            return { ok: false, error: "Too many reset requests. Try again in about " + waitMin + " minutes." };
          }
        }
      } catch (_) {}
      const users = getUsers();
      if (!users.some((u) => u.email === emailNorm)) {
        return { ok: true }; // Don't reveal whether email exists
      }
      const token = generateToken();
      const tokens = getResetTokens().filter((t) => t.expiresAt > Date.now());
      tokens.push({
        email: emailNorm,
        token,
        expiresAt: Date.now() + TOKEN_EXPIRY_MS,
      });
      saveResetTokens(tokens);
      try {
        const limitData = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || "{}");
        const entry = limitData[emailNorm] || { count: 0, windowStart: Date.now() };
        if (Date.now() - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
          entry.count = 0;
          entry.windowStart = Date.now();
        }
        entry.count = (entry.count || 0) + 1;
        limitData[emailNorm] = entry;
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(limitData));
      } catch (_) {}
      const base = window.location.href.replace(/[^/]*$/, "");
      const resetUrl = base + "reset-password.html?token=" + token;
      return { ok: true, resetUrl };
    },

    async resetPassword(token, newPassword) {
      if (!token || !newPassword) {
        return { ok: false, error: "Token and new password required." };
      }
      if (newPassword.length < 8) {
        return { ok: false, error: "Password must be at least 8 characters." };
      }
      const tokens = getResetTokens();
      const now = Date.now();
      const found = tokens.find(
        (t) => t.token === token && t.expiresAt > now
      );
      if (!found) {
        return { ok: false, error: "Reset link expired or invalid." };
      }
      const users = getUsers();
      const user = users.find((u) => u.email === found.email);
      if (!user) {
        return { ok: false, error: "Account not found." };
      }
      const salt = generateSalt();
      user.passwordHash = await hashPassword(newPassword, salt);
      user.salt = salt;
      saveUsers(users);
      saveResetTokens(tokens.filter((t) => t.token !== token));
      return { ok: true };
    },

    validateResetToken(token) {
      const tokens = getResetTokens();
      const now = Date.now();
      return !!tokens.find((t) => t.token === token && t.expiresAt > now);
    },
  };
})();
