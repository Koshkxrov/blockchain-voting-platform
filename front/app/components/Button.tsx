'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const { theme } = useTheme();

  const baseStyles = `
    inline-flex
    items-center
    justify-center
    rounded-md
    font-medium
    transition-colors
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantStyles = {
    primary: theme === 'dark'
      ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
      : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
    secondary: theme === 'dark'
      ? 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
    danger: theme === 'dark'
      ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
      : 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${widthStyle}
        ${className}
      `}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2">
          <LoadingSpinner size="sm" />
        </span>
      ) : null}
      {children}
    </button>
  );
};
