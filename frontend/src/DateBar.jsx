// DateBar.js
// Scrollable horizontal date picker bar for train search UI
// Provides an intuitive interface for selecting travel dates with visual feedback
// Props:
//   selectedDate (string, YYYY-MM-DD): the date to start from and highlight
//   onDateSelect (function): called with new date string when a date is selected
//   numDays (number, default 15): how many days to show
import React, { useMemo, useRef, useEffect } from "react";

// Month abbreviations for display
const months = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

// Day of week abbreviations for display
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Generate a list of dates starting from the selected date
// Creates date objects with formatted strings for display and comparison
function getDateList(startDateStr, numDays) {
  const list = [];
  const start = new Date(startDateStr);

  // Generate dates for the specified number of days
  for (let i = 0; i < numDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    list.push({
      dateStr: d.toISOString().slice(0, 10), // YYYY-MM-DD format
      day: days[d.getDay()], // Day name (Sun, Mon, etc.)
      date: d.getDate().toString().padStart(2, "0"), // Padded date (01, 02, etc.)
      month: months[d.getMonth()], // Month abbreviation (JAN, FEB, etc.)
      monthNum: d.getMonth(), // Month number (0-11)
      year: d.getFullYear(), // Full year
    });
  }
  return list;
}

const DateBar = ({ selectedDate, onDateSelect, numDays = 15 }) => {
  // Generate date list using memoization to avoid recalculation on every render
  const dateList = useMemo(
    () => getDateList(selectedDate, numDays),
    [selectedDate, numDays]
  );

  // Find the index of the currently selected date in the list
  const selectedIdx = dateList.findIndex((d) => d.dateStr === selectedDate);

  // Reference to the scrollable container for programmatic scrolling
  const scrollRef = useRef();

  // Scroll to selected date on mount/update for better UX
  // Ensures the selected date is visible when the component loads
  useEffect(() => {
    if (scrollRef.current && selectedIdx >= 0) {
      const el = scrollRef.current.children[selectedIdx + 1]; // +1 for month label
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [selectedIdx]);

  // Find the month for the selected date to display in the month label
  const currentMonth = dateList[selectedIdx]?.month || dateList[0].month;

  return (
    <div className="datebar-outer">
      <div className="datebar-scroll" ref={scrollRef}>
        {/* Month label displayed vertically on the left side */}
        <div className="datebar-month">
          <span>{currentMonth}</span>
        </div>

        {/* Horizontal list of selectable dates */}
        {dateList.map((d, i) => (
          <button
            key={d.dateStr}
            className={
              "datebar-date" + (d.dateStr === selectedDate ? " selected" : "")
            }
            onClick={() => onDateSelect(d.dateStr)}
            tabIndex={0}
            aria-label={`${d.day}, ${d.month} ${d.date}, ${d.year}`}
          >
            {/* Date number (01, 02, etc.) */}
            <div className="datebar-date-num">{d.date}</div>
            {/* Day abbreviation (Sun, Mon, etc.) */}
            <div className="datebar-date-day">{d.day}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateBar;
