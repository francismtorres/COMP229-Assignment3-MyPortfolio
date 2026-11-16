import { useCallback, useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { usersApi } from "../lib/api.js";

/**
 * AdminUsers: lists every account (admin only). The admin can promote a user to admin,
 * return an admin to user, or delete a user. Admin accounts themselves cannot be deleted
 * (the API refuses with 403), so the delete button is hidden for them.
 */
export default function AdminUsers() {
  const { token, user: signedInUser, signOut } = useAuth();
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const handleApiError = useCallback(
    (error) => {
      if (error.status === 401) {
        signOut();
        return "Your session has expired. Please sign in again.";
      }
      return error.message;
    },
    [signOut]
  );

  useEffect(() => {
    const controller = new AbortController();
    usersApi
      .list(token, controller.signal)
      .then((data) => {
        setUsers(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setErrorMessage(handleApiError(error));
        setStatus("error");
      });
    return () => controller.abort();
  }, [token, handleApiError]);

  // UPDATE: change one user's role (PUT /api/users/:id with { role })
  const handleRoleChange = async (user, newRole) => {
    setMessage("");
    setErrorMessage("");
    try {
      const updated = await usersApi.update(user._id, { role: newRole }, token);
      setUsers((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      setMessage(`${updated.name} is now ${updated.role === "admin" ? "an admin" : "a user"}.`);
    } catch (error) {
      setErrorMessage(handleApiError(error));
    }
  };

  // DELETE: remove one user (DELETE /api/users/:id)
  const handleDelete = async (user) => {
    setMessage("");
    setErrorMessage("");
    try {
      await usersApi.remove(user._id, token);
      setUsers((current) => current.filter((item) => item._id !== user._id));
      setMessage(`${user.name} was deleted.`);
    } catch (error) {
      setErrorMessage(handleApiError(error));
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Admin" title="Users" intro="Everyone who has signed up. Passwords are hashed and are never shown." />
      <section className="section">
        <div className="container">
          {message && (
            <div className="notice" role="status">
              <div>{message}</div>
              <button type="button" className="notice-close" onClick={() => setMessage("")} aria-label="Dismiss message">&times;</button>
            </div>
          )}
          {errorMessage && <p className="field-error" role="alert">{errorMessage}</p>}
          {status === "loading" && <p className="muted" role="status">Loading...</p>}

          {status === "ready" && (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Role</th>
                    <th scope="col">Created</th>
                    <th scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isSelf = user._id === signedInUser?._id;
                    return (
                      <tr key={user._id}>
                        <td data-label="Name">{user.name}{isSelf && <span className="badge badge-active">You</span>}</td>
                        <td data-label="Email">{user.email}</td>
                        <td data-label="Role">
                          <label className="sr-only" htmlFor={`role-${user._id}`}>Role for {user.name}</label>
                          <select
                            id={`role-${user._id}`}
                            value={user.role}
                            onChange={(event) => handleRoleChange(user, event.target.value)}
                            disabled={isSelf} // an admin cannot demote themselves by accident
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td data-label="Created">{new Date(user.created).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
                        <td data-label="Actions">
                          <div className="table-actions">
                          {user.role !== "admin" &&
                            (pendingDeleteId === user._id ? (
                              <>
                                <button type="button" className="button button-danger button-small" onClick={() => handleDelete(user)}>Confirm delete</button>
                                <button type="button" className="button button-outline button-small" onClick={() => setPendingDeleteId(null)}>Cancel</button>
                              </>
                            ) : (
                              <button type="button" className="button button-outline button-small button-danger-outline" onClick={() => setPendingDeleteId(user._id)}>
                                Delete
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
