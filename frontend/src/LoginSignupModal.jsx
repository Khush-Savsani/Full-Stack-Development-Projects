// Login and signup modal component with form validation and authentication
// Handles user registration, login, and session management with backend integration
import React, { useState, useEffect } from "react";
import "./index.css";

// Email validation utility function using regex pattern
const validateEmail = (email) => {
  // Simple email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Initial form state objects for login and signup
const initialLogin = { email: "", password: "" };
const initialSignup = { name: "", email: "", password: "", confirm: "" };

const LoginSignupModal = ({
  show,
  onClose,
  onLoginSuccess,
  initialStep = "choose",
}) => {
  // Component state management
  const [step, setStep] = useState(initialStep);
  const [loginData, setLoginData] = useState(initialLogin);
  const [signupData, setSignupData] = useState(initialSignup);
  const [error, setError] = useState("");

  // Reset form data and error state when modal is shown
  useEffect(() => {
    if (show) {
      setStep(initialStep);
      setLoginData(initialLogin);
      setSignupData(initialSignup);
      setError("");
    }
  }, [show, initialStep]);

  // Don't render if modal is not shown
  if (!show) return null;

  // Handle user choice between login and signup
  const handleChoose = (existing) => {
    setStep(existing ? "login" : "signup");
    setError("");
  };

  // Handle login form submission with validation and backend integration
  const handleLogin = async (e) => {
    e.preventDefault();

    // Form validation
    if (!loginData.email || !loginData.password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(loginData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (loginData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // Prepare login payload for backend
    const payload = {
      action: "login",
      email: loginData.email,
      password: loginData.password,
    };

    try {
      // Send login request to Django backend
      const res = await fetch("http://127.0.0.1:8000/users/auth/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        // Login successful - set session storage
        sessionStorage.setItem("isLoggedIn", "true");

        // Persist user identifiers
        try {
          sessionStorage.setItem("email", loginData.email);
        } catch (_) {}

        // Save username from backend if provided; else fallback to email local-part
        try {
          let uname = "";
          if (json) {
            if (json.username) uname = json.username;
            else if (json.user && json.user.username)
              uname = json.user.username;
            else if (json.data && json.data.username)
              uname = json.data.username;
          }
          if (!uname && loginData.email)
            uname = (loginData.email.split("@")[0] || "").trim();
          if (uname) sessionStorage.setItem("username", uname);
        } catch (_) {}

        // Notify listeners (e.g., Navbar) that auth state changed
        try {
          window.dispatchEvent(new Event("authChanged"));
        } catch (_) {}

        onLoginSuccess(true);
        onClose();
      } else {
        setError(json.error || "Login failed.");
      }
    } catch (err) {
      setError("Network error.");
    }
  };

  // Handle signup form submission with validation and backend integration
  const handleSignup = async (e) => {
    e.preventDefault();

    // Form validation
    if (
      !signupData.name ||
      !signupData.email ||
      !signupData.password ||
      !signupData.confirm
    ) {
      setError("Please fill all fields.");
      return;
    }
    if (!validateEmail(signupData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (signupData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (signupData.password !== signupData.confirm) {
      setError("Passwords do not match.");
      return;
    }

    // Prepare signup payload for backend
    const payload = {
      action: "signup",
      name: signupData.name,
      email: signupData.email,
      password: signupData.password,
    };

    try {
      // Send signup request to Django backend
      const res = await fetch("http://127.0.0.1:8000/users/auth/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        // Signup successful - set session storage
        sessionStorage.setItem("isLoggedIn", "true");

        // Persist user identifiers
        try {
          sessionStorage.setItem("email", signupData.email);
        } catch (_) {}

        // Save username: prefer backend response; else fallback to name field
        try {
          let uname = "";
          if (json) {
            if (json.username) uname = json.username;
            else if (json.user && json.user.username)
              uname = json.user.username;
            else if (json.data && json.data.username)
              uname = json.data.username;
          }
          if (!uname) uname = (signupData.name || "").trim();
          if (!uname && signupData.email)
            uname = (signupData.email.split("@")[0] || "").trim();
          if (uname) sessionStorage.setItem("username", uname);
        } catch (_) {}

        // Notify listeners (e.g., Navbar) that auth state changed
        try {
          window.dispatchEvent(new Event("authChanged"));
        } catch (_) {}

        onLoginSuccess(true);
        onClose();
      } else {
        setError(json.error || "Signup failed.");
      }
    } catch (err) {
      setError("Network error.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        {step === "choose" && (
          <div className="modal-content">
            <h2>Welcome to RailExpress</h2>
            <p>Are you an existing user?</p>
            <div className="modal-btn-group">
              <button className="modal-btn" onClick={() => handleChoose(true)}>
                Yes, Login
              </button>
              <button className="modal-btn" onClick={() => handleChoose(false)}>
                No, Register
              </button>
            </div>
          </div>
        )}
        {step === "login" && (
          <form className="modal-content" onSubmit={handleLogin}>
            <h2>Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              className="modal-input"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              className="modal-input"
              required
            />
            {error && <div className="modal-error">{error}</div>}
            <button className="modal-btn" type="submit">
              Login
            </button>
            <div className="modal-switch">
              New user?{" "}
              <span onClick={() => setStep("signup")}>Register here</span>
            </div>
          </form>
        )}
        {step === "signup" && (
          <form className="modal-content" onSubmit={handleSignup}>
            <h2>Register</h2>
            <input
              type="text"
              placeholder="Name"
              value={signupData.name}
              onChange={(e) =>
                setSignupData({ ...signupData, name: e.target.value })
              }
              className="modal-input"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={signupData.email}
              onChange={(e) =>
                setSignupData({ ...signupData, email: e.target.value })
              }
              className="modal-input"
              required
            />
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={signupData.password}
              onChange={(e) =>
                setSignupData({ ...signupData, password: e.target.value })
              }
              className="modal-input"
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={signupData.confirm}
              onChange={(e) =>
                setSignupData({ ...signupData, confirm: e.target.value })
              }
              className="modal-input"
              required
            />
            {error && <div className="modal-error">{error}</div>}
            <button className="modal-btn-register" type="submit">
              Register
            </button>
            <div className="modal-switch">
              Already have an account?{" "}
              <span onClick={() => setStep("login")}>Login here</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginSignupModal;
