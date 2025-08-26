// Main App component that serves as the root of the application
// Handles routing between different pages and components
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MyApp from "./MyApp";
import Contact from "./Contact";
import TrainResults from "./TrainResults";
import About from "./About";
import BookingPage from "./BookingPage";
import PaymentPage from "./PaymentPage";
import CancelBooking from "./CancelBooking";
import PNRStatus from "./PNRStatus";
import BackToTop from "./components/BackToTop";
import Dashboard from "./Dashboard";

function App() {
  return (
    // Router wrapper for handling client-side navigation
    <Router>
      {/* Main routing configuration for the application */}
      <Routes>
        {/* Home page - Main application interface */}
        <Route path="/" element={<MyApp />} />
        {/* Train search results page */}
        <Route path="/results" element={<TrainResults />} />
        {/* Train booking page */}
        <Route path="/booking" element={<BookingPage />} />
        {/* Payment processing page */}
        <Route path="/payment" element={<PaymentPage />} />
        {/* Booking cancellation page */}
        <Route path="/cancel" element={<CancelBooking />} />
        {/* PNR status checking page */}
        <Route path="/pnr" element={<PNRStatus />} />
        {/* User dashboard page */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Contact information page */}
        <Route path="/contact" element={<Contact />} />
        {/* About page */}
        <Route path="/about" element={<About />} />
      </Routes>
      {/* Back to top button component - always visible */}
      <BackToTop />
    </Router>
  );
}

export default App;
