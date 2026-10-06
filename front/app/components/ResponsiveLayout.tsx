'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`
        min-h-screen
        w-full
        px-4
        sm:px-6
        md:px-8
        lg:px-12
        xl:px-16
        mx-auto
        max-w-7xl
        ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}
        ${className}
      `}
    >
      <div className="w-full max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  );
};
