import React, { useState } from "react";

interface GlassCardProps {
  title: string;
  children: React.ReactNode;
  cta?: React.ReactNode;
  highlighted?: boolean;
  toggleable?: boolean;
  showStars?: boolean;
  sparkleIntensity?: 'low' | 'medium' | 'high';
  onClick?: () => void;
}

export default function GlassCard({ 
  title, 
  children, 
  cta, 
  highlighted = false,
  toggleable = false,
  showStars = true,
  sparkleIntensity = 'medium',
  onClick 
}: GlassCardProps) {
  const [isHighlighted, setIsHighlighted] = useState(highlighted);
  
  const handleClick = () => {
    if (toggleable) {
      setIsHighlighted(!isHighlighted);
    }
    if (onClick) {
      onClick();
    }
  };
  
  const cardClasses = [
    'sf-glass',
    isHighlighted ? 'sf-glass-highlighted' : '',
    toggleable ? 'cursor-pointer' : '',
    showStars ? 'sf-stars' : ''
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
      data-sparkle-intensity={sparkleIntensity}
    >
      <h3 className="sf-shine text-2xl font-extrabold tracking-tight mb-3">
        {title}
        {isHighlighted && (
          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold">
            PRO
          </span>
        )}
      </h3>
      <div className="sf-text-muted">{children}</div>
      {cta && <div className="sf-mt-4">{cta}</div>}
    </div>
  );
}
