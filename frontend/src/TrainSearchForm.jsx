// Train search form component with station autocomplete and validation
// Provides an intuitive interface for users to search for train availability
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import stations from "./Railway_stations.json";
import { FaExchangeAlt, FaTrain, FaRegCalendarAlt } from "react-icons/fa";

// Available train class options for user selection
const classOptions = [
  "All Classes",
  "Anubhuti Class (EA)",
  "AC First Class (1A)",
  "Vistadome AC (EV)",
  "Exec. Chair Car (EC)",
  "AC 2 Tier (2A)",
  "First Class (FC)",
  "AC 3 Tier (3A)",
  "AC 3 Economy (3E)",
  "Vistadome Chair Car (VC)",
  "AC Chair car (CC)",
  "Sleeper (SL)",
  "Vistadome Non AC (VS)",
  "Second Sitting (2S)",
];

// Filter stations based on user input for autocomplete suggestions
// Returns up to 8 matching stations
function filterStations(query) {
  if (!query) return [];
  return stations
    .filter((s) => s.STATION_NAME.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);
}

// Get station name with code for display (e.g., "New Delhi (NDLS)")
function getStationWithCode(name) {
  const s = stations.find((s) => s.STATION_NAME === name);
  return s ? `${s.STATION_NAME} (${s.CODE})` : name;
}

