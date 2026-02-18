import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, Phone, MapPin, Linkedin, Instagram, Github, CheckCircle } from 'lucide-react';
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { toast } from 'sonner';
import Card3D from '../effects/Card3D';
import GlowButton from '../effects/GlowButton';
import TextReveal from '../effects/TextReveal';

// Atualize com os dados reais da sua organização (obrigatório para Apple Developer)
const contactInfo = [
  { icon: Mail, label: 'Email (Suporte)', value: 'contato@rpsistemas.cloud', href: 'mailto:contato@rpsistemas.cloud' },
  { icon: Phone, label: 'Telefone', value: '+55 (48) 98851-9790', href: 'tel:+55 (48) 98851-9790' },
  { icon: MapPin, label: 'Endereço', value: 'Criciúma, SC - Brasil', href: null },
];

const socialLinks = [
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Github, href: '#', label: 'GitHub' },
];

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Mensagem enviada com sucesso!');
    
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  return (
    <section className="relative py-32 px-4 sm:px-6 overflow-hidden" id="contact">
      {/* Background */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#CCFF00]/20 rounded-full blur-[150px]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#CCFF00]/20 rounded-full blur-[150px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header - Suporte ao cliente (requisito Apple Developer) */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-[#CCFF00] text-sm font-semibold tracking-wider uppercase mb-4"
          >
            Contato e Suporte
          </motion.span>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <TextReveal className="justify-center text-white">
              Suporte ao Cliente
            </TextReveal>
            <TextReveal className="justify-center" delay={0.2}>
              <span className="text-[#CCFF00]">
                e Contato
              </span>
            </TextReveal>
          </h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Precisa de ajuda, dúvidas sobre nossos apps ou quer falar conosco? 
            Entre em contato pelo formulário abaixo ou pelos canais listados. 
            Nossa equipe está à disposição.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Contact cards */}
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 10, scale: 1.02 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#CCFF00] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <info.icon className="w-6 h-6 text-black" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-400 text-sm">{info.label}</p>
                  {info.href ? (
                    <a href={info.href} className="text-white font-medium block truncate hover:text-[#CCFF00] transition-colors" rel="noopener noreferrer">
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-white font-medium">{info.value}</p>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Social links */}
            <div className="pt-8">
              <p className="text-gray-400 mb-4">Siga-nos nas redes</p>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.2, y: -5 }}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-[#CCFF00]/50 transition-all"
                    data-hover
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <Card3D glowColor="rgba(59, 130, 246, 0.3)">
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Nome completo</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Seu nome"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#CCFF00]/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#CCFF00]/50"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Telefone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Mensagem</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Conte-nos sobre seu projeto..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 min-h-[150px] resize-none"
                    required
                  />
                </div>
                
                <GlowButton 
                  className="w-full"
                  onClick={isSubmitting || isSubmitted ? undefined : undefined}
                >
                  {isSubmitted ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Mensagem Enviada!
                    </>
                  ) : isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Mensagem
                    </>
                  )}
                </GlowButton>
              </form>
            </Card3D>
          </motion.div>
        </div>
      </div>
    </section>
  );
}