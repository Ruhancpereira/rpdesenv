import { works } from "@/lib/site-content";

export default function WorkChapter() {
  return (
    <section id="work" className="scroll-mt-24 px-5 py-28 sm:px-8">
      <div className="mx-auto max-w-[980px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#D6E6FF]">Frentes</p>
        <h2 className="font-display mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
          Onde a complexidade mora
        </h2>
        <p className="mt-5 max-w-xl text-[#E7EEF8]/75">
          Linhas de sistema em que a engenharia da RP atua. Cada uma pede modelo, fluxo e operação — não só uma interface.
        </p>

        <div className="relative mt-14">
          {works.map((work, index) => (
            <article
              key={work.title}
              className="sticky mb-6 rounded-[32px] border border-white/10 bg-[#0B3470] p-7 shadow-[0_30px_80px_rgba(4,24,51,0.45)] sm:p-10"
              style={{ top: `${96 + index * 14}px` }}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#D6E6FF]">{work.area}</p>
                <p className="font-display text-3xl text-white/30">{work.index}</p>
              </div>
              <h3 className="font-display mt-8 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">{work.title}</h3>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#E7EEF8]/80 sm:text-lg">{work.text}</p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {work.tags.map((tag) => (
                  <li key={tag} className="rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/75">
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
