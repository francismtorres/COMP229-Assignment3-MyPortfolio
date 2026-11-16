import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Signin: email + password form. A controlled form (state holds each input) that calls
 * POST /auth/signin through the AuthContext, then returns the visitor to the page they came from.
 */
export default function Signin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { state: routeState } = useLocation();

  const [values, setValues] = useState({ email: routeState?.email ?? "", password: "" });
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
    const validationErrors = {};
    if (!EMAIL_PATTERN.test(values.email.trim())) validationErrors.email = "Please enter a valid email address.";
    if (!values.password) validationErrors.password = "Please enter your password.";
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setServerError("");
    try {
      await signIn(values.email.trim(), values.password);
      navigate(routeState?.from ?? "/", { replace: true });
    } catch (error) {
      setServerError(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Account" title="Sign in" intro="Sign in to your account. Administrators can add, edit and delete portfolio content." />
      <section className="section">
        <div className="container narrow">
          {routeState?.notice && <div className="notice" role="status"><div>{routeState.notice}</div></div>}
          {routeState?.from && !routeState?.notice && (
            <div className="notice notice-info" role="status"><div>Please sign in to view that page.</div></div>
          )}
          <form className="card auth-card" onSubmit={handleSubmit} noValidate>
            <div className="card-body">
              <div className="form-field">
                <label htmlFor="signin-email">Email address</label>
                <input
                  id="signin-email" name="email" type="email" autoComplete="email"
                  value={values.email} onChange={handleChange}
                  aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "signin-email-error" : undefined}
                />
                {errors.email && <p className="field-error" id="signin-email-error">{errors.email}</p>}
              </div>
              <div className="form-field">
                <label htmlFor="signin-password">Password</label>
                <input
                  id="signin-password" name="password" type="password" autoComplete="current-password"
                  value={values.password} onChange={handleChange}
                  aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "signin-password-error" : undefined}
                />
                {errors.password && <p className="field-error" id="signin-password-error">{errors.password}</p>}
              </div>
              {serverError && <p className="field-error" role="alert">{serverError}</p>}
              <button type="submit" className="button button-primary" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
              <p className="auth-switch muted">
                Don&apos;t have an account? <Link to="/signup">Sign up</Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
