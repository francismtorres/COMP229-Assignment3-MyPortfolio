import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * ResourceManager: one reusable component that performs CRUD for any REST resource
 * (projects, qualifications, contacts). It is configured with props instead of being copied
 * for every object:
 *
 *   api            the resource's API helpers (list / create / update / remove from lib/api.js)
 *   fields         the form fields: [{ name, label, type, required, wide }]
 *   defaultValues  starting values for the "Add" form
 *   titleFields    names of the fields joined into each card's heading (default: the first field)
 *   canManage      true for an admin (shows Add / Edit / Delete); everyone else can only read
 *
 * State management (Week 8 slides, "State in component trees"):
 *   - this component owns the state (items, the open form, the pending delete),
 *   - it sends that state DOWN to <EntryForm> and the list as props,
 *   - and the child calls the functions it receives (onChange, onSubmit, onCancel) to send
 *     interactions back UP, which update the state here.
 * The server stays the source of truth: the list is only updated after the API call succeeds.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Dates come back from MongoDB as ISO strings; <input type="date"> needs YYYY-MM-DD. */
const toInputValue = (field, value) => {
  if (value === undefined || value === null) return "";
  return field.type === "date" ? String(value).slice(0, 10) : String(value);
};

/** Human-readable text for the list view. */
const toDisplayValue = (field, value) => {
  if (!value) return "-";
  if (field.type === "date") {
    return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  }
  return value;
};

/** validateValues: returns an object of error messages (empty object = valid). */
function validateValues(fields, values) {
  const errors = {};
  fields.forEach((field) => {
    const value = (values[field.name] ?? "").trim();
    if (field.required && !value) {
      errors[field.name] = `${field.label} is required.`;
    } else if (field.type === "email" && value && !EMAIL_PATTERN.test(value)) {
      errors[field.name] = "Please enter a valid email address.";
    }
  });
  return errors;
}

