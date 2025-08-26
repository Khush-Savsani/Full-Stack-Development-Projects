// Main entry point for the React application
// This file bootstraps the React app and renders it to the DOM
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Main App component containing the entire application
import "./index.css"; // Global CSS styles for the application

// Create the root React element and render the App component
// React.StrictMode enables additional development checks and warnings
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
