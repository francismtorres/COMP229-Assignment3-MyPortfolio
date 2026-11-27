import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Home from "./pages/Home.jsx";
const About = lazy(() => import("./pages/About.jsx"));
const Projects = lazy(() => import("./pages/Projects.jsx"));
const Education = lazy(() => import("./pages/Education.jsx"));
const Services = lazy(() => import("./pages/Services.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Signin = lazy(() => import("./pages/Signin.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const AdminContacts = lazy(() => import("./pages/AdminContacts.jsx"));
const AdminUsers = lazy(() => import("./pages/AdminUsers.jsx"));
import PrivateRoute from "./components/PrivateRoute.jsx";
import NotFound from "./pages/NotFound.jsx";

/**
 * App: the shared page layout (navigation + footer) with one route per page,
 * including the sign-in / sign-up pages and the admin-only pages.
 */
export default function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <ScrollToTop />
      <Navbar />
      <main id="main-content" className="app-main">
        <Suspense fallback={<div className="container section" aria-busy="true" role="status">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/education" element={<Education />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          {/* Admin pages: PrivateRoute sends visitors to /signin and blocks non-admin users */}
          <Route path="/admin/contacts" element={<PrivateRoute adminOnly><AdminContacts /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute adminOnly><AdminUsers /></PrivateRoute>} />
          {/* Any unknown address falls back to a friendly 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
