// Train booking page component with comprehensive passenger and journey details
// Features seat selection, passenger information forms, and booking confirmation
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { addBookedSeats } from "./TrainResults";
import stations from "./Railway_stations.json";

// Color scheme constants for consistent styling
const blue = {
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  lightBg: "#eff6ff",
  border: "#bfdbfe",
};

// Reusable section component with glassmorphism design
// Provides consistent card styling for different booking sections
const Section = ({ title, children }) => (
  <div
    className="bp-card"
    style={{
      position: "relative",
      background: "rgba(255,255,255,0.9)",
      border: "1px solid transparent",
      borderRadius: 16,
      padding: 18,
      boxShadow: "0 10px 24px rgba(2,6,23,0.08)",
      overflow: "hidden",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 10,
          height: 10,
          borderRadius: 9999,
          background: blue.primary,
        }}
      />
      <span
        style={{
          color: "#0f172a",
          fontWeight: 800,
          fontSize: 16,
          letterSpacing: 0.2,
        }}
      >
        {title}
      </span>
    </div>
    {children}
  </div>
);

// Base seat capacity for each train class code (mirror TrainResults)
// Used to calculate availability and validate seat selections
const BASE_SEATS_BY_CLASS = {
  EA: 56, // Anubhuti Class
  "1A": 24, // AC First Class
  EV: 40, // Vistadome AC
  EC: 56, // Exec. Chair Car
  "2A": 52, // AC 2 Tier
  FC: 26, // First Class
  "3A": 72, // AC 3 Tier
  "3E": 83, // AC 3 Economy
  VC: 40, // Vistadome Chair Car
  CC: 78, // AC Chair car
  SL: 80, // Sleeper
  VS: 44, // Vistadome Non AC
  "2S": 102, // Second Sitting
};

// Country list and dial codes (subset commonly used for international bookings)
// Includes major countries with their ISO codes and international dialing codes
const COUNTRIES = [
  { name: "India", code: "IN", dial: "+91" },
  { name: "United States", code: "US", dial: "+1" },
  { name: "United Kingdom", code: "GB", dial: "+44" },
  { name: "Canada", code: "CA", dial: "+1" },
  { name: "Australia", code: "AU", dial: "+61" },
  { name: "United Arab Emirates", code: "AE", dial: "+971" },
  { name: "Singapore", code: "SG", dial: "+65" },
  { name: "Germany", code: "DE", dial: "+49" },
  { name: "France", code: "FR", dial: "+33" },
  { name: "Nepal", code: "NP", dial: "+977" },
  { name: "Bangladesh", code: "BD", dial: "+880" },
  { name: "Sri Lanka", code: "LK", dial: "+94" },
];

// Indian states and union territories for domestic bookings
// Comprehensive list including all states and UTs for address validation
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// Convert two-letter ISO country code to flag emoji
// Uses Unicode regional indicator symbols to display country flags
const codeToFlag = (code) => {
  if (!code || code.length !== 2) return "";
  const A = 0x1f1e6; // regional indicator A
  const aCode = code.toUpperCase();
  const first = aCode.codePointAt(0);
  const second = aCode.codePointAt(1);
  if (!first || !second) return "";
  return String.fromCodePoint(A + (first - 65), A + (second - 65));
};

// Remove standalone uppercase shortnames (e.g., IN, USA) when not inside parentheses
// Keep codes that are inside parentheses, e.g., "India (IN)" remains intact
// This function cleans up country names for better display
const sanitizeCountryName = (name) => {
  if (!name) return name;
  let out = name;
  // 1) If there's already a code in parentheses, strip any extra codes AFTER the closing parenthesis.
  //    Example: "India (IN) IN" -> "India (IN)"
  out = out.replace(/\)(\s+[A-Z]{2,3}\b)+/g, ")");
  // 2) Remove any leading stray codes before the country name (rare): "IN India" -> "India"
  out = out.replace(/^\s*[A-Z]{2,3}\s+/, "");
  // 3) If there are NO parentheses at all, strip standalone 2-3 letter uppercase tokens anywhere.
  if (!/\([^)]*\)/.test(out)) {
    out = out.replace(/\b([A-Z]{2,3})\b/g, "");
  }
  return out.replace(/\s{2,}/g, " ").trim();
};

// Local seat utils (legacy fallback)
// Functions for managing seat availability in localStorage
const seatKey = (trainNo, date, classCode) =>
  `seats:${trainNo}:${date}:${classCode}`;
