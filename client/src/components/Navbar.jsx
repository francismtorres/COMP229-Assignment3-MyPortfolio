import { useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// Every page of the site, in display order
const navigationLinks = [
  { label: "Home", path: "/" },
  { label: "About Me", path: "/about" },
  { label: "Projects", path: "/projects" },
  { label: "Education", path: "/education" },
  { label: "Services", path: "/services" },
  { label: "Contact Me", path: "/contact" },
];

/**
 * Navbar: logo + links to all six pages, plus account links that change with the session:
 *   signed out -> Sign in / Sign up;  signed in -> name, Sign out;  admin -> Admin links.
 * Collapses into a menu button on small screens.
 */
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isSignedIn, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  // Closes the mobile menu and the Admin dropdown (called whenever a link is chosen)
  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsAdminMenuOpen(false);
  };

  const handleSignOut = async () => {
    closeMenu();
    await signOut();
    navigate("/");
  };

  const accountLinkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <Logo />
          <span className="navbar-brand-text">Francis Torres</span>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen((previousState) => !previousState)}
        >
          <span className="sr-only">Toggle navigation menu</span>
          <span className="menu-toggle-bar" />
          <span className="menu-toggle-bar" />
          <span className="menu-toggle-bar" />
        </button>

        <ul id="primary-navigation" className={`navbar-links ${isMenuOpen ? "is-open" : ""}`}>
          {navigationLinks.map((navLink) => (
            <li key={navLink.path}>
              <NavLink
                to={navLink.path}
                end={navLink.path === "/"}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                onClick={closeMenu}
              >
                {navLink.label}
              </NavLink>
            </li>
          ))}

          {isAdmin && (
            <li className="nav-dropdown">
              <button
                type="button"
                className={`nav-link nav-button ${location.pathname.startsWith("/admin") ? "active" : ""}`}
                aria-expanded={isAdminMenuOpen}
                aria-haspopup="true"
                onClick={() => setIsAdminMenuOpen((previous) => !previous)}
              >
                Admin <span aria-hidden="true">&#9662;</span>
              </button>
              {isAdminMenuOpen && (
                <ul className="nav-dropdown-menu">
                  <li><NavLink to="/admin/contacts" className={accountLinkClass} onClick={closeMenu}>Contact messages</NavLink></li>
                  <li><NavLink to="/admin/users" className={accountLinkClass} onClick={closeMenu}>Users</NavLink></li>
                </ul>
              )}
            </li>
          )}

          {isSignedIn ? (
            <>
              <li className="nav-user">
                <span className="nav-user-name" title={user.email}>{user.name.split(" ")[0]}</span>
              </li>
              <li>
                <button type="button" className="nav-link nav-button" onClick={handleSignOut}>Sign out</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/signin" className={accountLinkClass} onClick={closeMenu}>Sign in</NavLink>
              </li>
              <li>
                <NavLink to="/signup" className={accountLinkClass} onClick={closeMenu}>Sign up</NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
