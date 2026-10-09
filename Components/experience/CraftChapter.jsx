import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { craftLayers } from "@/lib/site-content";

export default function CraftChapter() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setActive(Math.min(craftLayers.length - 1, Math.floor(value * craftLayers.length)));
  });

  const layer = craftLayers[active];

  return (
    <section id="craft" className="scroll-mt-20">
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:hidden">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#D6E6FF]">Ofício</p>
        <h2 className="font-display mt-4 max-w-xl text-4xl font-semibold tracking-[-0.04em]">
          Quatro camadas. Nenhuma opcional.
        </h2>
        <div className="mt-10 space-y-6">
          {craftLayers.map((layer) => (
            <article key={layer.index} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
              <p className="font-mono text-xs text-[#D6E6FF]/70">{layer.index}</p>
              <h3 className="font-display mt-2 text-3xl">{layer.title}</h3>
              <p className="mt-3 text-[#E7EEF8]/80">{layer.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div ref={ref} className="relative hidden h-[320vh] lg:block">
        <div className="sticky top-0 flex h-screen items-center">
          <div className="mx-auto grid h-[78vh] w-full max-w-[1440px] grid-cols-12 gap-8 px-8">
            <div className="col-span-5 flex flex-col justify-between py-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#D6E6FF]">Ofício</p>
                <h2 className="font-display mt-4 text-5xl font-semibold leading-[0.95] tracking-[-0.045em] xl:text-6xl">
                  Quatro camadas. Nenhuma opcional.
                </h2>
              </div>
              <p className="font-mono text-sm tracking-[0.28em] text-white/70">
                {craftLayers[active].index}
                <span className="text-white/30"> / 04</span>
              </p>
            </div>
            <div className="relative col-span-7 overflow-hidden rounded-[32px] border border-white/15 bg-[#0A3578] p-10">
              <AnimatePresence mode="wait">
                <motion.article
                  key={layer.index}
                  initial={{ opacity: 0, y: 36 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -28 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex flex-col justify-end p-10"
                >
                  <p className="font-mono text-xs tracking-[0.28em] text-[#D6E6FF]">{layer.index}</p>
                  <h3 className="font-display mt-3 text-6xl font-semibold tracking-[-0.04em] xl:text-7xl">{layer.title}</h3>
                  <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">{layer.text}</p>
                  <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-[#D6E6FF]/80">{layer.note}</p>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
