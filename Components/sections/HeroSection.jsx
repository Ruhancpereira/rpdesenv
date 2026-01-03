import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Cog } from 'lucide-react';
import TextReveal from '../effects/TextReveal';
import Card3D from '../effects/Card3D';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#CCFF00]/30 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#CCFF00]/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#CCFF00]/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
        >
          <Sparkles className="w-4 h-4 text-[#CCFF00]" />
          <span className="text-sm text-gray-300">Transformando ideias em realidade digital</span>
        </motion.div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
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
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Desenvolvemos sistemas personalizados, aplicativos e soluções web que 
          impulsionam seu negócio para o futuro. Tecnologia de ponta com design impecável.
        </motion.p>

        {/* Card "Em breve" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex justify-center"
        >
          <Card3D className="max-w-md w-full">
            <div className="p-8 text-center">
              {/* Engrenagem animada */}
              <motion.div
                className="flex justify-center mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Cog className="w-16 h-16 text-[#CCFF00]" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                Em Breve
              </h2>
              
              <p className="text-gray-400 text-lg">
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