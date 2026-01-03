import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function GlowButton({ children, className = '', onClick, variant = 'primary' }) {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    primary: {
      bg: 'bg-[#CCFF00]',
      glow: 'shadow-[0_0_40px_rgba(204,255,0,0.5)]',
      hoverGlow: 'shadow-[0_0_60px_rgba(204,255,0,0.7)]',
    },
    secondary: {
      bg: 'bg-transparent border-2 border-[#CCFF00]/50',
      glow: 'shadow-[0_0_20px_rgba(204,255,0,0.3)]',
      hoverGlow: 'shadow-[0_0_40px_rgba(204,255,0,0.5)]',
    },
  };

  const v = variants[variant];

  return (
    <motion.button
      className={`relative px-8 py-4 rounded-full font-semibold text-black overflow-hidden ${v.bg} ${isHovered ? v.hoverGlow : v.glow} transition-all duration-500 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      data-hover
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-[#B8E600] opacity-0"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '200%' : '-100%' }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      />
      
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}