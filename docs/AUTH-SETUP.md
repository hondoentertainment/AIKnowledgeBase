# Auth Setup Guide

AI Knowledge Hub uses device-local auth (localStorage). This guide covers Google OAuth setup and session behavior.

## Google Sign-In Setup

To enable "Sign in with Google" on the login and register pages:

### 1. Create OAuth credentials

1. Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create or select a project
3. Click **Create Credentials** → **OAuth client ID**
4. If prompted, configure the OAuth consent screen (external for public use)
5. Choose **Web application** as the application type
6. Add your app origins under **Authorized JavaScript origins**:
   - `https://your-domain.com` (production)
   - `http://localhost:8080` (local development, if needed)
7. Copy the **Client ID** (format: `123456789-abc.apps.googleusercontent.com`)

### 2. Add the Client ID in Admin

1. Log in to your AI Knowledge Hub at `admin.html`
2. Scroll to **Settings** → **Google OAuth Client ID**
3. Paste your Client ID and click **Save**
4. The Client ID is stored in localStorage on this device

### 3. Use it

- On `login.html` and `register.html`, the "Sign in with Google" button will appear
- First-time Google users are auto-registered; returning users sign in

---

## Session & Login Behavior

| Setting         | Value   | Notes                                                  |
|----------------|---------|--------------------------------------------------------|
| Session length | 7 days  | Sessions expire 7 days after login                     |
| Expiry notice  | &lt; 2 days | When logged in, the header shows "Session expires in X hours/days" |
| Storage        | Device only | Accounts and data stay in this browser/device      |

### Session expiry

- When your session has fewer than 2 days left, a notice appears in the header
- Expired sessions redirect to login when accessing Admin
- There is no "Remember me" toggle; all sessions last 7 days by design

### Data locality

- Accounts, custom tools, and profile data are stored in browser localStorage
- Use **Profiles** to export a backup; use **Admin → Export** for custom tools
- No data is sent to external servers except Google OAuth during sign-in
