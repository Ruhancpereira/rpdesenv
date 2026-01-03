import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, ArrowUpRight } from 'lucide-react';
import Card3D from '../effects/Card3D';
import TextReveal from '../effects/TextReveal';

const categories = ['Todos', 'Web', 'Mobile', 'Sistemas'];

const projects = [
  {
    id: 1,
    title: 'E-Commerce Premium',
    description: 'Plataforma completa de vendas online com integração de pagamentos e gestão de estoque.',
    image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80',
    category: 'Web',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    color: 'bg-[#CCFF00]',
  },
  {
    id: 2,
    title: 'App Delivery',
    description: 'Aplicativo de entregas com rastreamento em tempo real e sistema de avaliações.',
    image: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&q=80',
    category: 'Mobile',
    tags: ['React Native', 'Firebase', 'Maps API'],
    color: 'bg-[#CCFF00]',
  },
  {
    id: 3,
    title: 'Sistema ERP',
    description: 'Gestão empresarial completa com módulos de vendas, estoque, financeiro e RH.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    category: 'Sistemas',
    tags: ['Vue.js', 'Laravel', 'MySQL'],
    color: 'bg-[#CCFF00]',
  },
  {
    id: 4,
    title: 'Dashboard Analytics',
    description: 'Painel de controle com visualização de dados em tempo real e relatórios personalizados.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    category: 'Web',
    tags: ['Next.js', 'D3.js', 'MongoDB'],
    color: 'bg-[#CCFF00]',
  },
  {
    id: 5,
    title: 'App Financeiro',
    description: 'Controle financeiro pessoal com categorização automática e metas de economia.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    category: 'Mobile',
    tags: ['Flutter', 'Dart', 'SQLite'],
    color: 'bg-[#CCFF00]',
  },
  {
    id: 6,
    title: 'CRM Integrado',
    description: 'Sistema de gestão de relacionamento com clientes e automação de marketing.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    category: 'Sistemas',
    tags: ['Angular', 'Python', 'Redis'],
    color: 'bg-[#CCFF00]',
  },
];

export default function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [hoveredId, setHoveredId] = useState(null);

  const filteredProjects = activeCategory === 'Todos' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <section className="relative py-32 px-4 sm:px-6 overflow-hidden" id="portfolio">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-[#CCFF00] text-sm font-semibold tracking-wider uppercase mb-4"
          >
            Portfólio
          </motion.span>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <TextReveal className="justify-center text-white">
              Projetos que
            </TextReveal>
            <TextReveal className="justify-center" delay={0.2}>
              <span className="text-[#CCFF00]">
                Inspiram Confiança
              </span>
            </TextReveal>
          </h2>
        </div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/25'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-hover
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Projects grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card3D 
                  glowColor={project.color.includes('blue') ? 'rgba(59, 130, 246, 0.4)' : 'rgba(168, 85, 247, 0.4)'}
                  className="h-full"
                >
                  <div 
                    className="relative overflow-hidden"
                    onMouseEnter={() => setHoveredId(project.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      <motion.img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        animate={{
                          scale: hoveredId === project.id ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.4 }}
                      />
                      <div className="absolute inset-0 bg-[#CCFF00] opacity-40" />
                      
                      {/* Overlay */}
                      <motion.div
                        className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredId === project.id ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.button
                          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ExternalLink className="w-5 h-5 text-white" />
                        </motion.button>
                        <motion.button
                          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Github className="w-5 h-5 text-white" />
                        </motion.button>
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#CCFF00] text-black">
                          {project.category}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#CCFF00] transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span key={tag} className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-hover
          >
            Ver Todos os Projetos
            <ArrowUpRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}