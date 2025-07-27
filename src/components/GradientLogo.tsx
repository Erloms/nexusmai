
import React from 'react';

interface GradientLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const GradientLogo: React.FC<GradientLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* 图标部分 - 以太风格的几何图形 */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-purple-500/30 blur-md rounded-lg"></div>
        <div className="relative bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-2 rounded-lg backdrop-blur-sm border border-white/20">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path 
              d="M12 2L3 7V17L12 22L21 17V7L12 2Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="url(#logoGradient)"
              fillOpacity="0.3"
            />
            <path 
              d="M12 8L18 12L12 16L6 12L12 8Z" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="url(#logoInnerGradient)"
              fillOpacity="0.5"
            />
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="logoInnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e0e7ff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      
      {/* 文字部分 */}
      <span className={`font-bold ${sizeClasses[size]} bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm`}>
        Nexus AI
      </span>
    </div>
  );
};

export default GradientLogo;
