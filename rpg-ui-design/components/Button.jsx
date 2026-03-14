/**
 * 🎯 Shared Button Component
 * 
 * Accessibility-focused button with:
 * - Proper semantic HTML (button element)
 * - Focus visible styles (WCAG)
 * - ARIA support
 * - Color contrast compliance (WCAG AA)
 */

import React from 'react';

const variants = {
  primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:scale-105',
  secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600',
  success: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium',
  danger: 'bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold',
  warning: 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-medium',
  ghost: 'bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white',
  outline: 'border-2 border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white hover:bg-gray-800',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  type = 'button',
  ariaLabel,
  ariaDescribedBy,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    rounded-xl font-medium
    transition-all duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-purple-500
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    cursor-pointer
  `;

  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Icon Button variant for action buttons
export function IconButton({
  children,
  ariaLabel,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const baseStyles = `
    inline-flex items-center justify-center
    rounded-lg
    transition-all duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-purple-500
    disabled:opacity-50 disabled:cursor-not-allowed
    cursor-pointer
  `;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.ghost} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
