import React from 'react';

export default function LogoIcon({ size = 36, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="cfHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1e2e" />
          <stop offset="100%" stopColor="#0a0a0f" />
        </linearGradient>
        <linearGradient id="cfBoltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8ff47" />
          <stop offset="100%" stopColor="#b8cf17" />
        </linearGradient>
      </defs>
      {/* Outer hexagon */}
      <polygon
        points="50,3 93,27.5 93,72.5 50,97 7,72.5 7,27.5"
        fill="url(#cfHexGrad)"
        stroke="#e8ff47"
        strokeWidth="2.5"
      />
      {/* Inner glow ring */}
      <polygon
        points="50,11 85,31 85,69 50,89 15,69 15,31"
        fill="none"
        stroke="rgba(232,255,71,0.12)"
        strokeWidth="1"
      />
      {/* Lightning bolt */}
      <polygon
        points="57,17 37,53 50,53 43,83 63,47 50,47"
        fill="url(#cfBoltGrad)"
      />
    </svg>
  );
}
