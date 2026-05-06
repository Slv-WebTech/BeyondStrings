import React from 'react';
import { cn } from './utils';

/**
 * AmbientGlow - Background ambient lighting effect
 * Creates soft, blurred gradient orbs for atmosphere
 */
const AmbientGlow = ({ 
  color = 'primary',
  position = 'top-left',
  size = 600,
  opacity = 0.15,
  blur = 120,
  className = '',
  ...props 
}) => {
  const colorMap = {
    primary: 'bg-[#00f0ff]',
    secondary: 'bg-[#d0bcff]',
    tertiary: 'bg-[#f5f5ff]',
    cyan: 'bg-[#00f0ff]',
    violet: 'bg-[#d0bcff]',
  };

  const positionMap = {
    'top-left': '-top-[100px] -left-[200px]',
    'top-right': '-top-[100px] -right-[200px]',
    'bottom-left': '-bottom-[100px] -left-[200px]',
    'bottom-right': '-bottom-[100px] -right-[200px]',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div 
      className={cn(
        'absolute rounded-full pointer-events-none',
        colorMap[color] || colorMap.primary,
        positionMap[position] || positionMap['top-left'],
        className
      )}
      style={{
        width: size,
        height: size,
        filter: `blur(${blur}px)`,
        opacity,
        zIndex: -1,
      }}
      {...props}
    />
  );
};

export default AmbientGlow;
