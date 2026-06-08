import React from 'react';

interface DiamondLogoProps {
  className?: string;
}

export const DiamondLogo: React.FC<DiamondLogoProps> = ({ className = "w-12 h-12" }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="diamondGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <path
        d="M 30 20 L 50 15 L 70 20 L 90 40 L 50 90 L 10 40 Z M 30 20 L 33 42 L 50 15 L 50 43 L 70 20 L 67 42 L 90 40 M 10 40 L 33 42 L 50 43 L 67 42 L 90 40 M 30 20 L 50 43 L 70 20 M 33 42 L 50 90 L 50 43 M 67 42 L 50 90"
        stroke="url(#diamondGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
