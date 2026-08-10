'use client';

import React from 'react';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  icon = null,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none select-none';
  
  const variants = {
    primary: 'bg-[#4f6e43] hover:bg-[#3d5733] text-white shadow-md shadow-[#4f6e43]/25 focus:ring-[#4f6e43]',
    secondary: 'bg-white hover:bg-[#f2f7ef] text-[#2a3f23] border border-[#bed2b2] shadow-2xs focus:ring-[#93af85]',
    outline: 'border-2 border-[#4f6e43] text-[#38522c] hover:bg-[#e7f1e1] focus:ring-[#4f6e43] font-black',
    ghost: 'text-[#38522c] hover:bg-[#e7f1e1]/80 hover:text-[#1d2d16] focus:ring-[#93af85]',
    danger: 'bg-[#b84343] hover:bg-[#993434] text-white shadow-sm shadow-[#b84343]/20 focus:ring-[#b84343]',
    success: 'bg-[#3b5930] hover:bg-[#2b4222] text-white shadow-md shadow-[#3b5930]/30 focus:ring-[#4f6e43]',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-2 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
