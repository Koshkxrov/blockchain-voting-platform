'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const { theme } = useTheme();
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={`
            block
            text-sm
            font-medium
            mb-1
            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
          `}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full
          px-3
          py-2
          rounded-md
          border
          focus:outline-none
          focus:ring-2
          focus:ring-offset-2
          transition-colors
          ${theme === 'dark'
            ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500'
            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
          }
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-500"
          role="alert"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          id={`${inputId}-helper`}
          className={`
            mt-1
            text-sm
            ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
          `}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
