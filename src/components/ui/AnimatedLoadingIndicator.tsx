import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedLoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  className?: string; // For additional container styling
  color?: string; // e.g., 'text-primary', 'text-destructive', 'currentColor'
}

const AnimatedLoadingIndicator: React.FC<AnimatedLoadingIndicatorProps> = ({
  size = 'medium',
  className = '',
  color = 'text-primary', // Default to primary theme color
}) => {
  const sizeMap = {
    small: { containerHeight: 'h-5', dotSize: 'h-1.5 w-1.5', spacing: 'space-x-1' },
    medium: { containerHeight: 'h-8', dotSize: 'h-2 w-2', spacing: 'space-x-1.5' },
    large: { containerHeight: 'h-12', dotSize: 'h-2.5 w-2.5', spacing: 'space-x-2' },
  };

  const currentSize = sizeMap[size];

  const dotVariants = {
    animate: (i: number) => ({
      scale: [1, 1.4, 1], // Dots scale up and down
      opacity: [0.5, 1, 0.5], // Dots fade in and out
      transition: {
        delay: i * 0.25, // Stagger animation for each dot
        duration: 1.0, // Duration of one animation cycle
        repeat: Infinity, // Repeat animation indefinitely
        ease: 'easeInOut', // Smooth easing function
      },
    }),
  };

  return (
    <div className={`flex items-center justify-center ${currentSize.containerHeight} ${className}`}>
      <motion.div
        className={`flex items-center ${currentSize.spacing} ${color}`} // Apply color and spacing to the dots container
        // This div will intrinsically size based on its children (the dots)
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={`block rounded-full ${currentSize.dotSize}`} // Apply dot size
            style={{ backgroundColor: 'currentColor' }} // Dots inherit color from parent
            custom={i} // Pass index to variants for staggering
            variants={dotVariants}
            animate="animate"
          />
        ))}
      </motion.div>
    </div>
  );
};

export default AnimatedLoadingIndicator;
