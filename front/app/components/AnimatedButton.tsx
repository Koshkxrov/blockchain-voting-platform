'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  animation?: 'scale' | 'bounce';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  animation = 'scale',
  className = '',
  ...props
}) => {
  const animations = {
    scale: {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
      transition: { duration: 0.2 }
    },
    bounce: {
      whileHover: { y: -2 },
      whileTap: { y: 2 },
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      {...animations[animation]}
      className={className}
    >
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        isLoading={isLoading}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};
