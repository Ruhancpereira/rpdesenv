import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function Card3D({ children, className = '', glowColor = 'rgba(204, 255, 0, 0.5)' }) {
  const ref = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const centerX = width / 2;
    const centerY = height / 2;
    const rotateXValue = (y - centerY) / 10;
    const rotateYValue = (centerX - x) / 10;
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      animate={{
        rotateX,
        rotateY,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      data-hover
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-0.5 rounded-2xl blur-xl opacity-0 transition-opacity duration-500"
        style={{ background: glowColor }}
        animate={{ opacity: isHovered ? 0.6 : 0 }}
      />
      
      {/* Card content */}
      <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        {children}
      </div>
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${isHovered ? '50%' : '0%'} ${isHovered ? '50%' : '0%'}, rgba(255,255,255,0.1) 0%, transparent 50%)`,
        }}
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
      />
    </motion.div>
  );
}