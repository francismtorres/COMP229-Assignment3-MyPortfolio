import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PageHeader from "./PageHeader.jsx";

/**
 * PrivateRoute: wraps a page that needs a signed-in user (Week 8 slides).
 * - Not signed in  -> redirected to /signin (and sent back here after signing in).
 * - `adminOnly`    -> a signed-in user who is not an admin sees an "Access denied" message.
 */
export default function PrivateRoute({ children, adminOnly = false }) {
  const { isSignedIn, isAdmin } = useAuth();
  const location = useLocation();

  if (!isSignedIn) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <PageHeader
        eyebrow="403 Forbidden"
        title="Access denied"
        intro="This page is only available to the portfolio administrator."
      />
    );
  }

  return children;
}
