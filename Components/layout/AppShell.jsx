import Link from "next/link";
import { useRouter } from "next/router";
import { getVisibleNavItems } from "@/lib/permissions";
import { profileLabels } from "@/lib/access";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

async function doLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
}

export default function AppShell({ user, children }) {
  const router = useRouter();
  const navItems = getVisibleNavItems(user?.role);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1920px]">
        <aside className="hidden w-72 border-r border-slate-800 bg-slate-900/70 p-5 lg:block">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Agrosys</p>
            <h1 className="mt-1 text-xl font-semibold">Gestão de Implantação</h1>
            <p className="mt-2 text-xs text-slate-400">Operação previsível para o agronegócio</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm transition",
                    active
                      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40"
                      : "text-slate-300 hover:bg-slate-800 hover:text-slate-100",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Plataforma Corporativa</p>
                <p className="text-sm text-slate-200">{profileLabels[user?.role] || user?.role}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={doLogout}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
                >
                  Sair
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
