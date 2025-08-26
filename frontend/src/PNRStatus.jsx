// PNR Status checking component for train ticket status and details
// Features dynamic Bootstrap loading, animated backgrounds, and PNR lookup functionality
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import LoginSignupModal from "./LoginSignupModal";
import appLogo from "./REP_Logo3.jpg";

const PNRStatus = () => {
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
      const s = document.createElement("script");
      s.id = id;
      s.src = src;
      s.defer = true;
      document.body.appendChild(s);
      return s;
    };

    // Load Bootstrap CSS, Font Awesome CSS, and Bootstrap JavaScript
    const bs = addLink(
      "_pnr_bs_css",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    );
    const fa = addLink(
      "_pnr_fa_css",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    );
    const bsJs = addScript(
      "_pnr_bs_js",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
    );

    // Cleanup: remove injected resources when component unmounts
    return () => {
      [bs, fa].forEach(
        (el) => el && el.parentNode && el.parentNode.removeChild(el)
      );
      if (bsJs && bsJs.parentNode) bsJs.parentNode.removeChild(bsJs);
    };
  }, []);

  // Inject page-scoped styles for PNR page specific styling
  // Creates animated backgrounds and modern design elements
  useEffect(() => {
    const id = "_pnr_stylescope";
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = `
      /* Animated gradient background layers (scoped like BookingPage) */
      .pnr-scope::before,
      .pnr-scope::after {
        content: "";
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
      }
      .pnr-scope::before {
        background:
          radial-gradient(60rem 60rem at 10% 10%, rgba(99,102,241,0.25), transparent 60%),
          radial-gradient(50rem 50rem at 90% 20%, rgba(59,130,246,0.25), transparent 60%),
          radial-gradient(55rem 55rem at 20% 90%, rgba(16,185,129,0.20), transparent 60%),
          linear-gradient(135deg,#eff6ff,#f5f3ff 40%,#fdf2f8);
        animation: pnrBgFloat 18s ease-in-out infinite alternate;
        filter: saturate(120%);
      }
      .pnr-scope::after {
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
      @keyframes pnrBgFloat { 0% { transform: translate3d(0,0,0) scale(1); } 100% { transform: translate3d(0,-12px,0) scale(1.02); } }

      /* Match About page aesthetics, scoped to .pnr-scope */
      .pnr-scope .hero {
        position: relative; overflow: hidden; color: #0b2368;
        background: linear-gradient(135deg, #f0f6ff 0%, #e6efff 40%, #ffffff 100%);
        padding: 3.2rem 1rem; text-align: center;
      }
      .pnr-scope .mesh {
        position: absolute; inset: -20%; pointer-events: none; opacity: .55;
        background:
          radial-gradient(40% 30% at 15% 20%, rgba(37,99,235,.16), transparent 60%),
          radial-gradient(35% 25% at 85% 15%, rgba(59,130,246,.16), transparent 60%),
          radial-gradient(30% 25% at 50% 90%, rgba(99,102,241,.14), transparent 60%);
      }
      .pnr-scope .headline { font-weight: 900; letter-spacing: -0.6px; margin-bottom: .35rem; }
      .pnr-scope .headline .grad {
        background: linear-gradient(90deg,#1742a0,#2563eb,#60a5fa);
        -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
      }
      .pnr-scope .subtext { max-width: 820px; margin: 0 auto; color: #3b4a88; font-weight: 500; }

      /* Card: subtle glassmorphism with gradient border */
      .pnr-scope .cardx {
        position: relative;
        border: 0; border-radius: 20px; background: rgba(255,255,255,0.82);
        backdrop-filter: saturate(140%) blur(8px);
        box-shadow: 0 12px 36px rgba(29,78,216,0.12), 0 6px 18px rgba(17,24,39,0.06);
        overflow: hidden;
      }
      .pnr-scope .cardx::before {
        content: ""; position: absolute; inset: 0; pointer-events:none;
        background: linear-gradient(120deg, rgba(29,78,216,0.35), rgba(99,102,241,0.30), rgba(56,189,248,0.28));
        mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        padding: 1px; border-radius: 22px; -webkit-mask-composite: xor; mask-composite: exclude;
      }

      /* Primary button: modern gradient */
      .pnr-scope .btn-primary {
        background: linear-gradient(135deg,#1d4ed8,#2563eb,#60a5fa);
        border: none; box-shadow: 0 8px 18px rgba(37,99,235,0.35);
      }
      .pnr-scope .btn-primary:hover { filter: brightness(1.03); box-shadow: 0 10px 22px rgba(37,99,235,0.42); }
      .pnr-scope .btn-primary:active { transform: translateY(1px); }

      /* Pills (summary chips) with glass + gradient border */
      .pnr-scope .badge { border-radius: 999px; }
      .pnr-scope .badge.text-bg-light {
        --glow: rgba(37,99,235,0.15);
        background: linear-gradient(180deg, rgba(255,255,255,0.85), rgba(248,250,252,0.92));
        color: #0b2368; border: 0; padding: .65rem 1rem;
        box-shadow: 0 6px 16px var(--glow);
        position: relative; isolation: isolate;
      }
      .pnr-scope .badge.text-bg-light::after {
        content: ""; position: absolute; inset: 0; border-radius: 999px; pointer-events:none;
        background: linear-gradient(120deg, rgba(29,78,216,.45), rgba(99,102,241,.35), rgba(56,189,248,.35));
        mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        padding: 1px; -webkit-mask-composite: xor; mask-composite: exclude;
      }

      /* PNR input box styles (same as Cancel Booking) */
      .pnr-scope .pnr-box { 
        background: linear-gradient(135deg, rgba(33,150,243,0.10), rgba(76,175,80,0.08));
        border: 1px solid rgba(33,150,243,0.25);
        box-shadow: 0 10px 30px rgba(33,150,243,0.15);
        border-radius: 20px;
        padding: 1.75rem;
      }
      .pnr-scope .pnr-box .form-label { font-size: 1.05rem; color: #0d6efd; margin-bottom: 0.6rem; }
      .pnr-scope .pnr-group .input-group-text { background: #0d6efd; color: #fff; border: none; padding: 0 1.15rem; font-size: 1.1rem; }
      .pnr-scope .pnr-group .form-control { height: 64px; font-size: 1.2rem; padding: 0 1rem; }
      .pnr-scope .pnr-group .btn { height: 64px; font-size: 1.05rem; font-weight: 600; padding: 0 1.25rem; box-shadow: 0 6px 16px rgba(13,110,253,0.35); }
      .pnr-scope .pnr-group .btn .fa-solid { font-size: 1.05rem; }
      @media (max-width: 576px) { 
        .pnr-scope .pnr-group .form-control, .pnr-scope .pnr-group .btn { height: 56px; font-size: 1rem; }
        .pnr-scope .pnr-box { padding: 1.25rem; }
      }

      /* Keep Navbar identical look */
      .pnr-scope nav.navbar { padding: 0 !important; background: inherit !important; box-shadow: none !important; }
      .pnr-scope .navbar .navbar-container { padding-left: 0 !important; }
      .pnr-scope .navbar .navbar-links a { color: inherit !important; text-decoration: none !important; }
      .pnr-scope .navbar .navbar-links a:hover { text-decoration: none !important; }

      /* Table upgrades: sticky header, zebra, hover lift */
      .pnr-scope .table { --row-radius: 12px; }
      .pnr-scope .table thead th {
        position: sticky; top: 0; z-index: 1;
        background: linear-gradient(180deg, #f8fafc, #eef2ff);
        color: #334155; font-weight: 700; border-bottom: 1px solid #e5e7eb;
      }
      .pnr-scope .table tbody tr { transition: transform .12s ease, box-shadow .12s ease, background-color .12s ease; }
      .pnr-scope .table tbody tr:hover {
        background: rgba(99,102,241,0.06);
        transform: translateY(-1px);
        box-shadow: 0 6px 12px rgba(2,6,23,0.06);
      }
      .pnr-scope .table tbody tr td { border-color: #eef2f7; }
      .pnr-scope .table tbody tr:nth-child(2n) { background: rgba(2,6,23,0.015); }
      .pnr-scope .table tbody tr:first-child td:first-child { border-top-left-radius: var(--row-radius); }
      .pnr-scope .table tbody tr:first-child td:last-child { border-top-right-radius: var(--row-radius); }
      .pnr-scope .table tbody tr:last-child td:first-child { border-bottom-left-radius: var(--row-radius); }
      .pnr-scope .table tbody tr:last-child td:last-child { border-bottom-right-radius: var(--row-radius); }

      /* Download button container spacing */
      .pnr-scope .download-wrap { display: flex; justify-content: flex-end; }
    `;
    return () => {
      if (style && style.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  const [pnr, setPnr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [showLogin, setShowLogin] = useState(false);

  const isLoggedIn = () => sessionStorage.getItem("isLoggedIn") === "true";

  // Helpers: class tax and timestamp formatting (localized)
  const getClassCode = () => {
    // Try multiple possible fields from backend (case variations)
    const raw =
      summary?.class ??
      summary?.Class ??
      passengers?.[0]?.class ??
      passengers?.[0]?.Class ??
      "";
    const v = String(raw).trim();
    if (!v) return "";
    // Already a code like 2A/3A/SL/etc
    if (/^(EA|1A|EV|EC|2A|FC|3A|3E|VC|CC|SL|VS|2S)$/i.test(v))
      return v.toUpperCase();
    // Try extract (CODE)
    const m = v.match(/\(([^)]+)\)/);
    if (m) return m[1].toUpperCase();
    // Map common names
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
  const isAcClass = () => {
    const code = getClassCode();
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
    ]).has(code);
  };
  const taxRateForClass = () => {
    const code = getClassCode();
    if (code === "SL" || code === "2S") return 0;
    return isAcClass() ? 0.05 : 0; // 5% GST for AC classes
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
      // If timestamp lacks timezone info, assume UTC to avoid double-offset issues
      if (!/[zZ]|([+-]\d{2}:?\d{2})$/.test(s)) {
        // e.g., 2025-08-21T10:00:00 -> interpret as UTC
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

  const ensureJsPDF = () =>
    new Promise((resolve, reject) => {
      if (window.jspdf && window.jspdf.jsPDF)
        return resolve(window.jspdf.jsPDF);
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = () => {
        if (window.jspdf && window.jspdf.jsPDF) resolve(window.jspdf.jsPDF);
        else reject(new Error("jsPDF failed to load"));
      };
      s.onerror = () => reject(new Error("Failed to load jsPDF script"));
      document.body.appendChild(s);
    });

  const imageToDataURL = async (url) => {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return await new Promise((res) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  // Helpers copied to match PaymentPage formatting
  const getStationNameAndCode = (val) => {
    if (!val) return { name: "", code: "" };
    const raw = String(val).trim();
    const m = /^(.*)\s*\(([^)]+)\)\s*$/.exec(raw);
    if (m) return { name: m[1].trim(), code: m[2].trim() };
    return { name: raw, code: "" };
  };
  const formatStationNameCodeSmart = (nameLike, codeLike) => {
    const a = getStationNameAndCode(nameLike);
    const b = getStationNameAndCode(codeLike);
    const name = (a.name || b.name || nameLike || "").toString().trim();
    const code = (a.code || b.code || codeLike || "").toString().trim();
    const upName = name ? name.toUpperCase() : "";
    const upCode = code ? code.toUpperCase() : "";
    if (upName && upCode) return `${upName} (${upCode})`;
    if (upName) return upName;
    if (upCode) return `(${upCode})`;
    return "";
  };

  const downloadTicket = async () => {
    if (!summary || passengers.length === 0) return;
    // Helpers to parse/format dates and times for fallback computation
    const pad = (n) => String(n).padStart(2, "0");
    const parseDMYorYMD = (s) => {
      if (!s) return null;
      const str = String(s).trim();
      // DD-MM-YYYY
      const m1 = str.match(/^(\d{2})-(\d{2})-(\d{4})$/);
      if (m1) return new Date(Number(m1[3]), Number(m1[2]) - 1, Number(m1[1]));
      // YYYY-MM-DD
      const m2 = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m2) return new Date(Number(m2[1]), Number(m2[2]) - 1, Number(m2[3]));
      // Fallback try Date()
      const d = new Date(str);
      return isNaN(d.getTime()) ? null : d;
    };
    const formatDMY = (d) =>
      `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
    const timeToMinutes = (t) => {
      if (!t) return null;
      const m = String(t).match(/^(\d{1,2}):(\d{2})$/);
      if (!m) return null;
      const hh = Number(m[1]);
      const mm = Number(m[2]);
      if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
      return hh * 60 + mm;
    };
    const durationToMinutes = (dur) => {
      if (!dur) return null;
      const m = String(dur).match(/^(\d{1,2}):(\d{2})$/);
      if (!m) return null;
      return Number(m[1]) * 60 + Number(m[2]);
    };

    const jsPDF = await ensureJsPDF();
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    // Header (white bg, blue text) - identical to PaymentPage
    try {
      const logoData = await imageToDataURL(appLogo);
      doc.addImage(logoData, "JPEG", 28, 18, 120, 44);
    } catch (_) {}
    doc.setTextColor(29, 78, 216); // blue-700
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("RailExpress - Train E-Ticket", pageW - 28, 34, {
      align: "right",
    });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`PNR: ${summary.pnr}`, pageW - 28, 56, { align: "right" });

    // Card-like helper
    const card = (x, y, w, h, title) => {
      doc.setDrawColor(228);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, w, h, 10, 10, "FD");
      doc.setTextColor(17, 24, 39); // slate-900
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(title, x + 14, y + 22);
      // divider
      doc.setDrawColor(230);
      doc.line(x + 14, y + 28, x + w - 14, y + 28);
    };

    const marginX = 24;
    let cursorY = 96;

    // Journey Details card
    const cardW = pageW - marginX * 2;
    const journeyH = 160;
    card(marginX, cursorY, cardW, journeyH, "Journey Details");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    let y = cursorY + 48;
    const leftX = marginX + 16,
      rightX = marginX + cardW / 2 + 16;
    const lineGap = 18;
    const put = (label, value, x, y) => {
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFont("helvetica", "bold");
      doc.text(`${label}`, x, y);
      doc.setTextColor(17, 24, 39);
      doc.setFont("helvetica", "normal");
      doc.text(String(value || "-"), x + 130, y);
    };
    const fromDisplay = formatStationNameCodeSmart(summary.source || "", "");
    const toDisplay = formatStationNameCodeSmart(summary.destination || "", "");
    const depTime = passengers[0]?.departure_time || "";
    const arrTime = passengers[0]?.arrival_time || "";
    const duration = passengers[0]?.duration || "";
    const distance = passengers[0]?.distance || "";
    put("From", fromDisplay, leftX, y);
    put("To", toDisplay, rightX, y);
    y += lineGap;
    put("Train Name", summary.train_name || "", leftX, y);
    put("Train Number", summary.train_number || "", rightX, y);
    y += lineGap;
    put("Departure Time", depTime, leftX, y);
    put("Arrival Time", arrTime, rightX, y);
    y += lineGap;
    put("Duration", duration, leftX, y);
    put("Distance", distance, rightX, y);
    cursorY += journeyH + 12;

    // Ticket Details card
    const dateDep = summary.date_of_departure || "";
    let dateArr =
      summary.date_of_arrival || passengers[0]?.date_of_arrival || "";
    if (!dateArr) {
      // Compute arrival date from departure date + times/duration with rollover
      const depBase = parseDMYorYMD(summary.date_of_departure);
      const depM = timeToMinutes(passengers[0]?.departure_time);
      const arrM = timeToMinutes(passengers[0]?.arrival_time);
      const durM = durationToMinutes(passengers[0]?.duration);
      if (depBase) {
        let arrDateObj = null;
        if (depM != null && durM != null) {
          arrDateObj = new Date(
            depBase.getFullYear(),
            depBase.getMonth(),
            depBase.getDate()
          );
          arrDateObj = new Date(arrDateObj.getTime() + (depM + durM) * 60000);
        } else if (depM != null && arrM != null) {
          const rollover = arrM < depM ? 1440 : 0;
          arrDateObj = new Date(
            depBase.getFullYear(),
            depBase.getMonth(),
            depBase.getDate()
          );
          arrDateObj = new Date(
            arrDateObj.getTime() + (arrM + rollover) * 60000
          );
        } else if (arrM != null) {
          arrDateObj = new Date(
            depBase.getFullYear(),
            depBase.getMonth(),
            depBase.getDate()
          );
          arrDateObj = new Date(arrDateObj.getTime() + arrM * 60000);
        }
        if (arrDateObj) dateArr = formatDMY(arrDateObj);
      }
    }
    const ticketH = 120;
    card(marginX, cursorY, cardW, ticketH, "Ticket Details");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    y = cursorY + 60; // extra top padding to avoid collision with header row
    put("Date of Departure", dateDep, leftX, y);
    put("Date of Arrival", dateArr, rightX, y);
    y += lineGap;
    put("Class", summary.class || "", leftX, y);
    put("Quota", passengers[0]?.quota || "", rightX, y);
    y += lineGap;
    put("State", passengers[0]?.state || "", leftX, y);
    put("PNR", summary.pnr || "", rightX, y);
    cursorY += ticketH + 12;

    // Passenger table card
    const passH = 220;
    card(marginX, cursorY, cardW, passH, "Passenger(s)");
    y = cursorY + 52; // add a bit more top padding
    // Table header style
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(marginX + 12, y - 12, cardW - 24, 24, 6, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFontSize(10);
    const colXs = [marginX + 24, marginX + 260, marginX + 340, marginX + 420];
    ["NAME", "AGE", "GENDER", "SEAT"].forEach((h, i) =>
      doc.text(h, colXs[i], y)
    );
    doc.setFont("helvetica", "normal");
    doc.setTextColor(17, 24, 39);
    y += 24; // more space between header row and first data row
    passengers.forEach((p) => {
      const nm = (p.name || "").toString().toUpperCase();
      doc.text(nm, colXs[0], y);
      doc.text(String(p.age || "-"), colXs[1], y);
      doc.text(String(p.gender || "-"), colXs[2], y);
      doc.text(String(p.booked_seat_number || "-"), colXs[3], y);
      // Add clear vertical spacing between passenger rows
      y += 28;
    });
    cursorY += passH + 12;

    // Fare card with precise 2-decimal GST
    const subtotal = passengers.reduce(
      (acc, p) => acc + (parseFloat(p.fare) || 0),
      0
    );
    const rate = taxRateForClass();
    const tax = Math.round(subtotal * rate * 100) / 100; // 2-decimal GST
    const totalFare = Math.round((subtotal + tax) * 100) / 100;
    const fareH = 90;
    card(marginX, cursorY, cardW, fareH, "Fare");
    y = cursorY + 52;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(
      `Total Fare (incl. tax): Rs. ${Number(totalFare).toFixed(2)}`,
      marginX + 16,
      y
    );
    // Free Cancellation section removed

    // Footer note
    const footY = cursorY + fareH + 28;
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(
      "Thank you for booking with RailExpress. Please carry a valid ID during travel.",
      marginX + 4,
      footY
    );

    doc.save(`Ticket_${summary.pnr}.pdf`);
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
      setSummary(data.summary);
      setPassengers(data.passengers || []);
    } catch (e) {
      setSummary(null);
      setPassengers([]);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pnr-scope d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      {/* HERO (same as About) */}
      <section className="hero">
        <div className="mesh"></div>
        <div className="container position-relative">
          <h1 className="display-5 headline">
            <span className="grad">PNR Status</span>
          </h1>
          <p className="subtext">
            View your booked passenger details and download your ticket
            instantly.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="container my-5 flex-grow-1">
        <div className="cardx p-4 p-md-5 mx-auto" style={{ maxWidth: 980 }}>
          {/* PNR Input */}
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
                onChange={(e) => setPnr(e.target.value.replace(/\D/g, ""))}
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
                    <i className="fa-solid fa-magnifying-glass me-2"></i>Fetch
                  </>
                )}
              </button>
            </div>
            {error && <div className="text-danger mt-2">{error}</div>}
            {!isLoggedIn() && (
              <div
                className="alert alert-info d-flex align-items-center mt-3"
                role="alert"
              >
                <i className="fa-solid fa-circle-info me-2"></i>
                You must be logged in to view PNR details.
              </div>
            )}
          </div>

          {/* Summary chips */}
          {summary && (
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <div className="badge text-bg-light w-100 text-start">
                  <b>PNR:</b>&nbsp;{summary.pnr}
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="badge text-bg-light w-100 text-start">
                  <b>Date:</b>&nbsp;{summary.date_of_departure}
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="badge text-bg-light w-100 text-start">
                  <b>Train:</b>&nbsp;{summary.train_name} (
                  {summary.train_number})
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="badge text-bg-light w-100 text-start">
                  <b>Class:</b>&nbsp;{summary.class}
                </div>
              </div>
              <div className="col-12">
                <div className="badge text-bg-light w-100 text-start">
                  <b>Route:</b>&nbsp;{summary.source} → {summary.destination}
                </div>
              </div>
            </div>
          )}

          {/* Passenger table */}
          {passengers.length > 0 && (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Passenger</th>
                    <th>Seat</th>
                    <th>Created_At</th>
                    <th>Fare</th>
                    <th>GST Incl.</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.map((p, i) => (
                    <tr key={p.id}>
                      <td>{i + 1}</td>
                      <td>
                        <div className="fw-semibold">{p.name}</div>
                        <div className="text-muted small">
                          {p.gender}, {p.age} yrs
                        </div>
                      </td>
                      <td>{p.booked_seat_number}</td>
                      <td>
                        {formatLocalDateTime(p.created_at || p.Created_At)}
                      </td>
                      <td>₹{Number(p.fare || 0).toFixed(2)}</td>
                      <td>
                        ₹
                        {(typeof p.gst_incl !== "undefined"
                          ? Number(p.gst_incl || 0)
                          : Math.round(
                              parseFloat(p.fare || 0) * taxRateForClass() * 100
                            ) / 100
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Download button */}
          {summary && passengers.length > 0 && (
            <div className="text-end mt-3">
              <button className="btn btn-primary" onClick={downloadTicket}>
                <i className="fa-solid fa-download me-2"></i>Download Ticket
                (PDF)
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <LoginSignupModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={() => setShowLogin(false)}
        initialStep="login"
      />
    </div>
  );
};

export default PNRStatus;
