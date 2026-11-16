/**
 * api.js
 * Every call from the React app to the Express REST API lives here (Week 8 slides:
 * api-user.js and api-auth.js). Components never call fetch() directly, so URLs, headers and
 * error handling are written once.
 *
 * The URLs are relative ("/api/..."): in development the Vite proxy forwards them to Express
 * on port 3000 (see vite.config.js), so there are no hard-coded ports and no CORS problems.
 */

/** ApiError: thrown for any failed request; `status` is the HTTP status (0 = server unreachable). */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * request: sends a JSON request and returns the parsed JSON response.
 * Pass the signed-in user's `token` to send it as "Authorization: Bearer <token>".
 */
async function request(path, { method = "GET", body, token, signal } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error; // the component unmounted: not a real error
    throw new ApiError("Could not reach the server. Please check that the back end is running.", 0);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.error || `Request failed (${response.status}).`, response.status);
  }
  return data;
}

/** makeResourceApi: the five CRUD calls for one collection (contacts, projects, ...). */
function makeResourceApi(basePath) {
  return {
    list: (token, signal) => request(basePath, { token, signal }), // GET    /api/<resource>
    read: (id, token, signal) => request(`${basePath}/${id}`, { token, signal }), // GET    /api/<resource>/:id
    create: (values, token) => request(basePath, { method: "POST", body: values, token }), // POST   /api/<resource>
    update: (id, values, token) => request(`${basePath}/${id}`, { method: "PUT", body: values, token }), // PUT    /api/<resource>/:id
    remove: (id, token) => request(`${basePath}/${id}`, { method: "DELETE", token }), // DELETE /api/<resource>/:id
  };
}

export const contactsApi = makeResourceApi("/api/contacts");
export const projectsApi = makeResourceApi("/api/projects");
export const qualificationsApi = makeResourceApi("/api/qualifications");
export const usersApi = makeResourceApi("/api/users");

/** Authentication calls (Week 6 slides: Sign-in and Sign-out). */
export const authApi = {
  signin: (credentials) => request("/auth/signin", { method: "POST", body: credentials }),
  signout: () => request("/auth/signout"),
};
