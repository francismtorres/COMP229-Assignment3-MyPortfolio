import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import { usersApi } from "../lib/api.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Please enter a valid email address.";
  if (values.password.length < 6) errors.password = "Password must be at least 6 characters.";
  if (values.confirmPassword !== values.password) errors.confirmPassword = "Passwords do not match.";
  return errors;
}

/**
 * Signup: creates a normal "user" account with POST /api/users (public route).
 * The back end always gives new accounts the "user" role, so nobody can sign up as an admin.
 * On success the visitor is sent to the Sign in page with their email filled in.
 */
export default function Signup() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setServerError("");
    try {
      await usersApi.create({ name: values.name.trim(), email: values.email.trim(), password: values.password });
      navigate("/signin", { state: { email: values.email.trim(), notice: "Account created. You can now sign in." } });
    } catch (error) {
      setServerError(error.message);
      setIsSubmitting(false);
    }
  };

  const renderField = (name, label, type, autoComplete) => (
    <div className="form-field">
      <label htmlFor={`signup-${name}`}>{label}</label>
      <input
        id={`signup-${name}`} name={name} type={type} autoComplete={autoComplete}
        value={values[name]} onChange={handleChange}
        aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `signup-${name}-error` : undefined}
      />
      {errors[name] && <p className="field-error" id={`signup-${name}-error`}>{errors[name]}</p>}
    </div>
  );

  return (
    <>
      <PageHeader eyebrow="Account" title="Sign up" intro="Create a free account. Signed-in users can view the portfolio's live data." />
      <section className="section">
        <div className="container narrow">
          <form className="card auth-card" onSubmit={handleSubmit} noValidate>
            <div className="card-body">
              {renderField("name", "Name", "text", "name")}
              {renderField("email", "Email address", "email", "email")}
              {renderField("password", "Password", "password", "new-password")}
              {renderField("confirmPassword", "Confirm password", "password", "new-password")}
              {serverError && <p className="field-error" role="alert">{serverError}</p>}
              <button type="submit" className="button button-primary" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
              <p className="auth-switch muted">
                Already have an account? <Link to="/signin">Sign in</Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
