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
    <section id="hero" ref={ref} className="relative h-[165vh] md:h-[145vh]">
      <div className="pin-screen sticky top-0 flex items-center overflow-hidden">
        <div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-3 px-5 pb-6 pt-20 sm:gap-8 sm:px-8 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
          <motion.div style={{ y: markY }} className="lg:order-2">
            <img
              src="/brand-mark.png"
              alt="Símbolo RP: letra R escultural e esfera de circuito"
              className="mx-auto w-full max-w-[230px] sm:max-w-[360px] lg:max-w-[520px]"
            />
          </motion.div>

          <motion.div style={{ y: contentY }} className="lg:order-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#D6E6FF] sm:text-[11px] sm:tracking-[0.32em]">
              Engenharia de software · Criciúma
            </p>
            <h1 className="font-display mt-3 max-w-xl text-[2.35rem] font-semibold leading-[0.95] tracking-[-0.045em] text-white sm:mt-5 sm:text-6xl lg:text-7xl">
              O sistema é o produto.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#E7EEF8]/80 sm:mt-6 sm:text-lg">
              Projetamos e construímos software sob medida: web, aplicativos e plataformas empresariais, com domínio, contrato e operação no mesmo desenho.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-8">
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

            <dl className="mt-5 grid max-w-lg grid-cols-2 gap-x-6 gap-y-3 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#D6E6FF]/80 sm:mt-10 sm:grid-cols-4 sm:pt-6 sm:text-[11px]">
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
