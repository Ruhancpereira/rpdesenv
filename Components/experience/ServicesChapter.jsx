import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { services } from "@/lib/site-content";

function ServiceCard({ service }) {
  return (
    <article className="flex h-[68vh] min-h-[460px] w-[78vw] max-w-[620px] shrink-0 flex-col justify-between rounded-[32px] border border-white/10 bg-gradient-to-br from-[#0E4488] to-[#041833] p-8 sm:p-10">
      <div className="flex items-start justify-between">
        <p className="font-display text-6xl font-semibold tracking-[-0.06em] text-white/90">{service.index}</p>
        <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#D6E6FF]">
          produção
        </span>
      </div>
      <div>
        <h3 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{service.title}</h3>
        <p className="mt-4 max-w-md text-base leading-relaxed text-[#E7EEF8]/80">{service.text}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {service.layers.map((layer) => (
            <li key={layer} className="rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em]">
              {layer}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function ServicesChapter() {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const [travel, setTravel] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0.04, 0.96], [0, -travel]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const measure = () => setTravel(Math.max(0, track.scrollWidth - window.innerWidth + 32));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section id="services" className="scroll-mt-20">
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:hidden">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#D6E6FF]">Sistemas</p>
        <h2 className="font-display mt-4 text-4xl font-semibold tracking-[-0.04em]">O que entra em produção</h2>
        <div className="mt-8 flex flex-col gap-4">
          {services.map((service) => (
            <article key={service.index} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
              <p className="font-mono text-xs text-[#D6E6FF]/70">{service.index}</p>
              <h3 className="font-display mt-2 text-3xl">{service.title}</h3>
              <p className="mt-3 text-[#E7EEF8]/80">{service.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div ref={ref} className="relative hidden h-[380vh] lg:block">
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div className="mx-auto mb-8 flex w-full max-w-[1440px] items-end justify-between px-8">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#D6E6FF]">Sistemas</p>
              <h2 className="font-display mt-3 text-5xl font-semibold tracking-[-0.045em]">O que entra em produção</h2>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">rolar continua para o lado</p>
          </div>
          <motion.div ref={trackRef} style={{ x }} className="flex gap-5 pl-[7vw] pr-[18vw]">
            {services.map((service) => (
              <ServiceCard key={service.index} service={service} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
