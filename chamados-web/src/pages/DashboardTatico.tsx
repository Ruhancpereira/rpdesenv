import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'
import { FiltrosPainel } from '../components/FiltrosPainel'
import { apiFetch } from '../lib/api'
import { chartNavigateLista } from '../lib/listaFromChart'

type Pair = { label: string; total: string }

type Data = {
  heatmapStatusArea: {
    status: Pair[]
    areas: Pair[]
  }
  volumeDiarioAbertura: Record<string, string>
}

const chartColors = {
  grid: 'rgba(255,255,255,0.06)',
  text: '#b0c4e6',
}

export function DashboardTatico() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [d, setD] = useState<Data | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setErr(null)
    const q = searchParams.toString()
    apiFetch(`/api/dashboard/tatico${q ? `?${q}` : ''}`)
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
        <h1 className="font-display text-2xl font-semibold text-white">Visão tática</h1>
        <p className="mt-1 text-sm text-white/55">
          Cruzamento rápido status × volume e áreas para identificar gargalos e desvios de roteamento.
        </p>
      </div>

      <FiltrosPainel />

      {err ? <p className="text-red-300">{err}</p> : null}
      {!d && !err ? <p className="text-white/50">Carregando visão tática…</p> : null}

      {d ? (
        <>
      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-sm text-sky-100/90">
        {Object.values(d.volumeDiarioAbertura)[0] ?? 'Use filtros de data na lista de chamados para análises por período.'}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-display text-lg font-medium text-white">Volume por status</h2>
          <p className="mt-1 text-xs text-white/40">Clique numa barra para filtrar por status.</p>
          <div className="mt-4 h-80">
            <Bar
              data={{
                labels: d.heatmapStatusArea.status.map((x) => x.label),
                datasets: [
                  {
                    label: 'Chamados',
                    data: d.heatmapStatusArea.status.map((x) => Number(x.total)),
                    backgroundColor: 'rgba(56, 189, 248, 0.75)',
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                ...chartNavigateLista(navigate, 'sta_ativ'),
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
              }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-display text-lg font-medium text-white">Volume por área (atendimento)</h2>
          <p className="mt-1 text-xs text-white/40">Clique numa barra para filtrar por área de atendimento.</p>
          <div className="mt-4 h-80">
            <Bar
              data={{
                labels: d.heatmapStatusArea.areas.slice(0, 15).map((x) => x.label),
                datasets: [
                  {
                    label: 'Chamados',
                    data: d.heatmapStatusArea.areas.slice(0, 15).map((x) => Number(x.total)),
                    backgroundColor: 'rgba(91, 141, 239, 0.75)',
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                ...chartNavigateLista(navigate, 'area_atend'),
                indexAxis: 'y',
                scales: {
                  x: {
                    ticks: { color: chartColors.text },
                    grid: { color: chartColors.grid },
                  },
                  y: {
                    ticks: { color: chartColors.text },
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
        </>
      ) : null}
    </div>
  )
}
