import { createContext, useCallback, useContext, useMemo, useState } from "react";
import auth from "../lib/auth-helper.js";
import { authApi } from "../lib/api.js";

/**
 * AuthContext: shares "who is signed in" with the whole component tree (React state management).
 * Instead of passing the user down through every component as props, any component can call
 * useAuth() to read the session or to sign in / sign out. The session is also saved in
 * sessionStorage (auth-helper.js) so a page refresh keeps the visitor signed in.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Lazy initial state: read the saved session once, when the app first loads
  const [session, setSession] = useState(() => auth.isAuthenticated() || null);

  /** signIn: POST /auth/signin, then keep the token and user in state + sessionStorage. */
  const signIn = useCallback(async (email, password) => {
    const data = await authApi.signin({ email, password });
    auth.authenticate(data);
    setSession(data);
    return data.user;
  }, []);

  /** signOut: tell the server to clear its cookie, then forget the session on the client. */
  const signOut = useCallback(async () => {
    try {
      await authApi.signout();
    } catch {
      /* even if the server cannot be reached, the visitor must still be signed out locally */
    }
    auth.clearJWT();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isSignedIn: Boolean(session?.token),
      isAdmin: session?.user?.role === "admin",
      signIn,
      signOut,
    }),
    [session, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>.");
  return context;
}
