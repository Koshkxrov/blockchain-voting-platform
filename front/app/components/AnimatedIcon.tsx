'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedIconProps {
  icon: React.ReactNode;
  animation?: 'pulse' | 'rotate' | 'float';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  icon,
  animation = 'pulse',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const animations = {
    pulse: {
      animate: { scale: [1, 1.1, 1] },
      transition: { duration: 2, repeat: Infinity }
    },
    rotate: {
      animate: { rotate: 360 },
      transition: { duration: 2, repeat: Infinity, ease: 'linear' }
    },
    float: {
      animate: { y: [0, -5, 0] },
      transition: { duration: 2, repeat: Infinity }
    }
  };

  return (
    <motion.div
      {...animations[animation]}
      className={`${sizeClasses[size]} ${className}`}
    >
      {icon}
    </motion.div>
  );
};
