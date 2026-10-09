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
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:hidden">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#D6E6FF]">Método</p>
        <h2 className="font-display mt-4 text-4xl font-semibold tracking-[-0.04em]">Como um sistema nasce aqui</h2>
        <ol className="mt-10 space-y-6">
          {method.map((step) => (
            <li key={step.index} className="border-t border-white/10 pt-5">
              <p className="font-mono text-xs text-[#D6E6FF]/70">{step.index}</p>
              <h3 className="font-display mt-1 text-2xl">{step.title}</h3>
              <p className="mt-2 text-[#E7EEF8]/80">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>

      <div ref={ref} className="relative hidden h-[260vh] lg:block">
        <div className="sticky top-0 flex h-screen items-center">
          <div className="mx-auto w-full max-w-[1440px] px-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#D6E6FF]">Método</p>
            <h2 className="font-display mt-4 max-w-3xl text-5xl font-semibold tracking-[-0.045em] xl:text-6xl">
              Como um sistema nasce aqui
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">{method[active].text}</p>

            <div className="relative mt-16">
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
