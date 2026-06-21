import React from "react";

interface DeurLogoProps {
  className?: string;
  size?: number;
}

export default function DeurLogo({ className = "w-10 h-10", size = 40 }: DeurLogoProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ minWidth: size, minHeight: size }}
    >
      <defs>
        {/* Left tall perspective folding panel gradient */}
        <linearGradient id="deur-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DF1B60" /> {/* Magenta / Fuchsia */}
          <stop offset="40%" stopColor="#A8287F" /> {/* Indigo / Purple */}
          <stop offset="100%" stopColor="#FF7A00" /> {/* Sunset Gold */}
        </linearGradient>

        {/* Right curved panel/handle gradient */}
        <linearGradient id="deur-grad-right" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00C48C" /> {/* Emerald / Mint */}
          <stop offset="30%" stopColor="#1E80F0" /> {/* Classic Blue */}
          <stop offset="100%" stopColor="#9C27B0" /> {/* Violet */}
        </linearGradient>

        {/* Inner core loop gradient */}
        <linearGradient id="deur-grad-inner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2EB67D" /> {/* Deur Green */}
          <stop offset="50%" stopColor="#36C5F0" /> {/* Vibrant Blue */}
          <stop offset="100%" stopColor="#ECB22E" /> {/* Warm Yellow */}
        </linearGradient>
      </defs>

      {/* Main Folding-Perspective Outer Frame (Representing Deur's Open Doorway) */}
      <path
        d="M 30 25 
           L 30 85 
           L 70 93 
           L 70 17 
           Z"
        stroke="url(#deur-grad-left)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.25"
      />

      {/* The Actual Colored Perspective Door Shell */}
      <path
        d="M 30 85 
           L 30 25
           L 78 16
           C 78 16, 79 40, 79 72
           C 79 88, 62 101, 46 92"
        stroke="url(#deur-grad-left)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center Circle loop 1 (Forms the central 'd' structure handle) */}
      <path
        d="M 40 60
           C 40 46, 73 44, 73 60
           C 73 75, 40 76, 40 60
           Z"
        stroke="url(#deur-grad-right)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Concentric Core Circle (Highly-detailed core loop of safety and authentication) */}
      <circle
        cx="58.5"
        cy="59.5"
        r="12.5"
        stroke="url(#deur-grad-inner)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
