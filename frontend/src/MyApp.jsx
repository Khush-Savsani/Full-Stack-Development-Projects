// Main application component that serves as the home page
// Contains hero section, train search form, quick actions, and features
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import TrainSearchForm from "./TrainSearchForm";
import trainHeroBg from "./train_1.png";
import aadhaarLogo from "./Aadhar Card Logo.jpeg";

// Feature cards data for the "Why Choose RailExpress?" section
// Each feature has a title, description, and SVG icon
const features = [
  {
    title: "Fast Booking",
    desc: "Book your train tickets in seconds with our streamlined process.",
    icon: (
      <svg
        className="feature-icon"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m4 4h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h1m4 0v2a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-2"
        />
      </svg>
    ),
  },
  {
    title: "Live Schedule",
    desc: "Get real-time updates on train timings and platform info.",
    icon: (
      <svg
        className="feature-icon"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
        />
      </svg>
    ),
  },
  {
    title: "Secure Payments",
    desc: "Your transactions are protected with top-grade security.",
    icon: (
      <svg
        className="feature-icon"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3v2a3 3 0 0 1-3 3h-1a3 3 0 0 1-3-3v-2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 11V7a5 5 0 0 0-10 0v4"
        />
      </svg>
    ),
  },
];

// Quick action buttons for common user tasks
// Some actions have routes for navigation, others are placeholder features
const quickActions = [
  { label: "Check PNR status", route: "/pnr" },
  { label: "Cancel Booking", route: "/cancel" },
  { label: "Order Food" },
  { label: "Rail Madad" },
  { label: "Link Aadhaar" },
];

