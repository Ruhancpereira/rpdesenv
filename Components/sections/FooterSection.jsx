import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowUp, Linkedin, Instagram, Github, Twitter } from 'lucide-react';

const footerLinks = [
  {
    title: 'Empresa',
    links: ['Sobre Nós', 'Equipe', 'Carreiras', 'Blog'],
  },
  {
    title: 'Serviços',
    links: ['Desenvolvimento Web', 'Apps Mobile', 'Sistemas', 'Consultoria'],
  },
  {
    title: 'Suporte',
    links: ['FAQ', 'Contato', 'Documentação', 'Status'],
  },
];

const socialLinks = [
  { icon: Linkedin, href: '#' },
  { icon: Instagram, href: '#' },
  { icon: Github, href: '#' },
  { icon: Twitter, href: '#' },
];

export default function FooterSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative pt-20 pb-8 px-4 sm:px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-950 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Main footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="h-10 flex items-center justify-center">
                <img src="/logo.png" alt="RP Sistemas" className="h-10 w-auto" />
              </div>
              <span className="text-xl font-bold text-white">RP Sistemas</span>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 mb-6 max-w-sm"
            >
              Transformando ideias em soluções digitais inovadoras. 
              Seu parceiro de tecnologia para o futuro.
            </motion.p>
            
            {/* Social */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -3 }}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-[#CCFF00]/50 transition-all"
                  data-hover
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      className="text-gray-400 hover:text-[#CCFF00] transition-colors text-sm"
                      whileHover={{ x: 5 }}
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-500 text-sm flex items-center gap-2"
          >
            © {new Date().getFullYear()} RP Sistemas. Feito com
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            no Brasil
          </motion.p>
          
          {/* Back to top */}
          <motion.button
            onClick={scrollToTop}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -3 }}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
            data-hover
          >
            Voltar ao topo
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <ArrowUp className="w-4 h-4" />
            </div>
          </motion.button>
        </div>
      </div>
    </footer>
  );
}