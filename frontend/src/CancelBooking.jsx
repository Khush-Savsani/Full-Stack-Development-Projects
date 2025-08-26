// Train booking cancellation component with PNR lookup and cancellation functionality
// Features dynamic Bootstrap loading, animated backgrounds, and booking management
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import LoginSignupModal from "./LoginSignupModal";

const CancelBooking = () => {
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
      "_cb_bs_css",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    );
    const faCss = addLink(
      "_cb_fa_css",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    );
    const bsJs = addScript(
      "_cb_bs_js",
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

  // Restore Home navbar sizing on this page (Bootstrap overrides it otherwise)
  // Inject page-scoped styles for CancelBooking page specific styling
  useEffect(() => {
    const id = "_cb_nav_restore";
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = `
      /* Animated gradient background layers (scoped like BookingPage) */
      .cb-scope::before,
      .cb-scope::after {
        content: "";
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
      }
      .cb-scope::before {
        background:
          radial-gradient(60rem 60rem at 10% 10%, rgba(99,102,241,0.25), transparent 60%),
          radial-gradient(50rem 50rem at 90% 20%, rgba(59,130,246,0.25), transparent 60%),
          radial-gradient(55rem 55rem at 20% 90%, rgba(16,185,129,0.20), transparent 60%),
          linear-gradient(135deg,#eff6ff,#f5f3ff 40%,#fdf2f8);
        animation: cancelBgFloat 18s ease-in-out infinite alternate;
        filter: saturate(120%);
      }
      .cb-scope::after {
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
      @keyframes cancelBgFloat { 0% { transform: translate3d(0,0,0) scale(1); } 100% { transform: translate3d(0,-12px,0) scale(1.02); } }

      /* Match About page aesthetics, scoped to .cb-scope */
      .cb-scope .hero {
        position: relative; overflow: hidden; color: #0b2368;
        background: linear-gradient(135deg, #f0f6ff 0%, #e6efff 40%, #ffffff 100%);
        padding: 3.2rem 1rem; text-align: center;
      }
      .cb-scope .mesh {
        position: absolute; inset: -20%; pointer-events: none; opacity: .55;
        background:
          radial-gradient(40% 30% at 15% 20%, rgba(37,99,235,.16), transparent 60%),
          radial-gradient(35% 25% at 85% 15%, rgba(59,130,246,.16), transparent 60%),
          radial-gradient(30% 25% at 50% 90%, rgba(99,102,241,.14), transparent 60%);
      }
      .cb-scope .headline { font-weight: 900; letter-spacing: -0.6px; margin-bottom: .35rem; }
      .cb-scope .headline .grad {
        background: linear-gradient(90deg,#1742a0,#2563eb,#60a5fa);
        -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
      }
      .cb-scope .subtext { max-width: 820px; margin: 0 auto; color: #3b4a88; font-weight: 500; }

      .cb-scope .cardx {
        position: relative;
        border: 0; border-radius: 20px; background: rgba(255,255,255,0.82);
        backdrop-filter: saturate(140%) blur(8px);
        box-shadow: 0 12px 36px rgba(29,78,216,0.12), 0 6px 18px rgba(17,24,39,0.06);
        overflow: hidden;
      }
      .cb-scope .cardx::before {
        content: ""; position: absolute; inset: 0; pointer-events:none;
        background: linear-gradient(120deg, rgba(29,78,216,0.35), rgba(99,102,241,0.30), rgba(56,189,248,0.28));
        mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        padding: 1px; border-radius: 22px; -webkit-mask-composite: xor; mask-composite: exclude;
      }
      .cb-scope .btn-primary { background:#1d4ed8; border-color:#1d4ed8 }
      .cb-scope .badge { border-radius: 999px; }

      /* Fix Login modal close button position (Cancel page only) */
      .cb-scope .modal-box { padding-top: 1.6rem; }
      .cb-scope .modal-close {
        top: 0.6rem;
        right: 0.8rem;
        z-index: 1001;
        line-height: 1;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        font-size: 28px;
        background: none;
        border: none;
        cursor: pointer;
      }

      /* Keep Navbar identical look to About */
      .cb-scope nav.navbar { padding: 0 !important; background: inherit !important; box-shadow: none !important; }
      .cb-scope .navbar .navbar-container { padding-left: 0 !important; }
      .cb-scope .navbar .navbar-links a { color: inherit !important; text-decoration: none !important; }
      .cb-scope .navbar .navbar-links a:hover { text-decoration: none !important; }

      /* Ensure hover effect on Cancel Booking link */
      .cb-scope .navbar-links li:last-child a,
      .cb-scope .navbar-links a[href="/cancel"] { transition: color 0.2s ease; }
      .cb-scope .navbar-links li:last-child a:hover,
      .cb-scope .navbar-links a[href="/cancel"]:hover { color: #0d6efd !important; }

      /* PNR hero box styles - scoped to Cancel Booking page */
      .cb-scope .pnr-box { 
        background: linear-gradient(135deg, rgba(33,150,243,0.10), rgba(76,175,80,0.08));
        border: 1px solid rgba(33,150,243,0.25);
        box-shadow: 0 10px 30px rgba(33,150,243,0.15);
        border-radius: 20px;
        padding: 1.75rem;
      }
      /* Gradient heading style to match About hero */
      .cb-scope .grad {
        background: linear-gradient(90deg,#1742a0,#2563eb,#60a5fa);
        -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
      }
      .cb-scope .pnr-box .form-label { font-size: 1.05rem; color: #0d6efd; margin-bottom: 0.6rem; }
      .cb-scope .pnr-group .input-group-text { background: #0d6efd; color: #fff; border: none; padding: 0 1.15rem; font-size: 1.1rem; }
      .cb-scope .pnr-group .form-control { height: 64px; font-size: 1.2rem; padding: 0 1rem; }
      .cb-scope .pnr-group .btn { height: 64px; font-size: 1.05rem; font-weight: 600; padding: 0 1.25rem; box-shadow: 0 6px 16px rgba(13,110,253,0.35); }
      .cb-scope .pnr-group .btn .fa-solid { font-size: 1.05rem; }
      @media (max-width: 576px) { 
        .cb-scope .pnr-group .form-control, .cb-scope .pnr-group .btn { height: 56px; font-size: 1rem; }
        .cb-scope .pnr-box { padding: 1.25rem; }
      }
    `;
    return () => {
      if (style && style.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  const [pnr, setPnr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null); // summary
  const [passengers, setPassengers] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showLogin, setShowLogin] = useState(false);
  const [refundPreview, setRefundPreview] = useState(0);

  const isLoggedIn = () => sessionStorage.getItem("isLoggedIn") === "true";

  // Helpers for tax-inclusive fare and timestamp formatting
  const getClassCode = () => {
    const v = (booking?.class || "").trim();
    if (!v) return "";
    if (/^(EA|1A|EV|EC|2A|FC|3A|3E|VC|CC|SL|VS|2S)$/i.test(v))
      return v.toUpperCase();
    const m = v.match(/\(([^)]+)\)/);
    if (m) return m[1].toUpperCase();
    const map = {
      "ANUBHUTI CLASS": "EA",
      "AC FIRST CLASS": "1A",
      "VISTADOME AC": "EV",
      "EXEC. CHAIR CAR": "EC",
      "AC 2 TIER": "2A",
      "FIRST CLASS": "FC",
      "AC 3 TIER": "3A",
      "AC 3 ECONOMY": "3E",
      "VISTADOME CHAIR CAR": "VC",
      "AC CHAIR CAR": "CC",
      SLEEPER: "SL",
      "VISTADOME NON AC": "VS",
      "SECOND SITTING": "2S",
    };
    const key = v.toUpperCase();
    return map[key] || v.toUpperCase();
  };
  const taxRateForClass = () => {
    const code = getClassCode();
    if (code === "SL" || code === "2S") return 0;
    return new Set([
      "EA",
      "1A",
      "EV",
      "EC",
      "2A",
      "FC",
      "3A",
      "3E",
      "VC",
      "CC",
    ]).has(code)
      ? 0.05
      : 0;
  };
  const fareInclTax = (fare) => {
    const base = parseFloat(fare || 0);
    const rate = taxRateForClass();
    return Math.round(base * (1 + rate) * 100) / 100;
  };
  // Distribute subtotal+rounded-tax per passenger (align with PaymentPage rounding)
  const fareInclTaxAtIndex = (idx) => {
    const bases = passengers.map((p) => parseFloat(p.fare || 0));
    const subtotal = bases.reduce((a, b) => a + b, 0);
    const rate = taxRateForClass();
    if (!subtotal || rate === 0) return bases[idx] || 0;
    const total = subtotal + Math.round(subtotal * rate);
    const factor = total / subtotal;
    const val = (bases[idx] || 0) * factor;
    return Math.round(val * 100) / 100;
  };
  const formatLocalDateTime = (ts) => {
    if (!ts) return "-";
    try {
      let s = String(ts);
      // If timestamp lacks timezone, assume UTC to avoid double-offset
      if (!/[zZ]|([+-]\d{2}:?\d{2})$/.test(s)) {
        s = s.replace(/\s+/g, "");
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(s)) s += "Z";
      }
      const d = new Date(s);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      });
    } catch {
      return "-";
    }
  };

  const calcRefund = (p) => {
    const fare = parseFloat(p.fare || 0);
    // Flat 70% refund policy irrespective of any prior flags
    return Math.round(fare * 0.7 * 100) / 100;
  };

  const updateRefundPreview = (ids) => {
    const total = passengers
      .filter((p) => ids.has(p.id))
      .reduce((sum, p) => sum + calcRefund(p), 0);
    setRefundPreview(Math.round(total * 100) / 100);
  };

  const toggleSelect = (pid) => {
    const next = new Set(selectedIds);
    if (next.has(pid)) next.delete(pid);
    else next.add(pid);
    setSelectedIds(next);
    updateRefundPreview(next);
  };

  const selectAll = (checked) => {
    const next = new Set();
    if (checked) passengers.forEach((p) => next.add(p.id));
    setSelectedIds(next);
    updateRefundPreview(next);
  };

  const fetchByPNR = async () => {
    setError("");
    if (!isLoggedIn()) {
      setShowLogin(true);
      return;
    }
    if (!pnr || pnr.trim().length !== 10) {
      setError("Enter valid 10-digit PNR");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch("http://localhost:8000/users/booking-by-pnr/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pnr: pnr.trim() }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Lookup failed");
      setBooking(data.summary);
      setPassengers(data.passengers || []);
      setSelectedIds(new Set());
      setRefundPreview(0);
    } catch (e) {
      setBooking(null);
      setPassengers([]);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const doCancel = async () => {
    setError("");
    if (!isLoggedIn()) {
      setShowLogin(true);
      return;
    }
    if (!booking || selectedIds.size === 0) {
      setError("Select at least one passenger to cancel");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch("http://localhost:8000/users/cancel-booking/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pnr: booking.pnr,
          passenger_ids: Array.from(selectedIds),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Cancellation failed");

      // Remove cancelled passengers from local list
      const remaining = passengers.filter((p) => !selectedIds.has(p.id));
      setPassengers(remaining);
      setSelectedIds(new Set());
      setRefundPreview(0);
      // Show a simple success message
      alert(
        `Cancelled ${data.cancelled_count} passenger(s). Total refund: ₹${data.total_refund}`
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cb-scope d-flex flex-column min-vh-100 bg-light">
      <Navbar />
      {/* HERO (match About) */}
      <section className="hero">
        <div className="mesh"></div>
        <div className="container position-relative">
          <h1 className="display-5 headline">
            <span className="grad">Cancel Booking</span>
          </h1>
          <p className="subtext">
            Partial cancellation supported per passenger.
          </p>
        </div>
      </section>

      {/* Main content */}
      <main className="container my-5 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="cardx p-4 p-md-5 mt-2">
              <div>
                {/* PNR input */}
                <div className="pnr-box mb-4">
                  <label className="form-label fw-semibold">PNR Number</label>
                  <div className="input-group pnr-group">
                    <span className="input-group-text">
                      <i className="fa-solid fa-receipt"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter 10-digit PNR"
                      maxLength={10}
                      value={pnr}
                      onChange={(e) =>
                        setPnr(e.target.value.replace(/\D/g, ""))
                      }
                    />
                    <button
                      className="btn btn-primary"
                      onClick={fetchByPNR}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <>
                          <i className="fa-solid fa-magnifying-glass me-2"></i>
                          Fetch
                        </>
                      )}
                    </button>
                  </div>
                  {error && <div className="text-danger mt-2">{error}</div>}
                </div>

                {/* Login gate */}
                {!isLoggedIn() && (
                  <div
                    className="alert alert-info d-flex align-items-center"
                    role="alert"
                  >
                    <i className="fa-solid fa-circle-info me-2"></i>
                    You must be logged in to cancel tickets.
                  </div>
                )}

                {/* Booking summary */}
                {booking && (
                  <div className="bg-light p-3 rounded-3 mb-3">
                    <div className="d-flex flex-wrap gap-3">
                      <div>
                        <strong>PNR:</strong> {booking.pnr}
                      </div>
                      <div>
                        <strong>Train:</strong> {booking.train_name} (
                        {booking.train_number})
                      </div>
                      <div>
                        <strong>Route:</strong> {booking.source} →{" "}
                        {booking.destination}
                      </div>
                      <div>
                        <strong>Class:</strong> {booking.class}
                      </div>
                      <div>
                        <strong>Date:</strong> {booking.date_of_departure}
                      </div>
                    </div>
                  </div>
                )}

                {/* Passengers table */}
                {passengers.length > 0 && (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th scope="col">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              onChange={(e) => selectAll(e.target.checked)}
                              checked={selectedIds.size === passengers.length}
                            />
                          </th>
                          <th scope="col">Passenger</th>
                          <th scope="col">Seat</th>
                          <th scope="col">Created_At</th>
                          <th scope="col">Fare</th>
                          <th scope="col">GST Incl.</th>
                          <th scope="col">Refund</th>
                        </tr>
                      </thead>
                      <tbody>
                        {passengers.map((p, i) => (
                          <tr key={p.id}>
                            <td>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={selectedIds.has(p.id)}
                                onChange={() => toggleSelect(p.id)}
                              />
                            </td>
                            <td>
                              <div className="fw-semibold">{p.name}</div>
                              <div className="text-muted small">
                                {p.gender}, {p.age} yrs
                              </div>
                            </td>
                            <td>{p.booked_seat_number}</td>
                            <td>
                              {formatLocalDateTime(
                                p.created_at || p.Created_At
                              )}
                            </td>
                            <td>₹{Number(p.fare || 0).toFixed(2)}</td>
                            <td>
                              ₹
                              {(typeof p.gst_incl !== "undefined"
                                ? Number(p.gst_incl || 0)
                                : Math.round(
                                    parseFloat(p.fare || 0) *
                                      taxRateForClass() *
                                      100
                                  ) / 100
                              ).toFixed(2)}
                            </td>
                            <td className="fw-semibold text-success">
                              ₹{calcRefund(p).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Action bar */}
                {passengers.length > 0 && (
                  <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                    <div className="fs-5">
                      <i className="fa-solid fa-rotate-left me-2 text-success"></i>
                      Total Refund:{" "}
                      <span className="fw-bold text-success">
                        ₹{refundPreview.toFixed(2)}
                      </span>
                    </div>
                    <button
                      className="btn btn-danger btn-lg"
                      disabled={selectedIds.size === 0 || loading}
                      onClick={doCancel}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <>
                          <i className="fa-solid fa-user-xmark me-2"></i>Cancel
                          Selected
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <LoginSignupModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={() => {
          setShowLogin(false);
        }}
        initialStep="login"
      />
    </div>
  );
};

export default CancelBooking;
