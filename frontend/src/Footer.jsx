// Footer component that provides comprehensive site information and navigation
// Includes company details, quick links, social media, and app store links
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faXTwitter,
  faInstagram,
  faLinkedinIn,
  faYoutube,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import {
  faGooglePlay,
  faAppStoreIos,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import "./Footer.css";

const Footer = () => {
  // Get current year for copyright notice
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Company information section */}
        <div className="footer-section">
          <h3>RailExpress</h3>
          <p>Your journey, our priority. Travel with comfort and safety.</p>
          <div className="footer-contact">
            <p>
              <FontAwesomeIcon icon={faEnvelope} /> support@railexpress.com
            </p>
            <p>
              <FontAwesomeIcon icon={faPhone} /> +1 234 567 8900
            </p>
          </div>
        </div>

        {/* Quick navigation links section */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/">Book Tickets</a>
            </li>
            <li>
              <a href="/results">Train Schedule</a>
            </li>
            <li>
              <a href="/results">Fare Enquiry</a>
            </li>
            <li>
              <a href="/pnr">PNR Status</a>
            </li>
          </ul>
        </div>

        {/* Legal and information links section */}
        <div className="footer-section">
          <h4>Information</h4>
          <ul>
            <li>
              <a href="/about">About Us</a>
            </li>
            <li>
              <a href="/about#terms">Terms & Conditions</a>
            </li>
            <li>
              <a href="/about#privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="/about#refund">Refund Policy</a>
            </li>
            <li>
              <a href="/about#faq">FAQ</a>
            </li>
          </ul>
        </div>

        {/* Social media and app store section */}
        <div className="footer-section">
          <h4>Connect With Us</h4>

          {/* Social media icons with proper accessibility labels */}
          <div className="social-icons">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon facebook"
              aria-label="Facebook"
            >
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a
              href="https://x.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon x"
              aria-label="X (Twitter)"
            >
              <FontAwesomeIcon icon={faXTwitter} />
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon instagram"
              aria-label="Instagram"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon linkedin"
              aria-label="LinkedIn"
            >
              <FontAwesomeIcon icon={faLinkedinIn} />
            </a>
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon youtube"
              aria-label="YouTube"
            >
              <FontAwesomeIcon icon={faYoutube} />
            </a>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon whatsapp"
              aria-label="WhatsApp"
            >
              <FontAwesomeIcon icon={faWhatsapp} />
            </a>
          </div>

          {/* Mobile app store download buttons */}
          <div className="store-buttons">
            {/* Google Play Store button */}
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="store-btn play"
              aria-label="Get it on Google Play"
            >
              <span className="store-ic">
                <FontAwesomeIcon icon={faGooglePlay} />
              </span>
              <span className="store-text">
                <small>GET IT ON</small>
                <strong>Google Play</strong>
              </span>
            </a>

            {/* Apple App Store button */}
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              className="store-btn app"
              aria-label="Download on the App Store"
            >
              <span className="store-ic">
                <FontAwesomeIcon icon={faAppStoreIos} />
              </span>
              <span className="store-text">
                <small>Download on the</small>
                <strong>App Store</strong>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright notice at the bottom */}
      <div className="footer-bottom">
        <p>&copy; {currentYear} RailExpress. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
