// Digital clock component that displays current date and time in the navigation bar
// Updates every second and formats time in 24-hour format
import React, { useState, useEffect } from "react";

// Utility function to pad single digits with leading zero
// Ensures consistent two-digit display for hours, minutes, and seconds
function pad(num) {
  return num.toString().padStart(2, "0");
}

// Format time in 24-hour format with brackets for visual separation
// Returns time in [HH:MM:SS] format
function format24Hour(date) {
  const hours = date.getHours(); // 0-23
  return `[${pad(hours)}:${pad(date.getMinutes())}:${pad(date.getSeconds())}]`;
}

const DigitalClock = () => {
  // State to store current date/time, updates every second
  const [now, setNow] = useState(new Date());

  // Set up interval to update time every second
  // Cleanup interval when component unmounts to prevent memory leaks
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and time strings for display
  // Use local date (not UTC ISO) to avoid off-by-one day in some timezones
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}`; // YYYY-MM-DD
  const timeStr = format24Hour(now);

  return (
    <div className="navbar-clock">
      {/* Display current date in YYYY-MM-DD format */}
      <span className="navbar-clock-date">{dateStr}</span>
      {/* Display current time in [HH:MM:SS] format */}
      <span className="navbar-clock-time">{timeStr}</span>
    </div>
  );
};

export default DigitalClock;