const getBookedSeats = (trainNo, date, classCode) => {
  try {
    const raw = localStorage.getItem(seatKey(trainNo, date, classCode));
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
};

// Backend-based seat checking (matches TrainResults)
// Function to fetch booked seats from the backend API
async function getBookedSeatsFromDB(trainNo, date, classCode) {
  try {
    const response = await fetch("http://localhost:8000/users/check-seats/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        train_number: trainNo,
        date: date,
        train_class: classCode,
        num_passengers: 0,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.booked_count || 0;
    }
    return 0;
  } catch (_) {
    return 0;
  }
}

const TrainCard = ({ booking, selectedCount = 0 }) => {
  const { train, selectedClass, date, quota } = booking || {};
  if (!train) return null;

  const trainNo = train.trainNo || train.train_number;
  const classCode = (selectedClass || "").trim();
  const base = BASE_SEATS_BY_CLASS[classCode] || 0;

  // Keep in sync with TrainResults: fetch booked from backend
  const [bookedDB, setBookedDB] = React.useState(null);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!trainNo || !date || !classCode) {
        setBookedDB(0);
        return;
      }
      const b = await getBookedSeatsFromDB(trainNo, date, classCode);
      if (mounted) setBookedDB(b);
    })();
    return () => {
      mounted = false;
    };
  }, [trainNo, date, classCode]);

  const booked = Number.isFinite(bookedDB)
    ? bookedDB
    : getBookedSeats(trainNo, date, classCode);
  const remaining = Math.max(
    0,
    base - booked - (Number.isFinite(selectedCount) ? selectedCount : 0)
  );

  // Helpers for time/date formatting and station codes
  const extractCode = (name) => {
    const m = name.match(/\(([^)]+)\)/);
    return m ? m[1] : "";
  };

  // Robust resolver: handles values that are either "Name (CODE)" or just CODE
  const getStationNameAndCode = (val) => {
    if (!val) return { name: "", code: "" };
    const m = /^(.*)\s*\(([^)]+)\)\s*$/.exec(val);
    if (m) return { name: m[1].trim(), code: m[2].trim() };
    const s = stations.find((s) => s.CODE === val);
    if (s) return { name: s.STATION_NAME, code: s.CODE };
    return { name: val, code: "" };
  };

  const parseTimeOnDate = (dateStr, timeStr) => {
    // timeStr like "09:45 PM" or "21:05"
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    let h = 0,
      m = 0;
    const pm = /PM/i.test(timeStr);
    const am = /AM/i.test(timeStr);
    const parts = timeStr.replace(/[^0-9:]/g, "").split(":");
    if (parts.length >= 2) {
      h = parseInt(parts[0] || "0", 10);
      m = parseInt(parts[1] || "0", 10);
    }
    if (am || pm) {
      if (pm && h < 12) h += 12;
      if (am && h === 12) h = 0;
    }
    d.setHours(h, m, 0, 0);
    return d;
  };

  const formatDayMon = (d) =>
    d
      ? d.toLocaleString(undefined, {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })
      : "";
  const formatTime = (d) =>
    d
      ? d.toLocaleString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "";

  const depDate = parseTimeOnDate(date, train.departureTime || "");
  let arrDate = parseTimeOnDate(date, train.arrivalTime || "");
  if (depDate && arrDate && arrDate.getTime() <= depDate.getTime()) {
    // arrival next day (simple assumption)
    arrDate = new Date(arrDate.getTime() + 24 * 60 * 60 * 1000);
  }

  const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
  const parseDurationLabel = () => {
    if (train.duration && /:\d{2}/.test(train.duration)) {
      const [hh, mm] = train.duration
        .split(":")
        .map((x) => parseInt(x, 10) || 0);
      return `${pad2(hh)}h ${pad2(mm)}min`;
    }
    if (depDate && arrDate) {
      const diff = arrDate - depDate;
      const hh = Math.floor(diff / 3600000);
      const mm = Math.floor(diff / 60000) % 60;
      return `${pad2(hh)}h ${pad2(mm)}min`;
    }
    return "";
  };
  const durationLabel = parseDurationLabel();
  const fromInfo = getStationNameAndCode(train.fromStation);
  const toInfo = getStationNameAndCode(train.toStation);
  const isWaitlist = typeof remaining === "number" ? remaining <= 0 : false;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Header row: Name | Number */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${blue.border}`,
          borderRadius: 12,
          padding: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontWeight: 800, color: "#111827", fontSize: 18 }}>
              {train.trainName}
            </div>
            <div style={{ color: "#6b7280", fontWeight: 700 }}>| {trainNo}</div>
          </div>
        </div>
        {/* Class pill + availability + date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 12,
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg,#3b82f6,#1d4ed8)",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: 12,
              fontWeight: 900,
              boxShadow: "0 1px 2px rgba(29,78,216,0.25)",
            }}
          >
            {classCode ? `Class: ${classCode}` : "Class: -"}
          </div>
          <div
            style={{
              color: "#fff",
              background: isWaitlist
                ? "linear-gradient(90deg,#f59e0b,#ef4444)"
                : "linear-gradient(90deg,#60a5fa,#2563eb)",
              padding: "8px 12px",
              borderRadius: 12,
              fontWeight: 900,
              boxShadow: isWaitlist
                ? "0 1px 2px rgba(239,68,68,0.25)"
                : "0 1px 2px rgba(37,99,235,0.25)",
            }}
          >
            {isWaitlist ? "Waiting List" : `Available ${remaining}`}
          </div>
          <div
            style={{
              marginLeft: "auto",
              color: "#ffffff",
              background: "linear-gradient(135deg,#60a5fa,#a78bfa,#22d3ee)",
              padding: "8px 12px",
              borderRadius: 12,
              fontWeight: 900,
              border: "1px solid rgba(255,255,255,0.35)",
              boxShadow: "0 6px 14px rgba(30,64,175,0.20)",
            }}
          >
            {formatDayMon(depDate)}
          </div>
        </div>
      </div>

      {/* Timing and stations block */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${blue.border}`,
          borderRadius: 12,
          padding: 16,
        }}
      >
        {/* Top row: times with dates */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ color: "#111827", fontWeight: 900 }}>
              {formatTime(depDate)}
            </div>
            <div style={{ color: "#6b7280", fontWeight: 700 }}>
              {formatDayMon(depDate)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#111827", fontWeight: 900 }}>
              {formatTime(arrDate)}
            </div>
            <div style={{ color: "#6b7280", fontWeight: 700 }}>
              {formatDayMon(arrDate)}
            </div>
          </div>
        </div>

        {/* Dotted decorated line with centered duration */}
        <div style={{ position: "relative", margin: "12px 0 8px" }}>
          <div style={{ borderTop: "2px dotted #d1d5db", height: 0 }} />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              transform: "translate(-50%, -50%)",
              width: 10,
              height: 10,
              background: "#10b981",
              borderRadius: "50%",
              border: "2px solid #a7f3d0",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              transform: "translate(50%, -50%)",
              width: 10,
              height: 10,
              background: "#ef4444",
              borderRadius: "50%",
              border: "2px solid #fecaca",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -14,
              left: "50%",
              transform: "translateX(-50%)",
              background: "linear-gradient(135deg,#0ea5e9,#6366f1,#a855f7)",
              color: "#ffffff",
              padding: "3px 10px",
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.35)",
              boxShadow: "0 6px 14px rgba(99,102,241,0.25)",
              fontWeight: 900,
            }}
          >
            {durationLabel}
          </div>
        </div>

        {/* Stations full names and codes (robust mapping) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            alignItems: "start",
          }}
        >
          <div>
            <div style={{ color: "#111827", fontWeight: 900 }}>
              {fromInfo.name}
            </div>
            <div style={{ color: "#6b7280", fontWeight: 800 }}>
              {fromInfo.code}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#111827", fontWeight: 900 }}>
              {toInfo.name}
            </div>
            <div style={{ color: "#6b7280", fontWeight: 800 }}>
              {toInfo.code}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px dashed #d1d5db", margin: "12px 0" }} />
        <div>
          <div style={{ color: "#6b7280", fontWeight: 800, marginBottom: 4 }}>
            Boarding Station
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ color: "#111827", fontWeight: 800 }}>
              {train.fromStation}
            </div>
            <button
              type="button"
              style={{
                background: "transparent",
                border: "none",
                color: blue.primaryDark,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Change station
            </button>
          </div>
        </div>
      </div>

      {/* Quota chip */}
      {quota && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#ffffff",
            background: "linear-gradient(135deg,#dc2626,#f97316,#f59e0b)",
            padding: "6px 12px",
            borderRadius: 12,
            fontWeight: 900,
            width: "fit-content",
            boxShadow: "0 6px 14px rgba(239,68,68,0.18)",
            border: "1px solid rgba(255,255,255,0.28)",
          }}
        >
          Quota: {quota}
        </div>
      )}
    </div>
  );
};

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = useMemo(() => location.state || null, [location.state]);

  // Load a prettier font for this page only
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap";
    document.head.appendChild(link);
    // Load Bootstrap (scoped to this page's lifecycle)
    const bs = document.createElement("link");
    bs.rel = "stylesheet";
    bs.href =
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    document.head.appendChild(bs);
    // Load Font Awesome for address-book icon
    const fa = document.createElement("link");
    fa.rel = "stylesheet";
    fa.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
    document.head.appendChild(fa);
    return () => {
      document.head.removeChild(link);
      try {
        document.head.removeChild(bs);
      } catch (_) {}
      try {
        document.head.removeChild(fa);
      } catch (_) {}
    };
  }, []);

  const [passengers, setPassengers] = useState([]);
  const [mobile, setMobile] = useState("");
  const [mobileCountryCode, setMobileCountryCode] = useState("+91");
  const [addStep, setAddStep] = useState(null); // null | "new"
  const [newCount, setNewCount] = useState(1);
  const [savedPassengers, setSavedPassengers] = useState(() => {
    try {
      const raw = localStorage.getItem("savedPassengers");
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  });

  // Custom dropdown state for Berth Preference (which menu is open)
  const [openBerthFor, setOpenBerthFor] = useState(null); // index or null
  // Custom dropdown state for Nationality (which menu is open)
  const [openNationalityFor, setOpenNationalityFor] = useState(null); // index or null
  // Contact details and state dropdown
  const [contactEmail, setContactEmail] = useState(() => {
    try {
      return sessionStorage.getItem("email") || "";
    } catch (_) {
      return "";
    }
  });
  const [contactPhone, setContactPhone] = useState("");
  const [contactState, setContactState] = useState("GUJARAT");
  const [openStateDropdown, setOpenStateDropdown] = useState(false);
  useEffect(() => {
    const onDocClick = (e) => {
      // Close on outside click
      if (openBerthFor !== null) setOpenBerthFor(null);
      if (openNationalityFor !== null) setOpenNationalityFor(null);
    };
    if (openBerthFor !== null || openNationalityFor !== null) {
      document.addEventListener("click", onDocClick, { once: true });
    }
    return () => document.removeEventListener("click", onDocClick);
  }, [openBerthFor, openNationalityFor, openStateDropdown]);

  // (Payment CSS loader removed; PaymentPage has its own styles)

  // CAPTCHA state and helpers
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaGeneratedAt, setCaptchaGeneratedAt] = useState(0); // ms epoch
  const [captchaError, setCaptchaError] = useState("");
  const [captchaTick, setCaptchaTick] = useState(0); // simple ticker for countdown re-render
  const secondsLeft = useMemo(() => {
    if (!captchaGeneratedAt) return 30;
    const diff = Math.floor((Date.now() - captchaGeneratedAt) / 1000);
    return Math.max(0, 30 - diff);
  }, [captchaGeneratedAt, captchaTick]);

  const makeCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // removed easily-confused chars
    let out = "";
    for (let i = 0; i < 6; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    // Append a tiny unique salt to strengthen uniqueness across rapid regenerations
    return out;
  };

  const regenerateCaptcha = () => {
    setCaptchaCode(makeCaptcha());
    setCaptchaGeneratedAt(Date.now());
    setCaptchaInput("");
    setCaptchaError("");
  };

  // Start a 1s ticker to show countdown remaining
  useEffect(() => {
    const id = setInterval(() => setCaptchaTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Generate a CAPTCHA whenever user switches to Add New flow
  useEffect(() => {
    if (addStep === "new") {
      regenerateCaptcha();
    }
  }, [addStep]);

  const addBlankPassenger = () => ({
    name: "",
    age: "",
    gender: "",
    nationality: "Indian",
    berth: "No Preference",
    type: "adult",
  });

  const startAddNew = () => {
    setAddStep("new");
    setPassengers(Array.from({ length: newCount }, addBlankPassenger));
  };

  // (Payment state and handlers removed; handled in PaymentPage)

  const savePassengers = () => {
    // Simple validation
    for (const p of passengers) {
      if (!p.name || !p.age || !p.gender) {
        alert("Please fill all passenger details.");
        return;
      }
      if (Number(p.age) <= 4) {
        alert("Age must be above 4 years for passengers here.");
        return;
      }
      // Senior citizen quota validation: all non-infant passengers must be > 60
      if (
        booking?.quota === "Senior" &&
        !(p.type === "infant_berth" || p.type === "infant_noberth")
      ) {
        if (Number(p.age) <= 60) {
          alert(
            "Senior citizen quota selected: all passengers must be above 60 years of age."
          );
          return;
        }
      }
    }
    // Use Contact Details mobile as the required phone input
    if (!contactPhone || contactPhone.length !== 10) {
      alert("Please enter a valid mobile number in Contact Details.");
      return;
    }
    // CAPTCHA validation
    if (addStep === "new") {
      const expired = Date.now() - captchaGeneratedAt > 30000;
      if (expired) {
        setCaptchaError("Captcha expired. Please reload to get a new one.");
        alert("Captcha expired. Please reload the captcha and try again.");
        return;
      }
      if (!captchaInput || captchaInput.trim().toUpperCase() !== captchaCode) {
        setCaptchaError("Captcha does not match.");
        alert("Captcha does not match. Please try again.");
        return;
      }
    }
    // Save to savedPassengers store for re-use
    const merged = [...savedPassengers];
    passengers.forEach((p) => {
      const exists = merged.some(
        (mp) => mp.name === p.name && mp.age === p.age && mp.gender === p.gender
      );
      if (!exists) merged.push({ ...p });
    });
    setSavedPassengers(merged);
    try {
      localStorage.setItem("savedPassengers", JSON.stringify(merged));
    } catch (_) {}
    // Navigate to dedicated Payment page with all required context
    const classPriceTable = {
      EA: 3500,
      "1A": 2500,
      EV: 2200,
      EC: 1800,
      "2A": 1500,
      FC: 1200,
      "3A": 1000,
      "3E": 800,
      VC: 900,
      CC: 800,
      SL: 400,
      VS: 600,
      "2S": 200,
    };
    const selClass = (booking?.selectedClass || "").trim();
    const exactShownPrice = Number(booking?.selectedClassPrice);
    const baseFarePerPerson =
      Number.isFinite(exactShownPrice) && exactShownPrice > 0
        ? exactShownPrice
        : classPriceTable[selClass] ?? 500;
    navigate("/payment", {
      state: {
        booking,
        passengers,
        // Include selected state so it doesn't become null on Payment/Backend
        contact: {
          email: contactEmail,
          phone: contactPhone,
          state: contactState,
        },
        baseFarePerPerson,
      },
    });
  };

  if (!booking) {
    return (
      <div>
        <Navbar />
        <main
          style={{ maxWidth: 1100, margin: "40px auto", padding: "0 16px" }}
        >
          <Section title="Booking not found">
            <div style={{ color: "#374151" }}>
              No booking data. Please select a train again.
            </div>
            <button
              style={{
                marginTop: 12,
                background: blue.primary,
                color: "#fff",
                border: "none",
                padding: "8px 14px",
                borderRadius: 8,
                fontWeight: 700,
              }}
              onClick={() => navigate("/results")}
            >
              Back to Results
            </button>
          </Section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="booking-root">
      {/* Scoped, premium visuals for BookingPage only */}
      <style>{`
        /* Modern, beautiful font (medium-friendly) */
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');

        .booking-root { position: relative; min-height: 100vh; font-family: 'Segoe UI','Roboto', 'Arial', 'sans-serif'; }

        /* Animated gradient background layers (scoped) */
        .booking-root::before,
        .booking-root::after {
          content: "";
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .booking-root::before {
          background:
            radial-gradient(60rem 60rem at 10% 10%, rgba(99,102,241,0.25), transparent 60%),
            radial-gradient(50rem 50rem at 90% 20%, rgba(59,130,246,0.25), transparent 60%),
            radial-gradient(55rem 55rem at 20% 90%, rgba(16,185,129,0.20), transparent 60%),
            linear-gradient(135deg,#eff6ff,#f5f3ff 40%,#fdf2f8);
          animation: bgFloat 18s ease-in-out infinite alternate;
          filter: saturate(120%);
        }
        .booking-root::after {
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
        }
        @keyframes bgFloat {
          0% { transform: translate3d(0,0,0) scale(1); }
          100% { transform: translate3d(0,-12px,0) scale(1.02); }
        }
        @keyframes sheen { to { transform: rotate(360deg); } }

        /* Premium cards with gradient border via mask (keeps white interior) */
        .booking-root .bp-card { position: relative; border: 1px solid transparent; border-radius: 20px; background: rgba(255,255,255,0.88); transition: transform .18s ease, box-shadow .18s ease; }
        .booking-root .bp-card::after {
          content: ""; position: absolute; inset: 0; border-radius: 20px; padding: 1px;
          background: linear-gradient(135deg, rgba(59,130,246,.85), rgba(16,185,129,.70), rgba(168,85,247,.75));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          pointer-events: none;
        }
        .booking-root .bp-card:hover { transform: translateY(-2px); box-shadow: 0 24px 48px rgba(2,6,23,.14); }

        /* Inputs and controls */
        .booking-root input, .booking-root select, .booking-root textarea, .booking-root button { transition: box-shadow .2s ease, border-color .2s ease, transform .08s ease, background .2s ease; }
        .booking-root input, .booking-root select, .booking-root textarea {
          background: linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,250,251,0.96));
          border: 1px solid ${blue.border};
          border-radius: 12px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.03);
        }
        .booking-root input:focus, .booking-root select:focus, .booking-root textarea:focus {
          outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,.20);
          border-color: ${blue.primary};
        }
        .booking-root button:hover { transform: translateY(-1px); }

        /* Passenger Mobile Number: show border normally, hide on focus */
        .booking-root .mobile-wrap { border: 1px solid ${blue.border}; border-radius: 8px; overflow: hidden; transition: border-color .15s ease, box-shadow .15s ease; }
        .booking-root .mobile-wrap:focus-within { border-color: ${blue.border} !important; box-shadow: none !important; }
        .booking-root .mobile-wrap input { border: none !important; outline: none !important; box-shadow: none !important; }
        .booking-root .mobile-wrap input:focus { border: none !important; outline: none !important; box-shadow: none !important; }
      `}</style>

      <Navbar />
      <main
        className="container"
        style={{
          maxWidth: 1100,
          margin: "24px auto 48px",
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Section title="Your Selection">
          <TrainCard booking={booking} selectedCount={passengers.length} />
        </Section>

        {/* IRCTC Username (non-mandatory) moved above passenger section */}
        <Section title="IRCTC Username">
          <div style={{ color: "#6b7280", marginBottom: 8 }}>
            Your username is required to book tickets
          </div>
          <input
            placeholder="IRCTC username"
            style={{
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              padding: 12,
              borderRadius: 10,
              border: `1px solid ${blue.border}`,
              fontWeight: 600,
            }}
          />
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <button
              style={{
                background: "transparent",
                border: "none",
                color: blue.primaryDark,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              I don't have an IRCTC username
            </button>
            <button
              style={{
                background: "transparent",
                border: "none",
                color: blue.primaryDark,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Forgot username
            </button>
          </div>
        </Section>

        <Section title="Select Passenger(s)">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: 12,
            }}
          >
            {(() => {
              const active = addStep === "new";
              const style = {
                background: active ? blue.primary : "#ffffff",
                color: active ? "#fff" : blue.primaryDark,
                border: active ? "none" : `1px solid ${blue.border}`,
                padding: "10px 16px",
                borderRadius: 10,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: active ? "0 2px 6px rgba(37,99,235,0.25)" : "none",
              };
              return (
                <button style={style} onClick={startAddNew}>
                  Add New
                </button>
              );
            })()}
          </div>

          {addStep === "new" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <label style={{ fontWeight: 800, color: "#1f2937" }}>
                  How many passengers?
                </label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={newCount}
                  onChange={(e) => setNewCount(Number(e.target.value))}
                  style={{
                    width: 80,
                    padding: 8,
                    borderRadius: 8,
                    border: `1px solid ${blue.border}`,
                  }}
                />
                <button
                  style={{
                    background: blue.primaryDark,
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontWeight: 700,
                  }}
                  onClick={() =>
                    setPassengers(
                      Array.from({ length: newCount }, addBlankPassenger)
                    )
                  }
                >
                  Set
                </button>
              </div>

              {/* Contact Details card */}
              <div
                style={{
                  background: "#ffffff",
                  border: `1px solid ${blue.border}`,
                  borderLeft: `4px solid ${blue.primary}`,
                  borderRadius: 12,
                  padding: 12,
                  backgroundImage:
                    "linear-gradient(90deg,#f8fafc 0,#ffffff 30%)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        display: "grid",
                        placeItems: "center",
                        border: "2px solid rgba(37,99,235,0.45)",
                        background: blue.primary,
                        boxShadow:
                          "0 0 0 4px rgba(59,130,246,0.10), 0 8px 18px rgba(37,99,235,0.28)",
                      }}
                    >
                      {/* address-book icon (white on blue) */}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#ffffff"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path d="M17 3H7a2 2 0 0 0-2 2v1H4a1 1 0 1 0 0 2h1v2H4a1 1 0 1 0 0 2h1v2H4a1 1 0 1 0 0 2h1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-5 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm5 10H7v-.28c0-1.86 3.33-2.72 5-2.72s5 .86 5 2.72V17Z" />
                      </svg>
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: blue.primaryDark,
                          wordSpacing: 2,
                        }}
                      >
                        Contact Details
                      </div>
                      <div
                        style={{
                          color: "#6b7280",
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        Ticket details will be sent to provided contact info
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 700,
                        color: "#374151",
                        marginBottom: 4,
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      aria-invalid={
                        !contactEmail ||
                        !/^([^\s@]+)@([^\s@]+)\.[^\s@]{2,}$/.test(contactEmail)
                      }
                      style={{
                        width: "98.4%",
                        padding: 8,
                        borderRadius: 8,
                        border: `1px solid ${blue.border}`,
                      }}
                    />
                    {!contactEmail ? (
                      <div
                        style={{
                          color: "#ef4444",
                          fontWeight: 700,
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        Email is required
                      </div>
                    ) : !/^([^\s@]+)@([^\s@]+)\.[^\s@]{2,}$/.test(
                        contactEmail
                      ) ? (
                      <div
                        style={{
                          color: "#ef4444",
                          fontWeight: 700,
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        Please enter a valid email
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 700,
                        color: "#374151",
                        marginBottom: 4,
                      }}
                    >
                      Mobile Number
                    </label>
                    <div
                      className="contact-mobile-wrap"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: `1px solid ${blue.border}`,
                        borderRadius: 8,
                        overflow: "hidden",
                        width: "99.9%",
                      }}
                    >
                      <span
                        style={{
                          background: "#f3f4f6",
                          padding: "8px 10px",
                          fontWeight: 700,
                          color: "#374151",
                        }}
                      >
                        +91
                      </span>
                      <input
                        type="tel"
                        placeholder="Mobile Number"
                        value={contactPhone}
                        onChange={(e) =>
                          setContactPhone(
                            (e.target.value || "")
                              .replace(/[^0-9]/g, "")
                              .slice(0, 10)
                          )
                        }
                        inputMode="numeric"
                        aria-invalid={contactPhone.length !== 10}
                        style={{
                          padding: 8,
                          border: "none",
                          outline: "none",
                          flex: 1,
                        }}
                      />
                    </div>
                    {contactPhone.length === 0 ? (
                      <div
                        style={{
                          color: "#ef4444",
                          fontWeight: 700,
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        Mobile Number is required
                      </div>
                    ) : contactPhone.length !== 10 ? (
                      <div
                        style={{
                          color: "#ef4444",
                          fontWeight: 700,
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        Please enter valid phone number
                      </div>
                    ) : null}
                  </div>

                  {/* State row with Change */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 900,
                        color: "#111827",
                        textTransform: "uppercase",
                      }}
                    >
                      {contactState}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenStateDropdown((v) => !v);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#111827",
                        fontWeight: 900,
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Change
                    </button>

                    {openStateDropdown && (
                      <div
                        role="listbox"
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 28,
                          zIndex: 60,
                          width: "100%",
                          maxWidth: 360,
                          background:
                            "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)",
                          border: `1px solid ${blue.border}`,
                          borderRadius: 12,
                          boxShadow:
                            "0 12px 28px rgba(37,99,235,0.18), 0 4px 10px rgba(0,0,0,0.06)",
                          overflow: "hidden",
                          maxHeight: 260,
                          overflowY: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {INDIAN_STATES.map((st) => {
                          const label = st.toUpperCase();
                          const active = contactState === label;
                          return (
                            <div
                              key={label}
                              role="option"
                              aria-selected={active}
                              onClick={() => {
                                setContactState(label);
                                setOpenStateDropdown(false);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 12px",
                                fontWeight: 800,
                                color: active ? blue.primaryDark : "#111827",
                                background: active
                                  ? "linear-gradient(90deg,#eef2ff,#ffffff)"
                                  : "transparent",
                                borderLeft: active
                                  ? `4px solid ${blue.primary}`
                                  : "4px solid transparent",
                                cursor: "pointer",
                                transition:
                                  "background .15s ease,color .15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = active
                                  ? "linear-gradient(90deg,#e0e7ff,#ffffff)"
                                  : "#f3f4f6";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = active
                                  ? "linear-gradient(90deg,#eef2ff,#ffffff)"
                                  : "transparent";
                              }}
                            >
                              <span>{label}</span>
                              {active && (
                                <span
                                  style={{
                                    color: blue.primaryDark,
                                    fontWeight: 900,
                                  }}
                                >
                                  ✓
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {passengers.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#ffffff",
                    border: `1px solid ${blue.border}`,
                    borderLeft: `4px solid ${blue.primary}`,
                    borderRadius: 12,
                    padding: 12,
                    backgroundImage:
                      "linear-gradient(90deg,#f8fafc 0,#ffffff 30%)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      color: blue.primaryDark,
                      marginBottom: 8,
                    }}
                  >
                    Passenger {idx + 1}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontWeight: 700,
                          color: "#374151",
                          marginBottom: 4,
                        }}
                      >
                        Full Name
                      </label>
                      <input
                        placeholder="Enter full name"
                        value={p.name}
                        onChange={(e) =>
                          setPassengers((prev) =>
                            prev.map((pp, i) =>
                              i === idx ? { ...pp, name: e.target.value } : pp
                            )
                          )
                        }
                        aria-invalid={!p.name || !p.name.trim()}
                        style={{
                          width: "100%",
                          padding: 8,
                          borderRadius: 8,
                          border: `1px solid ${blue.border}`,
                          boxSizing: "border-box",
                        }}
                      />
                      {(!p.name || !p.name.trim()) && (
                        <div
                          style={{
                            color: "#ef4444",
                            fontWeight: 700,
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          Full Name is required
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontWeight: 700,
                          color: "#374151",
                          marginBottom: 4,
                        }}
                      >
                        Age
                      </label>
                      {(() => {
                        const senior = booking?.quota === "Senior";
                        const minAge = senior ? 61 : 4;
                        const ph = senior
                          ? "Age (Above 60 Years)"
                          : "Age (Above 4 Years)";
                        return (
                          <input
                            type="number"
                            placeholder={ph}
                            value={p.age}
                            onChange={(e) =>
                              setPassengers((prev) =>
                                prev.map((pp, i) =>
                                  i === idx
                                    ? { ...pp, age: e.target.value }
                                    : pp
                                )
                              )
                            }
                            aria-invalid={!p.age}
                            style={{
                              width: "100%",
                              padding: 8,
                              borderRadius: 8,
                              border: `1px solid ${blue.border}`,
                              boxSizing: "border-box",
                            }}
                          />
                        );
                      })()}
                      {!p.age && (
                        <div
                          style={{
                            color: "#ef4444",
                            fontWeight: 700,
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          Age is required
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontWeight: 700,
                          color: "#374151",
                          marginBottom: 6,
                        }}
                      >
                        Gender
                      </label>
                      <div
                        style={{
                          display: "flex",
                          border: `1px solid ${blue.border}`,
                          borderRadius: 10,
                          overflow: "hidden",
                          width: "100%",
                        }}
                      >
                        {(booking?.quota === "Ladies"
                          ? [{ v: "Female", label: "Female" }]
                          : [
                              { v: "Male", label: "Male" },
                              { v: "Female", label: "Female" },
                              { v: "Other", label: "Others" },
                            ]
                        ).map((g, gi) => {
                          const active = p.gender === g.v;
                          return (
                            <button
                              key={g.v}
                              type="button"
                              onClick={() =>
                                setPassengers((prev) =>
                                  prev.map((pp, i) =>
                                    i === idx ? { ...pp, gender: g.v } : pp
                                  )
                                )
                              }
                              style={{
                                flex: 1,
                                background: active ? blue.primary : "#f9fafb",
                                color: active ? "#fff" : "#111827",
                                border: "none",
                                padding: "10px 12px",
                                fontWeight: 800,
                                cursor: "pointer",
                                borderRight:
                                  gi < 2 ? `1px solid ${blue.border}` : "none",
                                transition:
                                  "background 0.15s ease, color 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (!active) {
                                  e.currentTarget.style.background =
                                    blue.lightBg;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!active) {
                                  e.currentTarget.style.background = "#f9fafb";
                                }
                              }}
                            >
                              {g.label}
                            </button>
                          );
                        })}
                      </div>
                      {!p.gender && (
                        <div
                          style={{
                            color: "#ef4444",
                            fontWeight: 700,
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          Gender is required
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontWeight: 700,
                          color: "#374151",
                          marginBottom: 4,
                        }}
                      >
                        Nationality
                      </label>
                      <div
                        aria-readonly
                        style={{
                          width: "100%",
                          padding: "10px 44px 10px 12px",
                          borderRadius: 12,
                          border: `1px solid ${blue.border}`,
                          background: "linear-gradient(180deg,#ffffff,#f9fafb)",
                          color: "#111827",
                          fontWeight: 800,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          userSelect: "none",
                          cursor: "default",
                          width: "94.7%",
                        }}
                      >
                        Indian (IN)
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontWeight: 700,
                          color: "#374151",
                          marginBottom: 4,
                        }}
                      >
                        Berth Preference
                      </label>
                      <div style={{ position: "relative" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenBerthFor(openBerthFor === idx ? null : idx);
                          }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "10px 44px 10px 12px",
                            borderRadius: 12,
                            border: `1px solid ${blue.border}`,
                            background:
                              "linear-gradient(180deg,#ffffff,#f9fafb)",
                            color: "#111827",
                            fontWeight: 800,
                            outline: "none",
                            boxShadow:
                              openBerthFor === idx
                                ? "0 0 0 3px rgba(37,99,235,0.25)"
                                : "0 2px 8px rgba(0,0,0,0.06)",
                            cursor: "pointer",
                            transition:
                              "box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease",
                          }}
                        >
                          {p.berth || "No Preference"}
                          <span
                            style={{
                              position: "absolute",
                              right: 10,
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: blue.primaryDark,
                            }}
                          >
                            ▼
                          </span>
                        </button>

                        {openBerthFor === idx && (
                          <div
                            role="listbox"
                            style={{
                              position: "absolute",
                              zIndex: 50,
                              width: "100%",
                              marginTop: 6,
                              background:
                                "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)",
                              border: `1px solid ${blue.border}`,
                              borderRadius: 12,
                              boxShadow:
                                "0 12px 28px rgba(37,99,235,0.18), 0 4px 10px rgba(0,0,0,0.06)",
                              overflow: "hidden",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {[
                              "No Preference",
                              "Lower",
                              "Middle",
                              "Upper",
                              "Side Lower",
                              "Side Upper",
                            ].map((opt) => {
                              const active = p.berth === opt;
                              return (
                                <div
                                  key={opt}
                                  role="option"
                                  aria-selected={active}
                                  onClick={() => {
                                    setPassengers((prev) =>
                                      prev.map((pp, i) =>
                                        i === idx ? { ...pp, berth: opt } : pp
                                      )
                                    );
                                    setOpenBerthFor(null);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "10px 12px",
                                    fontWeight: 800,
                                    color: active
                                      ? blue.primaryDark
                                      : "#111827",
                                    background: active
                                      ? "linear-gradient(90deg,#eef2ff,#ffffff)"
                                      : "transparent",
                                    borderLeft: active
                                      ? `4px solid ${blue.primary}`
                                      : "4px solid transparent",
                                    transition:
                                      "background 0.15s ease, color 0.15s ease, transform 0.05s ease",
                                    cursor: "pointer",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = active
                                      ? "linear-gradient(90deg,#e0e7ff,#ffffff)"
                                      : "#f3f4f6";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = active
                                      ? "linear-gradient(90deg,#eef2ff,#ffffff)"
                                      : "transparent";
                                  }}
                                >
                                  <span>{opt}</span>
                                  {active && (
                                    <span
                                      style={{
                                        color: blue.primaryDark,
                                        fontWeight: 900,
                                      }}
                                    >
                                      ✓
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* CAPTCHA (moved here just before action buttons) */}
              {addStep === "new" && (
                <div style={{ marginTop: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      aria-label="Captcha code"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px 14px",
                        minWidth: 140,
                        borderRadius: 12,
                        border: `1px solid ${blue.border}`,
                        background:
                          "repeating-linear-gradient(45deg,#f8fafc,#f8fafc 10px,#eef2ff 10px,#eef2ff 20px)",
                        letterSpacing: 4,
                        fontWeight: 900,
                        color: "#111827",
                        userSelect: "none",
                      }}
                    >
                      {captchaCode}
                    </div>
                    <button
                      type="button"
                      onClick={regenerateCaptcha}
                      title="Reload captcha"
                      style={{
                        background: "#ffffff",
                        color: blue.primaryDark,
                        border: `1px solid ${blue.border}`,
                        padding: "8px 12px",
                        borderRadius: 10,
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa fa-refresh" aria-hidden="true" />
                    </button>
                    <input
                      placeholder="Enter captcha"
                      value={captchaInput}
                      onChange={(e) => {
                        setCaptchaInput(e.target.value.toUpperCase());
                        setCaptchaError("");
                      }}
                      style={{
                        flex: 1,
                        minWidth: 220,
                        padding: 10,
                        borderRadius: 10,
                        border: `1px solid ${blue.border}`,
                      }}
                    />
                  </div>
                  {captchaError && (
                    <div
                      style={{
                        color: "#ef4444",
                        fontWeight: 700,
                        fontSize: 12,
                        marginTop: 6,
                      }}
                    >
                      {captchaError}
                    </div>
                  )}
                </div>
              )}

              <div
                style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
              >
                <button
                  style={{
                    background: "#ffffff",
                    color: blue.primaryDark,
                    border: `1px solid ${blue.border}`,
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontWeight: 700,
                  }}
                  onClick={() => setAddStep(null)}
                >
                  Cancel
                </button>
                <button
                  style={{
                    background: blue.primary,
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontWeight: 700,
                  }}
                  onClick={savePassengers}
                >
                  Save & Continue
                </button>
              </div>
            </div>
          )}

          {/* 'Add Existing' option removed */}

          {/* Infant options removed */}

          {passengers.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: blue.primaryDark,
                  marginBottom: 8,
                }}
              >
                Selected Passengers
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 8,
                }}
              >
                {passengers.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#ffffff",
                      border: `1px solid ${blue.border}`,
                      borderRadius: 10,
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#111827" }}>
                      {p.name || "(Unnamed)"}
                    </div>
                    <div style={{ color: "#374151", fontSize: 13 }}>
                      Age: {p.age || "-"} • {p.gender || "-"}
                    </div>
                    <div style={{ color: "#374151", fontSize: 13 }}>
                      Berth: {p.berth || "No Preference"}
                    </div>
                    <button
                      style={{
                        marginTop: 8,
                        background: "#fff",
                        color: blue.primaryDark,
                        border: `1px solid ${blue.border}`,
                        padding: "6px 10px",
                        borderRadius: 8,
                        fontWeight: 700,
                      }}
                      onClick={() =>
                        setPassengers((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default BookingPage;
