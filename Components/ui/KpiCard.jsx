export default function KpiCard({ title, label, value, subtitle, helper, tone = "default" }) {
  const toneClass =
    tone === "danger"
      ? "border-rose-500/40 bg-rose-500/10"
      : tone === "warning"
        ? "border-amber-500/40 bg-amber-500/10"
        : tone === "success"
          ? "border-emerald-500/40 bg-emerald-500/10"
          : "border-slate-800 bg-slate-900/60";

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{title || label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-100">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}
