// Contact page component that provides company contact information and form
// Features dynamic Bootstrap loading, animated backgrounds, and modern styling
import React, { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Contact = () => {
  // Load Bootstrap and Font Awesome resources locally for this page only
  // Prevents conflicts with other pages and ensures proper cleanup
  useEffect(() => {
    // Helper function to create and inject CSS links
    const addLink = (id, href) => {
      if (document.getElementById(id)) return null;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
      return link;
    };

    // Helper function to create and inject JavaScript files
    const addScript = (id, src) => {
      if (document.getElementById(id)) return null;
      const script = document.createElement("script");
      script.id = id;
      script.src = src;
      script.defer = true;
      document.body.appendChild(script);
      return script;
    };

    // Load Bootstrap CSS, Font Awesome CSS, and Bootstrap JavaScript
    const bsCss = addLink(
      "_contact_bs_css",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    );
    const faCss = addLink(
      "_contact_fa_css",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    );
    const bsJs = addScript(
      "_contact_bs_js",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
    );

    // Cleanup: remove injected resources when component unmounts
    return () => {
      [bsCss, faCss].forEach(
        (el) => el && el.parentNode && el.parentNode.removeChild(el)
      );
      if (bsJs && bsJs.parentNode) bsJs.parentNode.removeChild(bsJs);
    };
  }, []);

  // Inject page-scoped styles for Contact page specific styling
  // Creates animated backgrounds and modern design elements
  useEffect(() => {
    const id = "_contact_styles";
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = `
      /* Animated gradient background layers (scoped like BookingPage) */
      .contact-scope::before,
      .contact-scope::after {
        content: "";
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
      }
      .contact-scope::before {
        background:
          radial-gradient(60rem 60rem at 10% 10%, rgba(99,102,241,0.25), transparent 60%),
          radial-gradient(50rem 50rem at 90% 20%, rgba(59,130,246,0.25), transparent 60%),
          radial-gradient(55rem 55rem at 20% 90%, rgba(16,185,129,0.20), transparent 60%),
          linear-gradient(135deg,#eff6ff,#f5f3ff 40%,#fdf2f8);
        animation: contactBgFloat 18s ease-in-out infinite alternate;
        filter: saturate(120%);
      }
      .contact-scope::after {
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
      @keyframes contactBgFloat { 0% { transform: translate3d(0,0,0) scale(1); } 100% { transform: translate3d(0,-12px,0) scale(1.02); } }

      /* Hero section styling (matching About page style) */
      .contact-scope .hero {
        position: relative; overflow: hidden; color: #0b2368;
        background: linear-gradient(135deg, #f0f6ff 0%, #e6efff 40%, #ffffff 100%);
        padding: 3.2rem 1rem; text-align: center;
        box-shadow: 0 4px 24px rgba(37,99,235,0.12);
      }
      .contact-scope .hero .mesh {
        position: absolute; inset: -20%; pointer-events: none; opacity: .55;
        background:
          radial-gradient(40% 30% at 15% 20%, rgba(37,99,235,.16), transparent 60%),
          radial-gradient(35% 25% at 85% 15%, rgba(59,130,246,.16), transparent 60%),
          radial-gradient(30% 25% at 50% 90%, rgba(99,102,241,.14), transparent 60%);
      }
      .contact-scope .headline { font-weight: 900; letter-spacing: -0.6px; margin-bottom: .35rem; }
      .contact-scope .headline .grad {
        background: linear-gradient(90deg,#1742a0,#2563eb,#60a5fa);
        -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
      }
      .contact-scope .subtext { max-width: 820px; margin: 0 auto; color: #3b4a88; font-weight: 500; }

      .contact-scope .contact-card {
        border: 0; border-radius: 1.25rem; overflow: hidden;
        box-shadow: 0 10px 30px rgba(37,99,235,0.12);
      }
      .contact-scope .contact-card .card-header {
        background: #ffffff;
        border-bottom: 0;
        padding: 1.25rem 1.5rem;
      }
      .contact-scope .contact-card .card-body { padding: 1.5rem 1.5rem 1.8rem; }
      .contact-scope .form-control { height: 56px; font-size: 1.05rem; }
      .contact-scope textarea.form-control { height: 140px; }
      .contact-scope .btn-primary { height: 56px; font-weight: 700; box-shadow: 0 6px 16px rgba(13,110,253,0.25); }
      .contact-scope .info-pill { background:#f1f5ff; color:#1742a0; border-radius: 999px; padding: 0.35rem 0.75rem; font-weight:600; }
      .contact-scope .icon { color:#2563eb; }

      /* Keep Navbar identical to Home on Contact page (override Bootstrap locally) */
      .contact-scope nav.navbar { padding: 0 !important; background: inherit !important; box-shadow: none !important; }
      .contact-scope .navbar .navbar-container { padding-left: 0 !important; }
      .contact-scope .navbar .navbar-links a { color: inherit !important; text-decoration: none !important; }
      .contact-scope .navbar .navbar-links a:hover { text-decoration: none !important; }
    `;
    return () => {
      if (style && style.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  return (
    <div className="contact-scope d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <section className="hero">
        <div className="mesh"></div>
        <h1 className="display-5 headline">
          <span className="grad">Contact Us</span>
        </h1>
        <p className="subtext">
          We'd love to hear from you. Send us a message and we'll respond
          shortly.
        </p>
      </section>

      <main className="container my-5 flex-grow-1">
        <div className="row g-4 align-items-stretch">
          <div className="col-lg-7">
            <div className="card contact-card h-100">
              <div className="card-header d-flex align-items-center gap-2">
                <i className="fa-solid fa-envelope-open-text icon"></i>
                <span className="fw-bold">Send a Message</span>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Your Name Here"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-control"
                      placeholder="Write your message here..."
                    ></textarea>
                  </div>
                  <div className="col-12 d-flex justify-content-end">
                    <button className="btn btn-primary">
                      <i className="fa-solid fa-paper-plane me-2"></i>Send
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card contact-card h-100">
              <div className="card-header d-flex align-items-center gap-2">
                <i className="fa-solid fa-circle-info icon"></i>
                <span className="fw-bold">Contact Information</span>
              </div>
              <div className="card-body d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="info-pill">
                    <i className="fa-solid fa-location-dot me-2"></i>Address
                  </div>
                  <div>Ahmedabad, Gujarat, India</div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="info-pill">
                    <i className="fa-solid fa-phone me-2"></i>Phone
                  </div>
                  <div>+91 79 1234 5678</div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="info-pill">
                    <i className="fa-solid fa-envelope me-2"></i>Email
                  </div>
                  <div>support@railexpress.app</div>
                </div>
                <div className="ratio ratio-16x9 rounded overflow-hidden mt-2">
                  <iframe
                    title="map"
                    src="https://maps.google.com/maps?q=Ahmedabad%2C%20Gujarat%2C%20India&t=&z=12&ie=UTF8&iwloc=&output=embed"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
