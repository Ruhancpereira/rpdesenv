import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { setToken } from '../lib/api'

function comMesmosFiltros(path: string) {
  return path.startsWith('/dashboard') || path === '/chamados'
}

const chamadosNav = [
  { to: '/assistente', label: 'Assistente' },
  { to: '/dashboard/estrategico', label: 'Estratégico' },
  { to: '/dashboard/operacional', label: 'Operacional' },
  { to: '/dashboard/tatico', label: 'Tático' },
  { to: '/importar', label: 'Importar planilha' },
  { to: '/chamados', label: 'Lista & filtros' },
]

const agendaNav = [
  { to: '/agenda/dashboard', label: 'Painel agenda' },
  { to: '/agenda/gantt', label: 'Gantt' },
  { to: '/agenda/importar', label: 'Importar agenda' },
]

export function Layout() {
  const navHook = useNavigate()
  const { search } = useLocation()
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-white/10 bg-agro-900/80 px-4 py-6 backdrop-blur-sm">
        <div className="mb-8 flex items-start justify-between gap-2">
          <div className="font-display text-lg font-semibold tracking-tight text-agro-accent">
            Agrosys
            <span className="block text-xs font-normal text-white/50">Chamados &amp; agenda</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setToken(null)
              navHook('/login')
            }}
            className="shrink-0 text-xs text-white/45 underline hover:text-white"
          >
            Sair
          </button>
        </div>

        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/35">Chamados</p>
        <nav className="flex flex-col gap-1">
          {chamadosNav.map((item) => (
            <NavLink
              key={item.to}
              to={comMesmosFiltros(item.to) ? `${item.to}${search}` : item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 text-agro-accent'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <p className="mb-2 mt-8 text-[10px] font-medium uppercase tracking-wider text-white/35">
          Agenda &amp; alocação
        </p>
        <nav className="flex flex-col gap-1">
          {agendaNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 text-agro-accent'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  )
}
