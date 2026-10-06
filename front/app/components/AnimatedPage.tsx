'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn, slideIn, scaleIn, staggerChildren } from '../utils/animations';

interface AnimatedPageProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'scale';
  className?: string;
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({
  children,
  animation = 'fade',
  className = '',
}) => {
  const animations = {
    fade: fadeIn,
    slide: slideIn,
    scale: scaleIn,
  };

  return (
    <motion.div
      {...animations[animation]}
      className={className}
      variants={staggerChildren}
    >
      {children}
    </motion.div>
  );
};
