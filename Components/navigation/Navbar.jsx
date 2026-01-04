import React from 'react';
import { motion } from 'framer-motion';
import MagneticButton from '../effects/MagneticButton';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gray-50/95 backdrop-blur-xl border-b border-gray-200/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center h-16 sm:h-20">
          {/* Logo centralizado */}
          <MagneticButton>
            <motion.div 
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <div className="h-8 sm:h-10 flex items-center justify-center">
                <img src="/logoRP.png" alt="RP Sistemas" className="h-8 sm:h-10 w-auto" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-black">RP Sistemas</span>
            </motion.div>
          </MagneticButton>
        </div>
      </div>
    </motion.nav>
  );
}