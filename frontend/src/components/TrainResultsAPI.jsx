// Train search results component that displays available trains based on search criteria
// Integrates with train service API to fetch and display train information
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTrain, FaSearch } from "react-icons/fa";
import trainService from "../services/trainService";

const TrainResultsAPI = () => {
  // Router hooks for navigation and accessing search parameters
  const location = useLocation();
  const navigate = useNavigate();

  // Component state management
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract search parameters from location state
  const { from, to, date, trainClass } = location.state || {};

  // Effect to trigger train search when search parameters change
  useEffect(() => {
    if (from && to && date) {
      searchTrains();
    } else {
      setError("Missing search parameters");
      setLoading(false);
    }
  }, [from, to, date, trainClass]);

  // Function to search for trains using the train service
  const searchTrains = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await trainService.searchTrains(
        from,
        to,
        date,
        trainClass
      );
      setTrains(result.trains);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Utility function to convert 24-hour time format to 12-hour format
  const formatTime = (time) => {
    if (!time) return "";
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get appropriate color class for train running status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "on time":
        return "text-green-600";
      case "running late":
        return "text-yellow-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Get appropriate color class for seat availability status
  const getAvailabilityColor = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "text-green-600";
      case "waiting":
        return "text-yellow-600";
      case "not available":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Loading state display with spinner animation
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching for trains...</p>
        </div>
      </div>
    );
  }

  // Error state display with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header section with navigation and search summary */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back to search button */}
              <button
                onClick={() => navigate("/")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Search
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              {/* Search details display */}
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Trains from {from} to {to}
                </h1>
                <p className="text-sm text-gray-600">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main results section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {trains.length === 0 ? (
          // No trains found state
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🚂</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Trains Found
            </h2>
            <p className="text-gray-600 mb-4">
              No trains are available for the selected route and date.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Search Again
            </button>
          </div>
        ) : (
          // Train results display
          <div className="space-y-4">
            {/* Results header with count and refresh button */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {trains.length} train{trains.length !== 1 ? "s" : ""} found
              </h2>
              <button
                onClick={searchTrains}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                <FaSearch className="inline mr-1" />
                Refresh
              </button>
            </div>

            {/* Individual train result cards */}
            {trains.map((train, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <div className="flex items-start justify-between">
                  {/* Train information section */}
                  <div className="flex-1">
                    {/* Train header with number and name */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {train.train_number}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {train.train_name}
                      </h3>
                    </div>

                    {/* Train timing information grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Departure</p>
                        <p className="font-semibold text-gray-800">
                          {formatTime(train.departure_time)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Arrival</p>
                        <p className="font-semibold text-gray-800">
                          {formatTime(train.arrival_time)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Duration</p>
                        <p className="font-semibold text-gray-800">
                          {train.duration}
                        </p>
                      </div>
                    </div>

                    {/* Additional train details */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Distance: {train.distance} km</span>
                      <span
                        className={`font-medium ${getStatusColor(
                          train.running_status
                        )}`}
                      >
                        {train.running_status}
                      </span>
                      <span>Runs: {train.running_days?.join(", ")}</span>
                    </div>
                  </div>

                  {/* Seat availability and pricing section */}
                  <div className="ml-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Available Classes
                    </h4>
                    <div className="space-y-1">
                      {train.classes?.map((cls, clsIndex) => (
                        <div
                          key={clsIndex}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-800">{cls.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">₹{cls.price}</span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${getAvailabilityColor(
                                cls.status
                              )}`}
                            >
                              {cls.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainResultsAPI;