// Get today's date in YYYY-MM-DD format for date input minimum value
// Uses local date to avoid timezone issues
function getToday() {
  // Use local date (not UTC ISO) to avoid off-by-one day in some timezones
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = ("0" + (d.getMonth() + 1)).slice(-2);
  const dd = ("0" + d.getDate()).slice(-2);
  return `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD in local time
}

// Validate if user input matches a valid station name
const isValidStation = (input) => {
  return stations.some(
    (s) =>
      input.trim().toLowerCase() === s.STATION_NAME.toLowerCase() ||
      input.trim().toLowerCase() ===
        `${s.STATION_NAME} (${s.CODE})`.toLowerCase()
  );
};

const TrainSearchForm = () => {
  // Form state management
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [trainClass, setTrainClass] = useState(classOptions[0]);

  // Autocomplete suggestions state
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  // DOM references for focus management and date picker
  const fromInputRef = useRef();
  const toInputRef = useRef();
  const dateInputRef = useRef();
  const navigate = useNavigate();

  // Handle from station input changes and show suggestions
  const handleFromChange = (e) => {
    const value = e.target.value;
    setFrom(value);
    setFromSuggestions(filterStations(value));
    setShowFromSuggestions(true);
  };

  // Handle to station input changes and show suggestions
  const handleToChange = (e) => {
    const value = e.target.value;
    setTo(value);
    setToSuggestions(filterStations(value));
    setShowToSuggestions(true);
  };

  // Handle selection of from station from suggestions
  const handleFromSelect = (name) => {
    setFrom(getStationWithCode(name));
    setShowFromSuggestions(false);
  };

  // Handle selection of to station from suggestions
  const handleToSelect = (name) => {
    setTo(getStationWithCode(name));
    setShowToSuggestions(false);
  };

  // Swap from and to stations for return journey
  const handleExchange = () => {
    setFrom(to);
    setTo(from);
    fromInputRef.current.focus();
  };

  // Handle form submission with validation
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation: ensure all required fields are filled
    if (!from.trim() || !to.trim() || !date.trim()) {
      alert("Please enter From, To, and Date before searching.");
      return;
    }

    // Validate station names against the stations database
    if (!isValidStation(from) || !isValidStation(to)) {
      alert(
        "Please enter valid station names for From and To (choose from the suggestions)."
      );
      return;
    }

    // Prevent same station selection for from and to
    if (
      from.trim().toLowerCase() === to.trim().toLowerCase() ||
      from.trim().toLowerCase() === `${to.trim()}`.toLowerCase()
    ) {
      alert(
        "From and To stations cannot be the same. Please select different stations."
      );
      return;
    }

    // Navigate to results page after successful validation, passing station codes and date
    const fromCode = from.match(/\(([^)]+)\)$/)?.[1] || from;
    const toCode = to.match(/\(([^)]+)\)$/)?.[1] || to;
    const params = new URLSearchParams({
      from: fromCode,
      to: toCode,
      date,
      trainClass,
    });
    navigate(`/results?${params.toString()}`, {
      state: { from: fromCode, to: toCode, date, trainClass },
    });
  };

  return (
    <form
      className="train-search-form"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      {/* First row: From station | Swap button | To station */}
      <div className="search-box-grid">
        {/* From station input with autocomplete */}
        <div>
          <div className="input-icon-wrapper">
            <span className="input-icon">
              <FaTrain />
            </span>
            <input
              id="from-station"
              type="text"
              value={from}
              onChange={handleFromChange}
              onFocus={() => setShowFromSuggestions(true)}
              onBlur={() =>
                setTimeout(() => setShowFromSuggestions(false), 100)
              }
              placeholder="From"
              ref={fromInputRef}
              className="search-input with-icon"
            />
            {/* From station autocomplete suggestions */}
            {showFromSuggestions && fromSuggestions.length > 0 && (
              <ul className="suggestions-list">
                {fromSuggestions.map((s) => (
                  <li
                    key={s.CODE}
                    onMouseDown={() => handleFromSelect(s.STATION_NAME)}
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
        </div>

        {/* Station swap button */}
        <div className="swap-icon">
          <button
            type="button"
            className="exchange-btn"
            onClick={handleExchange}
            title="Swap From/To"
            tabIndex={-1}
          >
            <FaExchangeAlt size={22} />
          </button>
        </div>

        {/* To station input with autocomplete */}
        <div>
          <div className="input-icon-wrapper">
            <span className="input-icon">
              <FaTrain />
            </span>
            <input
              id="to-station"
              type="text"
              value={to}
              onChange={handleToChange}
              onFocus={() => setShowToSuggestions(true)}
              onBlur={() => setTimeout(() => setShowToSuggestions(false), 100)}
              placeholder="To"
              ref={toInputRef}
              className="search-input with-icon"
            />
            {/* To station autocomplete suggestions */}
            {showToSuggestions && toSuggestions.length > 0 && (
              <ul className="suggestions-list">
                {toSuggestions.map((s) => (
                  <li
                    key={s.CODE}
                    onMouseDown={() => handleToSelect(s.STATION_NAME)}
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
        </div>
      </div>

      {/* Second row: Date picker | (empty) | Train class selector */}
      <div className="search-box-grid" style={{ marginTop: "18px" }}>
        {/* Journey date input with calendar icon */}
        <div>
          <div className="input-icon-wrapper">
            <span
              className="input-icon"
              onClick={() => {
                if (dateInputRef.current) {
                  if (typeof dateInputRef.current.showPicker === "function") {
                    dateInputRef.current.showPicker();
                  } else {
                    dateInputRef.current.focus();
                  }
                }
              }}
              style={{
                cursor: "pointer",
                color: "#2563eb",
                left: 16,
                right: "auto",
              }}
            >
              <FaRegCalendarAlt />
            </span>
            <input
              id="journey-date"
              type="date"
              value={date}
              min={getToday()}
              onChange={(e) => setDate(e.target.value)}
              className="search-input with-icon date-blue custom-date-left-icon"
              required
              style={{ color: "#2563eb", borderColor: "#2563eb" }}
              ref={dateInputRef}
            />
          </div>
        </div>

        {/* Empty space for grid alignment */}
        <div></div>

        {/* Train class selection dropdown */}
        <div>
          <select
            id="train-class"
            value={trainClass}
            onChange={(e) => setTrainClass(e.target.value)}
            className="classes-dropdown"
            style={{ color: "#2563eb", borderColor: "#2563eb" }}
          >
            {classOptions.map((opt) => (
              <option
                key={opt}
                value={opt}
                style={{ color: "#2563eb", fontWeight: 600 }}
              >
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Third row: Search button centered below all fields */}
      <div
        style={{
          width: "100%",
          marginTop: "22px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button type="submit" className="train-search-btn">
          Search
        </button>
      </div>
    </form>
  );
};

export default TrainSearchForm;
