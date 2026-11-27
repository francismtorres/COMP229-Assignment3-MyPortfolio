import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

let mockAuth = {};
vi.mock("../context/AuthContext.jsx", () => ({ useAuth: () => mockAuth }));

import PrivateRoute from "../components/PrivateRoute.jsx";

const renderRoute = (adminOnly) =>
  render(
    <MemoryRouter initialEntries={["/secret"]}>
      <Routes>
        <Route path="/signin" element={<p>Sign in page</p>} />
        <Route path="/secret" element={<PrivateRoute adminOnly={adminOnly}><p>Secret content</p></PrivateRoute>} />
      </Routes>
    </MemoryRouter>
  );

describe("PrivateRoute (route protection)", () => {
  it("redirects a visitor who is not signed in to /signin", () => {
    mockAuth = { isSignedIn: false, isAdmin: false };
    renderRoute(false);
    expect(screen.getByText("Sign in page")).toBeInTheDocument();
  });

  it("lets a signed-in user see a normal protected page", () => {
    mockAuth = { isSignedIn: true, isAdmin: false };
    renderRoute(false);
    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });

  it("shows Access denied to a normal user on an admin-only page", () => {
    mockAuth = { isSignedIn: true, isAdmin: false };
    renderRoute(true);
    expect(screen.getByText("Access denied")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("lets an admin see an admin-only page", () => {
    mockAuth = { isSignedIn: true, isAdmin: true };
    renderRoute(true);
    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });
});
