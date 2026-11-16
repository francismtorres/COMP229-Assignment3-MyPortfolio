/**
 * auth-helper.js
 * Client-side helpers that save, read and delete the signed-in user's credentials
 * (Week 6 / Week 8 slides: "Managing auth state").
 *
 * The JWT and the user (name, email, role) are kept in sessionStorage under the key "jwt",
 * so the visitor stays signed in while the tab is open and is signed out when it closes.
 * Every access is wrapped in try/catch because browsers can block storage (private windows).
 */
const STORAGE_KEY = "jwt";

const auth = {
  /** Returns { token, user } when someone is signed in, otherwise false. */
  isAuthenticated() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  },

  /** Saves the response of POST /auth/signin ({ token, user }). */
  authenticate(jwt) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(jwt));
    } catch {
      /* storage unavailable: the session then lasts only until the page reloads */
    }
  },

  /** Removes the saved credentials (sign out). */
  clearJWT() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clear */
    }
  },
};

export default auth;
