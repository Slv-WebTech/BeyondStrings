import React from 'react';
import { cn } from './utils';
import GradientText from './GradientText';

/**
 * SectionHeading - Consistent section heading with optional gradient
 */
const SectionHeading = ({ 
  title,
  subtitle,
  align = 'center',
  gradient = false,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  ...props 
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={cn(alignClasses[align], className)} {...props}>
      <h2 className={cn(
        'text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight',
        titleClassName
      )}>
        {gradient ? <GradientText>{title}</GradientText> : title}
      </h2>
      {subtitle && (
        <p className={cn(
          'mt-4 text-base md:text-lg text-[#b9cacb] max-w-2xl',
          align === 'center' && 'mx-auto',
          subtitleClassName
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
