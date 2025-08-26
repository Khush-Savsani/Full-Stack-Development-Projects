// Navigation bar component that provides site-wide navigation and user authentication
// Includes responsive design, user menu, and integration with login/signup modal
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "./REP_Logo3.jpg";
import LoginSignupModal from "./LoginSignupModal";
import DigitalClock from "./DigitalClock";

const Navbar = () => {
  // State management for modal display and authentication
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState("choose");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Initialize authentication state from session storage on component mount
  useEffect(() => {
    setIsLoggedIn(sessionStorage.getItem("isLoggedIn") === "true");
    const u = sessionStorage.getItem("username") || "";
    if (u) setUsername(u);
    else {
      const em = sessionStorage.getItem("email") || "";
      if (em) setUsername((em.split("@")[0] || "").trim());
    }
  }, []);

  // React to auth state changes from Login/Signup without needing a page reload
  // Listens for custom events and storage changes to keep navbar in sync
  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(sessionStorage.getItem("isLoggedIn") === "true");
      const u = sessionStorage.getItem("username") || "";
      if (u) setUsername(u);
      else {
        const em = sessionStorage.getItem("email") || "";
        setUsername(em ? (em.split("@")[0] || "").trim() : "");
      }
    };
    window.addEventListener("authChanged", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("authChanged", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  // Ensure Font Awesome is available for navbar icons (scoped, non-global)
  // Loads Font Awesome CSS only when navbar is mounted
  useEffect(() => {
    const id = "_navbar_fa_css";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
      document.head.appendChild(link);
    }
  }, []);

  // Modal control functions
  const openLogin = () => {
    setModalStep("login");
    setShowModal(true);
  };
  const openSignup = () => {
    setModalStep("signup");
    setShowModal(true);
  };

  // Handle successful login by updating local state
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowModal(false);
  };

  // Handle user logout by clearing session storage and redirecting
  const handleLogout = () => {
    try {
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("email");
    } catch (_) {}
    setIsLoggedIn(false);
    setUsername("");
    setMenuOpen(false);
    // Redirect to Home immediately after logout
    try {
      window.location.href = "/";
    } catch (_) {}
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo and brand link to home page */}
          <Link className="navbar-brand" to="/">
            <img
              src={logo}
              alt="RailExpress Logo"
              className="navbar-logo-img"
            />
          </Link>

          {/* Main navigation links with icons */}
          <ul className="navbar-links">
            <li>
              <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                <i className="fa-solid fa-house nav-ic" aria-hidden="true"></i>
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <i
                  className="fa-solid fa-circle-info nav-ic"
                  aria-hidden="true"
                ></i>
                <span>About</span>
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <i
                  className="fa-solid fa-envelope nav-ic"
                  aria-hidden="true"
                ></i>
                <span>Contact</span>
              </Link>
            </li>
            <li>
              <Link
                to="/pnr"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <i className="fa-solid fa-ticket nav-ic" aria-hidden="true"></i>
                <span>PNR Status</span>
              </Link>
            </li>
          </ul>

          {/* Digital clock component for current time display */}
          <DigitalClock />

          {/* Authentication section - shows login/signup buttons or user menu */}
          <div className="navbar-auth-btns">
            {isLoggedIn ? (
              // User is logged in - show user menu dropdown
              <div className="user-menu" ref={menuRef}>
                <button
                  className="user-btn"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((v) => !v);
                  }}
                >
                  {/* User avatar with initial letter */}
                  <span className="user-avatar-initial" aria-hidden="true">
                    {((username || "U").trim()[0] || "U").toUpperCase()}
                  </span>
                  <i
                    className="fa-solid fa-chevron-down caret"
                    aria-hidden="true"
                  ></i>
                </button>
                {menuOpen && (
                  <div className="user-dropdown" role="menu">
                    <Link
                      to="/dashboard"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      <i className="fa-solid fa-gauge" aria-hidden="true"></i>
                      <span>Dashboard</span>
                    </Link>
                    <button
                      className="dropdown-item"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <i
                        className="fa-solid fa-right-from-bracket"
                        aria-hidden="true"
                      ></i>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // User is not logged in - show login/signup buttons
              <>
                <button className="navbar-btn" onClick={openLogin}>
                  Login
                </button>
                <button
                  className="navbar-btn navbar-btn-signup"
                  onClick={openSignup}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Scoped hover styles for navbar items (exclude logo) */}
      <style>{`
        /* Shared base for nav links (excludes logo) */
        .navbar .navbar-links a {
          position: relative;
          display: inline-flex; align-items: center; gap: 8px;
          transition: color .2s ease;
        }

        .navbar .navbar-links .nav-ic { font-size: .95em; opacity: .95; color: #1742a0; }

        /* Underline animation for links */
        .navbar .navbar-links a::after {
          content: '';
          position: absolute;
          left: 0; bottom: -4px; height: 2px;
          width: 0;
          background: linear-gradient(90deg, #0d6efd, #60a5fa);
          transition: width .25s ease;
          border-radius: 2px;
        }

        /* Simple hover: gradient text color + underline expand (no glow) */
        .navbar .navbar-links a:hover span {
          background: linear-gradient(90deg, #0d6efd, #60a5fa);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .navbar .navbar-links a:hover .nav-ic { color: #1742a0; }
        .navbar .navbar-links a:hover::after { width: 100%; }

        /* Keep auth buttons behavior unchanged */
        .navbar .user-menu { position: relative; }
        .navbar .user-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1742a0; color: #fff; border: none; border-radius: 10px;
          padding: 8px 12px; cursor: pointer; box-shadow: 0 6px 16px rgba(23,66,160,.25);
        }
        .navbar .user-btn .caret { font-size: .8em; opacity: .9; }
        .navbar .user-avatar-initial {
          width: 28px; height: 28px; border-radius: 999px;
          display: grid; place-items: center; font-weight: 800; font-size: .95rem;
          color: #fff; background: linear-gradient(135deg,#1d4ed8,#60a5fa);
          box-shadow: 0 4px 12px rgba(37,99,235,.35);
        }
        .navbar .user-dropdown {
          position: absolute; right: 0; top: calc(100% + 8px);
          min-width: 180px; background: #fff; border: 1px solid rgba(23,66,160,.15);
          border-radius: 12px; box-shadow: 0 12px 28px rgba(2,6,23,.15); padding: 6px;
          z-index: 1000;
        }
        .navbar .user-dropdown .dropdown-item {
          display: flex; align-items: center; gap: 10px; width: 100%;
          background: transparent; border: 0; text-align: left; padding: 10px 0.3px 10px 2.5px;
          border-radius: 10px; color: #0b2368; text-decoration: none;
        }
        .navbar .user-dropdown .dropdown-item:hover {
          background: rgba(13,110,253,0.08);
        }
      `}</style>

      {/* Login/Signup modal component */}
      <LoginSignupModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onLoginSuccess={handleLoginSuccess}
        initialStep={modalStep}
      />
    </>
  );
};

export default Navbar;
