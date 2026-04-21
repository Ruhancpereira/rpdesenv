import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bar, Doughnut } from 'react-chartjs-2'
import { FiltrosPainel } from '../components/FiltrosPainel'
import { apiFetch } from '../lib/api'
import { chartNavigateLista, navigateListaComFiltro } from '../lib/listaFromChart'

type Pair = { label: string; total: string }

type Data = {
  totalChamados: number
  porStatus: Pair[]
  porAreaAtendimento: Pair[]
  porTipoChamado: Pair[]
  porMes: Pair[]
  topConsultores: Pair[]
  slaEstourados: number
  slaDentroOuAberto: number
  tempoMedioDiasAguardando: number | null
  tempoMedioDiasExecucao: number | null
}

const chartColors = {
  grid: 'rgba(255,255,255,0.06)',
  text: '#b0c4e6',
}

export function DashboardEstrategico() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [d, setD] = useState<Data | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setErr(null)
    const q = searchParams.toString()
    apiFetch(`/api/dashboard/estrategico${q ? `?${q}` : ''}`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setD)
      .catch(() => setErr('Não foi possível carregar o painel.'))
  }, [searchParams])

  const statusLabels = d?.porStatus.map((x) => x.label) ?? []
  const statusData = d?.porStatus.map((x) => Number(x.total)) ?? []
  const areaLabels = d?.porAreaAtendimento.slice(0, 8).map((x) => x.label) ?? []
  const areaData = d?.porAreaAtendimento.slice(0, 8).map((x) => Number(x.total)) ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Visão estratégica</h1>
        <p className="mt-1 text-sm text-white/55">
          Volume, distribuição por status e área, SLA e tempos médios para decisões de alto nível.
        </p>
      </div>

      <FiltrosPainel />

      {err ? <p className="text-red-300">{err}</p> : null}
      {!d && !err ? <p className="text-white/50">Carregando visão estratégica…</p> : null}

      {d ? (
        <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          title="Total de chamados"
          value={String(d.totalChamados)}
          hint="Base importada · clique para ver a lista completa"
          onDrill={() => navigate('/chamados?page=0')}
        />
        <Kpi title="SLA estourado" value={String(d.slaEstourados)} hint="Últ. retorno &gt; data SLA" />
        <Kpi title="Dentro do SLA / abertos" value={String(d.slaDentroOuAberto)} hint="Sem estouro" />
        <Kpi
          title="Tempo médio (dias)"
          value={`Aguard.: ${fmt(d.tempoMedioDiasAguardando)} · Exec.: ${fmt(d.tempoMedioDiasExecucao)}`}
          hint="Por status"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-display text-lg font-medium text-white">Chamados por status</h2>
          <p className="mt-1 text-xs text-white/40">Clique em um segmento para abrir a lista já filtrada por esse status.</p>
          <div className="mt-4 h-72">
            <Doughnut
              data={{
                labels: statusLabels,
                datasets: [
                  {
                    data: statusData,
                    backgroundColor: [
                      '#38bdf8',
                      '#60a5fa',
                      '#3b82f6',
                      '#22d3ee',
                      '#818cf8',
                      '#94a3b8',
                    ],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                ...chartNavigateLista(navigate, 'sta_ativ'),
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: chartColors.text, boxWidth: 12 },
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-display text-lg font-medium text-white">Top áreas de atendimento</h2>
          <p className="mt-1 text-xs text-white/40">Clique numa barra para filtrar por área de atendimento.</p>
          <div className="mt-4 h-72">
            <Bar
              data={{
                labels: areaLabels,
                datasets: [
                  {
                    label: 'Chamados',
                    data: areaData,
                    backgroundColor: 'rgba(56, 189, 248, 0.75)',
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                ...chartNavigateLista(navigate, 'area_atend'),
                scales: {
                  x: {
                    ticks: { color: chartColors.text, maxRotation: 45 },
                    grid: { color: chartColors.grid },
                  },
                  y: {
                    ticks: { color: chartColors.text },
                    grid: { color: chartColors.grid },
                  },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-display text-lg font-medium text-white">Tipo de chamado</h2>
          <p className="mt-1 text-xs text-white/40">Clique numa barra para filtrar por tipo de chamado.</p>
          <div className="mt-4 h-64">
            <Bar
              data={{
                labels: d.porTipoChamado.map((x) => x.label),
                datasets: [
                  {
                    data: d.porTipoChamado.map((x) => Number(x.total)),
                    backgroundColor: 'rgba(59, 130, 246, 0.85)',
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                ...chartNavigateLista(navigate, 'tipo_cha'),
                indexAxis: 'y',
                scales: {
                  x: { ticks: { color: chartColors.text }, grid: { color: chartColors.grid } },
                  y: { ticks: { color: chartColors.text }, grid: { display: false } },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-display text-lg font-medium text-white">Top consultores</h2>
          <p className="mt-1 text-xs text-white/40">Clique numa linha para filtrar por consultor.</p>
          <ul className="mt-4 space-y-2 text-sm">
            {d.topConsultores.slice(0, 10).map((x, i) => (
              <li
                key={x.label + i}
                className="flex cursor-pointer justify-between rounded-lg bg-black/20 px-3 py-2 text-white/85 transition hover:bg-white/10"
                role="button"
                tabIndex={0}
                onClick={() => navigateListaComFiltro(navigate, 'consultor', x.label)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigateListaComFiltro(navigate, 'consultor', x.label)
                  }
                }}
              >
                <span className="truncate">{x.label}</span>
                <span className="shrink-0 font-medium text-agro-accent">{x.total}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
        </>
      ) : null}
    </div>
  )
}

function Kpi({
  title,
  value,
  hint,
  onDrill,
}: {
  title: string
  value: string
  hint: string
  onDrill?: () => void
}) {
  const inner = (
    <>
      <p className="text-xs uppercase tracking-wide text-white/45">{title}</p>
      <p className="mt-2 font-display text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-white/40">{hint}</p>
    </>
  )
  if (onDrill) {
    return (
      <button
        type="button"
        onClick={onDrill}
        className="w-full rounded-xl border border-white/10 bg-gradient-to-br from-white/8 to-transparent p-4 text-left transition hover:border-agro-accent/40 hover:from-white/10"
      >
        {inner}
      </button>
    )
  }
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/8 to-transparent p-4">
      {inner}
    </div>
  )
}

function fmt(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return '—'
  return n.toFixed(1)
}
