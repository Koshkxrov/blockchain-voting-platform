'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = ''
}) => {
  const { theme } = useTheme();
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-t-transparent rounded-full animate-spin`}
        style={{
          borderColor: theme === 'dark' ? '#ffffff' : '#000000',
          borderTopColor: 'transparent'
        }}
      />
    </div>
  );
};
