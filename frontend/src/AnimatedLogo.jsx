// Animated logo component with bouncing train emoji and smoke effect
// Uses Tailwind CSS classes for styling and animations
import React from "react";

const AnimatedLogo = () => (
  <div className="relative flex items-center">
    {/* Main logo container with bouncing animation and shadow */}
    {/* Replace with your logo image */}
    <div className="w-20 h-12 bg-blue-700 rounded-lg flex items-center justify-center animate-bounce shadow-lg">
      {/* Train emoji as placeholder logo */}
      <span className="text-white font-bold text-lg">🚆</span>
    </div>

    {/* Smoke animation effect positioned to the right of the logo */}
    {/* Creates a realistic train smoke effect with pulsing animation */}
    <div className="absolute left-16 top-2 flex space-x-1">
      {/* Smaller smoke particle */}
      <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></span>
      {/* Larger smoke particle */}
      <span className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></span>
    </div>
  </div>
);

export default AnimatedLogo;
