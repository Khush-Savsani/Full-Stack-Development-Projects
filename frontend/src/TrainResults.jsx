import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import stations from "./Railway_stations.json";
import {
  FaTrain,
  FaExchangeAlt,
  FaRegCalendarAlt,
  FaSearch,
  FaFilter,
  FaSun,
  FaMoon,
  FaCloudSun,
  FaLongArrowAltRight,
  FaShieldAlt,
} from "react-icons/fa";
import DateBar from "./DateBar";
import LoginSignupModal from "./LoginSignupModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShield } from "@fortawesome/free-solid-svg-icons";

// Base seats per class code
const BASE_SEATS_BY_CLASS = {
  EA: 56,
  "1A": 24,
  EV: 40,
  EC: 56,
  "2A": 52,
  FC: 26,
  "3A": 72,
  "3E": 83,
  VC: 40,
  CC: 78,
  SL: 80,
  VS: 44,
  "2S": 102,
};

// Database-based seat checking
async function getBookedSeatsFromDB(trainNo, date, classCode) {
  try {
    const response = await fetch("http://localhost:8000/users/check-seats/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        train_number: trainNo,
        date: date,
        train_class: classCode,
        num_passengers: 0, // Just checking current status
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.booked_count || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching seat data:", error);
    return 0;
  }
}

// Legacy functions for compatibility (now use database)
function getBookedSeats(trainNo, date, classCode) {
  // This will be replaced by async calls in components
  return 0;
}

export function addBookedSeats(trainNo, date, classCode, count) {
  // No longer needed - seats are managed in database
  console.log("Seat booking now handled by database");
}

// Reset all seat bookings to full capacity
export function resetAllSeats() {
  try {
    const prefixes = ["seats:", "seatsAssigned:"];
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && prefixes.some((p) => key.startsWith(p))) toRemove.push(key);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
    console.log(`Reset complete: Removed ${toRemove.length} seat booking keys`);
    return toRemove.length;
  } catch (e) {
    console.error("Error resetting seats:", e);
    return 0;
  }
}

// Comprehensive train data generator
const generateTrainData = (
  fromStation,
  toStation,
  date,
  trainClass = "All Classes"
) => {
  const trainTypes = [
    { name: "Rajdhani Express", speed: "fast", stops: 3, prefix: "12" },
    { name: "Shatabdi Express", speed: "fast", stops: 2, prefix: "12" },
    { name: "Duronto Express", speed: "fast", stops: 4, prefix: "12" },
    { name: "Garib Rath Express", speed: "medium", stops: 8, prefix: "12" },
    { name: "Superfast Express", speed: "medium", stops: 12, prefix: "12" },
    { name: "Express", speed: "medium", stops: 15, prefix: "12" },
    { name: "Passenger", speed: "slow", stops: 25, prefix: "15" },
    { name: "Local", speed: "slow", stops: 35, prefix: "15" },
  ];

  const classTypes = [
    { code: "EA", name: "Anubhuti Class", price: 3500, status: "Available" },
    { code: "1A", name: "AC First Class", price: 2500, status: "Available" },
    { code: "EV", name: "Vistadome AC", price: 2200, status: "Available" },
    { code: "EC", name: "Exec. Chair Car", price: 1800, status: "Available" },
    { code: "2A", name: "AC 2 Tier", price: 1500, status: "Available" },
    { code: "FC", name: "First Class", price: 1200, status: "Available" },
    { code: "3A", name: "AC 3 Tier", price: 1000, status: "Available" },
    { code: "3E", name: "AC 3 Economy", price: 800, status: "Available" },
    {
      code: "VC",
      name: "Vistadome Chair Car",
      price: 900,
      status: "Available",
    },
    { code: "CC", name: "AC Chair Car", price: 800, status: "Available" },
    { code: "SL", name: "Sleeper", price: 400, status: "Available" },
    { code: "VS", name: "Vistadome Non AC", price: 600, status: "Available" },
    { code: "2S", name: "Second Sitting", price: 200, status: "Available" },
  ];

  // Calculate distance based on station codes (simplified)
  const getDistance = (from, to) => {
    // Ensure we have valid station codes
    if (!from || !to) {
      return 500; // Default distance if codes are missing
    }

    // Use the full station codes for distance calculation
    const fromCode = from.toString();
    const toCode = to.toString();

    // Calculate distance based on character differences
    let baseDistance = 0;
    const maxLength = Math.max(fromCode.length, toCode.length);

    for (let i = 0; i < maxLength; i++) {
      const fromChar = fromCode[i] || "";
      const toChar = toCode[i] || "";
      baseDistance +=
        Math.abs(fromChar.charCodeAt(0) - toChar.charCodeAt(0)) * 20;
    }

    return Math.max(100, Math.min(2000, baseDistance + Math.random() * 300));
  };

  const distance = getDistance(fromStation, toStation);

  // Generate realistic departure times throughout the day
  const departureTimes = [
    "05:30 AM",
    "06:15 AM",
    "07:00 AM",
    "08:30 AM",
    "09:45 AM",
    "11:20 AM",
    "12:30 PM",
    "02:15 PM",
    "03:45 PM",
    "05:00 PM",
    "06:30 PM",
    "08:00 PM",
    "09:30 PM",
    "10:45 PM",
    "11:30 PM",
  ];

  const trains = [];
  const numTrains = Math.floor(Math.random() * 8) + 8; // 8-15 trains

  for (let i = 0; i < numTrains; i++) {
    const trainType = trainTypes[Math.floor(Math.random() * trainTypes.length)];
    const trainNo = `${trainType.prefix}${
      Math.floor(Math.random() * 900) + 100
    }`;

    // Calculate duration based on distance and train speed
    let durationHours, durationMinutes;
    if (trainType.speed === "fast") {
      durationHours = Math.floor(distance / 60);
      durationMinutes = Math.floor((distance % 60) * 0.8);
    } else if (trainType.speed === "medium") {
      durationHours = Math.floor(distance / 45);
      durationMinutes = Math.floor((distance % 45) * 1.2);
    } else {
      durationHours = Math.floor(distance / 30);
      durationMinutes = Math.floor((distance % 30) * 2);
    }

    // Ensure minimum duration
    if (durationHours < 1) durationHours = 1;
    if (durationMinutes < 10) durationMinutes = 10;

    const depTime =
      departureTimes[Math.floor(Math.random() * departureTimes.length)];

    // Calculate arrival time
    const depHour = parseInt(depTime.split(":")[0]);
    const depMinute = parseInt(depTime.split(":")[1].split(" ")[0]);
    const isPM = depTime.includes("PM") && depHour !== 12;
    const depHour24 = isPM ? depHour + 12 : depHour === 12 ? 0 : depHour;

    let arrHour24 = (depHour24 + durationHours) % 24;
    const arrMinute = (depMinute + durationMinutes) % 60;
    if (depMinute + durationMinutes >= 60) {
      arrHour24 = (arrHour24 + 1) % 24;
    }

    const arrHour =
      arrHour24 === 0 ? 12 : arrHour24 > 12 ? arrHour24 - 12 : arrHour24;
    const arrTime = `${arrHour.toString().padStart(2, "0")}:${arrMinute
      .toString()
      .padStart(2, "0")} ${arrHour24 >= 12 ? "PM" : "AM"}`;

    // Generate class availability with realistic status
    const availableClasses = [];

    if (trainClass === "All Classes") {
      // Show all classes as before, but ensure variety across trains
      const numClasses = Math.floor(Math.random() * 4) + 2; // 2-5 classes

      // Create a shuffled array of all class types to ensure variety
      const shuffledClasses = [...classTypes].sort(() => Math.random() - 0.5);
      const selectedClasses = shuffledClasses.slice(0, numClasses);

      selectedClasses.forEach((cls) => {
        const statusOptions = [
          "Available",
          "Available",
          "Available",
          "WL 15",
          "WL 25",
          "RLWL 8",
          "TRAIN DEPARTED",
          "TRAIN DEPARTED",
        ];
        const status =
          statusOptions[Math.floor(Math.random() * statusOptions.length)];
        const price = status.includes("DEPARTED") ? "" : `₹${cls.price}`;

        availableClasses.push({
          code: cls.code,
          status: status,
          price: price,
          type: Math.random() > 0.7 ? "Tatkal" : "",
        });
      });
    } else {
      // Show only the selected class
      const selectedClass = classTypes.find(
        (cls) => trainClass.includes(cls.code) || trainClass.includes(cls.name)
      );

      if (selectedClass) {
        const statusOptions = [
          "Available",
          "Available",
          "Available",
          "WL 15",
          "WL 25",
          "RLWL 8",
          "TRAIN DEPARTED",
          "TRAIN DEPARTED",
        ];
        const status =
          statusOptions[Math.floor(Math.random() * statusOptions.length)];
        const price = status.includes("DEPARTED")
          ? ""
          : `₹${selectedClass.price}`;

        availableClasses.push({
          code: selectedClass.code,
          status: status,
          price: price,
          type: Math.random() > 0.7 ? "Tatkal" : "",
        });
      }
    }

    trains.push({
      trainNo: trainNo,
      name: trainType.name,
      depTime: depTime,
      arrTime: arrTime,
      from: fromStation,
      to: toStation,
      duration: `${durationHours}h ${durationMinutes}min`,
      distance: `${distance} km`,
      classes: availableClasses,
      route: "View Route",
      // Removed Free Cancellation offers
      offer: "Flexible Booking",
      status: Math.random() > 0.8 ? "On Time" : "Running Late",
      platform: Math.floor(Math.random() * 8) + 1,
    });
  }

  // Sort trains by departure time
  return trains.sort((a, b) => {
    const timeA = new Date(`2000-01-01 ${a.depTime}`);
    const timeB = new Date(`2000-01-01 ${b.depTime}`);
    return timeA - timeB;
  });
};

