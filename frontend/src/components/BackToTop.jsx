// Back to top button component that appears when user scrolls down
// Provides smooth scrolling back to the top of the page with animated visibility
import React, { useEffect, useState } from "react";

const BackToTop = () => {
  // State to control button visibility based on scroll position
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Inject component-scoped styles once to avoid style conflicts
    const id = "_btt_styles";
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }

    // Component-specific CSS with glassmorphism design and animations
    style.textContent = `
      .btt-container { position: fixed; right: 22px; bottom: 26px; z-index: 1100; }
      .btt-hidden { opacity: 0; pointer-events: none; transform: translate3d(0, 8px, 0) scale(0.96); }
      .btt-visible { opacity: 1; pointer-events: auto; transform: translate3d(0, 0, 0) scale(1); }
      .btt-transition { transition: opacity .35s ease, transform .35s ease; }

      /* Main button styling with glassmorphism effect */
      .btt-button { 
        display: inline-flex; align-items: center; justify-content: center;
        width: 56px; height: 56px; border-radius: 16px; border: 1px solid rgba(99,102,241,0.35);
        background: linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.65)) padding-box,
                    linear-gradient(135deg, rgba(99,102,241,0.55), rgba(59,130,246,0.55), rgba(16,185,129,0.45)) border-box;
        box-shadow: 0 10px 28px rgba(37,99,235,0.25), inset 0 1px 0 rgba(255,255,255,0.8);
        -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
        color: #0b2368; cursor: pointer; outline: none; position: relative;
      }
      .btt-button:hover { transform: translateY(-3px); box-shadow: 0 16px 36px rgba(37,99,235,0.32), inset 0 1px 0 rgba(255,255,255,0.9); }
      .btt-button:active { transform: translateY(-1px); }

      /* Glowing ring effect around the button */
      .btt-ring { position: absolute; inset: -6px; border-radius: 20px; pointer-events: none; opacity: .6;
        background: radial-gradient(40% 60% at 50% 10%, rgba(99,102,241,.25), transparent 60%),
                    radial-gradient(50% 60% at 70% 90%, rgba(59,130,246,.2), transparent 60%);
        filter: blur(12px);
      }

      /* Icon styling with gradient fill and shadow */
      .btt-icon { width: 22px; height: 22px; display: block; }
      .btt-icon path { fill: url(#bttGrad); filter: drop-shadow(0 1px 0 rgba(255,255,255,.6)); }

      /* Hover tooltip label */
      .btt-label { position: absolute; right: 68px; white-space: nowrap; font-weight: 600; color: #1742a0;
        font-size: 0.95rem; background: rgba(255,255,255,0.85); border: 1px solid rgba(99,102,241,0.25);
        padding: 6px 10px; border-radius: 10px; box-shadow: 0 6px 16px rgba(37,99,235,0.18); opacity: 0; transform: translateY(4px);
        transition: opacity .25s ease, transform .25s ease; pointer-events: none;
      }
      .btt-button:hover .btt-label { opacity: 1; transform: translateY(0); }

      /* Responsive design for mobile devices */
      @media (max-width: 640px) { .btt-label { display: none; } .btt-button { width: 52px; height: 52px; border-radius: 14px; } }
      /* Accessibility: respect user's motion preferences */
      @media (prefers-reduced-motion: reduce) { .btt-transition, .btt-button { transition: none !important; } }
    `;

    // Scroll event handler to show/hide button based on scroll position
    const onScroll = () => {
      const show = window.scrollY > 100; // Show button after scrolling 100px
      setVisible(show);
    };

    // Add scroll listener with passive option for better performance
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // Check initial scroll position

    // Cleanup: remove event listener on component unmount
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Smooth scroll function to return to top of page
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div
      className={`btt-container btt-transition ${
        visible ? "btt-visible" : "btt-hidden"
      }`}
      aria-hidden={!visible}
    >
      <button
        type="button"
        className="btt-button btt-transition"
        aria-label="Back to top"
        onClick={scrollTop}
      >
        {/* Glowing ring effect around the button */}
        <span className="btt-ring" />

        {/* Up arrow icon with gradient fill */}
        <svg className="btt-icon" viewBox="0 0 24 24" aria-hidden="true">
          <defs>
            <linearGradient id="bttGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
          <path d="M12 4l6 6-1.4 1.4L13 7.8V20h-2V7.8L7.4 11.4 6 10z" />
        </svg>

        {/* Hover tooltip label */}
        <span className="btt-label">Back to Top</span>
      </button>
    </div>
  );
};

export default BackToTop;
