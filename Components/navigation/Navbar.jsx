import React from 'react';
import { motion } from 'framer-motion';
import MagneticButton from '../effects/MagneticButton';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gray-30/95 backdrop-blur-xl border-b border-gray-200/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex-1" />
          {/* Logo centralizado */}
          <MagneticButton>
            <motion.a
              href="#hero"
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <div className="h-8 sm:h-10 flex items-center justify-center">
                <img src="/logoRP.png" alt="RP Sistemas" className="h-8 sm:h-10 w-auto" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">RP Sistemas</span>
            </motion.a>
          </MagneticButton>
          {/* Link Suporte/Contato (requisito Apple Developer - URL de suporte visível) */}
          <div className="flex-1 flex justify-end">
            <a
              href="#contact"
              className="text-sm sm:text-base text-gray-300 hover:text-[#CCFF00] transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
            >
              Contato / Suporte
            </a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}