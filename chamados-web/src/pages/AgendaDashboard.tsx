import { useEffect, useState } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { apiFetch } from '../lib/api'

type NamedTotal = { nome: string; horas: number; registros: number }

type Dashboard = {
  totalRegistros: number
  totalHoras: number
  porRecurso: NamedTotal[]
  porCliente: NamedTotal[]
  porStatus: NamedTotal[]
  porAlocadoPor: NamedTotal[]
}

const chartColors = {
  grid: 'rgba(255,255,255,0.06)',
  text: '#b0c4e6',
}

export function AgendaDashboard() {
  const [d, setD] = useState<Dashboard | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setErr(null)
    apiFetch('/api/agenda/dashboard')
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setD)
      .catch(() => setErr('Não foi possível carregar o painel da agenda.'))
  }, [])

  const topRec = d?.porRecurso.slice(0, 12) ?? []
  const topCli = d?.porCliente.slice(0, 12) ?? []
  const status = d?.porStatus ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Agenda · Painel</h1>
        <p className="mt-1 text-sm text-white/55">
          Visão consolidada após importação: totais, maiores alocações por recurso e cliente, status e quem
          alocou.
        </p>
      </div>

      {err ? <p className="text-red-300">{err}</p> : null}
      {!d && !err ? <p className="text-white/50">Carregando…</p> : null}

      {d ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/45">Registros na agenda</p>
              <p className="mt-1 font-display text-2xl text-agro-accent">{d.totalRegistros}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/45">Horas somadas (planilha)</p>
              <p className="mt-1 font-display text-2xl text-agro-warm">
                {d.totalHoras.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
              <p className="text-xs text-white/45">Maior carga por recurso (top 1)</p>
              <p className="mt-1 font-display text-lg text-white">
                {topRec[0] ? (
                  <>
                    {topRec[0].nome}{' '}
                    <span className="text-white/55">
                      · {topRec[0].horas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h
                    </span>
                  </>
                ) : (
                  '—'
                )}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-display text-lg font-medium text-white">Horas por recurso (top 12)</h2>
              <p className="mt-1 text-xs text-white/40">Consultores / veículos conforme coluna Recurso.</p>
              <div className="mt-4 h-80">
                <Bar
                  data={{
                    labels: topRec.map((x) => (x.nome.length > 24 ? x.nome.slice(0, 22) + '…' : x.nome)),
                    datasets: [
                      {
                        label: 'Horas',
                        data: topRec.map((x) => x.horas),
                        backgroundColor: 'rgba(56, 189, 248, 0.75)',
                        borderRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                      x: {
                        ticks: { color: chartColors.text },
                        grid: { color: chartColors.grid },
                      },
                      y: {
                        ticks: { color: chartColors.text, font: { size: 10 } },
                        grid: { display: false },
                      },
                    },
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-display text-lg font-medium text-white">Horas por cliente (top 12)</h2>
              <div className="mt-4 h-80">
                <Bar
                  data={{
                    labels: topCli.map((x) => (x.nome.length > 20 ? x.nome.slice(0, 18) + '…' : x.nome)),
                    datasets: [
                      {
                        label: 'Horas',
                        data: topCli.map((x) => x.horas),
                        backgroundColor: 'rgba(96, 165, 250, 0.8)',
                        borderRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                      x: {
                        ticks: { color: chartColors.text },
                        grid: { color: chartColors.grid },
                      },
                      y: {
                        ticks: { color: chartColors.text, font: { size: 10 } },
                        grid: { display: false },
                      },
                    },
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-display text-lg font-medium text-white">Distribuição por status</h2>
              <div className="mt-4 mx-auto h-72 max-w-md">
                <Doughnut
                  data={{
                    labels: status.map((x) => x.nome),
                    datasets: [
                      {
                        data: status.map((x) => x.registros),
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
              <h2 className="font-display text-lg font-medium text-white">Alocado por (reservas)</h2>
              <p className="mt-1 text-xs text-white/40">Quem registrou a alocação na planilha.</p>
              <div className="mt-4 h-80">
                <Bar
                  data={{
                    labels: (d.porAlocadoPor.slice(0, 10)).map((x) =>
                      x.nome.length > 18 ? x.nome.slice(0, 16) + '…' : x.nome,
                    ),
                    datasets: [
                      {
                        label: 'Horas',
                        data: d.porAlocadoPor.slice(0, 10).map((x) => x.horas),
                        backgroundColor: 'rgba(129, 140, 248, 0.85)',
                        borderRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                      x: {
                        ticks: { color: chartColors.text },
                        grid: { color: chartColors.grid },
                      },
                      y: {
                        ticks: { color: chartColors.text, font: { size: 10 } },
                        grid: { display: false },
                      },
                    },
                    plugins: { legend: { display: false } },
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
