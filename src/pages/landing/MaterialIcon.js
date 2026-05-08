import React from 'react';

/**
 * MaterialIcon - Reusable Material Symbols component
 * @param {string} icon - The icon name (e.g., 'security', 'speed', 'check_circle')
 * @param {string} className - Additional Tailwind classes
 * @param {boolean} filled - Whether to use filled variant
 * @param {string} size - Icon size in px (default: 24)
 */
const MaterialIcon = ({ 
  icon, 
  className = '', 
  filled = false, 
  size = 24,
  ...props 
}) => {
  return (
    <span 
      className={`material-symbols-outlined inline-flex items-center justify-center select-none ${className}`}
      style={{ 
        fontVariationSettings: filled 
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" 
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        fontSize: size,
        lineHeight: 1,
      }}
      {...props}
    >
      {icon}
    </span>
  );
};

export default MaterialIcon;
