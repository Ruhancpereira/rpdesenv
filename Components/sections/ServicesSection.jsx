import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Smartphone, 
  Database, 
  Cloud, 
  Cpu, 
  Shield,
  ArrowUpRight
} from 'lucide-react';
import Card3D from '../effects/Card3D';
import TextReveal from '../effects/TextReveal';

const services = [
  {
    icon: Globe,
    title: 'Desenvolvimento Web',
    description: 'Sites e sistemas web de alta performance com tecnologias modernas e design responsivo.',
    color: 'bg-[#CCFF00]',
    glow: 'rgba(204, 255, 0, 0.4)',
  },
  {
    icon: Smartphone,
    title: 'Aplicativos Mobile',
    description: 'Apps nativos e híbridos para iOS e Android com experiência de usuário excepcional.',
    color: 'bg-[#CCFF00]',
    glow: 'rgba(204, 255, 0, 0.4)',
  },
  {
    icon: Database,
    title: 'Sistemas Empresariais',
    description: 'ERPs, CRMs e soluções personalizadas para otimizar processos do seu negócio.',
    color: 'bg-[#CCFF00]',
    glow: 'rgba(204, 255, 0, 0.4)',
  },
  {
    icon: Cloud,
    title: 'Soluções em Nuvem',
    description: 'Infraestrutura escalável, migração e gerenciamento de serviços cloud.',
    color: 'bg-[#CCFF00]',
    glow: 'rgba(204, 255, 0, 0.4)',
  },
  {
    icon: Cpu,
    title: 'Inteligência Artificial',
    description: 'Automações inteligentes, chatbots e análise de dados com machine learning.',
    color: 'bg-[#CCFF00]',
    glow: 'rgba(204, 255, 0, 0.4)',
  },
  {
    icon: Shield,
    title: 'Segurança Digital',
    description: 'Proteção de dados, auditorias de segurança e compliance para seu negócio.',
    color: 'bg-[#CCFF00]',
    glow: 'rgba(204, 255, 0, 0.4)',
  },
];

export default function ServicesSection() {
  return (
    <section className="relative py-32 px-4 sm:px-6 overflow-hidden" id="services">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-[#CCFF00] text-sm font-semibold tracking-wider uppercase mb-4"
          >
            Nossos Serviços
          </motion.span>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <TextReveal className="justify-center text-white">
              Soluções Completas para
            </TextReveal>
            <TextReveal className="justify-center" delay={0.2}>
              <span className="text-[#CCFF00]">
                Seu Negócio Digital
              </span>
            </TextReveal>
          </h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Do conceito à implementação, oferecemos soluções tecnológicas 
            que transformam desafios em oportunidades de crescimento.
          </motion.p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card3D glowColor={service.glow} className="h-full">
                <div className="p-8 h-full flex flex-col">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <service.icon className="w-7 h-7 text-black" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                  <p className="text-gray-400 leading-relaxed flex-grow">{service.description}</p>
                  
                  {/* Link */}
                  <motion.div 
                    className="mt-6 flex items-center gap-2 text-[#CCFF00] font-medium cursor-pointer group"
                    whileHover={{ x: 5 }}
                  >
                    <span>Saiba mais</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </motion.div>
                </div>
              </Card3D>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}