// SVG logo component for RailExpress with animated train and scenic elements
// Features mountains, tunnel, animated train with smoke, and company name
import React from "react";

const RailExpressLogo = () => (
  <svg
    width="220"
    height="60"
    viewBox="0 0 440 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block" }}
  >
    {/* Mountain range background - creates scenic railway environment */}
    <polygon points="0,120 60,40 120,120" fill="url(#mountainGradient)" />
    <polygon points="80,120 140,60 200,120" fill="url(#mountainGradient2)" />

    {/* Railway tunnel entrance - dark blue with light inner highlight */}
    <ellipse cx="170" cy="120" rx="40" ry="30" fill="#1e3a8a" />
    <ellipse cx="170" cy="120" rx="32" ry="24" fill="#fff" opacity="0.12" />

    {/* Main train group with all animations */}
    <g>
      <g id="train-anim">
        {/* Train body - main rectangular car with rounded corners */}
        <rect
          x="130"
          y="80"
          width="80"
          height="28"
          rx="12"
          fill="#2563eb"
          stroke="#1e3a8a"
          strokeWidth="3"
        />

        {/* Train windows - three passenger windows with rounded corners */}
        <rect
          x="145"
          y="88"
          width="16"
          height="10"
          rx="3"
          fill="#fff"
          opacity="0.9"
        />
        <rect
          x="167"
          y="88"
          width="16"
          height="10"
          rx="3"
          fill="#fff"
          opacity="0.9"
        />
        <rect
          x="189"
          y="88"
          width="16"
          height="10"
          rx="3"
          fill="#fff"
          opacity="0.9"
        />

        {/* Train front - rounded nose section */}
        <ellipse
          cx="210"
          cy="94"
          rx="10"
          ry="14"
          fill="#2563eb"
          stroke="#1e3a8a"
          strokeWidth="3"
        />

        {/* Train wheels - four circular wheels for movement */}
        <circle cx="150" cy="110" r="5" fill="#1e293b" />
        <circle cx="170" cy="110" r="5" fill="#1e293b" />
        <circle cx="190" cy="110" r="5" fill="#1e293b" />
        <circle cx="210" cy="110" r="5" fill="#1e293b" />

        {/* Chimney - exhaust pipe for steam engine */}
        <rect x="200" y="70" width="8" height="14" rx="3" fill="#1e293b" />

        {/* Animated smoke group - creates realistic steam effect */}
        <g>
          {/* First smoke puff - largest and fastest */}
          <ellipse
            className="smoke-puff"
            cx="204"
            cy="68"
            rx="7"
            ry="4"
            fill="url(#smokeGradient)"
            opacity="0.7"
          >
            <animate
              attributeName="cy"
              values="68;50;40"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.7;0.4;0"
              dur="2s"
              repeatCount="indefinite"
            />
          </ellipse>

          {/* Second smoke puff - medium size with delayed start */}
          <ellipse
            className="smoke-puff"
            cx="210"
            cy="65"
            rx="5"
            ry="3"
            fill="url(#smokeGradient)"
            opacity="0.5"
          >
            <animate
              attributeName="cy"
              values="65;48;38"
              dur="2.2s"
              begin="0.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0.3;0"
              dur="2.2s"
              begin="0.5s"
              repeatCount="indefinite"
            />
          </ellipse>

          {/* Third smoke puff - smallest with longest delay */}
          <ellipse
            className="smoke-puff"
            cx="215"
            cy="62"
            rx="4"
            ry="2.5"
            fill="url(#smokeGradient)"
            opacity="0.4"
          >
            <animate
              attributeName="cy"
              values="62;46;36"
              dur="2.4s"
              begin="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.4;0.2;0"
              dur="2.4s"
              begin="1s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>
      </g>

      {/* Horizontal train movement animation - subtle side-to-side motion */}
      <animateTransform
        xlinkHref="#train-anim"
        attributeName="transform"
        type="translate"
        values="0;10;0"
        dur="3s"
        repeatCount="indefinite"
      />
    </g>

    {/* Company name text - "RailExpress" in brand blue */}
    <text
      x="240"
      y="105"
      fontFamily="Segoe UI, Arial, sans-serif"
      fontWeight="bold"
      fontSize="40"
      fill="#2563eb"
      letterSpacing="-2"
    >
      RailExpress
    </text>

    {/* Gradient definitions for visual effects */}
    <defs>
      {/* Mountain gradient - blue tones for depth */}
      <linearGradient
        id="mountainGradient"
        x1="0"
        y1="40"
        x2="120"
        y2="120"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#2563eb" />
        <stop offset="1" stopColor="#60a5fa" />
      </linearGradient>

      {/* Second mountain gradient - darker blue for contrast */}
      <linearGradient
        id="mountainGradient2"
        x1="80"
        y1="60"
        x2="200"
        y2="120"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#1e3a8a" />
        <stop offset="1" stopColor="#2563eb" />
      </linearGradient>

      {/* Smoke gradient - creates realistic smoke appearance */}
      <radialGradient id="smokeGradient" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#e5e7eb" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

export default RailExpressLogo;