const MyApp = () => {
  const navigate = useNavigate();

  // Scroll-reveal observer for animations (scoped to .home-scope)
  useEffect(() => {
    // Load Font Awesome for icons (scoped to Home page lifecycle)
    const faId = "_home_fa_css";
    let fa = document.getElementById(faId);
    if (!fa) {
      fa = document.createElement("link");
      fa.id = faId;
      fa.rel = "stylesheet";
      fa.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
      document.head.appendChild(fa);
    }

    // Set up intersection observer for scroll reveal animations
    const rootEl = document.querySelector(".home-scope");
    if (!rootEl) return;
    const items = Array.from(rootEl.querySelectorAll(".reveal"));
    if (!items.length) return;

    // Create intersection observer for scroll-triggered animations
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          } else {
            entry.target.classList.remove("show");
          }
        });
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
    );

    // Observe all reveal elements for animation triggers
    items.forEach((el) => io.observe(el));

    // Cleanup: disconnect observer and remove Font Awesome when component unmounts
    return () => {
      io.disconnect();
      if (fa && fa.parentNode) fa.parentNode.removeChild(fa);
    };
  }, []);

  return (
    <div className="main-app home-scope">
      {/* Scope-only CSS overrides for home page styling */}
      <style>{`
        .home-scope .navbar { position: static !important; top: auto !important; }

        /* Scroll reveal animations (scoped to home) */
        .home-scope .reveal { opacity: 0; transform: translate3d(0, 12px, 0); transition: opacity .6s ease, transform .6s ease; will-change: opacity, transform; }
        .home-scope .reveal.show { opacity: 1; transform: none; }
        .home-scope .fade-up { transform: translate3d(0, 18px, 0); }
        .home-scope .fade-left { transform: translate3d(-24px, 0, 0); }
        .home-scope .fade-right { transform: translate3d(24px, 0, 0); }

        /* Hero styling (match About page hero) */
        .home-scope .hero {
          position: relative; overflow: hidden; color: #0b2368;
          background: linear-gradient(135deg, #f0f6ff 0%, #e6efff 40%, #ffffff 100%);
          padding: 3.2rem 1rem; text-align: center;
        }
        .home-scope .hero .mesh {
          position: absolute; inset: -20%; pointer-events: none; opacity: .55;
          background:
            radial-gradient(40% 30% at 15% 20%, rgba(37,99,235,.16), transparent 60%),
            radial-gradient(35% 25% at 85% 15%, rgba(59,130,246,.16), transparent 60%),
            radial-gradient(30% 25% at 50% 90%, rgba(99,102,241,.14), transparent 60%);
        }
        .home-scope .headline { font-weight: 900; letter-spacing: -0.6px; margin-bottom: .35rem; }
        .home-scope .headline .grad {
          background: linear-gradient(90deg,#1742a0,#2563eb,#60a5fa);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
        }
        /* Make the welcome text bigger */
        .home-scope .headline { font-size: clamp(2.25rem, 3.8vw, 3.25rem); line-height: 1.15; }
        .home-scope .headline .grad { filter: saturate(115%); }
        .home-scope .subtext { max-width: 820px; margin: 0 auto; color: #3b4a88; font-weight: 600; font-size: clamp(1.05rem, 1.6vw, 1.25rem); }

        /* Quick Actions: attractive small cards under hero image */
        .home-scope .quick-actions-section {
          padding: 1.25rem 1rem 0.25rem;
          /* add proper spacing from image section above */
          margin-top: 16px;
        }
        @media (min-width: 768px) {
          .home-scope .quick-actions-section { margin-top: 22px; }
        }
        @media (min-width: 1200px) {
          .home-scope .quick-actions-section { margin-top: 28px; }
        }
        .home-scope .quick-actions-row {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
          max-width: 1100px;
          margin: 0 auto;
        }
        @media (max-width: 992px) {
          .home-scope .quick-actions-row { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 576px) {
          .home-scope .quick-actions-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        .home-scope .quick-action-card {
          position: relative;
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(255,255,255,0.86);
          box-shadow: 0 10px 28px rgba(2,6,23,0.08);
          border: 1px solid rgba(37,99,235,0.18);
          transition: transform .18s ease, box-shadow .18s ease, background .2s ease;
          overflow: hidden;
        }
        .home-scope .quick-action-card::after {
          content: ""; position: absolute; inset: 0; pointer-events: none; border-radius: 16px; padding: 1px;
          background: linear-gradient(120deg, rgba(29,78,216,0.35), rgba(99,102,241,0.30), rgba(56,189,248,0.28));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
        }
        .home-scope .quick-action-card:hover { transform: translateY(-2px); box-shadow: 0 16px 36px rgba(2,6,23,0.12); }
        .home-scope .quick-action-icon {
          width: 40px; height: 40px; flex: 0 0 40px;
          display: grid; place-items: center;
          border-radius: 10px;
          background: linear-gradient(135deg,#1d4ed8,#60a5fa);
          color: #fff; box-shadow: 0 6px 16px rgba(37,99,235,0.35);
          overflow: hidden;
        }
        .home-scope .quick-action-icon i { font-size: 18px; line-height: 1; }
        .home-scope .quick-action-icon img { width: 100%; height: 100%; object-fit: contain; background: #ffffff; }
        .home-scope .quick-action-label { font-weight: 800; color: #0b2368; letter-spacing: .2px; }
      `}</style>

      {/* Scroll-reveal observer setup (IIFE wrapper for render-time execution) */}
      {(() => {
        // Using an IIFE wrapper so it executes once on render; we still attach via useEffect below for proper lifecycle
        return null;
      })()}
      {null}

      {/* Hook to observe reveal elements */}
      {(() => {
        return null;
      })()}

      {/* Navigation bar component */}
      <Navbar />

      <main className="main-content">
        {/* Welcome Hero Section with gradient text and mesh background */}
        <section className="hero reveal fade-up">
          <div className="mesh"></div>
          <h1 className="display-5 headline">
            <span className="grad">Welcome To RailExpress</span>
          </h1>
          <p className="subtext">Desh Ka Safar Apno Ke Saath</p>
        </section>

        {/* Main Hero Section with train background image and search form */}
        <section
          className="main-hero hero-bg-train-img reveal fade-up"
          style={{ backgroundImage: `url(${trainHeroBg})` }}
        >
          <div className="hero-bg-train-img-overlay">
            {/* IRCTC authorization badge */}
            <div className="irctc-badge">IRCTC Authorised Partner</div>
            {/* Centered train search form */}
            <div className="hero-search-card hero-search-centered search-container reveal fade-up">
              <TrainSearchForm />
            </div>
          </div>
        </section>

        {/* Quick Actions Section - Easy access to common features */}
        <section className="quick-actions-section reveal fade-up">
          <div className="quick-actions-row">
            {quickActions.map((action) => (
              <div
                className="quick-action-card reveal fade-up"
                key={action.label}
                role={action.route ? "button" : undefined}
                onClick={() => action.route && navigate(action.route)}
                style={action.route ? { cursor: "pointer" } : undefined}
              >
                {/* Icon for each quick action */}
                <span className="quick-action-icon">
                  {action.label === "Check PNR status" && (
                    <i className="fa-solid fa-receipt" aria-hidden="true"></i>
                  )}
                  {action.label === "Cancel Booking" && (
                    <i
                      className="fa-solid fa-user-xmark"
                      aria-hidden="true"
                    ></i>
                  )}
                  {action.label === "Order Food" && (
                    <i className="fa-solid fa-utensils" aria-hidden="true"></i>
                  )}
                  {action.label === "Rail Madad" && (
                    <i className="fa-solid fa-life-ring" aria-hidden="true"></i>
                  )}
                  {action.label === "Link Aadhaar" && (
                    <img src={aadhaarLogo} alt="Aadhaar" />
                  )}
                </span>
                <span className="quick-action-label">{action.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section - Highlighting key benefits of RailExpress */}
        <section className="main-features reveal fade-up">
          <h2 className="features-title">Why Choose RailExpress?</h2>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card reveal fade-up">
                {feature.icon}
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer component */}
      <Footer />
    </div>
  );
};

export default MyApp;
