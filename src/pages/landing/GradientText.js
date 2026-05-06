import React from 'react';
import { cn } from './utils';

/**
 * GradientText - Animated gradient text with shimmer effect
 */
const GradientText = ({ 
  children, 
  className = '',
  animate = true,
  ...props 
}) => {
  return (
    <span 
      className={cn(
        'bg-gradient-to-r from-[#00f0ff] via-[#7df4ff] to-[#d0bcff] bg-clip-text text-transparent',
        animate && 'bg-[length:200%_auto] animate-gradient-shift',
        className
      )}
      style={{
        backgroundSize: animate ? '200% auto' : undefined,
      }}
      {...props}
    >
      {children}
    </span>
  );
};

export default GradientText;
