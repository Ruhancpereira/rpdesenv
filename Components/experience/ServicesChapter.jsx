import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { services } from "@/lib/site-content";

function ServiceCard({ service }) {
  return (
    <article className="flex h-[54dvh] w-[84vw] max-w-[620px] shrink-0 flex-col justify-between rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0E4488] to-[#041833] p-6 sm:h-[68vh] sm:min-h-[460px] sm:rounded-[32px] sm:p-10">
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-5xl font-semibold tracking-[-0.06em] text-white/90 sm:text-6xl">{service.index}</p>
        <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#D6E6FF]">
          produção
        </span>
      </div>
      <div>
        <h3 className="font-display text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">{service.title}</h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[#E7EEF8]/80 sm:mt-4 sm:text-base">{service.text}</p>
        <ul className="mt-4 flex flex-wrap gap-2 sm:mt-6">
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
    const measure = () => setTravel(Math.max(0, track.scrollWidth - window.innerWidth + 24));
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
      <div ref={ref} className="relative h-[460vh] sm:h-[380vh]">
        <div className="pin-screen sticky top-0 flex touch-pan-y flex-col justify-center overflow-hidden">
          <div className="mx-auto mb-4 flex w-full max-w-[1440px] items-end justify-between px-5 sm:mb-8 sm:px-8">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#D6E6FF]">Sistemas</p>
              <h2 className="font-display mt-2 text-3xl font-semibold tracking-[-0.045em] sm:mt-3 sm:text-5xl">
                O que entra em produção
              </h2>
            </div>
            <p className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-white/45 sm:block">
              rolar continua para o lado
            </p>
          </div>
          <motion.div ref={trackRef} style={{ x }} className="flex gap-4 pl-5 pr-[18vw] sm:gap-5 sm:pl-[7vw]">
            {services.map((service) => (
              <ServiceCard key={service.index} service={service} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
