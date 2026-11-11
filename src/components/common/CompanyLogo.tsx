import React from 'react';

interface CompanyLogoProps {
  className?: string;
  size?: number;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ className = 'w-8 h-8', size }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      role="img"
      aria-label="Company.ai Logo"
    >
      <defs>
        {/* Modern tech gradient: electric cobalt to deep violet */}
        <linearGradient id="company-ai-bg" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="55%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>

        {/* AI node accent gradient */}
        <linearGradient id="company-ai-accent" x1="130" y1="35" x2="185" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* Core emblem curve gradient */}
        <linearGradient id="company-ai-curve" x1="40" y1="50" x2="160" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>

        <filter id="company-shadow" x="0" y="0" width="200" height="200" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#312E81" floodOpacity="0.32" />
        </filter>
      </defs>

      {/* Modern rounded squircle badge with soft drop shadow */}
      <rect
        x="20"
        y="20"
        width="160"
        height="160"
        rx="42"
        fill="url(#company-ai-bg)"
        filter="url(#company-shadow)"
      />

      {/* Subtle glass reflection highlight */}
      <path
        d="M 20 62 C 20 39 39 20 62 20 L 138 20 C 161 20 180 39 180 62 L 180 88 C 135 106 65 98 20 78 Z"
        fill="white"
        fillOpacity="0.12"
      />

      {/* Distinctive Bold 'C' geometry embracing the AI core */}
      <path
        d="M 132 64 C 120 50 104 44 86 44 C 54 44 34 68 34 100 C 34 132 54 156 86 156 C 104 156 120 150 132 136"
        stroke="url(#company-ai-curve)"
        strokeWidth="19"
        strokeLinecap="round"
      />

      {/* Neural AI Core Node */}
      <circle cx="146" cy="100" r="15" fill="url(#company-ai-accent)" />
      <circle cx="146" cy="100" r="6.5" fill="#FFFFFF" />

      {/* Smart Intelligence Spark (.ai) */}
      <path
        d="M 146 38 L 150 48 L 160 52 L 150 56 L 146 66 L 142 56 L 132 52 L 142 48 Z"
        fill="#38BDF8"
      />
    </svg>
  );
};

export const ConsarkLogo = CompanyLogo;
