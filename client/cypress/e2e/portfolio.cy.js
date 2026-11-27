/// <reference types="cypress" />

// End-to-end tests for the deployed portfolio (React front end on Vercel + Express API on Render).
// The tests behave like a real visitor: they click, type and read what is on screen.

describe("Portfolio site - public visitor", () => {
  it("loads the home page", () => {
    cy.visit("/");
    cy.title().should("contain", "Francis Torres");
    cy.contains("h1", "Hi, I'm Francis").should("be.visible");
    cy.contains("a", "View my projects").should("be.visible");
  });

  it("navigates to every main page from the navigation bar", () => {
    cy.visit("/");
    const pages = [
      { link: "About Me", path: "/about" },
      { link: "Projects", path: "/projects", heading: "Selected work" },
      { link: "Education", path: "/education" },
      { link: "Services", path: "/services" },
      { link: "Contact Me", path: "/contact", heading: "Let's talk" },
    ];
    pages.forEach(({ link, path, heading }) => {
      cy.get("nav[aria-label='Main navigation']").contains("a", link).click();
      cy.location("pathname").should("eq", path);
      cy.get("h1").should("be.visible");
      if (heading) cy.contains("h1", heading);
    });
  });

  it("shows the project list, including the live section from the database", () => {
    cy.visit("/projects");
    cy.contains("h2", "More projects, live from the database").scrollIntoView().should("be.visible");
    // A visitor (not signed in) cannot manage projects
    cy.contains("button", "Add project").should("not.exist");
  });

  it("shows a friendly 404 page for an unknown address", () => {
    cy.visit("/this-page-does-not-exist");
    cy.contains("h1", "That page does not exist").should("be.visible");
  });
});

describe("Contact form", () => {
  beforeEach(() => cy.visit("/contact"));

  it("shows validation errors when the empty form is submitted", () => {
    cy.contains("button", /send message/i).click();
    cy.contains("Please enter your first name.").should("be.visible");
    cy.contains("Please enter your last name.").should("be.visible");
    cy.contains("Please enter a valid phone number.").should("be.visible");
    cy.contains("Please enter a valid email address.").should("be.visible");
    cy.contains("Please write a message of at least 10 characters.").should("be.visible");
  });

  it("submits a valid message and shows the thank-you banner on the home page", () => {
    // The API call is stubbed so the test never writes to the real database
    cy.intercept("POST", "/api/contacts", { statusCode: 201, body: { _id: "test-id" } }).as("saveContact");
    cy.get("#firstName").type("Cypress");
    cy.get("#lastName").type("Tester");
    cy.get("#contactNumber").type("4165550123");
    cy.get("#emailAddress").type("cypress.tester@example.com");
    cy.get("#message").type("Hello Francis, this message comes from an automated E2E test.");
    cy.contains("button", /send message/i).click();
    cy.wait("@saveContact").its("request.body").should((body) => {
      expect(body.firstname).to.eq("Cypress");
      expect(body.email).to.eq("cypress.tester@example.com");
    });
    cy.location("pathname").should("eq", "/");
    cy.contains("Thank you, Cypress!").should("be.visible");
  });
});

describe("Authentication and role-based access", () => {
  it("validates the sign-up form (mismatched passwords)", () => {
    cy.visit("/signup");
    cy.get("#signup-name").type("Test User");
    cy.get("#signup-email").type("test.user@example.com");
    cy.get("#signup-password").type("Secret123");
    cy.get("#signup-confirmPassword").type("Different123");
    cy.contains("button", /sign up|create account/i).click();
    cy.contains("Passwords do not match.").should("be.visible");
  });

  it("rejects a wrong email/password combination", () => {
    cy.visit("/signin");
    cy.get("#signin-email").type("nobody@example.com");
    cy.get("#signin-password").type("not-a-real-password");
    cy.contains("button", "Sign in").click();
    cy.get("[role='alert']").should("contain", "don't match");
    cy.location("pathname").should("eq", "/signin");
  });

  it("redirects a signed-out visitor from an admin page to the sign-in page", () => {
    cy.visit("/admin/users");
    cy.location("pathname").should("eq", "/signin");
    cy.contains("Please sign in to view that page.").should("be.visible");
  });

  it("blocks a normal user from the admin pages (Access denied)", () => {
    // A signed-in normal user is simulated with a saved session; the server still enforces
    // roles on every API call, so this only checks what the React route guard shows.
    cy.visit("/", {
      onBeforeLoad(win) {
        win.sessionStorage.setItem(
          "jwt",
          JSON.stringify({ token: "fake-token", user: { name: "Normal User", email: "u@example.com", role: "user" } })
        );
      },
    });
    cy.visit("/admin/users", {
      onBeforeLoad(win) {
        win.sessionStorage.setItem(
          "jwt",
          JSON.stringify({ token: "fake-token", user: { name: "Normal User", email: "u@example.com", role: "user" } })
        );
      },
    });
    cy.contains("Access denied").should("be.visible");
    cy.contains("This page is only available to the portfolio administrator.").should("be.visible");
  });
});
