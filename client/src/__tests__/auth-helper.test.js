import { describe, it, expect } from "vitest";
import auth from "../lib/auth-helper.js";

describe("auth-helper (session storage helpers)", () => {
  it("returns false when nobody is signed in", () => {
    expect(auth.isAuthenticated()).toBe(false);
  });

  it("saves and reads back the token and user", () => {
    const session = { token: "abc.def.ghi", user: { name: "Test", role: "user" } };
    auth.authenticate(session);
    expect(auth.isAuthenticated()).toEqual(session);
  });

  it("clears the session on sign out", () => {
    auth.authenticate({ token: "t", user: { role: "admin" } });
    auth.clearJWT();
    expect(auth.isAuthenticated()).toBe(false);
  });
});
