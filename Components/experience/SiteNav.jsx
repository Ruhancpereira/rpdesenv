import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { chapters } from "@/lib/site-content";

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("hero");
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const nodes = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0.15, 0.35, 0.6] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition duration-500 ${
        scrolled ? "border-b border-white/10 bg-[#072A5E]/75 backdrop-blur-xl" : ""
      }`}
    >
      <motion.div style={{ scaleX }} className="h-px origin-left bg-[#D6E6FF]" />
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-8">
        <a href="#hero" className="flex items-center gap-3">
          <img
            src="/brand-mark.png"
            alt="RP Sistemas"
            className="h-10 w-auto sm:h-12"
          />
          <span className="font-display text-sm font-semibold tracking-[0.18em] text-white sm:text-base">
            RP
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Seções">
          {chapters.slice(1).map((chapter) => (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              className={`font-mono text-[11px] uppercase tracking-[0.22em] transition ${
                active === chapter.id ? "text-white" : "text-[#D6E6FF]/60 hover:text-white"
              }`}
            >
              {chapter.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="rounded-full bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#072A5E] transition hover:bg-[#D6E6FF]"
        >
          Suporte
        </a>
      </div>
    </header>
  );
}
