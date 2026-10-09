import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroChapter() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, -36]);
  const markY = useTransform(scrollYProgress, [0, 1], [0, -28]);

  return (
    <section id="hero" ref={ref} className="relative md:h-[145vh]">
      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-6 px-5 pb-16 pt-24 sm:px-8 md:hidden">
        <img
          src="/brand-mark.png"
          alt="Símbolo RP: letra R escultural e esfera de circuito"
          className="mx-auto w-full max-w-[420px]"
        />
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#D6E6FF]">
          Engenharia de software · Criciúma
        </p>
        <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-[-0.045em]">
          O sistema é o produto.
        </h1>
        <p className="text-base leading-relaxed text-[#E7EEF8]/80">
          Projetamos e construímos software sob medida: web, aplicativos e plataformas empresariais, com domínio, contrato e operação no mesmo desenho.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="#contact" className="rounded-full bg-white px-5 py-3 text-sm font-medium text-[#072A5E]">
            Falar com a engenharia
          </a>
          <a href="#method" className="rounded-full border border-white/20 px-5 py-3 text-sm">
            Ver o método
          </a>
        </div>
      </div>

      <div className="sticky top-0 hidden h-screen items-center overflow-hidden md:flex">
        <div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-8 px-5 pb-10 pt-24 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
          <motion.div style={{ y: contentY }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#D6E6FF]">
              Engenharia de software · Criciúma
            </p>
            <h1 className="font-display mt-5 max-w-xl text-4xl font-semibold leading-[0.95] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
              O sistema é o produto.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#E7EEF8]/80 sm:text-lg">
              Projetamos e construímos software sob medida: web, aplicativos e plataformas
              empresariais, com domínio, contrato e operação no mesmo desenho.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-[#072A5E] transition hover:bg-[#D6E6FF]"
              >
                Falar com a engenharia
              </a>
              <a
                href="#method"
                className="rounded-full border border-white/20 px-5 py-3 text-sm text-white transition hover:border-white/50"
              >
                Ver o método
              </a>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-[#D6E6FF]/80 sm:grid-cols-4">
              <div>
                <dt className="text-white/40">Escopo</dt>
                <dd className="mt-1 text-white">Sob medida</dd>
              </div>
              <div>
                <dt className="text-white/40">Entrega</dt>
                <dd className="mt-1 text-white">Web · App</dd>
              </div>
              <div>
                <dt className="text-white/40">Base</dt>
                <dd className="mt-1 text-white">Criciúma</dd>
              </div>
              <div>
                <dt className="text-white/40">Suporte</dt>
                <dd className="mt-1 text-white">Público</dd>
              </div>
            </dl>
            <p className="mt-8 hidden font-mono text-[10px] uppercase tracking-[0.28em] text-white/45 lg:block">
              rolar para entrar
            </p>
          </motion.div>

          <motion.div style={{ y: markY }} className="relative">
            <img
              src="/brand-mark.png"
              alt="Símbolo RP: letra R escultural e esfera de circuito"
              className="mx-auto w-full max-w-[520px]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
