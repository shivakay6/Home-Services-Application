import React from 'react';

interface ConsarkLogoProps {
  className?: string;
  size?: number;
}

export const ConsarkLogo: React.FC<ConsarkLogoProps> = ({ className = 'w-8 h-8', size }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      role="img"
      aria-label="Consarc Logo"
    >
      {/* Outer rounded frame with right breach */}
      <path
        d="M 172 74 L 172 46 A 26 26 0 0 0 146 20 L 54 20 A 26 26 0 0 0 28 46 L 28 154 A 26 26 0 0 0 54 180 L 146 180 A 26 26 0 0 0 172 154 L 172 126"
        stroke="#000000"
        strokeWidth="19"
        strokeLinecap="butt"
        strokeLinejoin="round"
      />

      {/* Vibrant Blue Dot centered at right opening */}
      <circle cx="172" cy="100" r="14.5" fill="#0080FF" />

      {/* Bold geometric center C */}
      <text
        x="96"
        y="132"
        textAnchor="middle"
        fontSize="102"
        fontWeight="900"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fill="#000000"
      >
        C
      </text>
    </svg>
  );
};
