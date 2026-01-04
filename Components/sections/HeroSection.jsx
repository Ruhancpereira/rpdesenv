import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Cog } from 'lucide-react';
import TextReveal from '../effects/TextReveal';
import Card3D from '../effects/Card3D';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 pt-20 sm:pt-24">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 sm:w-96 sm:h-96 bg-[#CCFF00]/30 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 sm:w-96 sm:h-96 bg-[#CCFF00]/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-[#CCFF00]/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto text-center w-full">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6 sm:mb-8"
        >
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#CCFF00]" />
          <span className="text-xs sm:text-sm text-gray-300">Transformando ideias em realidade digital</span>
        </motion.div>

        {/* Main heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 tracking-tight px-2">
          <TextReveal className="justify-center text-white">
            Criamos
          </TextReveal>
          <TextReveal className="justify-center" delay={0.3}>
            <span className="text-[#CCFF00]">
              Experiências Digitais
            </span>
          </TextReveal>
          <TextReveal className="justify-center text-white" delay={0.6}>
            Extraordinárias
          </TextReveal>
        </h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4"
        >
          Desenvolvemos sistemas personalizados, aplicativos e soluções web que 
          impulsionam seu negócio para o futuro. Tecnologia de ponta com design impecável.
        </motion.p>

        {/* Card "Em breve" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex justify-center px-4"
        >
          <Card3D className="max-w-md w-full">
            <div className="p-6 sm:p-8 text-center">
              {/* Engrenagem animada */}
              <motion.div
                className="flex justify-center mb-4 sm:mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Cog className="w-12 h-12 sm:w-16 sm:h-16 text-[#CCFF00]" />
              </motion.div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                Em Breve
              </h2>
              
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                Estamos trabalhando em algo incrível. 
                Em breve você poderá conhecer nossos projetos e serviços.
              </p>
            </div>
          </Card3D>
        </motion.div>
      </div>
    </section>
  );
}