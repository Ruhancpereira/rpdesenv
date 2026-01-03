import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { CheckCircle2, Users, Award, Rocket } from 'lucide-react';
import TextReveal from '../effects/TextReveal';

const stats = [
  { value: '150+', label: 'Projetos Entregues', icon: Rocket },
  { value: '50+', label: 'Clientes Satisfeitos', icon: Users },
  { value: '8+', label: 'Anos de Experiência', icon: Award },
  { value: '99%', label: 'Taxa de Satisfação', icon: CheckCircle2 },
];

const features = [
  'Desenvolvimento ágil e iterativo',
  'Código limpo e documentado',
  'Suporte contínuo pós-lançamento',
  'Tecnologias de última geração',
  'Design centrado no usuário',
  'Segurança em primeiro lugar',
];

export default function AboutSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative py-32 px-4 sm:px-6 overflow-hidden" id="about">
      {/* Background elements */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#CCFF00]/20 rounded-full blur-[150px]"
      />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-[#CCFF00] text-sm font-semibold tracking-wider uppercase mb-4"
            >
              Sobre Nós
            </motion.span>
            
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <TextReveal className="text-white">
                Transformamos Visões em
              </TextReveal>
              <TextReveal delay={0.2}>
                <span className="text-[#CCFF00]">
                  Realidade Digital
                </span>
              </TextReveal>
            </h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 text-lg leading-relaxed mb-8"
            >
              Somos uma equipe apaixonada por tecnologia e inovação. 
              Combinamos expertise técnica com criatividade para desenvolver 
              soluções que não apenas atendem, mas superam as expectativas 
              dos nossos clientes.
            </motion.p>

            {/* Features list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-[#CCFF00] flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-black" />
                  </div>
                  <span className="text-gray-300 text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right content - Stats */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-[#CCFF00]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center transition-all group-hover:border-[#CCFF00]/30">
                  <div className="w-12 h-12 rounded-xl bg-[#CCFF00] flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-black" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}