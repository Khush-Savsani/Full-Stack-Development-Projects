// About page component that provides company information and details
// Features dynamic Bootstrap loading, scroll reveal animations, and modern styling
import React, { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const About = () => {
  // Load Bootstrap and Font Awesome locally for this page only (scoped loading)
  // Prevents conflicts with other pages and ensures proper cleanup
  useEffect(() => {
    // Helper function to create and inject CSS links
    const ensureLink = (id, href) => {
      if (document.getElementById(id)) return null;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
      return link;
    };

    // Helper function to create and inject JavaScript files
    const ensureScript = (id, src) => {
      if (document.getElementById(id)) return null;
      const s = document.createElement("script");
      s.id = id;
      s.src = src;
      s.defer = true;
      document.body.appendChild(s);
      return s;
    };

    // Load Bootstrap CSS, Font Awesome CSS, and Bootstrap JavaScript
    const bsCss = ensureLink(
      "_about_bs_css",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    );
    const faCss = ensureLink(
      "_about_fa_css",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    );
    const bsJs = ensureScript(
      "_about_bs_js",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
    );

    // Cleanup: remove injected resources when component unmounts
    return () => {
      if (bsCss && bsCss.parentNode) bsCss.parentNode.removeChild(bsCss);
      if (faCss && faCss.parentNode) faCss.parentNode.removeChild(faCss);
      if (bsJs && bsJs.parentNode) bsJs.parentNode.removeChild(bsJs);
    };
  }, []);

  // Scroll-reveal animation system: observe elements within About page only
  // Creates smooth reveal animations when elements come into view
  useEffect(() => {
    const rootEl = document.querySelector(".about-scope");
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
            // Remove when out of view so it can animate again on re-entry
            entry.target.classList.remove("show");
          }
        });
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
    );

    // Observe all reveal elements for animation triggers
    items.forEach((el) => io.observe(el));

    // Cleanup: disconnect observer when component unmounts
    return () => io.disconnect();
  }, []);

  // Page-scoped styles (attractive, modern, Contact-like feel)
  // Injects custom CSS only for the About page to avoid global conflicts
  useEffect(() => {
    const id = "_about_styles";
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = `
      /* Animated gradient background layers (same as Contact) */
      .about-scope::before,
      .about-scope::after {
        content: "";
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
      }
      .about-scope::before {
        background:
          radial-gradient(60rem 60rem at 10% 10%, rgba(99,102,241,0.25), transparent 60%),
          radial-gradient(50rem 50rem at 90% 20%, rgba(59,130,246,0.25), transparent 60%),
          radial-gradient(55rem 55rem at 20% 90%, rgba(16,185,129,0.20), transparent 60%),
          linear-gradient(135deg,#eff6ff,#f5f3ff 40%,#fdf2f8);
        animation: aboutBgFloat 18s ease-in-out infinite alternate;
        filter: saturate(120%);
      }
      .about-scope::after {
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
      @keyframes aboutBgFloat { 0% { transform: translate3d(0,0,0) scale(1); } 100% { transform: translate3d(0,-12px,0) scale(1.02); } }

      /* Hero (unchanged) */
      .about-scope .hero {
        position: relative; overflow: hidden; color: #0b2368;
        background: linear-gradient(135deg, #f0f6ff 0%, #e6efff 40%, #ffffff 100%);
        padding: 3.2rem 1rem; text-align: center;
      }
      .about-scope .hero .mesh {
        position: absolute; inset: -20%; pointer-events: none; opacity: .55;
        background:
          radial-gradient(40% 30% at 15% 20%, rgba(37,99,235,.16), transparent 60%),
          radial-gradient(35% 25% at 85% 15%, rgba(59,130,246,.16), transparent 60%),
          radial-gradient(30% 25% at 50% 90%, rgba(99,102,241,.14), transparent 60%);
      }
      .about-scope .headline { font-weight: 900; letter-spacing: -0.6px; margin-bottom: .35rem; }
      .about-scope .headline .grad {
        background: linear-gradient(90deg,#1742a0,#2563eb,#60a5fa);
        -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
      }
      .about-scope .subtext { max-width: 820px; margin: 0 auto; color: #3b4a88; font-weight: 500; }

      /* Section title */
      .about-scope .section-title { color:#0b2368; font-weight: 800; letter-spacing:-.3px; position:relative; display:inline-block; }
      .about-scope .section-title::after { content:""; position:absolute; left:0; bottom:-6px; width:52%; height:4px; border-radius:4px; background: linear-gradient(90deg,#1d4ed8,#60a5fa); }
      .about-scope .section-desc { color:#5b6aa5 }

      /* Glass cards with gradient border */
      .about-scope .card-glass { position:relative; border-radius:20px; background: rgba(255,255,255,0.92); backdrop-filter: saturate(140%) blur(6px); border: 1px solid transparent; overflow:hidden; box-shadow: 0 10px 30px rgba(37,99,235,0.08); }
      .about-scope .card-glass::after { content:""; position:absolute; inset:0; padding:1px; border-radius:22px; background: linear-gradient(135deg, rgba(29,78,216,.45), rgba(99,102,241,.35), rgba(56,189,248,.34)); pointer-events:none; -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
      .about-scope .card-glass::before { content:""; position:absolute; top:-120%; left:-20%; width:60%; height:300%; transform: rotate(25deg); background: linear-gradient( to right, rgba(255,255,255,0), rgba(255,255,255,.28), rgba(255,255,255,0) ); filter: blur(10px); opacity:.0; transition: opacity .2s ease; }
      .about-scope .card-glass:hover::before { opacity:.8; }
      .about-scope .card-glass:hover { transform: translateY(-4px); transition: transform .2s ease, box-shadow .2s ease; box-shadow: 0 18px 48px rgba(2,6,23,.12); }

      /* Icon pill */
      .about-scope .icon-pill { width:50px; height:50px; display:inline-flex; align-items:center; justify-content:center; border-radius:16px; background: linear-gradient(135deg,#eaf1ff,#eef2ff); color:#1d4ed8; font-size:1.2rem; box-shadow: 0 6px 16px rgba(37,99,235,.18); }

      /* Timeline */
      .about-scope .timeline { position:relative; padding-left: 1rem; }
      .about-scope .timeline::before { content:""; position:absolute; left:10px; top:0; bottom:0; width:2px; background: linear-gradient(180deg,#e6efff,#c7d2fe); }
      .about-scope .tl-item { position:relative; padding-left: 2rem; }
      .about-scope .tl-item::before { content:""; position:absolute; left:1px; top:.45rem; width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid #93c5fd; box-shadow:0 4px 10px rgba(59,130,246,.25); }

      /* Testimonials */
      .about-scope .testi { border:0; border-radius:18px; background:#ffffff; box-shadow:0 10px 30px rgba(37,99,235,0.10); }
      .about-scope .testi .avatar { width:44px; height:44px; border-radius:50%; object-fit:cover; }
      .about-scope .quote { color:#0b2368; font-weight:700 }
      .about-scope .muted { color:#64748b }
      .about-scope .stars { color:#f59e0b }

      /* Values */
      .about-scope .value { border-radius:16px; background:#fff; border:1px solid #e6efff; box-shadow: 0 8px 22px rgba(37,99,235,0.08); transition: transform .18s ease, box-shadow .18s ease }
      .about-scope .value:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(2,6,23,.10) }

      /* CTA */
      .about-scope .cta { background:#ffffff; border:1px solid #e6efff; border-radius: 16px; box-shadow: 0 8px 22px rgba(37,99,235,0.08) }
      .about-scope .cta .btn-primary { background:#1d4ed8; border-color:#1d4ed8 }

      /* Keep Navbar identical on About page */
      .about-scope nav.navbar { padding: 0 !important; background: inherit !important; box-shadow: none !important; }
      .about-scope .navbar .navbar-container { padding-left: 0 !important; }
      .about-scope .navbar .navbar-links a { color: inherit !important; text-decoration: none !important; }
      .about-scope .navbar .navbar-links a:hover { text-decoration: none !important; }

      /* Scroll reveal animations (scoped) */
      .about-scope .reveal { opacity: 0; transform: translate3d(0, 12px, 0); transition: opacity .6s ease, transform .6s ease; will-change: opacity, transform; }
      .about-scope .reveal.show { opacity: 1; transform: none; }
      .about-scope .fade-up { transform: translate3d(0, 18px, 0); }
      .about-scope .fade-left { transform: translate3d(-24px, 0, 0); }
      .about-scope .fade-right { transform: translate3d(24px, 0, 0); }
    `;

    return () => {
      if (style && style.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  return (
    <div className="about-scope d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="mesh"></div>
        <div className="container position-relative">
          <h1 className="display-5 headline">
            <span className="grad">About RailExpress</span>
          </h1>
          <p className="subtext">
            Fast, reliable and thoughtfully designed rail journeys—from search
            to arrival.
          </p>
        </div>
      </section>

      <main className="container my-5 flex-grow-1">
        {/* FEATURES: premium glass grid */}
        <div className="mb-5 reveal fade-up">
          <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-3">
            <h3 className="section-title mb-0">Why RailExpress</h3>
            <div className="section-desc">
              Crafted to be fast, clear and reliable for every journey
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-4 reveal fade-up">
              <div className="card-glass p-4 h-100">
                <div className="icon-pill mb-3">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <h5 className="fw-bold mb-1">Instant Search</h5>
                <div className="text-muted">
                  Find trains and availability in a snap with helpful results.
                </div>
              </div>
            </div>
            <div className="col-md-4 reveal fade-up">
              <div className="card-glass p-4 h-100">
                <div className="icon-pill mb-3">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <h5 className="fw-bold mb-1">Trusted Platform</h5>
                <div className="text-muted">
                  Performance and security tuned for smooth bookings.
                </div>
              </div>
            </div>
            <div className="col-md-4 reveal fade-up">
              <div className="card-glass p-4 h-100">
                <div className="icon-pill mb-3">
                  <i className="fa-solid fa-bell"></i>
                </div>
                <h5 className="fw-bold mb-1">Smart Updates</h5>
                <div className="text-muted">
                  Stay informed with clear alerts and next steps.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STORY + TIMELINE */}
        <div className="row g-4 align-items-stretch mb-5">
          <div className="col-lg-6 reveal fade-left">
            <div className="card-glass p-4 p-md-5 h-100">
              <h4 className="fw-bold mb-2" style={{ color: "#0b2368" }}>
                Purposeful by Design
              </h4>
              <div className="text-muted mb-3">
                We obsess over clarity and speed so your planning feels
                effortless.
              </div>
              <ul className="timeline list-unstyled m-0">
                <li className="tl-item mb-3">
                  <div className="fw-semibold">2019 — The Idea</div>
                  <div className="muted">
                    Simplify train discovery and booking.
                  </div>
                </li>
                <li className="tl-item mb-3">
                  <div className="fw-semibold">2021 — The Launch</div>
                  <div className="muted">
                    High-performance search with a clean UI.
                  </div>
                </li>
                <li className="tl-item">
                  <div className="fw-semibold">Today — Continuous Upgrades</div>
                  <div className="muted">
                    Smarter insights, faster results, better experience.
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-6 reveal fade-right">
            <div className="card-glass p-4 p-md-5 h-100 d-flex flex-column justify-content-center">
              <div className="row g-3">
                <div className="col-6 reveal fade-up">
                  <div className="value p-3 text-center">
                    <div className="h4 mb-0">1M+</div>
                    <div className="muted small">Searches</div>
                  </div>
                </div>
                <div className="col-6 reveal fade-up">
                  <div className="value p-3 text-center">
                    <div className="h4 mb-0">99.9%</div>
                    <div className="muted small">Uptime</div>
                  </div>
                </div>
                <div className="col-6 reveal fade-up">
                  <div className="value p-3 text-center">
                    <div className="h4 mb-0">24x7</div>
                    <div className="muted small">Support</div>
                  </div>
                </div>
                <div className="col-6 reveal fade-up">
                  <div className="value p-3 text-center">
                    <div className="h4 mb-0">50+</div>
                    <div className="muted small">Cities</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="mb-5 reveal fade-up">
          <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-3">
            <h3 className="section-title mb-0">What users say</h3>
            <div className="section-desc">
              Real feedback from frequent travellers
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-4 reveal fade-up">
              <div className="testi p-4 h-100">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <img
                    className="avatar"
                    src="https://i.pravatar.cc/100?img=12"
                    alt="avatar"
                  />
                  <div>
                    <div className="fw-semibold">Aarav Patel</div>
                    <div className="muted small">Business Traveller</div>
                  </div>
                </div>
                <div className="quote">
                  “Fast, simple and reliable — love the clarity while booking.”
                </div>
              </div>
            </div>
            <div className="col-md-4 reveal fade-up">
              <div className="testi p-4 h-100">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <img
                    className="avatar"
                    src="https://i.pravatar.cc/100?img=32"
                    alt="avatar"
                  />
                  <div>
                    <div className="fw-semibold">Neha Sharma</div>
                    <div className="muted small">Designer</div>
                  </div>
                </div>
                <div className="quote">
                  “The interface feels premium and makes planning effortless.”
                </div>
              </div>
            </div>
            <div className="col-md-4 reveal fade-up">
              <div className="testi p-4 h-100">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <img
                    className="avatar"
                    src="https://i.pravatar.cc/100?img=5"
                    alt="avatar"
                  />
                  <div>
                    <div className="fw-semibold">Rahul Mehta</div>
                    <div className="muted small">Student</div>
                  </div>
                </div>
                <div className="quote">
                  “Updates are clear, and results load super quick.”
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="cta p-4 p-md-5 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 reveal fade-up">
          <div>
            <h5 className="fw-bold mb-1" style={{ color: "#0b2368" }}>
              Plan your next trip
            </h5>
            <div className="text-muted">
              Search, compare and book with confidence.
            </div>
          </div>
          <a href="/" className="btn btn-primary px-4 py-2">
            Go to Home
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