// Helper functions for station suggestions and validation
function filterStations(query) {
  if (!query) return [];
  return stations
    .filter((s) => s.STATION_NAME.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);
}
function getStationWithCode(name) {
  const s = stations.find((s) => s.STATION_NAME === name);
  return s ? `${s.STATION_NAME} (${s.CODE})` : name;
}
const isValidStation = (input) => {
  return stations.some(
    (s) =>
      input.trim().toLowerCase() === s.STATION_NAME.toLowerCase() ||
      input.trim().toLowerCase() ===
        `${s.STATION_NAME} (${s.CODE})`.toLowerCase()
  );
};
function getToday() {
  // Use local date (not UTC ISO) to avoid off-by-one day in some timezones
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = ("0" + (d.getMonth() + 1)).slice(-2);
  const dd = ("0" + d.getDate()).slice(-2);
  return `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD in local time
}

const TrainResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get search params with priority: location.state -> URL -> localStorage (latest) -> defaults
  const getInitialSearchParams = () => {
    // 1) If navigation provided state (TrainSearchForm uses navigate state), use it first
    if (location.state?.from && location.state?.to) {
      return {
        from: location.state.from,
        to: location.state.to,
        date: location.state.date || getToday(),
        trainClass: location.state.trainClass || "All Classes",
      };
    }

    // 2) Use URL search params if present
    const searchParams = new URLSearchParams(location.search);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const dateParam = searchParams.get("date");
    const classParam = searchParams.get("trainClass");

    if (fromParam && toParam) {
      return {
        from: fromParam,
        to: toParam,
        date: dateParam || getToday(),
        trainClass: classParam || "All Classes",
      };
    }

    // 3) Fall back to the most recent persisted values from localStorage
    try {
      const savedSearch = localStorage.getItem("trainSearch");
      if (savedSearch) {
        const parsed = JSON.parse(savedSearch);
        if (parsed && parsed.from && parsed.to) {
          return {
            from: parsed.from,
            to: parsed.to,
            date: parsed.date || getToday(),
            trainClass: parsed.trainClass || "All Classes",
          };
        }
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e);
    }

    // 4) Defaults
    return {
      from: "",
      to: "",
      date: getToday(),
      trainClass: "All Classes",
    };
  };

  // Get initial search parameters
  const initialParams = getInitialSearchParams();
  const [from, setFrom] = useState(initialParams.from || "");
  const [to, setTo] = useState(initialParams.to || "");
  const [date, setDate] = useState(initialParams.date || getToday());
  const [trainClass, setTrainClass] = useState(
    initialParams.trainClass || "All Classes"
  );

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seatData, setSeatData] = useState({}); // Cache seat availability data
  const [seatLoading, setSeatLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(date);
  const [showRupee, setShowRupee] = useState(false);
  // Accordion open/close state for Filter results box
  const [accordionOpen, setAccordionOpen] = useState({});
  // Removed Free Cancellation subtitle animation
  // Always-upward continuous slide control (keeps direction consistent)
  const [scrollStep, setScrollStep] = useState(0);
  const [enableSlideTransition, setEnableSlideTransition] = useState(true);
  const [msgBaseIndex, setMsgBaseIndex] = useState(0); // 0 -> show [A,B], 1 -> show [B,A]
  useEffect(() => {
    const id2 = setInterval(() => {
      // Always animate one step up
      setEnableSlideTransition(true);
      setScrollStep(18);
    }, 2200);
    return () => clearInterval(id2);
  }, []);
  // Filters state
  const getClassCodeFromLabel = (label) => {
    if (!label || label === "All Classes") return null;
    const m = label.match(/\(([^)]+)\)/);
    return m ? m[1] : label.trim();
  };
  const [ticketClassFilters, setTicketClassFilters] = useState(() => {
    const code = getClassCodeFromLabel(trainClass);
    return code ? new Set([code]) : new Set();
  }); // Set of class codes
  const [quota, setQuota] = useState("General+Tatkal"); // General+Tatkal | Ladies | Senior
  const [depRanges, setDepRanges] = useState(() => new Set()); // Morning|Afternoon|Evening|Night
  const [arrRanges, setArrRanges] = useState(() => new Set());

  // Options
  const CLASS_FILTER_OPTIONS = [
    { code: "1A", label: "AC First Class (1A)" },
    { code: "2A", label: "AC 2 Tier (2A)" },
    { code: "3A", label: "AC 3 Tier (3A)" },
    { code: "3E", label: "AC 3 Economy (3E)" },
    { code: "EC", label: "Exec. Chair Car (EC)" },
    { code: "CC", label: "AC Chair car (CC)" },
    { code: "SL", label: "Sleeper (SL)" },
    { code: "2S", label: "Second Sitting (2S)" },
    { code: "EA", label: "Anubhuti Class (EA)" },
    { code: "EV", label: "Vistadome AC (EV)" },
    { code: "VC", label: "Vistadome Chair Car (VC)" },
    { code: "VS", label: "Vistadome Non AC (VS)" },
    { code: "FC", label: "First Class (FC)" },
  ];

  const TIME_RANGES = [
    {
      key: "Morning",
      label: "6.00 AM - 12.00 PM",
      start: 6,
      end: 12,
      Icon: FaSun,
      sub: "Morning",
    },
    {
      key: "Afternoon",
      label: "12.00 PM - 6.00 PM",
      start: 12,
      end: 18,
      Icon: FaCloudSun,
      sub: "Afternoon",
    },
    {
      key: "Evening",
      label: "6.00 PM - 12.00 AM",
      start: 18,
      end: 24,
      Icon: FaCloudSun,
      sub: "Evening",
    },
    {
      key: "Night",
      label: "12.00 AM - 6.00 AM",
      start: 0,
      end: 6,
      Icon: FaMoon,
      sub: "Night",
    },
  ];

  const isHourInRanges = (hour24, selectedSet) => {
    if (!selectedSet || selectedSet.size === 0) return true; // no filter => allow
    for (const r of TIME_RANGES) {
      if (selectedSet.has(r.key)) {
        if (r.start <= r.end) {
          if (hour24 >= r.start && hour24 < r.end) return true;
        } else {
          // overnight wrap
          if (hour24 >= r.start || hour24 < r.end) return true;
        }
      }
    }
    return false;
  };

  const parseHour24 = (timeStr) => {
    if (!timeStr) return null;
    try {
      const [hm, ampm] = timeStr.split(" ");
      const [hRaw] = hm.split(":");
      let h = parseInt(hRaw, 10);
      if (ampm?.toUpperCase() === "PM" && h !== 12) h += 12;
      if (ampm?.toUpperCase() === "AM" && h === 12) h = 0;
      return h;
    } catch (_) {
      return null;
    }
  };

  // Parse a time string ("HH:MM" or "HH:MM AM/PM") to minutes from midnight [0..1439]
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    try {
      const parts = timeStr.trim();
      const hasAmPm = /\b(AM|PM)\b/i.test(parts);
      let hh, mm;
      if (hasAmPm) {
        const [hm, ampmRaw] = parts.split(/\s+/);
        const [hRaw, mRaw] = hm.split(":");
        hh = parseInt(hRaw, 10);
        mm = parseInt(mRaw, 10) || 0;
        const ampm = ampmRaw.toUpperCase();
        if (ampm === "PM" && hh !== 12) hh += 12;
        if (ampm === "AM" && hh === 12) hh = 0;
      } else {
        const [hRaw, mRaw] = parts.split(":");
        hh = parseInt(hRaw, 10);
        mm = parseInt(mRaw, 10) || 0;
      }
      if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
      return hh * 60 + mm;
    } catch (_) {
      return null;
    }
  };

  // Parse duration like "H:MM" or "HH:MM" to minutes
  const parseDurationToMinutes = (dur) => {
    if (!dur || typeof dur !== "string") return null;
    const m = dur.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const hh = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
    return hh * 60 + mm;
  };

  const ymdToLocalDate = (ymd) => {
    // ymd: "YYYY-MM-DD" -> local Date at midnight
    const [y, m, d] = ymd.split("-").map((v) => parseInt(v, 10));
    return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
  };

  const addMinutes = (dateObj, mins) => {
    const d = new Date(dateObj);
    d.setMinutes(d.getMinutes() + mins);
    return d;
  };

  const formatShortDate = (dateObj) => {
    try {
      return dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      });
    } catch {
      return "";
    }
  };

  const formatYMD = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDMY = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${d}-${m}-${y}`;
  };

  const getDayLabel = (ymd) => {
    const d = ymdToLocalDate(ymd);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[d.getDay()];
  };

  // Visible trains list based on running days, past departure, time ranges, and ticket class filters
  const filteredResults = useMemo(() => {
    if (!Array.isArray(results)) return [];
    const isSameYMD = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
    const selectedDOW = getDayLabel(selectedDate);
    const now = new Date();

    return results.filter((train) => {
      const trainNo = train.train_number || train.trainNo || "";
      const departureTime = train.departure_time || train.depTime;
      const arrivalTime = train.arrival_time || train.arrTime;
      const trainDuration = train.duration;

      // running days
      if (Array.isArray(train.running_days) && train.running_days.length > 0) {
        const runsToday =
          train.running_days.includes("Daily") ||
          train.running_days.includes(selectedDOW);
        if (!runsToday) return false;
      }

      // past departure for selected date (only if selected date is today)
      const depMins = parseTimeToMinutes(departureTime);
      if (depMins != null) {
        const depDateObj = addMinutes(ymdToLocalDate(selectedDate), depMins);
        if (
          isSameYMD(depDateObj, now) &&
          depDateObj.getTime() <= now.getTime()
        ) {
          return false;
        }
      }

      // time range filters
      const depHour = parseHour24(departureTime);
      const arrHour = parseHour24(arrivalTime);
      if (
        !isHourInRanges(depHour ?? -1, depRanges) ||
        !isHourInRanges(arrHour ?? -1, arrRanges)
      ) {
        return false;
      }

      // class filters: if any selected, ensure at least one class remains
      if (ticketClassFilters && ticketClassFilters.size > 0) {
        let classes = [];
        if (train.classes && Array.isArray(train.classes)) {
          classes = train.classes;
        } else if (train.class_type && Array.isArray(train.class_type)) {
          const trainNumSeed =
            parseInt(String(trainNo).replace(/\D/g, "")) || 12345;
          classes = train.class_type.map((classCode) => {
            const classCodeSeed =
              classCode.charCodeAt(0) * 100 + (classCode.charCodeAt(1) || 0);
            const price = 500 + ((trainNumSeed + classCodeSeed) % 1500);
            const statusSeed = (trainNumSeed + classCodeSeed) % 10;
            const statusOptions = [
              "Available",
              "Available",
              "Available",
              "Available",
              "Available",
              "Available",
              "WL 15",
              "WL 25",
              "RLWL 8",
              "TRAIN DEPARTED",
            ];
            return {
              code: classCode,
              price: `₹${price}`,
              status: statusOptions[statusSeed],
              type: (trainNumSeed + classCodeSeed) % 10 > 7 ? "Tatkal" : "",
            };
          });
        } else {
          const defaultClasses = ["SL", "3A", "2A"];
          const trainNumSeed =
            parseInt(String(trainNo).replace(/\D/g, "")) || 12345;
          classes = defaultClasses.map((classCode) => {
            const classCodeSeed =
              classCode.charCodeAt(0) * 100 + (classCode.charCodeAt(1) || 0);
            const price = 500 + ((trainNumSeed + classCodeSeed) % 1500);
            return {
              code: classCode,
              price: `₹${price}`,
              status: "Available",
              type: "",
            };
          });
        }
        const visibleClasses = classes.filter((c) =>
          ticketClassFilters.has(c.code)
        );
        if (visibleClasses.length === 0) return false;
      }

      return true;
    });
  }, [results, selectedDate, depRanges, arrRanges, ticketClassFilters]);

  // Booking state
  const [selectedClassByTrain, setSelectedClassByTrain] = useState({}); // { [trainNo]: "3A" }
  const [toastMsg, setToastMsg] = useState("");
  const toastTimerRef = useRef(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null); // store data to proceed after login

  const isLoggedIn = () => sessionStorage.getItem("isLoggedIn") === "true";

  const showToast = (msg) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(""), 4500);
  };

  // Helper to get full station name with code from code
  function getStationNameWithCode(code) {
    const s = stations.find((s) => s.CODE === code);
    return s ? `${s.STATION_NAME} (${s.CODE})` : code;
  }

  // Helper to get only station name without code from code
  function getStationNameOnly(code) {
    const s = stations.find((s) => s.CODE === code);
    return s ? s.STATION_NAME : code;
  }

  // For search box at top
  const [fromInput, setFromInput] = useState(
    from ? getStationNameWithCode(from) : ""
  );
  const [toInput, setToInput] = useState(to ? getStationNameWithCode(to) : "");
  const [dateInput, setDateInput] = useState(date || getToday());
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const fromInputRef = useRef();
  const toInputRef = useRef();
  const dateInputRef = useRef();
  const [editField, setEditField] = useState(null); // 'from', 'to', 'date' or null

  // Helper to robustly extract station code from any input
  function extractStationCode(input) {
    // Try to extract code from (CODE)
    const match = input.match(/\(([^)]+)\)$/);
    if (match) return match[1];
    // Try to match by station name
    const s = stations.find(
      (st) =>
        st.STATION_NAME.toLowerCase() === input.trim().toLowerCase() ||
        st.CODE.toLowerCase() === input.trim().toLowerCase()
    );
    return s ? s.CODE : input.trim();
  }

  // Initial search when component mounts with valid location state
  useEffect(() => {
    if (from && to && date) {
      // If we have valid location state, trigger the search immediately
      const fromCode = extractStationCode(from);
      const toCode = extractStationCode(to);

      if (fromCode && toCode && fromCode !== toCode) {
        setLoading(true);
        setError("");

        // Try to fetch data from API first
        const fetchTrainData = async () => {
          try {
            // Format the API request URL
            const apiUrl =
              "https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations";
            const params = new URLSearchParams({
              fromStationCode: fromCode,
              toStationCode: toCode,
              dateOfJourney: date,
            });

            // Check if API key is available (replace with your actual check)
            const apiKey = "YOUR_API_KEY"; // This should be replaced with actual API key
            const hasValidApiKey = apiKey && apiKey !== "YOUR_API_KEY";

            if (hasValidApiKey) {
              // Make API request if key is available
              const response = await fetch(`${apiUrl}?${params}`, {
                method: "GET",
                headers: {
                  "x-rapidapi-key": apiKey,
                  "x-rapidapi-host": "irctc1.p.rapidapi.com",
                },
              });

              if (response.ok) {
                const data = await response.json();
                console.log("API data received:", data);

                if (data && Array.isArray(data.data) && data.data.length > 0) {
                  setResults(data.data);
                  setLoading(false);
                  return;
                }
              }
              // If API request fails or returns no data, fall back to dummy data
              console.log(
                "API request failed or returned no data, falling back to dummy data"
              );
            }

            // Fallback to dummy data
            try {
              // Try to fetch from dummy_train_data.json
              const dummyResponse = await fetch("/dummy_train_data.json");
              if (dummyResponse.ok) {
                const dummyData = await dummyResponse.json();
                console.log("Dummy data loaded:", dummyData);

                // Filter dummy data based on station codes - strict matching only
                const filteredTrains = dummyData.data
                  ? dummyData.data.filter(
                      (train) =>
                        train.from_station_code === fromCode &&
                        train.to_station_code === toCode
                    )
                  : [];

                if (filteredTrains.length > 0) {
                  // If matching trains found in dummy data
                  console.log(
                    "Using filtered dummy data:",
                    filteredTrains.length,
                    "trains"
                  );
                  setResults(filteredTrains);
                  setError(""); // Clear any previous errors
                } else {
                  // If no matching trains in dummy data, show error message
                  console.log(
                    "No matching trains in dummy data for these station codes"
                  );
                  setResults([]);
                  setError(
                    "Sorry, no trains found for this route. Please try different stations."
                  );
                }
              } else {
                // If dummy data file can't be loaded, show error message
                console.log("Could not load dummy data file");
                setResults([]);
                setError(
                  "No trains found for this route. Please try different stations."
                );
              }
            } catch (dummyErr) {
              console.error("Error loading dummy data:", dummyErr);
              // Final fallback to generated data
              const trainData = generateTrainData(
                fromCode,
                toCode,
                date,
                trainClass
              );

              if (trainData.length > 0) {
                console.log(
                  "Generated train data:",
                  trainData.length,
                  "trains"
                );
                setResults(trainData);
                setError(""); // Clear any previous errors
              } else {
                console.log("No trains could be generated");
                setResults([]);
                setError(
                  "No trains found for this route. Please try different stations."
                );
              }
            }

            setLoading(false);
          } catch (err) {
            console.error("Error fetching train data:", err);
            setError("Failed to load train data. Please try again.");
            setLoading(false);
          }
        };

        fetchTrainData();
      }
    }
  }, [from, to, date, trainClass]); // Only run when location state changes

  // Reset all seat bookings on component load
  useEffect(() => {
    resetAllSeats();
  }, []);

  // Load seat data for all trains after results are loaded
  useEffect(() => {
    const loadSeatData = async () => {
      if (results.length === 0) return;

      setSeatLoading(true);
      const newSeatData = {};

      for (const train of results) {
        const trainNo = train.trainNo || train.train_number;
        if (!trainNo) continue;

        for (const classInfo of train.classes || []) {
          const key = `${trainNo}:${selectedDate}:${classInfo.code}`;
          try {
            const booked = await getBookedSeatsFromDB(
              trainNo,
              selectedDate,
              classInfo.code
            );
            const base = BASE_SEATS_BY_CLASS[classInfo.code] || 0;
            newSeatData[key] = Math.max(0, base - booked);
          } catch (error) {
            console.error("Error loading seat data:", error);
            newSeatData[key] = BASE_SEATS_BY_CLASS[classInfo.code] || 0;
          }
        }
      }

      setSeatData(newSeatData);
      setSeatLoading(false);
    };

    loadSeatData();
  }, [results, selectedDate]);

  // Sync sidebar ticket class checkboxes with the class selected in TrainSearchForm
  // - If a particular class was selected, pre-check only that class
  // - If 'All Classes' was selected, do not check any
  useEffect(() => {
    const code = getClassCodeFromLabel(trainClass);
    setTicketClassFilters(code ? new Set([code]) : new Set());
  }, [from, to, date, trainClass]);

  useEffect(() => {
    if (!fromInput || !toInput || !dateInput) {
      setError("Missing search parameters. Please go back and search again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const fetchTrainData = async () => {
      try {
        const fromCode = extractStationCode(fromInput);
        const toCode = extractStationCode(toInput);

        console.log("Searching train data for:", {
          fromInput,
          toInput,
          fromCode,
          toCode,
          dateInput,
        });

        // Check if we have valid station codes
        if (!fromCode || !toCode) {
          setError("Invalid station codes. Please try again.");
          setLoading(false);
          return;
        }

        // Check if from and to are the same
        if (fromCode === toCode) {
          setError("From and To stations cannot be the same.");
          setLoading(false);
          return;
        }

        // Format the API request URL
        const apiUrl =
          "https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations";
        const params = new URLSearchParams({
          fromStationCode: fromCode,
          toStationCode: toCode,
          dateOfJourney: dateInput,
        });

        // Check if API key is available (replace with your actual check)
        const apiKey = "YOUR_API_KEY"; // This should be replaced with actual API key
        const hasValidApiKey = apiKey && apiKey !== "YOUR_API_KEY";

        if (hasValidApiKey) {
          // Make API request if key is available
          try {
            const response = await fetch(`${apiUrl}?${params}`, {
              method: "GET",
              headers: {
                "x-rapidapi-key": apiKey,
                "x-rapidapi-host": "irctc1.p.rapidapi.com",
              },
            });

            if (response.ok) {
              const data = await response.json();
              console.log("API data received:", data);

              if (data && Array.isArray(data.data) && data.data.length > 0) {
                setResults(data.data);
                setLoading(false);
                return;
              }
            }
            // If API request fails or returns no data, fall back to dummy data
            console.log(
              "API request failed or returned no data, falling back to dummy data"
            );
          } catch (apiErr) {
            console.error("API request error:", apiErr);
            // Continue to fallback options
          }
        }

        // Fallback to dummy data
        try {
          // Try to fetch from dummy_train_data.json
          const dummyResponse = await fetch("/dummy_train_data.json");
          if (dummyResponse.ok) {
            const dummyData = await dummyResponse.json();
            console.log("Dummy data loaded:", dummyData);

            // Filter dummy data based on station codes - strict matching only
            const filteredTrains = dummyData.data
              ? dummyData.data.filter(
                  (train) =>
                    train.from_station_code === fromCode &&
                    train.to_station_code === toCode
                )
              : [];

            if (filteredTrains.length > 0) {
              // If matching trains found in dummy data
              setResults(filteredTrains);
              setLoading(false);
              return;
            } else {
              // If no matching trains in dummy data, show error message
              console.log(
                "No matching trains in dummy data for these station codes"
              );
              setResults([]);
              setError(
                "Sorry, no trains found for this route. Please try different stations."
              );
              setLoading(false);
              return;
            }
          }
        } catch (dummyErr) {
          console.error("Error loading dummy data:", dummyErr);
          // Continue to final fallback
        }

        // Final fallback to generated data
        const trainData = generateTrainData(
          fromCode,
          toCode,
          dateInput,
          trainClass
        );
        console.log("Generated train data:", trainData.length, "trains");

        if (!trainData || trainData.length === 0) {
          setError(
            "No trains found for this route. Please try different stations."
          );
          setLoading(false);
          return;
        }

        setResults(trainData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching train data:", err);
        setError("Failed to load train data. Please try again.");
        setLoading(false);
      }
    };

    fetchTrainData();
  }, [fromInput, toInput, dateInput, trainClass]);

  // Effect for rupee animation, but not for price changes
  useEffect(() => {
    const interval = setInterval(() => setShowRupee((v) => !v), 2000);
    return () => clearInterval(interval);
  }, []);

  const getStationName = (code) => {
    const station = stations.find((s) => s.CODE === code);
    return station ? station.STATION_NAME : code;
  };

  const formatDate = (dateInput) => {
    // Accept either a Date object or a YYYY-MM-DD string.
    // If string, parse into a local Date to avoid UTC parsing shifting the day.
    let date;
    if (typeof dateInput === "string") {
      const ymd = dateInput.slice(0, 10).split("-");
      if (ymd.length === 3) {
        const y = parseInt(ymd[0], 10);
        const m = parseInt(ymd[1], 10) - 1;
        const d = parseInt(ymd[2], 10);
        date = new Date(y, m, d); // local time
      } else {
        date = new Date(dateInput);
      }
    } else {
      date = new Date(dateInput);
    }
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${date.getDate().toString().padStart(2, "0")} ${
      days[date.getDay()]
    }`;
  };

  const getNextDays = () => {
    const days = [];
    const currentDate = new Date(date);
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + i);
      const yyyy = nextDate.getFullYear();
      const mm = ("0" + (nextDate.getMonth() + 1)).slice(-2);
      const dd = ("0" + nextDate.getDate()).slice(-2);
      days.push({
        date: `${yyyy}-${mm}-${dd}`,
        display: formatDate(nextDate),
      });
    }
    return days;
  };

  // Save search parameters to localStorage and URL
  const saveSearchParams = (params) => {
    try {
      // Save to localStorage
      localStorage.setItem("trainSearch", JSON.stringify(params));

      // Update URL params without navigating
      const searchParams = new URLSearchParams(window.location.search);
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.set(key, value);
      });

      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.replaceState(null, "", newUrl);
    } catch (e) {
      console.error("Error saving search parameters:", e);
    }
  };

  // Save initial search params if they exist
  useEffect(() => {
    if (from && to) {
      saveSearchParams({ from, to, date, trainClass });
    }
  }, [from, to, date, trainClass]);

  // Persist latest user selections (inputs) so reload shows the most recent values
  useEffect(() => {
    // Only persist when inputs look valid to avoid saving partial typing
    if (
      fromInput &&
      toInput &&
      dateInput &&
      isValidStation(fromInput) &&
      isValidStation(toInput)
    ) {
      const fromCode = extractStationCode(fromInput);
      const toCode = extractStationCode(toInput);
      saveSearchParams({
        from: fromCode,
        to: toCode,
        date: dateInput,
        trainClass,
      });
    }
  }, [fromInput, toInput, dateInput, trainClass]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setDateInput(newDate);

    const newParams = { from, to, date: newDate, trainClass };

    // Update component state to reflect new date
    setDate(newDate);

    // Save to localStorage
    try {
      localStorage.setItem("trainSearch", JSON.stringify(newParams));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }

    // Navigate with URL parameters to ensure they persist on reload
    const urlParams = new URLSearchParams();
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });

    navigate(`/results?${urlParams.toString()}`, {
      state: newParams,
    });
  };

  const handleBackToSearch = () => {
    navigate("/");
  };

  // Handlers for search box
  const handleFromChange = (e) => {
    const value = e.target.value;
    setFromInput(value);
    setFromSuggestions(filterStations(value));
    setShowFromSuggestions(true);
  };
  const handleToChange = (e) => {
    const value = e.target.value;
    setToInput(value);
    setToSuggestions(filterStations(value));
    setShowToSuggestions(true);
  };
  const handleFromSelect = (station) => {
    // If station is an object with STATION_NAME and CODE, format it directly
    if (station && station.STATION_NAME && station.CODE) {
      setFromInput(`${station.STATION_NAME} (${station.CODE})`);
    } else {
      // Fallback for string input
      setFromInput(getStationNameWithCode(station));
    }
    setShowFromSuggestions(false);
  };
  const handleToSelect = (station) => {
    // If station is an object with STATION_NAME and CODE, format it directly
    if (station && station.STATION_NAME && station.CODE) {
      setToInput(`${station.STATION_NAME} (${station.CODE})`);
    } else {
      // Fallback for string input
      setToInput(getStationNameWithCode(station));
    }
    setShowToSuggestions(false);
  };
  const handleExchange = () => {
    // Extract station codes from current inputs
    const fromCode = extractStationCode(fromInput);
    const toCode = extractStationCode(toInput);

    // Swap with correct formats: both get name with code
    setFromInput(getStationNameWithCode(toCode));
    setToInput(getStationNameWithCode(fromCode));
    if (fromInputRef.current) {
      fromInputRef.current.focus();
    }
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!fromInput.trim() || !toInput.trim() || !dateInput.trim()) {
      alert("Please enter From, To, and Date before searching.");
      return;
    }
    if (!isValidStation(fromInput) || !isValidStation(toInput)) {
      alert(
        "Please enter valid station names for From and To (choose from the suggestions)."
      );
      return;
    }
    if (
      fromInput.trim().toLowerCase() === toInput.trim().toLowerCase() ||
      fromInput.trim().toLowerCase() === `${toInput.trim()}`.toLowerCase()
    ) {
      alert(
        "From and To stations cannot be the same. Please select different stations."
      );
      return;
    }
    // Extract codes
    const fromCode = fromInput.match(/\(([^)]+)\)$/)?.[1] || fromInput;
    const toCode = toInput.match(/\(([^)]+)\)$/)?.[1] || toInput;

    // Create search params object
    const searchParams = {
      from: fromCode,
      to: toCode,
      date: dateInput,
      trainClass,
    };

    // Update component state to reflect new search parameters
    setFrom(fromCode);
    setTo(toCode);
    setDate(dateInput);
    setTrainClass(trainClass);

    // Save to localStorage
    try {
      localStorage.setItem("trainSearch", JSON.stringify(searchParams));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }

    // Navigate with URL parameters to ensure they persist on reload
    const urlParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });

    navigate(`/results?${urlParams.toString()}`, {
      state: searchParams,
    });
  };

  if (!from || !to || !date) {
    return (
      <div style={{ background: "#f7f9fb", minHeight: "100vh" }}>
        <Navbar />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{ color: "#e11d48", fontSize: "18px", textAlign: "center" }}
          >
            {error || "No search parameters found"}
          </div>
          <button
            onClick={handleBackToSearch}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Back to Search
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: "#f7f9fb", minHeight: "100vh" }}>
      <Navbar />
      {/* Search Box at Top */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 2px 8px rgba(37,99,235,0.07)",
          padding: 0,
          margin: "24px auto 0 auto",
          maxWidth: 1400,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "1.5px solid #e0e7fa",
        }}
      >
        <form
          className="train-search-form"
          onSubmit={handleSearchSubmit}
          autoComplete="off"
          style={{
            width: "100%",
            maxWidth: 1300,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 1px 2px rgba(37,99,235,0.04)",
            padding: 0,
            minHeight: 90,
            gap: 0,
          }}
        >
          {/* FROM */}
          <div
            style={{
              flex: 1,
              minWidth: 240,
              padding: "0 24px",
              borderRight: "1.5px solid #e0e7fa",
              height: 90,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "none",
              boxShadow: "none",
            }}
          >
            {editField === "from" ? (
              <div
                className="input-icon-wrapper"
                style={{ width: "100%", maxWidth: "200px" }}
              >
                <span className="input-icon">
                  <FaTrain />
                </span>
                <input
                  id="from-station"
                  type="text"
                  value={fromInput}
                  onChange={handleFromChange}
                  onFocus={() => setShowFromSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowFromSuggestions(false), 50);
                    setTimeout(() => setEditField(null), 60);
                  }}
                  placeholder="From"
                  ref={fromInputRef}
                  className="search-input with-icon"
                  style={{
                    background: "none",
                    border: "none",
                    boxShadow: "none",
                    width: "100%",
                    maxWidth: "160px",
                    paddingLeft: "40px",
                    fontWeight: 400,
                  }}
                  autoFocus
                />
                {showFromSuggestions && fromSuggestions.length > 0 && (
                  <ul
                    className="suggestions-list"
                    style={{ maxWidth: "200px", left: "0" }}
                  >
                    {fromSuggestions.map((s) => (
                      <li
                        key={s.CODE}
                        onMouseDown={() => {
                          handleFromSelect(s);
                          setEditField(null);
                        }}
                      >
                        <span style={{ color: "#2563eb", fontWeight: 600 }}>
                          {s.STATION_NAME}
                        </span>{" "}
                        <span className="station-code">({s.CODE})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div
                onClick={() => setEditField("from")}
                style={{
                  cursor: "pointer",
                  background: "#fff",
                  border: "none",
                  borderRadius: 16,
                  padding: "12px 18px 12px 44px",
                  minHeight: 48,
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                  transition: "box-shadow 0.2s",
                  boxShadow: "0 1px 4px rgba(37,99,235,0.04)",
                  marginRight: "20px",
                }}
              >
                <span
                  className="input-icon"
                  style={{ left: 16, position: "absolute", color: "#2563eb" }}
                >
                  <FaTrain />
                </span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: 15,
                      color: "#888",
                      fontWeight: 500,
                      marginBottom: 0,
                    }}
                  >
                    Source
                  </span>
                  <span
                    style={{
                      fontWeight: 400,
                      fontSize: "1.15rem",
                      color: "#2563eb",
                    }}
                  >
                    {fromInput || "From"}
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* SWAP */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 90,
              width: 0,
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              className="swap-circle-btn"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                background: "#2563eb",
                borderRadius: "50%",
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid #fff",
                boxShadow: "0 2px 8px rgba(37,99,235,0.10)",
                borderLeft: "1.5px solid #e0e7fa",
                borderRight: "1.5px solid #e0e7fa",
                zIndex: 3,
                cursor: "pointer",
                transition: "transform 0.3s",
              }}
              onClick={handleExchange}
              title="Swap From/To"
              tabIndex={-1}
            >
              <FaExchangeAlt
                style={{
                  color: "#fff",
                  fontSize: 20,
                  transition: "transform 0.3s",
                }}
              />
            </div>
          </div>
          {/* TO */}
          <div
            style={{
              flex: 1,
              minWidth: 240,
              padding: "0 24px",
              borderRight: "1.5px solid #e0e7fa",
              height: 90,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "none",
              boxShadow: "none",
            }}
          >
            {editField === "to" ? (
              <div
                className="input-icon-wrapper"
                style={{ width: "100%", maxWidth: "200px" }}
              >
                <span className="input-icon">
                  <FaTrain />
                </span>
                <input
                  id="to-station"
                  type="text"
                  value={toInput}
                  onChange={handleToChange}
                  onFocus={() => setShowToSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowToSuggestions(false), 50);
                    setTimeout(() => setEditField(null), 60);
                  }}
                  placeholder="To"
                  ref={toInputRef}
                  className="search-input with-icon"
                  style={{
                    background: "none",
                    border: "none",
                    boxShadow: "none",
                    width: "100%",
                    maxWidth: "160px",
                    paddingLeft: "40px",
                    fontWeight: 400,
                  }}
                  autoFocus
                />
                {showToSuggestions && toSuggestions.length > 0 && (
                  <ul
                    className="suggestions-list"
                    style={{ maxWidth: "200px", left: "0" }}
                  >
                    {toSuggestions.map((s) => (
                      <li
                        key={s.CODE}
                        onMouseDown={() => {
                          handleToSelect(s);
                          setEditField(null);
                        }}
                      >
                        <span style={{ color: "#2563eb", fontWeight: 600 }}>
                          {s.STATION_NAME}
                        </span>{" "}
                        <span className="station-code">({s.CODE})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div
                onClick={() => setEditField("to")}
                style={{
                  cursor: "pointer",
                  background: "#fff",
                  border: "none",
                  borderRadius: 16,
                  padding: "12px 18px 12px 44px",
                  minHeight: 48,
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                  transition: "box-shadow 0.2s",
                  boxShadow: "0 1px 4px rgba(37,99,235,0.04)",
                  marginLeft: "20px",
                }}
              >
                <span
                  className="input-icon"
                  style={{ left: 16, position: "absolute", color: "#2563eb" }}
                >
                  <FaTrain />
                </span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: 15,
                      color: "#888",
                      fontWeight: 500,
                      marginBottom: 0,
                    }}
                  >
                    Destination
                  </span>
                  <span
                    style={{
                      fontWeight: 400,
                      fontSize: "1.15rem",
                      color: "#2563eb",
                    }}
                  >
                    {toInput || "To"}
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* DATE */}
          <div
            style={{
              flex: 1,
              minWidth: 180,
              maxWidth: 200,
              padding: "0 16px",
              height: 90,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {editField === "date" ? (
              <div style={{ position: "relative", width: "100%" }}>
                <span
                  className="input-icon"
                  style={{
                    left: 16,
                    position: "absolute",
                    color: "#2563eb",
                    top: 18,
                    cursor: "pointer",
                    zIndex: 2,
                    transform: "translateY(-50%)",
                    top: "50%",
                  }}
                  onClick={() => {
                    if (dateInputRef.current) {
                      if (
                        typeof dateInputRef.current.showPicker === "function"
                      ) {
                        dateInputRef.current.showPicker();
                      } else {
                        dateInputRef.current.focus();
                      }
                    }
                  }}
                >
                  <FaRegCalendarAlt />
                </span>
                <input
                  id="journey-date"
                  type="date"
                  value={dateInput}
                  min={getToday()}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="search-input with-icon date-blue custom-date-left-icon"
                  required
                  ref={dateInputRef}
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#2563eb",
                    background: "none",
                    border: "none",
                    boxShadow: "none",
                    width: "100%",
                    paddingLeft: 44,
                    zIndex: 3,
                  }}
                  autoFocus
                  onBlur={() => setEditField(null)}
                />
              </div>
            ) : (
              <div
                onClick={() => {
                  setEditField("date");
                  setTimeout(() => {
                    if (dateInputRef.current) {
                      if (
                        typeof dateInputRef.current.showPicker === "function"
                      ) {
                        dateInputRef.current.showPicker();
                      } else {
                        dateInputRef.current.focus();
                      }
                    }
                  }, 50);
                }}
                style={{
                  cursor: "pointer",
                  background: "#fff",
                  border: "none",
                  borderRadius: 16,
                  padding: "12px 18px 12px 44px",
                  minHeight: 48,
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                  transition: "box-shadow 0.2s",
                  boxShadow: "0 1px 4px rgba(37,99,235,0.04)",
                  width: "100%",
                }}
              >
                <span
                  className="input-icon"
                  style={{
                    left: 16,
                    position: "absolute",
                    color: "#2563eb",
                    cursor: "pointer",
                    transform: "translateY(-50%)",
                    top: "50%",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditField("date");
                    setTimeout(() => {
                      if (dateInputRef.current) {
                        if (
                          typeof dateInputRef.current.showPicker === "function"
                        ) {
                          dateInputRef.current.showPicker();
                        } else {
                          dateInputRef.current.focus();
                        }
                      }
                    }, 50);
                  }}
                >
                  <FaRegCalendarAlt />
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      color: "#888",
                      fontWeight: 500,
                      marginBottom: 0,
                    }}
                  >
                    Date of journey
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#2563eb",
                    }}
                  >
                    {dateInput
                      ? new Date(dateInput).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Date"}
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* TOMORROW / DAY AFTER */}
          <div
            style={{
              minWidth: 360,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0 24px",
              height: 90,
              boxSizing: "border-box",
              borderRight: "1.5px solid #e0e7fa",
            }}
          >
            <button
              type="button"
              onClick={() => handleDateChange(getNextDays()[1].date)}
              style={{
                background: "#e0e7fa",
                color: "#2563eb",
                border: "none",
                borderRadius: 20,
                padding: "8px 18px",
                fontWeight: 600,
                fontSize: 15,
                marginRight: 0,
                marginLeft: "30px",
                cursor: "pointer",
              }}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleDateChange(getNextDays()[2].date)}
              style={{
                background: "#e0e7fa",
                color: "#2563eb",
                border: "none",
                borderRadius: 20,
                padding: "8px 18px",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Day After
            </button>
          </div>
          {/* SEARCH BUTTON */}
          <div
            style={{
              minWidth: 90,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 90,
              padding: "0 24px",
              boxSizing: "border-box",
              marginTop: 18,
            }}
          >
            <button
              type="submit"
              className="train-search-btn"
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 56,
                height: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                boxShadow: "0 2px 8px rgba(37,99,235,0.10)",
              }}
            >
              <FaSearch />
            </button>
          </div>
        </form>
      </div>
      <div
        style={{
          display: "flex",
          maxWidth: 1400,
          margin: "0 auto",
          padding: "32px 0 80px 0",
        }}
      >
        {/* Filter Box */}
        <aside style={{ minWidth: 260, maxWidth: 320, marginRight: 32 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(37,99,235,0.07)",
              padding: 16,
            }}
          >
            <h3
              style={{
                color: "#2563eb",
                fontWeight: 700,
                fontSize: 18,
                margin: 8,
                marginBottom: 4,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FaFilter />
              Filter results
            </h3>
            <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 8 }} />
            {/* Accordion: Ticket class */}
            <div>
              <button
                onClick={() =>
                  setAccordionOpen((p) => ({ ...p, ticket: !p.ticket }))
                }
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 10px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 800,
                  color: "#111827",
                  fontSize: 16,
                }}
              >
                <span>Ticket class</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transform: accordionOpen.ticket
                      ? "rotate(180deg)"
                      : "rotate(0)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="#111827"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {accordionOpen.ticket && (
                <div style={{ padding: "0 10px 12px 10px", color: "#111827" }}>
                  {CLASS_FILTER_OPTIONS.map((opt, i) => (
                    <div
                      key={opt.code}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 0",
                      }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 600 }}>
                        {opt.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={ticketClassFilters.has(opt.code)}
                        onChange={(e) => {
                          setTicketClassFilters((prev) => {
                            const n = new Set(prev);
                            if (e.target.checked) n.add(opt.code);
                            else n.delete(opt.code);
                            return n;
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div style={{ borderTop: "1px solid #e5e7eb" }} />
            </div>

            {/* Accordion: Quota */}
            <div>
              <button
                onClick={() =>
                  setAccordionOpen((p) => ({ ...p, quota: !p.quota }))
                }
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 10px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 800,
                  color: "#111827",
                  fontSize: 16,
                }}
              >
                <span>Quota</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transform: accordionOpen.quota
                      ? "rotate(180deg)"
                      : "rotate(0)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="#111827"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {accordionOpen.quota && (
                <div style={{ padding: "0 10px 12px 10px", color: "#111827" }}>
                  {[
                    { val: "General+Tatkal", label: "General + Tatkal" },
                    { val: "Senior", label: "Senior citizen (SS)" },
                    { val: "Ladies", label: "Ladies quota (LD)" },
                  ].map((q, i) => (
                    <div
                      key={q.val}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 0",
                      }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 600 }}>
                        {q.label}
                      </span>
                      <input
                        type="radio"
                        name="quota"
                        checked={quota === q.val}
                        onChange={() => setQuota(q.val)}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div style={{ borderTop: "1px solid #e5e7eb" }} />
            </div>

            {/* Accordion: Departure time range */}
            <div>
              <button
                onClick={() =>
                  setAccordionOpen((p) => ({ ...p, depRange: !p.depRange }))
                }
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 10px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 800,
                  color: "#111827",
                  fontSize: 16,
                }}
              >
                <span>Departure time range</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transform: accordionOpen.depRange
                      ? "rotate(180deg)"
                      : "rotate(0)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="#111827"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {accordionOpen.depRange && (
                <div style={{ padding: "0 10px 12px 10px", color: "#111827" }}>
                  {TIME_RANGES.map((r, idx) => (
                    <div
                      key={r.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 0",
                        borderTop: idx ? "1px solid #e5e7eb" : "none",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <r.Icon />
                          <span style={{ fontSize: 15, fontWeight: 700 }}>
                            {r.label}
                          </span>
                        </div>
                        <span style={{ color: "#6b7280", fontSize: 13 }}>
                          {r.sub}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={depRanges.has(r.key)}
                        onChange={(e) =>
                          setDepRanges((prev) => {
                            const n = new Set(prev);
                            if (e.target.checked) n.add(r.key);
                            else n.delete(r.key);
                            return n;
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
              <div style={{ borderTop: "1px solid #e5e7eb" }} />
            </div>

            {/* Accordion: Arrival time range */}
            <div>
              <button
                onClick={() =>
                  setAccordionOpen((p) => ({ ...p, arrRange: !p.arrRange }))
                }
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 10px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 800,
                  color: "#111827",
                  fontSize: 16,
                }}
              >
                <span>Arrival time range</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transform: accordionOpen.arrRange
                      ? "rotate(180deg)"
                      : "rotate(0)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="#111827"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {accordionOpen.arrRange && (
                <div style={{ padding: "0 10px 12px 10px", color: "#111827" }}>
                  {TIME_RANGES.map((r, idx) => (
                    <div
                      key={r.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 0",
                        borderTop: idx ? "1px solid #e5e7eb" : "none",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <r.Icon />
                          <span style={{ fontSize: 15, fontWeight: 700 }}>
                            {r.label}
                          </span>
                        </div>
                        <span style={{ color: "#6b7280", fontSize: 13 }}>
                          {r.sub}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={arrRanges.has(r.key)}
                        onChange={(e) =>
                          setArrRanges((prev) => {
                            const n = new Set(prev);
                            if (e.target.checked) n.add(r.key);
                            else n.delete(r.key);
                            return n;
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Results Section */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Summary Bar */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(37,99,235,0.07)",
              padding: 24,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ color: "#2563eb", fontWeight: 700, fontSize: 18 }}>
                {fromInput} → {toInput}
              </div>
              <div style={{ color: "#555", fontSize: 15 }}>
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                · {filteredResults.length} trains
              </div>
            </div>
          </div>
          {/* DateBar below summary bar */}
          <DateBar
            selectedDate={selectedDate}
            onDateSelect={handleDateChange}
            numDays={15}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(37,99,235,0.07)",
              padding: "18px 24px",
              margin: "18px 0 12px 0",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 20 }}>
              {filteredResults.length} Trains
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ fontWeight: 600, color: "#222" }}>Sort By:</span>
              <span
                style={{ fontWeight: 700, color: "#2563eb", cursor: "pointer" }}
              >
                Default
              </span>
              <span style={{ color: "#888", cursor: "pointer" }}>
                Availability
              </span>
              <span style={{ color: "#888", cursor: "pointer" }}>Duration</span>
              <span style={{ color: "#888", cursor: "pointer" }}>
                Departure
              </span>
              <span style={{ color: "#888", cursor: "pointer" }}>Arrival</span>
            </div>
          </div>
          {/* Free Cancellation banner removed */}
          {loading ? (
            <div
              style={{
                color: "#2563eb",
                textAlign: "center",
                margin: 40,
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Loading trains...
            </div>
          ) : error ? (
            <div
              style={{
                color: "#e11d48",
                textAlign: "center",
                margin: 40,
                fontSize: "18px",
              }}
            >
              {error}
            </div>
          ) : filteredResults.length === 0 ? (
            <div
              style={{
                color: "#e11d48",
                textAlign: "center",
                margin: 40,
                fontSize: "18px",
              }}
            >
              No trains found for this route. Please try different stations.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {filteredResults
                .map((train, idx) => {
                  // Build list of rendered cards, skipping trains without the selected class
                  // Normalize train data properties to handle both API and generated data formats
                  const trainNo = train.train_number || train.trainNo;
                  const trainName = train.train_name || train.name;
                  const departureTime = train.departure_time || train.depTime;
                  const arrivalTime = train.arrival_time || train.arrTime;
                  const fromStation = train.from_station_code || train.from;
                  const toStation = train.to_station_code || train.to;
                  // Compute a reliable duration string (HH:MM) based on dep/arr if missing/invalid
                  const rawDuration = train.duration;
                  const depMForDur = parseTimeToMinutes(departureTime);
                  const arrMForDur = parseTimeToMinutes(arrivalTime);
                  let trainDuration = rawDuration;
                  const isValidDur =
                    typeof rawDuration === "string" &&
                    /^\d{1,2}:\d{2}$/.test(rawDuration);
                  if (!isValidDur && depMForDur != null && arrMForDur != null) {
                    const diff =
                      arrMForDur >= depMForDur
                        ? arrMForDur - depMForDur
                        : arrMForDur + 1440 - depMForDur;
                    const h = Math.floor(diff / 60);
                    const m = diff % 60;
                    trainDuration = `${h}:${String(m).padStart(2, "0")}`;
                  }
                  const trainDistance = train.distance || "500 km";
                  const trainStatus =
                    train.running_status || train.status || "On Time";
                  const trainOffer = train.offer || "Flexible Booking";
                  const platform =
                    train.platform ||
                    (parseInt(trainNo.replace(/\D/g, "")) % 8) + 1; // Use train number to generate stable platform number

                  // Filter out trains that do not run on the selected day (if running_days provided)
                  const selectedDOW = getDayLabel(selectedDate);
                  if (
                    Array.isArray(train.running_days) &&
                    train.running_days.length > 0
                  ) {
                    const runsToday =
                      train.running_days.includes("Daily") ||
                      train.running_days.includes(selectedDOW);
                    if (!runsToday) return null;
                  }

                  // Filter out trains whose departure time has already passed for the selected date (today check)
                  const now = new Date();
                  const depMins = parseTimeToMinutes(departureTime);
                  if (depMins != null) {
                    const depDateObj = addMinutes(
                      ymdToLocalDate(selectedDate),
                      depMins
                    );
                    // If selected date is today (same Y/M/D) and departure already passed, hide
                    const isSameYMD = (a, b) =>
                      a.getFullYear() === b.getFullYear() &&
                      a.getMonth() === b.getMonth() &&
                      a.getDate() === b.getDate();
                    if (
                      isSameYMD(depDateObj, now) &&
                      depDateObj.getTime() <= now.getTime()
                    ) {
                      return null;
                    }
                  }

                  // Apply time range filters (departure/arrival)
                  const depHour = parseHour24(departureTime);
                  const arrHour = parseHour24(arrivalTime);
                  if (
                    !isHourInRanges(depHour ?? -1, depRanges) ||
                    !isHourInRanges(arrHour ?? -1, arrRanges)
                  ) {
                    return null;
                  }

                  // Handle class types from different data sources
                  let classes = [];
                  if (train.classes && Array.isArray(train.classes)) {
                    // Already formatted classes from generated data
                    classes = train.classes;
                  } else if (
                    train.class_type &&
                    Array.isArray(train.class_type)
                  ) {
                    // Format from dummy data or API
                    // Use deterministic price based on train number and class code instead of random
                    classes = train.class_type.map((classCode) => {
                      // Generate price based on train number and class code (deterministic)
                      const trainNumSeed =
                        parseInt(trainNo.replace(/\D/g, "")) || 12345;
                      const classCodeSeed =
                        classCode.charCodeAt(0) * 100 +
                        (classCode.charCodeAt(1) || 0);
                      const price =
                        500 + ((trainNumSeed + classCodeSeed) % 1500); // Price between 500-2000

                      // Deterministic status based on train number and class
                      const statusSeed = (trainNumSeed + classCodeSeed) % 10;
                      const statusOptions = [
                        "Available",
                        "Available",
                        "Available",
                        "Available",
                        "Available",
                        "Available",
                        "WL 15",
                        "WL 25",
                        "RLWL 8",
                        "TRAIN DEPARTED",
                      ];
                      const status = statusOptions[statusSeed];

                      return {
                        code: classCode,
                        price: `₹${price}`,
                        status: status,
                        type:
                          (trainNumSeed + classCodeSeed) % 10 > 7
                            ? "Tatkal"
                            : "",
                      };
                    });
                  } else {
                    // Fallback if no class information is available
                    const defaultClasses = ["SL", "3A", "2A"];
                    const trainNumSeed =
                      parseInt(trainNo.replace(/\D/g, "")) || 12345;

                    classes = defaultClasses.map((classCode) => {
                      const classCodeSeed =
                        classCode.charCodeAt(0) * 100 +
                        (classCode.charCodeAt(1) || 0);
                      const price =
                        500 + ((trainNumSeed + classCodeSeed) % 1500);
                      return {
                        code: classCode,
                        price: `₹${price}`,
                        status: "Available",
                        type: "",
                      };
                    });
                  }

                  // Apply Ticket class filter from sidebar. This overrides the initial TrainSearchForm selection.
                  if (ticketClassFilters && ticketClassFilters.size > 0) {
                    classes = classes.filter((c) =>
                      ticketClassFilters.has(c.code)
                    );
                  }

                  // If a filter is applied but this train doesn't offer any of the selected classes, skip it.
                  if (
                    ticketClassFilters &&
                    ticketClassFilters.size > 0 &&
                    classes.length === 0
                  ) {
                    return null;
                  }

                  // Attach remaining seats from cached seat data
                  classes = classes.map((c) => {
                    const key = `${trainNo}:${selectedDate}:${c.code}`;
                    const remaining =
                      seatData[key] !== undefined
                        ? seatData[key]
                        : BASE_SEATS_BY_CLASS[c.code] || 0;
                    return { ...c, remaining };
                  });

                  return (
                    <div
                      key={idx}
                      style={{
                        background: "#fff",
                        borderRadius: 16,
                        boxShadow: "0 4px 12px rgba(37,99,235,0.1)",
                        padding: 24,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        border: "1px solid #e0e7fa",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 16px rgba(37,99,235,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(37,99,235,0.1)";
                      }}
                    >
                      {/* Decorative accent */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "4px",
                          background:
                            "linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa)",
                        }}
                      ></div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          position: "relative",
                          zIndex: 1,
                          marginTop: "8px",
                          flexWrap: "nowrap",
                          gap: "12px",
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                background: "#e0e7fa",
                                color: "#2563eb",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                marginRight: "10px",
                                fontWeight: 700,
                                fontSize: 16,
                                display: "inline-block",
                              }}
                            >
                              {trainNo}
                            </div>
                            <span
                              style={{
                                color: "#222",
                                fontWeight: 600,
                                fontSize: 17,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {trainName}
                            </span>
                            <span
                              style={{
                                marginLeft: 8,
                                color:
                                  trainStatus === "On Time"
                                    ? "#059669"
                                    : "#b45309",
                                fontSize: "14px",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                background:
                                  trainStatus === "On Time"
                                    ? "#ecfdf5"
                                    : "#fffbeb",
                              }}
                            >
                              • {trainStatus}
                            </span>
                          </div>
                          {/* Removed small grey Platform • Distance line as requested */}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            flexShrink: 0,
                          }}
                        >
                          {/* Offer text removed as requested */}

                          <button
                            style={{
                              background:
                                "linear-gradient(90deg, #15803d, #22c55e)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              padding: "8px 16px",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor: "pointer",
                              boxShadow: "0 2px 6px rgba(34, 197, 94, 0.2)",
                              transition: "all 0.2s ease",
                              opacity: selectedClassByTrain[trainNo] ? 1 : 0.4,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 8px rgba(34, 197, 94, 0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 2px 6px rgba(34, 197, 94, 0.2)";
                            }}
                            onClick={() => {
                              const selClass = selectedClassByTrain[trainNo];
                              if (!selClass) {
                                showToast(
                                  "Please select a class before booking."
                                );
                                return;
                              }
                              // Extract the exact displayed price for the selected class from this train's class list
                              let selectedClassPrice = null;
                              try {
                                const clsEntry = (train.classes || []).find(
                                  (c) => c.code === selClass
                                );
                                if (
                                  clsEntry &&
                                  typeof clsEntry.price === "string"
                                ) {
                                  const num = parseInt(
                                    clsEntry.price.replace(/[^0-9]/g, ""),
                                    10
                                  );
                                  if (Number.isFinite(num) && num > 0)
                                    selectedClassPrice = num;
                                }
                              } catch (_) {}
                              // Compute accurate departure/arrival dates from selectedDate + times/duration
                              const depM = parseTimeToMinutes(departureTime);
                              const arrM = parseTimeToMinutes(arrivalTime);
                              const durM =
                                parseDurationToMinutes(trainDuration);
                              const baseDate = ymdToLocalDate(selectedDate);
                              const depDateObj =
                                depM != null
                                  ? addMinutes(baseDate, depM)
                                  : baseDate;
                              let arrDateObj = null;
                              if (depM != null && Number.isFinite(durM)) {
                                arrDateObj = addMinutes(baseDate, depM + durM);
                              } else if (depM != null && arrM != null) {
                                const rollover = arrM < depM ? 1440 : 0;
                                arrDateObj = addMinutes(
                                  baseDate,
                                  arrM + rollover
                                );
                              } else if (arrM != null) {
                                arrDateObj = addMinutes(baseDate, arrM);
                              } else {
                                arrDateObj = baseDate;
                              }

                              const bookingPayload = {
                                train: {
                                  trainNo,
                                  trainName,
                                  departureTime,
                                  arrivalTime,
                                  fromStation,
                                  toStation,
                                  duration: trainDuration,
                                  distance: trainDistance,
                                  platform,
                                  offer: trainOffer,
                                  running_days: train.running_days || [],
                                  // New: accurate dates for downstream (PassengerDetails, PDF, PNR)
                                  departure_date: formatDMY(depDateObj), // e.g., 23-08-2025
                                  arrival_date: formatDMY(arrDateObj), // handles next-day rollover
                                  departure_ymd: formatYMD(depDateObj), // e.g., 2025-08-23
                                  arrival_ymd: formatYMD(arrDateObj), // e.g., 2025-08-24
                                },
                                selectedClass: selClass,
                                date: selectedDate,
                                quota,
                                selectedClassPrice,
                              };
                              if (!isLoggedIn()) {
                                setPendingBooking(bookingPayload);
                                setShowLoginModal(true);
                                return;
                              }
                              navigate("/booking", { state: bookingPayload });
                            }}
                          >
                            Book Ticket
                          </button>

                          {/* Running days display (MTWTFSS) */}
                          {train.running_days && (
                            <div
                              style={{
                                display: "flex",
                                gap: "2px",
                                marginLeft: "10px",
                                background: "#f0f9ff",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                border: "1px solid #bae6fd",
                              }}
                            >
                              {[
                                { day: "M", full: "Mon" },
                                { day: "T", full: "Tue" },
                                { day: "W", full: "Wed" },
                                { day: "T", full: "Thu" },
                                { day: "F", full: "Fri" },
                                { day: "S", full: "Sat" },
                                { day: "S", full: "Sun" },
                              ].map((dayObj, i) => {
                                const isRunning =
                                  train.running_days.includes(dayObj.full) ||
                                  train.running_days.includes("Daily");
                                return (
                                  <div
                                    key={i}
                                    title={dayObj.full}
                                    style={{
                                      width: "16px",
                                      height: "16px",
                                      borderRadius: "50%",
                                      background: isRunning
                                        ? "#0284c7"
                                        : "#e0f2fe",
                                      color: isRunning ? "#fff" : "#64748b",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {dayObj.day}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Divider after header with side margins */}
                      <div
                        style={{
                          height: 1,
                          background: "#e5e7eb",
                          margin: "8px 16px 0 16px",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 24,
                          marginTop: 8,
                          width: "100%",
                        }}
                      >
                        {/* Departure Time */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 24,
                            flex: 1,
                          }}
                        >
                          <div style={{ minWidth: 100 }}>
                            <div
                              style={{
                                color: "#222",
                                fontWeight: 700,
                                fontSize: 20,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {departureTime}
                              <span
                                style={{
                                  fontSize: 10,
                                  color: "#2563eb",
                                  background: "#e0e7fa",
                                  padding: "1px 4px",
                                  borderRadius: 4,
                                  marginLeft: 6,
                                  fontWeight: 600,
                                }}
                              >
                                DEP
                              </span>
                            </div>
                            <div
                              style={{
                                color: "#555",
                                fontSize: 14,
                                marginTop: 2,
                                fontWeight: 500,
                                lineHeight: 1.3,
                                whiteSpace: "normal",
                              }}
                            >
                              <div>{getStationNameWithCode(fromStation)}</div>
                              {/* Date of Departure */}
                              {(() => {
                                const mins = parseTimeToMinutes(departureTime);
                                if (mins == null) return null;
                                const depDateObj = addMinutes(
                                  ymdToLocalDate(selectedDate),
                                  mins
                                );
                                return (
                                  <div
                                    style={{ color: "#6b7280", fontSize: 12 }}
                                  >
                                    {formatShortDate(depDateObj)}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Arrow with train icon */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              position: "relative",
                              margin: "0 8px",
                            }}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: "2px",
                                background: "#e5e7eb",
                                position: "relative",
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  background: "#fff",
                                  padding: "0 4px",
                                }}
                              >
                                <FaLongArrowAltRight
                                  style={{
                                    color: "#2563eb",
                                    fontSize: 20,
                                    transform: "rotate(0deg)",
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Arrival Time */}
                          <div style={{ minWidth: 100 }}>
                            <div
                              style={{
                                color: "#222",
                                fontWeight: 700,
                                fontSize: 20,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {isNaN(
                                Number(arrivalTime?.replace(/[^0-9]/g, ""))
                              ) || !arrivalTime
                                ? "23:59"
                                : arrivalTime}
                              <span
                                style={{
                                  fontSize: 10,
                                  color: "#059669",
                                  background: "#d1fae5",
                                  padding: "1px 4px",
                                  borderRadius: 4,
                                  marginLeft: 6,
                                  fontWeight: 600,
                                }}
                              >
                                ARR
                              </span>
                            </div>
                            <div
                              style={{
                                color: "#555",
                                fontSize: 14,
                                marginTop: 2,
                                fontWeight: 500,
                                lineHeight: 1.3,
                                whiteSpace: "normal",
                              }}
                            >
                              <div>{getStationNameWithCode(toStation)}</div>
                              {/* Date of Arrival */}
                              {(() => {
                                const depM = parseTimeToMinutes(departureTime);
                                const arrMRaw = parseTimeToMinutes(arrivalTime);
                                if (depM == null && arrMRaw == null)
                                  return null;
                                let arrDateObj;
                                if (depM != null) {
                                  // Prefer duration if available to determine rollover
                                  const durM =
                                    parseDurationToMinutes(trainDuration);
                                  if (durM != null) {
                                    arrDateObj = addMinutes(
                                      ymdToLocalDate(selectedDate),
                                      depM + durM
                                    );
                                  } else if (arrMRaw != null) {
                                    const base = ymdToLocalDate(selectedDate);
                                    // If arrival minutes < dep minutes, arrival is next day
                                    const dayOffset = arrMRaw < depM ? 1440 : 0;
                                    arrDateObj = addMinutes(
                                      base,
                                      arrMRaw + dayOffset
                                    );
                                  }
                                } else if (arrMRaw != null) {
                                  arrDateObj = addMinutes(
                                    ymdToLocalDate(selectedDate),
                                    arrMRaw
                                  );
                                }
                                if (!arrDateObj) return null;
                                return (
                                  <div
                                    style={{ color: "#6b7280", fontSize: 12 }}
                                  >
                                    {formatShortDate(arrDateObj)}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            background:
                              "linear-gradient(135deg, #A7C7E7, #B6D0E2)",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            minWidth: 100,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            boxShadow: "0 2px 6px rgba(167, 199, 231, 0.2)",
                            transition:
                              "transform 0.2s ease, box-shadow 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(167, 199, 231, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 6px rgba(167, 199, 231, 0.15)";
                          }}
                        >
                          <div
                            style={{
                              color: "#ffffff",
                              fontWeight: 600,
                              fontSize: 12,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              marginBottom: 4,
                              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            }}
                          >
                            Duration
                          </div>
                          <div
                            style={{
                              color: "#ffffff",
                              fontWeight: 700,
                              fontSize: 18,
                              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            }}
                          >
                            {trainDuration}
                          </div>
                        </div>
                        <div
                          style={{
                            background:
                              "linear-gradient(135deg, #89CFF0, #B6D0E2)",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            minWidth: 100,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            boxShadow: "0 2px 6px rgba(137, 207, 240, 0.2)",
                            transition:
                              "transform 0.2s ease, box-shadow 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(137, 207, 240, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 6px rgba(137, 207, 240, 0.15)";
                          }}
                        >
                          <div
                            style={{
                              color: "#ffffff",
                              fontWeight: 600,
                              fontSize: 12,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              marginBottom: 4,
                              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            }}
                          >
                            Distance
                          </div>
                          <div
                            style={{
                              color: "#ffffff",
                              fontWeight: 700,
                              fontSize: 18,
                              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            }}
                          >
                            {isNaN(parseFloat(trainDistance))
                              ? "500 km"
                              : trainDistance}
                          </div>
                        </div>
                        <div
                          style={{
                            marginLeft: "auto",
                            display: "flex",
                            gap: "12px",
                          }}
                        >
                          <button
                            style={{
                              background:
                                "linear-gradient(to right, #2563eb, #3b82f6)",
                              color: "white",
                              border: "none",
                              borderRadius: 8,
                              padding: "10px 20px",
                              fontWeight: 600,
                              cursor: "pointer",
                              boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 10px rgba(37,99,235,0.35)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 2px 6px rgba(37,99,235,0.25)";
                            }}
                          >
                            View Route
                          </button>
                        </div>
                      </div>

                      {/* Class boxes row - redesigned with top/bottom bands and counts */}
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          flexWrap: "wrap",
                          marginTop: 16,
                          padding: "0",
                          background: "transparent",
                          borderRadius: 12,
                          border: "none",
                          boxShadow: "none",
                        }}
                      >
                        {classes.map((cls, i) => {
                          // Calculate time to departure for seat guarantee logic
                          const depDateTime = new Date(
                            `${selectedDate}T${departureTime
                              .replace(/(AM|PM)/, "")
                              .trim()}:00${
                              departureTime.includes("PM") &&
                              !departureTime.startsWith("12")
                                ? " PM"
                                : " AM"
                            }`
                          );
                          const now = new Date();
                          const hoursToDeparture =
                            (depDateTime - now) / (1000 * 60 * 60);
                          const showSeatGuarantee = hoursToDeparture > 2.5;
                          const isSelected =
                            selectedClassByTrain[trainNo] === cls.code;
                          // Status normalization for label and color
                          const statusText = cls.status || "Available";
                          const isAvailable = /available/i.test(statusText);
                          const isWaitlist = /\bWL\b|RLWL|waiting/i.test(
                            statusText
                          );
                          const isNotAvailable =
                            /not available/i.test(statusText) ||
                            /departed/i.test(statusText);

                          // Gradient palette: AVBL (blue gradient), WL (amber→red), NA (slate gradient)
                          const topBg = isAvailable
                            ? "linear-gradient(90deg,#3b82f6,#1d4ed8)"
                            : isWaitlist
                            ? "linear-gradient(90deg,#f59e0b,#ef4444)"
                            : "linear-gradient(90deg,#94a3b8,#64748b)";
                          const bottomBg = isAvailable
                            ? "linear-gradient(90deg,#eff6ff,#dbeafe)"
                            : isWaitlist
                            ? "linear-gradient(90deg,#fff7ed,#fef3c7)"
                            : "linear-gradient(90deg,#e2e8f0,#cbd5e1)";
                          // Use a solid color for selected border (gradients are not valid border colors)
                          const borderColor = isAvailable
                            ? "#1d4ed8"
                            : isWaitlist
                            ? "#d97706"
                            : "#475569"; // blue-700, amber-600, slate-600
                          const boxBorder = isSelected
                            ? `2px solid ${borderColor}`
                            : "1px solid rgba(0,0,0,0.08)";
                          const codeTextColor = "#ffffff";
                          const priceTextColor = "#ffffff";
                          const label = isAvailable
                            ? "AVBL"
                            : isWaitlist
                            ? "WL"
                            : "NOT AVAILABLE";
                          const count =
                            label === "WL"
                              ? parseInt(
                                  (statusText.match(/WL\s*(\d+)/i) || [])[1] ||
                                    "0",
                                  10
                                ) || (cls.remaining === 0 ? 10 : 0)
                              : cls.remaining ?? 0;

                          return (
                            <div
                              key={i}
                              style={{
                                background: "transparent",
                                color: "#111827",
                                borderRadius: 10,
                                padding: 0,
                                minWidth: 150,
                                minHeight: 110,
                                display: "flex",
                                flexDirection: "column",
                                textAlign: "center",
                                fontWeight: 600,
                                border: boxBorder,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                marginBottom: 4,
                                position: "relative",
                                transition:
                                  "transform 0.15s ease, box-shadow 0.15s ease",
                                cursor: "pointer",
                                fontFamily:
                                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(-2px)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 12px rgba(0,0,0,0.12)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                                e.currentTarget.style.boxShadow =
                                  "0 2px 8px rgba(0,0,0,0.08)";
                              }}
                              onClick={() => {
                                setSelectedClassByTrain((prev) => {
                                  // Toggle the class selection - if the same class is clicked again, deselect it
                                  if (prev[trainNo] === cls.code) {
                                    const newState = { ...prev };
                                    delete newState[trainNo];
                                    return newState;
                                  }
                                  // Otherwise, select the new class
                                  return { ...prev, [trainNo]: cls.code };
                                });
                              }}
                            >
                              {/* Top band: code (left) and price (right) */}
                              {(() => {
                                const priceFallbackByCode = {
                                  EA: "₹3500",
                                  "1A": "₹2500",
                                  EV: "₹2200",
                                  EC: "₹1800",
                                  "2A": "₹1500",
                                  FC: "₹1200",
                                  "3A": "₹1000",
                                  "3E": "₹800",
                                  CC: "₹800",
                                  SL: "₹400",
                                  VS: "₹600",
                                  "2S": "₹200",
                                };
                                const displayPrice =
                                  cls.price && String(cls.price).trim() !== ""
                                    ? cls.price
                                    : priceFallbackByCode[cls.code] || "";
                                return (
                                  <div
                                    style={{
                                      background: topBg,
                                      color: "#fff",
                                      padding: "12px 14px",
                                      borderTopLeftRadius: 10,
                                      borderTopRightRadius: 10,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontWeight: 800,
                                        fontSize: 16,
                                        letterSpacing: 0.2,
                                      }}
                                    >
                                      {cls.code}
                                    </span>
                                    <span
                                      style={{
                                        fontWeight: 800,
                                        fontSize: 16,
                                        letterSpacing: 0.2,
                                      }}
                                    >
                                      {displayPrice}
                                    </span>
                                  </div>
                                );
                              })()}
                              {/* Divider */}
                              <div
                                style={{
                                  height: 2,
                                  background: "rgba(255,255,255,0.85)",
                                }}
                              />
                              {/* Bottom band: availability and count */}
                              <div
                                style={{
                                  background: bottomBg,
                                  padding: "12px 14px",
                                  borderBottomLeftRadius: 10,
                                  borderBottomRightRadius: 10,
                                  flexGrow: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 800,
                                    letterSpacing: 0.15,
                                    color: isWaitlist
                                      ? "#92400e"
                                      : isAvailable
                                      ? "#1e40af"
                                      : "#334155",
                                  }}
                                >
                                  {label} {count > 0 ? count : ""}
                                </div>
                                {showSeatGuarantee && (
                                  <div
                                    style={{
                                      fontSize: 12,
                                      color: "#334155",
                                      fontWeight: 700,
                                      marginTop: 4,
                                    }}
                                  >
                                    <span role="img" aria-label="guarantee">
                                      💺
                                    </span>{" "}
                                    Seat Guarantee
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
                .filter(Boolean)}
              {!results.some((train) => {
                // Time range checks
                const depH = parseHour24(train.departure_time || train.depTime);
                const arrH = parseHour24(train.arrival_time || train.arrTime);
                if (
                  !isHourInRanges(depH ?? -1, depRanges) ||
                  !isHourInRanges(arrH ?? -1, arrRanges)
                )
                  return false;

                // Classes array normalized
                let classesArray = train.classes || train.class_type || [];
                if (!Array.isArray(classesArray)) classesArray = [];
                // Normalize to [{code}]
                const codes = classesArray.map((c) =>
                  typeof c === "string" ? c : c.code
                );

                // Apply global class from search bar
                let okBySearchClass = true;
                if (trainClass && trainClass !== "All Classes") {
                  const match = trainClass.match(/\(([^)]+)\)/);
                  const selectedCode = match ? match[1] : trainClass.trim();
                  okBySearchClass =
                    codes.includes(selectedCode) ||
                    trainClass.includes(selectedCode);
                }

                // Apply sidebar ticket class filters
                let okBySidebar = true;
                if (ticketClassFilters && ticketClassFilters.size > 0) {
                  okBySidebar = codes.some((code) =>
                    ticketClassFilters.has(code)
                  );
                }

                return okBySearchClass && okBySidebar;
              }) && (
                <div
                  style={{
                    color: "#e11d48",
                    textAlign: "center",
                    margin: 40,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  No trains match your filters for this route and date.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1e40af",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
            fontWeight: 600,
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Login Modal for booking */}
      <LoginSignupModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          if (pendingBooking) {
            navigate("/booking", { state: pendingBooking });
            setPendingBooking(null);
          }
        }}
      />
      <Footer />
    </div>
  );
};

export default TrainResults;
