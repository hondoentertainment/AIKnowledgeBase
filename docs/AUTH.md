# Authentication Architecture

AI Knowledge Hub uses **device-local (localStorage) authentication**. This is suitable for personal use, demos, and single-device deployments.

## Local / Demo Mode

- **Accounts**, **sessions**, **custom tools**, and **profile data** are stored in the browser’s `localStorage` on this device only.
- Data is **not** synced across devices or browsers.
- There is **no backend server** for auth. Passwords are hashed with SHA-256 + salt and stored locally.
- Use **Profiles** to export a backup. Use **Admin → Export** for custom tools.

This setup is intentional for:
- Quick local setup
- No hosting or API costs
- Privacy (no data sent except Google OAuth during sign-in)

## Production Migration Plan (Firebase)

For production use with multi-device sync and persistent accounts:

### Option A: Firebase Authentication + Firestore

1. **Firebase Auth** – Replace localStorage auth with:
   - `signInWithEmailAndPassword`
   - `createUserWithEmailAndPassword`
   - `signInWithPopup` (Google)
   - `sendPasswordResetEmail`

2. **Firestore** – Store per-user data:
   - `users/{userId}/stack` – array of item titles
   - `users/{userId}/ratings` – `{ [title]: number }`
   - `users/{userId}/directUse` – array
   - `users/{userId}/wantToTry` – array
   - `users/{userId}/profiles` – optional profile objects

3. **Migration path**:
   - Add Firebase SDK and config (env vars for API keys)
   - Create `auth-firebase.js` that mirrors `Auth` API
   - Feature-flag: use Firebase when `FIREBASE_ENABLED`, else local
   - On first Firebase login, optionally import from localStorage if `ProfileStore` has data

### Option B: Supabase

Same pattern as Firebase but with Supabase Auth + Postgres/Storage.

### Option C: Custom Backend

- REST or GraphQL API for auth (JWT) and user data
- Requires hosting (e.g. Vercel, Railway) and a database
- `auth.js` would call `fetch()` instead of localStorage

---

## Related Documentation

- [AUTH-SETUP.md](./AUTH-SETUP.md) – Google OAuth setup, session behavior, data locality
- [auth-setup.html](../auth-setup.html) – In-app setup guide
