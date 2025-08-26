// Payment processing page component for train ticket bookings
// Features seat allocation, multiple payment methods, and booking confirmation
import React, { useEffect, useMemo, useState } from "react";
import appLogo from "./REP_Logo3.jpg";
import hdfcLogo from "./bi-HDFC.png";
import iciciLogo from "./bi-ICICI.png";
import kotakLogo from "./bi-kotak.png";
import axisLogo from "./bi-axis.png";
import yesLogo from "./bi-Yes.png";
import pnbLogo from "./bi-PNB.png";
import sbiLogo from "./bi-SBI.png";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import stations from "./Railway_stations.json";

// Seat allocation API function for backend integration
// Allocates seats for passengers and returns allocated seat numbers
const allocateSeats = async (trainNumber, date, trainClass, numPassengers) => {
  try {
    const response = await fetch("http://localhost:8000/users/check-seats/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        train_number: trainNumber,
        date: date,
        train_class: trainClass,
        num_passengers: numPassengers,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.allocated_seats || [];
    }
    return [];
  } catch (error) {
    console.error("Error allocating seats:", error);
    return [];
  }
};

// Color scheme constants for consistent styling
const blue = {
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  lightBg: "#eff6ff",
  border: "#bfdbfe",
};

// Base seat capacity for each train class code
// Used to calculate availability and validate seat allocations
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

// Class categorization for fare calculation and tax purposes
const AC_CLASSES = new Set([
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
]);
const ZERO_TAX_CLASSES = new Set(["SL", "2S"]);

