import React from 'react';

interface IncorpifyLogoProps {
  className?: string;
}

const IncorpifyLogo: React.FC<IncorpifyLogoProps> = ({ className = "h-8 w-auto" }) => {
  return (
    <div className={`relative ${className}`}>
      <svg 
        viewBox="0 0 220 50" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <linearGradient id="incorpify-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1CD2E8" />
          <stop offset="50%" stopColor="#965BE4" />
          <stop offset="100%" stopColor="#201B36" />
        </linearGradient>
        
        {/* Building Icon */}
        <path 
          d="M12 8v34h8V8h-8zm16 12v22h8V20h-8zm16 10v12h8V30h-8z" 
          fill="url(#incorpify-gradient)" 
        />
        
        {/* Incorpify Text */}
        <text 
          x="60" 
          y="32" 
          fontFamily="Arial, sans-serif" 
          fontSize="24" 
          fontWeight="bold" 
          fill="url(#incorpify-gradient)"
        >
          Incorpify
        </text>
      </svg>
    </div>
  );
};

export default IncorpifyLogo; 