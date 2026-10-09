import { useEffect, useState } from "react";
import { chapters } from "@/lib/site-content";

export default function ScrollRail() {
  const [active, setActive] = useState("hero");

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
      { rootMargin: "-35% 0px -40% 0px", threshold: [0.2, 0.5] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Progresso da página"
      className="pointer-events-none fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
    >
      <ol className="pointer-events-auto space-y-3">
        {chapters.map((chapter) => {
          const on = active === chapter.id;
          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                aria-label={chapter.label}
                className="group flex items-center justify-end"
              >
                <span
                  className={`block rounded-full transition ${
                    on ? "h-6 w-[3px] bg-white" : "h-1.5 w-1.5 bg-white/35 group-hover:bg-white"
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
