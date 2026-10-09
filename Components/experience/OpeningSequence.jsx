import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const lines = [
  "rp.core        mount",
  "domínio        carregado",
  "interface      armada",
  "scroll         ativo",
];

export default function OpeningSequence() {
  const [phase, setPhase] = useState("boot");
  const timers = useRef([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || window.location.hash) {
      setPhase("done");
      return undefined;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    timers.current = [
      setTimeout(() => setPhase("exit"), 2500),
      setTimeout(() => setPhase("done"), 3300),
    ];

    return () => {
      timers.current.forEach(clearTimeout);
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (phase === "done") {
      document.body.style.overflow = "";
    }
  }, [phase]);

  if (phase === "done") return null;

  const skip = () => {
    timers.current.forEach(clearTimeout);
    setPhase("exit");
    timers.current = [setTimeout(() => setPhase("done"), 780)];
  };

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-label="Abertura RP Sistemas">
      <motion.div
        className="absolute inset-x-0 top-0 z-20 h-1/2 bg-[#072A5E]"
        animate={phase === "exit" ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 z-20 h-1/2 bg-[#072A5E]"
        animate={phase === "exit" ? { y: "100%" } : { y: 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      />

      <motion.div
        className="relative z-30 flex h-full flex-col justify-between px-6 py-8 sm:px-10"
        animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.28em] text-[#D6E6FF]/80">
          <span>RP Sistemas</span>
          <span>Criciúma</span>
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
          <div className="relative">
            <img
              src="/brand-mark.png"
              alt="Marca RP Sistemas"
              className="brand-dissolve h-auto w-[min(78vw,440px)]"
            />
            <div className="sweep" />
          </div>
          <div className="mt-2 h-px w-48 overflow-hidden bg-white/10">
            <div className="boot-bar h-full w-full bg-[#D6E6FF]" />
          </div>
        </div>

        <div className="flex items-end justify-between gap-6">
          <div className="font-mono text-[11px] leading-6 text-[#D6E6FF]/75 sm:text-xs">
            {lines.map((line, index) => (
              <motion.p
                key={line}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.28, duration: 0.4 }}
              >
                {line}
              </motion.p>
            ))}
          </div>
          <button
            type="button"
            onClick={skip}
            className="rounded-full border border-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/80 transition hover:border-white/40 hover:text-white"
          >
            Pular
          </button>
        </div>
      </motion.div>
    </div>
  );
}
