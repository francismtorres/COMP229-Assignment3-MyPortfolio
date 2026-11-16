# MyPortfolio REST API reference (Assignment 3)

Base URL (development): `http://localhost:3000`  
All request and response bodies are JSON. Protected routes need a JWT, sent as
`Authorization: Bearer <token>` (or via the `t` cookie set by sign-in).

## Roles

Every account has a `role`: **`user`** (the default) or **`admin`**.

| Role | Can do |
|------|--------|
| Visitor (no account) | Read projects and qualifications, submit the contact form, sign up, sign in |
| `user` | Everything a visitor can do, plus read and edit their **own** account |
| `admin` | Everything: create, update and delete projects, qualifications, contacts and users; change roles; read all contacts and users |

- Anyone who signs up (`POST /api/users`) becomes a `user`. A `role` sent in the sign-up body is ignored.
- The admin account is stored in MongoDB by `npm run seed:admin` (credentials come from `.env`).
- The role is read from the database on every protected request, so promoting or demoting an account takes effect immediately.

## Authentication

| Method | URL | Access | Action |
|--------|-----|--------|--------|
| POST | `/auth/signin` | public | Check `email` + `password`, return `{ token, user }` (user includes `role`) and set the `t` cookie |
| GET | `/auth/signout` | public | Clear the `t` cookie |

Sign-in example body: `{ "email": "admin@portfolio.local", "password": "Admin@12345" }`

Tokens are signed with `JWT_SECRET` (HS256) and expire after `JWT_EXPIRES_IN` (default 1 day).
JWTs are stateless: sign-out clears the cookie, and the React app also discards the token it saved in `sessionStorage`.

## Contacts  (`/api/contacts`)

Fields: `firstname`, `lastname`, `email` (required strings), `contactNumber` and `message` (optional strings),
`created` (Date, automatic). The two optional fields come from the updated Contact form; the
Assignment 2 requests with only `firstname`, `lastname` and `email` still work.

| Method | URL | Access | Action |
|--------|-----|--------|--------|
| POST | `/api/contacts` | **public** (the site's contact form) | Add new contact |
| GET | `/api/contacts` | **admin** | Get all contacts |
| GET | `/api/contacts/:id` | **admin** | Get contact by id |
| PUT | `/api/contacts/:id` | **admin** | Update contact by id |
| DELETE | `/api/contacts/:id` | **admin** | Remove contact by id |
| DELETE | `/api/contacts` | **admin** | Remove all contacts |

## Projects  (`/api/projects`)

Fields: `title`, `firstname`, `lastname`, `email` (strings), `completion` (Date), `description` (string)

| Method | URL | Access | Action |
|--------|-----|--------|--------|
| GET | `/api/projects` | **public** | Get all projects |
| GET | `/api/projects/:id` | **public** | Get project by id |
| POST | `/api/projects` | **admin** | Add new project |
| PUT | `/api/projects/:id` | **admin** | Update project by id |
| DELETE | `/api/projects/:id` | **admin** | Remove project by id |
| DELETE | `/api/projects` | **admin** | Remove all projects |

## Qualifications  (`/api/qualifications`)

Same fields and access rules as projects.

| Method | URL | Access | Action |
|--------|-----|--------|--------|
| GET | `/api/qualifications` | **public** | Get all qualifications |
| GET | `/api/qualifications/:id` | **public** | Get qualification by id |
| POST | `/api/qualifications` | **admin** | Add new qualification |
| PUT | `/api/qualifications/:id` | **admin** | Update qualification by id |
| DELETE | `/api/qualifications/:id` | **admin** | Remove qualification by id |
| DELETE | `/api/qualifications` | **admin** | Remove all qualifications |

## Users  (`/api/users`)

Fields: `name` (string), `email` (string, unique), `password` (string, stored as a salted scrypt hash),
`role` (`"user"` or `"admin"`), `created` (Date, automatic), `updated` (Date, set on update)

| Method | URL | Access | Action |
|--------|-----|--------|--------|
| POST | `/api/users` | **public** (sign up) | Add new user (always role `user`) |
| GET | `/api/users` | **admin** | Get all users |
| GET | `/api/users/:id` | own account, or **admin** | Get user by id |
| PUT | `/api/users/:id` | own account, or **admin** | Update user by id. Only an admin can change `role` |
| DELETE | `/api/users/:id` | own account, or **admin** | Remove user by id. Admin accounts cannot be deleted (403) |
| DELETE | `/api/users` | **admin** | Remove all **non-admin** users |

Passwords are never returned by any endpoint.

## Status codes

| Code | Meaning |
|------|---------|
| 200 | Success (read, update, delete) |
| 201 | Created |
| 400 | Validation error, malformed JSON or invalid id |
| 401 | Missing, invalid or expired token; wrong email/password; token belongs to a deleted account |
| 403 | Signed in, but not allowed (not an admin, or someone else's account) |
| 404 | Record or route not found |
| 500 | Unexpected server error |

Error responses look like `{ "error": "Readable message." }`.
