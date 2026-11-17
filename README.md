# MyPortfolio - Full-Stack MERN Portfolio (Assignment 3)

**Course:** COMP229 - Web Application Development, Assignment 3 (Integrating the Backend APIs to the Frontend)  
**Author:** Francis Torres  
**Stack:** React 19 + Vite + React Router (front end) / Node.js + Express 5 + Mongoose + MongoDB (back end) / JWT authentication  
**Earlier work:** Assignment 1 front end - https://francis-torres-portfolio.vercel.app - and Assignment 2 REST API (this repository continues it)

## What is new in Assignment 3

- **Sign up and Sign in forms** (`/signup`, `/signin`) and **Sign out**, using JWT. The token and user are kept in `sessionStorage` and shared through a React context.
- **Two roles: `user` and `admin`.** Anyone can sign up (always as `user`). The admin account is stored in MongoDB by a seed script.
- **Admin CRUD in the React app** for Projects, Education (qualifications) and Contacts, plus a Users page. Normal users and visitors can only read.
- **Updated Contact form** (React controlled form) that saves first name, last name, email, phone and message to MongoDB through `POST /api/contacts`.
- **Protected routes** on both sides: `PrivateRoute` in React and `requireSignin` / `requireAdmin` in Express.
- **API consumption** through one module (`client/src/lib/api.js`) using `fetch`, with the Vite proxy forwarding `/api` and `/auth` to Express.

## Project structure

```
MyPortfolio/
  server.js                    Back-end entry point
  server/
    express.js                 Express app + routes
    config/config.js           Settings from .env (port, MongoDB URI, JWT secret, admin seed credentials)
    models/                    contact, project, qualification, user (the user has a role)
    controllers/               request handlers (auth.controller.js has requireSignin, requireAdmin, hasAuthorization)
    routes/                    URL maps with the role rules
    seed/seedAdmin.js          Stores the admin account in MongoDB
    helpers/                   error handling, id validation, field whitelisting, password hashing
  client/src/
    lib/api.js                 All fetch() calls to the REST API
    lib/auth-helper.js         Saves / reads / clears the signed-in session (sessionStorage)
    context/AuthContext.jsx    Shares the signed-in user with every component (useContext)
    components/PrivateRoute.jsx   Redirects visitors to /signin; blocks non-admins
    components/ResourceManager.jsx   Reusable list + add / edit / delete for any resource
    components/Navbar.jsx      Shows Sign in / Sign up, or the user's name, Admin menu and Sign out
    pages/                     Signin, Signup, Contact, Projects, Education, AdminContacts, AdminUsers + Assignment 1 pages
    data/resourceConfig.js     Form fields for projects, qualifications and contacts
  postman/                     Postman collection (46 requests) for auth, roles and every CRUD route
  docs/API.md                  Endpoint reference and access rules
  .env.example                 Template for your private .env file
```

## Setup (first time)

1. **Install Node.js 18+** (`node -v`).
2. **MongoDB:** use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or a local MongoDB) and copy the connection string. The database is named `Portfolio`.
3. **Create `.env`:** copy `.env.example` to `.env` in the project root (next to `server.js`) and set `MONGODB_URI` and `JWT_SECRET`. The admin credentials already have defaults. `.env` is git-ignored: never commit it.
4. **Install dependencies:**
   ```bash
   npm install
   cd client
   npm install
   ```
5. **Create the admin account** (once, from the project root):
   ```bash
   npm run seed:admin
   ```
   It stores a user with the `admin` role in the `users` collection (password hashed). Running it again is safe.

## Run it

```bash
cd client
npm run dev
```

| Part | URL |
|------|-----|
| React front end | http://localhost:5173/ |
| Express back end | http://localhost:3000/ -> `{"message":"Welcome to My Portfolio application."}` |

## Accounts

| Account | How to get it | Can do |
|---------|---------------|--------|
| Admin | `npm run seed:admin` -> `admin@portfolio.local` / `Admin@12345` (change in `.env` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`) | Add, edit and delete projects, qualifications and contacts; view and manage users |
| User | Sign up at `/signup` | View projects and qualifications; no add / edit / delete |

Because the assignment asks for admin credentials to be stored in the database, the default admin
password is documented here for marking. Change it before deploying anywhere public.

## How the pieces connect

1. The visitor signs in. `POST /auth/signin` returns `{ token, user }`. `AuthContext` saves it in state and in `sessionStorage`.
2. Pages read the session with `useAuth()`. `isAdmin` decides whether the Add / Edit / Delete buttons show.
3. `ResourceManager` calls the API through `lib/api.js`, sending the token as `Authorization: Bearer <token>`.
4. Express checks the token (`requireSignin`), then the role (`requireAdmin`), which is read from the database on every request. The buttons are only a convenience: the server enforces the rules.
5. If the server answers 401 (expired token), the app signs the user out and asks them to sign in again.

## Testing

- **Postman:** import `postman/MyPortfolio.postman_collection.json`, run `npm run seed:admin` once, start the server and run the folders in order (or use the Collection Runner). It signs in as a user and as the admin, saves both tokens, and checks the expected status codes (401 without a token, 403 for a normal user on admin routes, 200/201 for the admin).
- **In the browser:** see the walkthrough in the submission document.
- **Lint and build:** `cd client && npm run lint && npm run build`.

## Security notes

- Passwords are hashed with a per-user salt (Node `crypto.scrypt`) and never returned by the API.
- Sign-up can never create an admin: the `role` field is ignored. Only an admin can change a role.
- The role is checked on the server for every protected request; hiding buttons in React is not the security.
- JWTs are signed with a secret from `.env`; `helmet` sets secure headers; request fields are whitelisted.
- Secrets live in `.env`, which is excluded from Git.

## AI Use Disclosure

In line with the course's permitted-use policy for AI tools, I used an AI assistant (Claude, by Anthropic) while building this project.

**How AI was used**
- Translating the Assignment 3 sheet and the Week 5, 6, 8, 9 and 10 slides into the code: role-based authorization on the back end, the admin seed script, the sign-in / sign-up forms, the auth context, protected routes and the reusable add / edit / delete component.
- Writing the Postman collection, the API reference, this README and the template for the submission document.
- Running automated checks on the code (a browser walk-through and the Postman collection) before I received it.

**What I did myself**
- Provided the assignment sheet, course slides and my earlier assignments, and directed the work.
- Set up my own MongoDB database and `.env`, created the admin account, ran the application, and tested every feature in the browser and in Postman.
- Captured the screenshots in the submission document and reviewed the code so that I can explain how it works.