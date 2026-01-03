import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import TextReveal from '../effects/TextReveal';

const testimonials = [
  {
    id: 1,
    name: 'Carlos Mendes',
    role: 'CEO, TechStart',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    content: 'A equipe superou todas as nossas expectativas. O sistema que desenvolveram transformou completamente nossa operação.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Ana Paula Silva',
    role: 'Diretora, InnovaShop',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    content: 'Profissionalismo e qualidade excepcionais. O aplicativo ficou incrível e nossos clientes adoraram.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Roberto Almeida',
    role: 'CTO, DataFlow',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    content: 'Parceria de longo prazo. Sempre entregam com qualidade e dentro do prazo. Altamente recomendados.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Mariana Costa',
    role: 'Fundadora, EcoMart',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    content: 'Do conceito à entrega, todo o processo foi impecável. A plataforma está gerando resultados incríveis.',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-32 px-4 sm:px-6 overflow-hidden" id="testimonials">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#CCFF00]/10 rounded-full blur-[150px]" />
      
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-[#CCFF00] text-sm font-semibold tracking-wider uppercase mb-4"
          >
            Depoimentos
          </motion.span>
          
          <h2 className="text-4xl sm:text-5xl font-bold">
            <TextReveal className="justify-center text-white">
              O que Nossos Clientes
            </TextReveal>
            <TextReveal className="justify-center" delay={0.2}>
              <span className="text-[#CCFF00]">
                Dizem Sobre Nós
              </span>
            </TextReveal>
          </h2>
        </div>

        {/* Testimonial slider */}
        <div className="relative">
          <div className="overflow-hidden py-8">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10">
                  {/* Quote icon */}
                  <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-[#CCFF00] flex items-center justify-center shadow-lg shadow-[#CCFF00]/30">
                    <Quote className="w-8 h-8 text-black" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Image */}
                    <motion.div 
                      className="relative flex-shrink-0"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-[#CCFF00]/30">
                        <img
                          src={testimonials[current].image}
                          alt={testimonials[current].name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-[#CCFF00] rounded-full p-2">
                        <Star className="w-4 h-4 text-black fill-black" />
                      </div>
                    </motion.div>

                    {/* Text */}
                    <div className="text-center md:text-left flex-1">
                      {/* Stars */}
                      <div className="flex justify-center md:justify-start gap-1 mb-4">
                        {[...Array(testimonials[current].rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      
                      <p className="text-xl md:text-2xl text-white leading-relaxed mb-6 italic">
                        "{testimonials[current].content}"
                      </p>
                      
                      <div>
                        <h4 className="text-lg font-bold text-white">{testimonials[current].name}</h4>
                        <p className="text-[#CCFF00]">{testimonials[current].role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <motion.button
              onClick={() => paginate(-1)}
              className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              data-hover
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            
            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > current ? 1 : -1);
                    setCurrent(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === current 
                      ? 'w-8 bg-[#CCFF00]' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
            
            <motion.button
              onClick={() => paginate(1)}
              className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              data-hover
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}