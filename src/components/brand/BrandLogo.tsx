import React, { useId } from 'react';

interface BrandLogoProps {
  logoUrl?: string | null;
  brandName?: string;
  className?: string;
  variant?: 'full' | 'icon';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  logoUrl,
  brandName = 'MAREA dulce',
  className = 'h-14 w-auto',
  variant = 'full',
}) => {
  const uniqueId = useId().replace(/:/g, '');

  if (logoUrl) {
    return <img src={logoUrl} alt={brandName} className={`${className} object-contain`} />;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      className={`${className} flex-shrink-0`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={`circleGrad_${uniqueId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F4F3FF" />
          <stop offset="100%" stopColor="#E8E3FF" />
        </radialGradient>
        <linearGradient id={`pipingGrad_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A29BFE" />
          <stop offset="50%" stopColor="#6C5CE7" />
          <stop offset="100%" stopColor="#4834D4" />
        </linearGradient>
        <filter id={`badgeShadow_${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#6C5CE7" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Sello Circular Base */}
      <g filter={`url(#badgeShadow_${uniqueId})`}>
        <circle cx="250" cy="250" r="220" fill={`url(#circleGrad_${uniqueId})`} stroke="#D6BBFB" strokeWidth="8" />
        <circle cx="250" cy="250" r="205" fill="none" stroke="#E8E3FF" strokeWidth="3" strokeDasharray="6 6" />
      </g>

      {/* Perlas Decorativas Exterior */}
      <circle cx="60" cy="180" r="10" fill="#D6BBFB" opacity="0.8" />
      <circle cx="440" cy="120" r="12" fill="#A29BFE" opacity="0.7" />
      <circle cx="450" cy="370" r="14" fill="#6C5CE7" opacity="0.6" />
      <circle cx="80" cy="420" r="8" fill="#D6BBFB" opacity="0.9" />

      {/* Manga / Dulla de Repostería e Ilustración de Crema */}
      <g transform="translate(180, 80)">
        <path d="M50 140 L90 140 L80 185 L60 185 Z" fill="#2D3436" opacity="0.85" />
        <path d="M55 185 L85 185 L70 210 Z" fill="#4834D4" />
        <path
          d="M70 140 C 40 120, 20 80, 45 40 C 65 10, 105 15, 110 45 C 115 75, 80 95, 100 120 C 110 130, 125 110, 120 90 C 115 70, 135 60, 140 80 C 145 100, 125 125, 105 140 Z"
          fill={`url(#pipingGrad_${uniqueId})`}
        />
        <path d="M50 110 C 60 80, 85 50, 95 30" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        <path d="M75 125 C 85 100, 105 75, 115 55" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <circle cx="145" cy="95" r="7" fill="#6C5CE7" />
        <circle cx="155" cy="125" r="5" fill="#D6BBFB" />
      </g>

      {/* Tipografía Oficial */}
      {variant === 'full' && (
        <g textAnchor="middle">
          <text x="250" y="320" fontFamily="'Poppins', sans-serif" fontSize="48" fontWeight="700" fill="#2D3436" letterSpacing="8">
            MAREA
          </text>
          <text x="250" y="370" fontFamily="'Playfair Display', serif" fontSize="42" fontStyle="italic" fill="#6C5CE7">
            ~ dulce ~
          </text>
          <path
            d="M250 410 C245 402, 232 402, 232 412 C232 422, 250 432, 250 432 C250 432, 268 422, 268 412 C268 402, 255 402, 250 410 Z"
            fill="none"
            stroke="#6C5CE7"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  );
};
