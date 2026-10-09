import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { method } from "@/lib/site-content";

export default function MethodChapter() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const [active, setActive] = useState(0);
  const lineScale = useTransform(scrollYProgress, [0.05, 0.9], ["0%", "100%"]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const index = Math.min(method.length - 1, Math.floor(value * method.length));
    setActive(index);
  });

  return (
    <section id="method" className="scroll-mt-20">
      <div ref={ref} className="relative h-[240vh]">
        <div className="pin-screen sticky top-0 flex items-center">
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#D6E6FF]">Método</p>
            <h2 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.045em] sm:mt-4 sm:text-5xl xl:text-6xl">
              Como um sistema nasce aqui
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:mt-6 sm:text-lg">{method[active].text}</p>

            <div className="relative mt-8 lg:hidden">
              <div className="absolute bottom-3 left-[11px] top-3 w-px bg-white/15" />
              <motion.div style={{ height: lineScale }} className="absolute left-[11px] top-3 w-px bg-[#D6E6FF]" />
              <ol className="space-y-1">
                {method.map((step, index) => {
                  const on = index <= active;
                  return (
                    <li key={step.index} className="flex items-center gap-4 py-2">
                      <span
                        className={`relative z-10 block h-6 w-6 shrink-0 rounded-full border ${
                          on ? "border-white bg-white" : "border-white/30 bg-[#072A5E]"
                        }`}
                      />
                      <div>
                        <p className="font-mono text-[10px] tracking-[0.18em] text-[#D6E6FF]/70">{step.index}</p>
                        <h3 className={`font-display text-2xl ${on ? "text-white" : "text-white/35"}`}>{step.title}</h3>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="relative mt-16 hidden lg:block">
              <div className="absolute left-0 right-0 top-3 h-px bg-white/15" />
              <motion.div style={{ width: lineScale }} className="absolute left-0 top-3 h-px bg-[#D6E6FF]" />
              <ol className="relative grid grid-cols-5">
                {method.map((step, index) => {
                  const on = index <= active;
                  return (
                    <li key={step.index} className="pr-4">
                      <span
                        className={`block h-6 w-6 rounded-full border ${
                          on ? "border-white bg-white" : "border-white/30 bg-[#072A5E]"
                        }`}
                      />
                      <p className="mt-6 font-mono text-[11px] tracking-[0.18em] text-[#D6E6FF]/70">{step.index}</p>
                      <h3 className={`font-display mt-2 text-2xl ${on ? "text-white" : "text-white/40"}`}>{step.title}</h3>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