const PaymentPage = () => {
  // Router hooks and state extraction
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const {
    booking,
    passengers = [],
    contact = {},
    baseFarePerPerson: stateBaseFare,
  } = state;

  // Load Bootstrap and Font Awesome for payment page styling
  useEffect(() => {
    const bs = document.createElement("link");
    bs.rel = "stylesheet";
    bs.href =
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    document.head.appendChild(bs);
    // Load Font Awesome for realistic payment icons
    const fa = document.createElement("link");
    fa.rel = "stylesheet";
    fa.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
    document.head.appendChild(fa);
    return () => {
      try {
        document.head.removeChild(bs);
      } catch (_) {}
      try {
        document.head.removeChild(fa);
      } catch (_) {}
    };
  }, []);

  // Redirect if required state missing (prevents direct navigation)
  useEffect(() => {
    if (!booking || !passengers || passengers.length === 0) {
      // If someone navigates directly without booking data
      navigate("/booking");
    }
  }, [booking, passengers, navigate]);

  // Payment method state management
  const [paymentMethod, setPaymentMethod] = useState("UPI"); // UPI | CREDIT | DEBIT | NET

  // UPI payment state
  const [upiId, setUpiId] = useState("");
  // Card shared
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState(""); // MM/YY
  const [cardCvv, setCardCvv] = useState("");
  // Net Banking
  const [bank, setBank] = useState("");
  const [openBankDropdown, setOpenBankDropdown] = useState(false);
  // Brand logos provided by user (imported from src)
  const BANKS = [
    { name: "HDFC", logo: hdfcLogo },
    { name: "ICICI", logo: iciciLogo },
    { name: "Kotak", logo: kotakLogo },
    { name: "Axis Bank", logo: axisLogo },
    { name: "Yes Bank", logo: yesLogo },
    { name: "Punjab National Bank", logo: pnbLogo },
    { name: "SBI", logo: sbiLogo },
  ];

  const CLASS_NAME_TO_CODE = {
    "Anubhuti Class": "EA",
    "AC First Class": "1A",
    "Vistadome AC": "EV",
    "Exec. Chair Car": "EC",
    "AC 2 Tier": "2A",
    "First Class": "FC",
    "AC 3 Tier": "3A",
    "AC 3 Economy": "3E",
    "Vistadome Chair Car": "VC",
    "AC Chair Car": "CC",
    Sleeper: "SL",
    "Vistadome Non AC": "VS",
    "Second Sitting": "2S",
  };

  const getSelectedClassCode = () => {
    let v = (booking?.selectedClass || "").trim();
    if (!v) return "";
    // If already a known code
    if (BASE_SEATS_BY_CLASS[v] !== undefined) return v;
    // Try to extract (CODE)
    const m = v.match(/\(([^)]+)\)/);
    if (m && BASE_SEATS_BY_CLASS[m[1]] !== undefined) return m[1];
    // Try mapping from name
    if (CLASS_NAME_TO_CODE[v]) return CLASS_NAME_TO_CODE[v];
    return v; // fallback
  };

  // Extract station display name from values like "Ahmedabad Jn (ADI)" or return the value as-is
  const getStationName = (val) => {
    if (!val) return "";
    const m = /^(.*)\s*\(([^)]+)\)\s*$/.exec(val);
    return m ? m[1].trim() : val;
  };

  // Extract both station name and code. If input is just CODE, resolve to NAME (CODE)
  const getStationNameAndCode = (val) => {
    if (!val) return { name: "", code: "" };
    const raw = String(val).trim();
    const m = /^(.*)\s*\(([^)]+)\)\s*$/.exec(raw);
    if (m) return { name: m[1].trim(), code: m[2].trim() };
    // Try resolving CODE-only to full name via stations list
    const byCode = stations.find(
      (s) => s.CODE.toUpperCase() === raw.toUpperCase()
    );
    if (byCode) return { name: byCode.STATION_NAME, code: byCode.CODE };
    // Try resolving NAME-only to include its CODE
    const byName = stations.find(
      (s) => s.STATION_NAME.toUpperCase() === raw.toUpperCase()
    );
    if (byName) return { name: byName.STATION_NAME, code: byName.CODE };
    return { name: raw, code: "" };
  };

  // Return display text as "NAME (CODE)" in UPPERCASE; if code missing, just NAME
  const formatStationNameCode = (val) => {
    const { name, code } = getStationNameAndCode(val);
    const n = (name || "").toUpperCase();
    const c = (code || "").toUpperCase();
    return c ? `${n} (${c})` : n;
  };

  // Return display text as "NAME (CODE)" using both a name-like and code-like value as fallbacks
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

  // Ensure jsPDF is available (load from CDN if needed)
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

  // Convert image URL (bundled) to dataURL for jsPDF addImage
  const imageToDataURL = async (url) => {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return await new Promise((res) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const generateTicketPDF = async ({ pnr, allocatedSeats, totalFare }) => {
    const jsPDF = await ensureJsPDF();
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    // Header (white bg, blue text)
    try {
      const logoData = await imageToDataURL(appLogo);
      // Proper logo size for visibility on white header
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
    doc.text(`PNR: ${pnr}`, pageW - 28, 56, { align: "right" });

    // Booking summary box
    const src = getStationNameAndCode(
      booking?.train?.fromStation || booking?.from || booking?.source || ""
    );
    const dst = getStationNameAndCode(
      booking?.train?.toStation || booking?.to || booking?.destination || ""
    );
    const depTime =
      booking?.train?.departureTime ||
      booking?.departure ||
      booking?.departureTime ||
      "";
    const arrTime =
      booking?.train?.arrivalTime ||
      booking?.arrival ||
      booking?.arrivalTime ||
      "";
    const duration = booking?.train?.duration || booking?.duration || "";
    const distance = booking?.train?.distance || booking?.distance || "";
    const trainName =
      booking?.train?.trainName ||
      booking?.train?.name ||
      booking?.trainName ||
      "";
    const trainNo =
      booking?.train?.trainNo || booking?.train?.train_number || "";
    const cls = (booking?.selectedClass || "").trim();
    const quota = booking?.quota || booking?.train?.quota || "GN";
    const stateSel = (location.state?.contact?.state || "").toString();

    // Card-like panels (Bootstrap/Tailwind-inspired spacing & contrast)
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
    const fromDisplay = formatStationNameCodeSmart(
      booking?.train?.fromStation ||
        booking?.from ||
        booking?.source ||
        booking?.fromStation ||
        "",
      booking?.train?.fromCode ||
        booking?.fromCode ||
        booking?.sourceCode ||
        booking?.train?.from_station_code ||
        booking?.from_station_code ||
        ""
    );
    const toDisplay = formatStationNameCodeSmart(
      booking?.train?.toStation ||
        booking?.to ||
        booking?.destination ||
        booking?.toStation ||
        "",
      booking?.train?.toCode ||
        booking?.toCode ||
        booking?.destinationCode ||
        booking?.train?.to_station_code ||
        booking?.to_station_code ||
        ""
    );
    put("From", fromDisplay, leftX, y);
    put("To", toDisplay, rightX, y);
    y += lineGap;
    put("Train Name", trainName, leftX, y);
    put("Train Number", trainNo, rightX, y);
    y += lineGap;
    put("Departure Time", depTime, leftX, y);
    put("Arrival Time", arrTime, rightX, y);
    y += lineGap;
    put("Duration", duration, leftX, y);
    put("Distance", distance, rightX, y);
    cursorY += journeyH + 12;

    // Dates and class (prefer accurate dates computed in TrainResults.jsx)
    const dateDep = booking?.train?.departure_date || booking?.date || "";
    const dateArr = booking?.train?.arrival_date || booking?.date || "";
    const ticketH = 120;
    card(marginX, cursorY, cardW, ticketH, "Ticket Details");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    y = cursorY + 60; // extra top padding to avoid collision with header row
    put("Date of Departure", dateDep, leftX, y);
    put("Date of Arrival", dateArr, rightX, y);
    y += lineGap;
    put("Class", cls, leftX, y);
    put("Quota", quota, rightX, y);
    y += lineGap;
    put("State", stateSel, leftX, y);
    put("PNR", pnr, rightX, y);
    cursorY += ticketH + 12;

    // Passenger table
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
    passengers.forEach((p, idx) => {
      const seat =
        (allocatedSeats && allocatedSeats[idx]) || p.Booked_Seat_Number || "-";
      const nm = (p.name || "").toString().toUpperCase();
      doc.text(nm, colXs[0], y);
      doc.text(String(p.age || "-"), colXs[1], y);
      doc.text(String(p.gender || "-"), colXs[2], y);
      doc.text(String(seat || "-"), colXs[3], y);
      // Add clear vertical spacing between passenger rows
      y += 28;
    });
    cursorY += passH + 12;

    // Fare info
    // Recompute precise totals (2-decimal GST) for PDF display
    const perForPdf = getBaseFarePerPerson();
    const countForPdf = passengers.length || 1;
    const classCodeForPdf = getSelectedClassCode();
    const rateForPdf = ZERO_TAX_CLASSES.has(classCodeForPdf)
      ? 0
      : AC_CLASSES.has(classCodeForPdf)
      ? 0.05
      : 0;
    const subtotalForPdf = perForPdf * countForPdf;
    const taxForPdf = Math.round(subtotalForPdf * rateForPdf * 100) / 100; // 2-decimal GST
    const preciseTotal = Math.round((subtotalForPdf + taxForPdf) * 100) / 100;

    const fareH = 90;
    card(marginX, cursorY, cardW, fareH, "Fare & Cancellation");
    y = cursorY + 52;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    // Ensure plain text, no superscripts
    doc.text(
      `Total Fare (incl. tax): Rs. ${preciseTotal.toFixed(2)}`,
      marginX + 16,
      y
    );

    // Footer note
    const footY = cursorY + fareH + 28;
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(
      "Thank you for booking with RailExpress. Please carry a valid ID during travel.",
      marginX + 4,
      footY
    );

    doc.save(`Ticket_${pnr}.pdf`);
  };

  const getBaseFarePerPerson = () => {
    // Prefer exact base fare from previous step if provided
    const parsed = Number(stateBaseFare);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    const cls = getSelectedClassCode();
    // This table mirrors TrainResults.jsx classTypes pricing
    const table = {
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
    return table[cls] || 500;
  };

  const fare = useMemo(() => {
    const per = getBaseFarePerPerson();
    const count = passengers.length || 1;
    const cls = getSelectedClassCode();
    const taxRate = ZERO_TAX_CLASSES.has(cls)
      ? 0
      : AC_CLASSES.has(cls)
      ? 0.05
      : 0;
    const subtotal = per * count;
    const tax = Math.round(subtotal * taxRate * 100) / 100; // two-decimal GST
    const total = Math.round((subtotal + tax) * 100) / 100;
    return { per, count, taxRate, subtotal, tax, total };
  }, [booking, passengers]);

  const luhnCheck = (num) => {
    const s = (num || "").replace(/\s+/g, "");
    if (!/^\d{12,19}$/.test(s)) return false;
    let sum = 0,
      dbl = false;
    for (let i = s.length - 1; i >= 0; i--) {
      let d = parseInt(s[i], 10);
      if (dbl) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  };

  const validatePayment = () => {
    if (paymentMethod === "UPI") {
      if (!/^[-\w.]{2,}@[\w.]{2,}$/.test(upiId)) {
        alert("Enter a valid UPI ID (e.g., name@bank).");
        return false;
      }
      return true;
    }
    if (paymentMethod === "CREDIT") {
      if (!cardName.trim()) {
        alert("Name on card is required.");
        return false;
      }
      if (!/^[A-Za-z ]+$/.test(cardName.trim())) {
        alert("Name on card must contain alphabets and spaces only.");
        return false;
      }
      const digits = cardNumber.replace(/\s+/g, "");
      // Credit card: exactly 15 or 16 digits
      if (!/^\d{15,16}$/.test(digits)) {
        alert("Credit card number must be exactly 15 or 16 digits.");
        return false;
      }
      if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(cardExpiry)) {
        alert("Expiry must be MM/YY.");
        return false;
      }
      const [mm, yy] = cardExpiry.split("/").map((x) => parseInt(x, 10));
      const now = new Date();
      // Valid through end of the expiry month
      const exp = new Date(2000 + yy, mm, 0, 23, 59, 59, 999);
      if (now > exp) {
        alert("Card is expired.");
        return false;
      }
      // Credit card CVV: exactly 3 digits
      if (!/^\d{3}$/.test(cardCvv)) {
        alert("Credit card CVV must be exactly 3 digits.");
        return false;
      }
      return true;
    }
    if (paymentMethod === "DEBIT") {
      if (!cardName.trim()) {
        alert("Name on card is required.");
        return false;
      }
      if (!/^[A-Za-z ]+$/.test(cardName.trim())) {
        alert("Name on card must contain alphabets and spaces only.");
        return false;
      }
      const digits = cardNumber.replace(/\s+/g, "");
      // Debit: exactly 16 digits (no Luhn check)
      if (!/^\d{16}$/.test(digits)) {
        alert("Debit card number must be exactly 16 digits.");
        return false;
      }
      if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(cardExpiry)) {
        alert("Expiry must be MM/YY.");
        return false;
      }
      const [mm, yy] = cardExpiry.split("/").map((x) => parseInt(x, 10));
      const now = new Date();
      // Valid through end of the expiry month
      const exp = new Date(2000 + yy, mm, 0, 23, 59, 59, 999);
      if (now > exp) {
        alert("Card is expired.");
        return false;
      }
      // Debit card CVV: exactly 3 digits
      if (!/^\d{3}$/.test(cardCvv)) {
        alert("Debit card CVV must be exactly 3 digits.");
        return false;
      }
      return true;
    }
    if (paymentMethod === "NET") {
      if (!bank) {
        alert("Please select your bank.");
        return false;
      }
      return true;
    }
    return false;
  };

  const seatAssignKey = (trainNo, date, classCode) =>
    `seatsAssigned:${trainNo}:${date}:${classCode}`;
  const readAssignedSeats = (trainNo, date, classCode) => {
    try {
      const raw = localStorage.getItem(seatAssignKey(trainNo, date, classCode));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };
  const writeAssignedSeats = (trainNo, date, classCode, arr) => {
    try {
      localStorage.setItem(
        seatAssignKey(trainNo, date, classCode),
        JSON.stringify(arr)
      );
    } catch {}
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;
    const { total } = fare;
    const classCode = (booking?.selectedClass || "").trim();
    const trainNo = booking?.train?.trainNo || booking?.train?.train_number;
    const date = booking?.date;
    const needed = passengers.length;

    try {
      // Debug: Log the booking object structure
      console.log("Booking object:", booking);
      console.log("Available booking keys:", Object.keys(booking || {}));

      // Allocate seats from database
      const allocatedSeats = await allocateSeats(
        trainNo,
        date,
        classCode,
        needed
      );

      if (!allocatedSeats || allocatedSeats.length < needed) {
        alert("Not enough seats available to complete booking.");
        return;
      }

      // Prepare passenger data with allocated seats
      const passengersWithSeats = passengers.map((passenger, index) => ({
        ...passenger,
        Booked_Seat_Number: allocatedSeats[index] || "NA",
      }));

      // Save booking to database
      // Backend expects YYYY-MM-DD for dates. Convert if we have DD-MM-YYYY from TrainResults.
      const toYMD = (s) => {
        if (!s) return s;
        const m = String(s).match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (m) return `${m[3]}-${m[2]}-${m[1]}`;
        return s; // already YYYY-MM-DD or other
      };
      const depDatePref =
        booking?.train?.departure_date ||
        date ||
        new Date().toISOString().split("T")[0];
      const arrDatePref =
        booking?.train?.arrival_date ||
        date ||
        new Date().toISOString().split("T")[0];
      const depYMD = toYMD(depDatePref);
      const arrYMD = toYMD(arrDatePref);
      const bookingData = {
        booking: {
          // Keep "NAME (CODE)" with robust fallbacks (handles code-only or name-only inputs)
          Source:
            formatStationNameCodeSmart(
              booking?.train?.fromStation ||
                booking?.from ||
                booking?.source ||
                booking?.fromStation ||
                "",
              booking?.train?.fromCode ||
                booking?.fromCode ||
                booking?.sourceCode ||
                booking?.train?.from_station_code ||
                booking?.from_station_code ||
                ""
            ) || "Unknown",
          Destination:
            formatStationNameCodeSmart(
              booking?.train?.toStation ||
                booking?.to ||
                booking?.destination ||
                booking?.toStation ||
                "",
              booking?.train?.toCode ||
                booking?.toCode ||
                booking?.destinationCode ||
                booking?.train?.to_station_code ||
                booking?.to_station_code ||
                ""
            ) || "Unknown",
          Train_Name:
            booking?.train?.trainName ||
            booking?.train?.name ||
            booking?.trainName ||
            "Unknown Train",
          Train_Number: trainNo || "Unknown",
          Departure_Time:
            booking?.train?.departureTime ||
            booking?.departure ||
            booking?.departureTime ||
            "00:00",
          Arrival_Time:
            booking?.train?.arrivalTime ||
            booking?.arrival ||
            booking?.arrivalTime ||
            "00:00",
          Duration: booking?.train?.duration || booking?.duration || "8:00",
          Distance: booking?.train?.distance || booking?.distance || "500 km",
          Class: classCode || "SL",
          Quota: booking?.quota || booking?.train?.quota || "GN",
          // Send in backend-required format YYYY-MM-DD
          Date_of_Departure: depYMD,
          Date_of_Arrival: arrYMD,
        },
        passengers: passengersWithSeats,
        contact: contact,
        fare_per_person: fare.per,
      };

      const response = await fetch(
        "http://localhost:8000/users/save-passengers/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Generate downloadable PDF ticket before navigating away
        await generateTicketPDF({
          pnr: result.pnr,
          allocatedSeats,
          totalFare: total,
        });
        alert(
          `Payment successful! Total paid: ₹${total}. PNR: ${
            result.pnr
          }. Seats: ${allocatedSeats.join(", ")}`
        );
        navigate("/results");
      } else {
        const errorData = await response.json();
        alert(`Booking failed: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    }
  };

  const cls = (booking?.selectedClass || "").trim();

  return (
    <div
      className="payment-root"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#eff6ff,#e0e7ff,#fce7f3)",
      }}
    >
      <style>{`
        .payment-root .card-glass { background: rgba(255,255,255,0.92); border: 1px solid ${blue.border}; border-radius: 16px; box-shadow: 0 10px 24px rgba(2,6,23,0.08); }
        .payment-root .nav-btn { font-weight: 700; }
        .payment-root .summary-header { background: linear-gradient(135deg, ${blue.primary}, ${blue.primaryDark}); color: #fff; border-radius: 12px; padding: 14px 16px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.15); }
        .payment-root .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .payment-root .chip { display:inline-block; padding: 4px 10px; border-radius: 999px; background: #e0e7ff; font-weight:700; color: #1e293b; border: 1px solid ${blue.border}; }
        /* Bank logo sizing; mix-blend-mode helps visually suppress white backgrounds on non-white surfaces */
        .payment-root .bank-logo { width: 22px; height: 22px; object-fit: contain; display: inline-block; mix-blend-mode: multiply; }
      `}</style>
      <Navbar />
      <div className="container py-4" style={{ maxWidth: 900 }}>
        {/* Fare Summary on top */}
        <div className="card-glass p-0 mb-4">
          <div className="summary-header d-flex justify-content-between align-items-center">
            <div className="fw-bold">Fare Summary</div>
            <div className="chip">Class: {cls || "-"}</div>
          </div>
          <div className="p-3">
            <div className="summary-row">
              <span>Fare per person</span>
              <span className="fw-bold">₹{Number(fare.per).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Passengers</span>
              <span className="fw-bold">{fare.count}</span>
            </div>
            <div className="summary-row">
              <span>
                Tax{" "}
                {fare.taxRate > 0
                  ? `(${Math.round(fare.taxRate * 100)}%)`
                  : "(0%)"}
              </span>
              <span className="fw-bold">₹{Number(fare.tax).toFixed(2)}</span>
            </div>
            <hr />
            <div className="summary-row">
              <span className="fw-bold">Total Payable</span>
              <span className="fw-bold">₹{Number(fare.total).toFixed(2)}</span>
            </div>

            <div className="mt-2 small text-muted">
              Contact: {contact?.email || "-"} • {contact?.phone || "-"}
            </div>
          </div>
        </div>

        {/* Payment options below */}
        <div className="card-glass p-3">
          <div
            className="btn-group w-100"
            role="group"
            aria-label="Payment methods"
          >
            {[
              { k: "UPI", label: "UPI" },
              { k: "CREDIT", label: "Credit Card" },
              { k: "DEBIT", label: "Debit Card" },
              { k: "NET", label: "Net Banking" },
            ].map((m) => (
              <button
                key={m.k}
                type="button"
                className={`btn ${
                  paymentMethod === m.k ? "btn-primary" : "btn-outline-primary"
                } nav-btn`}
                onClick={() => setPaymentMethod(m.k)}
              >
                {m.k === "CREDIT" && (
                  <i
                    className="fa fa-credit-card"
                    style={{ marginRight: 8 }}
                    aria-hidden="true"
                  ></i>
                )}
                {m.k === "DEBIT" && (
                  <i
                    className="fa fa-credit-card-alt"
                    style={{ marginRight: 8 }}
                    aria-hidden="true"
                  ></i>
                )}
                {m.k !== "CREDIT" && m.k !== "DEBIT" && null}
                {m.label}
              </button>
            ))}
          </div>

          {paymentMethod === "UPI" && (
            <div
              className="mt-3 p-3 border rounded-3"
              style={{ borderColor: blue.border }}
            >
              <label className="form-label fw-bold">UPI ID</label>
              <input
                className="form-control"
                placeholder="name@bank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <div className="text-muted mt-2" style={{ fontSize: 12 }}>
                You will be redirected to your UPI app to approve the payment.
              </div>
            </div>
          )}

          {(paymentMethod === "CREDIT" || paymentMethod === "DEBIT") && (
            <div
              className="mt-3 p-3 border rounded-3"
              style={{ borderColor: blue.border }}
            >
              <div className="mb-2">
                <label className="form-label fw-bold">Name on Card</label>
                <input
                  className="form-control"
                  value={cardName}
                  onChange={(e) => {
                    // Allow alphabets and spaces only
                    const v = e.target.value.replace(/[^A-Za-z ]+/g, "");
                    setCardName(v);
                  }}
                  placeholder="Full name"
                />
              </div>
              <div className="mb-2">
                <label className="form-label fw-bold">Card Number</label>
                <input
                  className="form-control"
                  inputMode="numeric"
                  placeholder="XXXX XXXX XXXX XXXX"
                  value={cardNumber}
                  onChange={(e) => {
                    // Allow only digits, cap at 16 digits total, then format 4-4-4-4 for readability
                    let v = e.target.value.replace(/[^0-9]/g, "");
                    v = v.slice(0, 16);
                    v = v.replace(/(.{4})/g, "$1 ").trim();
                    setCardNumber(v);
                  }}
                />
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label fw-bold">Expiry (MM/YY)</label>
                  <input
                    className="form-control"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => {
                      let v = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                      if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                      setCardExpiry(v);
                    }}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-bold">CVV</label>
                  <input
                    className="form-control"
                    inputMode="numeric"
                    placeholder="CVV"
                    value={cardCvv}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, "");
                      // Both CREDIT and DEBIT: exactly 3
                      const capped = digits.slice(0, 3);
                      setCardCvv(capped);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "NET" && (
            <div
              className="mt-3 p-3 border rounded-3"
              style={{ borderColor: blue.border }}
            >
              <label className="form-label fw-bold">Select Bank</label>
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenBankDropdown(openBankDropdown ? false : true);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 44px 10px 12px",
                    borderRadius: 12,
                    border: `1px solid ${blue.border}`,
                    background: "linear-gradient(180deg,#ffffff,#f9fafb)",
                    color: "#111827",
                    fontWeight: 800,
                    outline: "none",
                    boxShadow: openBankDropdown
                      ? "0 0 0 3px rgba(37,99,235,0.25)"
                      : "0 2px 8px rgba(0,0,0,0.06)",
                    cursor: "pointer",
                    transition:
                      "box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease",
                    position: "relative",
                  }}
                >
                  <span style={{ fontWeight: 500, color: "#6b7280" }}>
                    {bank || "No Preference"}
                  </span>
                  {bank && (
                    <span
                      style={{
                        position: "absolute",
                        right: 28,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <img
                        src={BANKS.find((b) => b.name === bank)?.logo}
                        alt={`${bank} logo`}
                        className="bank-logo"
                      />
                    </span>
                  )}
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

                {openBankDropdown && (
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
                      maxHeight: 300,
                      overflowY: "auto",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {BANKS.map((b) => {
                      const active = bank === b.name;
                      return (
                        <div
                          key={b.name}
                          role="option"
                          aria-selected={active}
                          onClick={() => {
                            setBank(b.name);
                            setOpenBankDropdown(false);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 12px",
                            fontWeight: 500,
                            color: active ? blue.primaryDark : "#111827",
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
                          <span>{b.name}</span>
                          <span aria-hidden>
                            <img
                              src={b.logo}
                              alt={`${b.name} logo`}
                              className="bank-logo"
                            />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="text-muted mt-2" style={{ fontSize: 12 }}>
                You will be redirected to your bank's secure page.
              </div>
            </div>
          )}

          <div className="mt-3 d-flex justify-content-end">
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <button className="btn btn-primary" onClick={handlePayment}>
              Pay Securely
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;
