import React from 'react';
import { cn } from './utils';

/**
 * AnimatedButton - Premium button with hover effects and animations
 * Variants: primary, secondary, ghost, outline
 */
const AnimatedButton = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon = null,
  iconPosition = 'right',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center gap-2 font-medium tracking-wide rounded-lg transition-all duration-300 active:scale-95 hover:scale-105 overflow-hidden group';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#00f0ff] to-[#d0bcff] text-[#00363a] hover:shadow-[0_0_50px_rgba(0,240,255,0.4)] hover:shadow-2xl',
    secondary: 'bg-white text-black hover:bg-zinc-200 hover:shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:shadow-2xl',
    ghost: 'bg-[var(--panel)] backdrop-blur-md border border-[var(--border-soft)] text-[var(--text-main)] hover:bg-[var(--panel-soft)] hover:border-[#00f0ff]/40 hover:shadow-[0_0_30px_rgba(0,240,255,0.2)]',
    outline: 'border border-[var(--border-soft)] text-[var(--text-main)] hover:bg-[var(--panel-soft)] hover:border-[#00f0ff]/50 hover:shadow-[0_0_25px_rgba(0,240,255,0.15)]',
    gradient: 'bg-gradient-to-r from-[#00f0ff] to-[#d0bcff] text-[#00363a] hover:shadow-[0_0_60px_rgba(0,240,255,0.5)] hover:shadow-2xl',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-10 py-4 text-lg',
    '2xl': 'px-12 py-5 text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={cn(
        baseClasses,
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed active:scale-100',
        className
      )}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {/* Shimmer overlay with enhanced timing */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="relative z-10">{icon}</span>}
          <span className="relative z-10">{children}</span>
          {icon && iconPosition === 'right' && <span className="relative z-10">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default AnimatedButton;
