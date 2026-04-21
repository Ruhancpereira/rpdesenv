import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'
import { FiltrosPainel } from '../components/FiltrosPainel'
import { apiFetch } from '../lib/api'
import { chartNavigateLista } from '../lib/listaFromChart'

type Pair = { label: string; total: string }

type Data = {
  porBancada: Pair[]
  porAreaInicial: Pair[]
  porGerente: Pair[]
  porPrioridade: Pair[]
  transferencias: { mediaQtTransf: number; chamadosComTransferencia: number }
}

const chartColors = {
  grid: 'rgba(255,255,255,0.06)',
  text: '#b0c4e6',
}

export function DashboardOperacional() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [d, setD] = useState<Data | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setErr(null)
    const q = searchParams.toString()
    apiFetch(`/api/dashboard/operacional${q ? `?${q}` : ''}`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setD)
      .catch(() => setErr('Não foi possível carregar o painel.'))
  }, [searchParams])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Visão operacional</h1>
        <p className="mt-1 text-sm text-white/55">
          Bancadas, áreas iniciais, gerência e prioridade — útil para alocação e fila de trabalho.
        </p>
      </div>

      <FiltrosPainel />

      {err ? <p className="text-red-300">{err}</p> : null}
      {!d && !err ? <p className="text-white/50">Carregando visão operacional…</p> : null}

      {d ? (
        <>
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate('/chamados?page=0')}
          className="rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-agro-accent/30 hover:bg-white/[0.07]"
        >
          <p className="text-xs uppercase text-white/45">Média de transferências</p>
          <p className="mt-1 font-display text-2xl text-agro-accent">
            {d.transferencias.mediaQtTransf.toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-white/35">Clique para abrir a lista de chamados</p>
        </button>
        <button
          type="button"
          onClick={() => navigate('/chamados?page=0')}
          className="rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-agro-warm/30 hover:bg-white/[0.07]"
        >
          <p className="text-xs uppercase text-white/45">Chamados com transferência &gt; 0</p>
          <p className="mt-1 font-display text-2xl text-agro-warm">
            {d.transferencias.chamadosComTransferencia}
          </p>
          <p className="mt-2 text-xs text-white/35">Clique para abrir a lista de chamados</p>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Por bancada"
          hint="Clique numa barra para filtrar por banca de atendimento."
        >
          <Bar
            data={{
              labels: d.porBancada.slice(0, 12).map((x) => x.label),
              datasets: [
                {
                  data: d.porBancada.slice(0, 12).map((x) => Number(x.total)),
                  backgroundColor: 'rgba(56, 189, 248, 0.8)',
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              ...barOpts,
              ...chartNavigateLista(navigate, 'bancada_atend'),
            }}
          />
        </ChartCard>
        <ChartCard
          title="Área inicial (origem)"
          hint="Clique numa barra para filtrar por área inicial."
        >
          <Bar
            data={{
              labels: d.porAreaInicial.slice(0, 12).map((x) => x.label),
              datasets: [
                {
                  data: d.porAreaInicial.slice(0, 12).map((x) => Number(x.total)),
                  backgroundColor: 'rgba(91, 141, 239, 0.85)',
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              ...barOpts,
              ...chartNavigateLista(navigate, 'area_ini'),
            }}
          />
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Por gerente" hint="Clique numa barra para filtrar por gerente.">
          <Bar
            data={{
              labels: d.porGerente.slice(0, 12).map((x) => x.label),
              datasets: [
                {
                  data: d.porGerente.slice(0, 12).map((x) => Number(x.total)),
                  backgroundColor: 'rgba(96, 165, 250, 0.85)',
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              ...barOpts,
              ...chartNavigateLista(navigate, 'gerente'),
              indexAxis: 'y' as const,
            }}
          />
        </ChartCard>
        <ChartCard title="Por prioridade (valor)" hint="Clique numa barra para filtrar por prioridade.">
          <Bar
            data={{
              labels: d.porPrioridade.map((x) => x.label),
              datasets: [
                {
                  data: d.porPrioridade.map((x) => Number(x.total)),
                  backgroundColor: 'rgba(129, 140, 248, 0.85)',
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              ...barOpts,
              ...chartNavigateLista(navigate, 'prioridade'),
            }}
          />
        </ChartCard>
      </div>
        </>
      ) : null}
    </div>
  )
}

function ChartCard({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="font-display text-lg font-medium text-white">{title}</h2>
      {hint ? <p className="mt-1 text-xs text-white/40">{hint}</p> : null}
      <div className="mt-4 h-72">{children}</div>
    </div>
  )
}

const barOpts = {
  maintainAspectRatio: false,
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
}
