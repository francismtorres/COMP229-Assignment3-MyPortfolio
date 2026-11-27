import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const signIn = vi.fn();
vi.mock("../context/AuthContext.jsx", () => ({ useAuth: () => ({ signIn }) }));

import Signin from "../pages/Signin.jsx";

const renderSignin = () => render(<MemoryRouter><Signin /></MemoryRouter>);

describe("Signin page", () => {
  it("renders the email and password fields and a Sign in button", () => {
    renderSignin();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows validation errors and does not call the API when the form is empty", async () => {
    signIn.mockClear();
    renderSignin();
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your password.")).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("calls signIn with the trimmed email and the password for valid input", async () => {
    signIn.mockClear();
    signIn.mockResolvedValue({});
    renderSignin();
    await userEvent.type(screen.getByLabelText("Email address"), "  user@example.com ");
    await userEvent.type(screen.getByLabelText("Password"), "secret123");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(signIn).toHaveBeenCalledWith("user@example.com", "secret123");
  });

  it("shows the server error when sign in fails", async () => {
    signIn.mockRejectedValue(new Error("Email and password don't match."));
    renderSignin();
    await userEvent.type(screen.getByLabelText("Email address"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Email and password don't match.");
  });
});
