import React from 'react';
import { cn } from './utils';

/**
 * GlassCard - Premium glassmorphism card component
 * Uses backdrop-filter blur with gradient borders
 */
const GlassCard = ({
  children,
  className = '',
  hover = true,
  glow = false,
  border = true,
  padding = 'normal',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    normal: 'p-6 md:p-8',
    large: 'p-8 md:p-10',
    xl: 'p-10 md:p-16',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-[var(--panel)] backdrop-blur-[20px]',
        border && 'border border-[var(--border-soft)]',
        hover && 'hover:bg-[var(--panel-soft)] hover:border-[color:color-mix(in_srgb,var(--border-soft)_75%,#00f0ff_25%)] hover:shadow-[0_10px_40px_rgba(0,240,255,0.1)] transition-all duration-500 hover:scale-[1.02]',
        glow && 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#00f0ff]/5 before:to-[#d0bcff]/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700',
        paddingClasses[padding] || paddingClasses.normal,
        className
      )}
      {...props}
    >
      {glow && <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/5 to-[#d0bcff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GlassCard;
