import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const create = vi.fn().mockResolvedValue({});
vi.mock("../lib/api.js", () => ({ contactsApi: { create: (...args) => create(...args) } }));

import Contact from "../pages/Contact.jsx";

const renderContact = () => render(<MemoryRouter><Contact /></MemoryRouter>);

describe("Contact page form", () => {
  it("shows an error for every required field when submitted empty", async () => {
    create.mockClear();
    renderContact();
    await userEvent.click(screen.getByRole("button", { name: /send message/i }));
    expect(screen.getByText("Please enter your first name.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your last name.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a valid phone number.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Please write a message of at least 10 characters.")).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects a message that is too short", async () => {
    renderContact();
    await userEvent.type(screen.getByLabelText("Message"), "Hi");
    await userEvent.click(screen.getByRole("button", { name: /send message/i }));
    expect(screen.getByText("Please write a message of at least 10 characters.")).toBeInTheDocument();
  });

  it("sends a valid message to the API with the field names the back end expects", async () => {
    create.mockClear();
    renderContact();
    await userEvent.type(screen.getByLabelText("First name"), "Demo");
    await userEvent.type(screen.getByLabelText("Last name"), "Visitor");
    await userEvent.type(screen.getByLabelText("Contact number"), "4165550123");
    await userEvent.type(screen.getByLabelText("Email address"), "demo@example.com");
    await userEvent.type(screen.getByLabelText("Message"), "Hello Francis, nice portfolio!");
    await userEvent.click(screen.getByRole("button", { name: /send message/i }));
    expect(create).toHaveBeenCalledWith({
      firstname: "Demo",
      lastname: "Visitor",
      email: "demo@example.com",
      contactNumber: "4165550123",
      message: "Hello Francis, nice portfolio!",
    });
  });
});
