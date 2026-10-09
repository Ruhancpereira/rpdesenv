export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <img src="/brand-mark.png" alt="" className="h-14 w-auto" />
            <p className="font-display text-xl font-semibold tracking-[-0.03em]">RP Sistemas</p>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#E7EEF8]/70">
            Engenharia de sistemas sob medida. Criciúma, Santa Catarina.
          </p>
        </div>
        <div className="font-mono text-[11px] uppercase leading-7 tracking-[0.16em] text-[#D6E6FF]/75">
          <p>© {new Date().getFullYear()} RP Sistemas</p>
          <a className="block hover:text-white" href="mailto:contato@rpsistemas.cloud">
            contato@rpsistemas.cloud
          </a>
          <a className="block hover:text-white" href="#contact">
            Suporte
          </a>
        </div>
      </div>
    </footer>
  );
}