/** EntryForm: the Add / Edit form. A "controlled" form: React state holds every input's value. */
function EntryForm({ idPrefix, heading, fields, values, errors, serverError, isSaving, submitLabel, onChange, onSubmit, onCancel }) {
  return (
    <form className="card entry-form" onSubmit={onSubmit} noValidate aria-label={heading}>
      <div className="card-body">
        <h3>{heading}</h3>
        <div className="form-row">
          {fields.map((field) => {
            const inputId = `${idPrefix}-${field.name}`;
            const errorId = `${inputId}-error`;
            const sharedProps = {
              id: inputId,
              name: field.name,
              value: values[field.name] ?? "",
              onChange: (event) => onChange(field.name, event.target.value),
              "aria-invalid": Boolean(errors[field.name]),
              "aria-describedby": errors[field.name] ? errorId : undefined,
              required: field.required,
            };
            return (
              <div className={`form-field ${field.wide ? "form-field-wide" : ""}`} key={field.name}>
                <label htmlFor={inputId}>
                  {field.label}
                  {field.required && <span aria-hidden="true"> *</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea rows="4" {...sharedProps} />
                ) : (
                  <input type={field.type || "text"} {...sharedProps} />
                )}
                {errors[field.name] && <p className="field-error" id={errorId}>{errors[field.name]}</p>}
              </div>
            );
          })}
        </div>
        {serverError && <p className="field-error" role="alert">{serverError}</p>}
        <div className="button-row">
          <button type="submit" className="button button-primary" disabled={isSaving}>
            {isSaving ? "Saving..." : submitLabel}
          </button>
          <button type="button" className="button button-outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export default function ResourceManager({ idPrefix, title, intro, singular, api, fields, titleFields, defaultValues, canManage, emptyText }) {
  const { token, signOut } = useAuth();

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
  const [loadError, setLoadError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  const [editor, setEditor] = useState(null); // null = form closed, otherwise { id, values, errors, serverError, isSaving }
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  // A token the server rejects (expired or deleted account) signs the visitor out
  const handleApiError = useCallback(
    (error) => {
      if (error.status === 401 && token) {
        signOut();
        return "Your session has expired. Please sign in again.";
      }
      return error.message;
    },
    [token, signOut]
  );

  // READ: load the list from the API when the component mounts (and again after "Try again")
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    api
      .list(token, controller.signal)
      .then((data) => {
        setItems(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setLoadError(handleApiError(error));
        setStatus("error");
      });
    return () => controller.abort(); // cancel the request if the page changes while it is loading
  }, [api, token, reloadCount, handleApiError]);

  // ----- Open / close the form -----
  const openCreateForm = () => {
    setNotice("");
    setActionError("");
    setEditor({ id: null, values: { ...defaultValues }, errors: {}, serverError: "", isSaving: false });
  };

  const openEditForm = (item) => {
    setNotice("");
    setActionError("");
    const values = {};
    fields.forEach((field) => {
      values[field.name] = toInputValue(field, item[field.name]);
    });
    setEditor({ id: item._id, values, errors: {}, serverError: "", isSaving: false });
  };

  const closeForm = () => setEditor(null);

  const handleFieldChange = (name, value) => {
    setEditor((current) => ({
      ...current,
      values: { ...current.values, [name]: value },
      errors: { ...current.errors, [name]: undefined }, // clear the error while the user fixes it
    }));
  };

  // ----- CREATE / UPDATE -----
  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateValues(fields, editor.values);
    if (Object.values(errors).some(Boolean)) {
      setEditor((current) => ({ ...current, errors }));
      return;
    }

    const trimmedValues = {};
    fields.forEach((field) => {
      trimmedValues[field.name] = (editor.values[field.name] ?? "").trim();
    });

    setEditor((current) => ({ ...current, isSaving: true, serverError: "" }));
    try {
      if (editor.id) {
        const updated = await api.update(editor.id, trimmedValues, token);
        setItems((current) => current.map((item) => (item._id === updated._id ? updated : item)));
        setNotice(`${singular} updated.`);
      } else {
        const created = await api.create(trimmedValues, token);
        setItems((current) => [...current, created]);
        setNotice(`${singular} added.`);
      }
      setEditor(null);
    } catch (error) {
      setEditor((current) => ({ ...current, isSaving: false, serverError: handleApiError(error) }));
    }
  };

  // ----- DELETE (two steps: "Delete" then "Confirm") -----
  const handleDelete = async (id) => {
    setActionError("");
    try {
      await api.remove(id, token);
      setItems((current) => current.filter((item) => item._id !== id));
      setNotice(`${singular} deleted.`);
    } catch (error) {
      setActionError(handleApiError(error));
    } finally {
      setPendingDeleteId(null);
    }
  };

  const headingFieldNames = titleFields ?? [fields[0].name];
  const detailFields = fields.filter((field) => !headingFieldNames.includes(field.name));
  const getHeading = (item) => headingFieldNames.map((name) => item[name]).filter(Boolean).join(" ") || "-";

  return (
    <div className="resource-manager">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          {intro && <p className="muted">{intro}</p>}
        </div>
        {canManage && !editor && (
          <button type="button" className="button button-primary" onClick={openCreateForm}>
            Add {singular.toLowerCase()}
          </button>
        )}
      </div>

      {notice && (
        <div className="notice" role="status">
          <div>{notice}</div>
          <button type="button" className="notice-close" onClick={() => setNotice("")} aria-label="Dismiss message">&times;</button>
        </div>
      )}
      {actionError && <p className="field-error" role="alert">{actionError}</p>}

      {editor && (
        <EntryForm
          idPrefix={idPrefix}
          heading={editor.id ? `Edit ${singular.toLowerCase()}` : `Add a new ${singular.toLowerCase()}`}
          submitLabel={editor.id ? "Save changes" : `Add ${singular.toLowerCase()}`}
          fields={fields}
          values={editor.values}
          errors={editor.errors}
          serverError={editor.serverError}
          isSaving={editor.isSaving}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}

      {status === "loading" && <p className="muted" role="status">Loading...</p>}

      {status === "error" && (
        <div className="notice notice-error" role="alert">
          <div>{loadError}</div>
          <button type="button" className="button button-outline button-small" onClick={() => setReloadCount((count) => count + 1)}>
            Try again
          </button>
        </div>
      )}

      {status === "ready" && items.length === 0 && <p className="muted">{emptyText}</p>}

      {status === "ready" && items.length > 0 && (
        <ul className="entry-list">
          {items.map((item) => (
            <li className="card entry-card" key={item._id}>
              <div className="card-body">
                <h3>{getHeading(item)}</h3>
                <dl className="entry-details">
                  {detailFields.map((field) => (
                    <div key={field.name} className={field.wide ? "entry-detail-wide" : undefined}>
                      <dt>{field.label}</dt>
                      <dd>{toDisplayValue(field, item[field.name])}</dd>
                    </div>
                  ))}
                </dl>
                {canManage && (
                  <div className="entry-actions">
                    {pendingDeleteId === item._id ? (
                      <>
                        <span className="muted">Delete this {singular.toLowerCase()}?</span>
                        <button type="button" className="button button-danger button-small" onClick={() => handleDelete(item._id)}>
                          Confirm delete
                        </button>
                        <button type="button" className="button button-outline button-small" onClick={() => setPendingDeleteId(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="button button-outline button-small" onClick={() => openEditForm(item)}>
                          Edit
                        </button>
                        <button type="button" className="button button-outline button-small button-danger-outline" onClick={() => setPendingDeleteId(item._id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
