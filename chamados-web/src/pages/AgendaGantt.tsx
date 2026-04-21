import { useEffect, useMemo, useRef, useState } from 'react'
import { apiFetch } from '../lib/api'

type GanttItem = {
  id: number
  recurso: string | null
  atividade: string | null
  cliente: string | null
  status: string | null
  localAgenda: string | null
  alocadoPor: string | null
  dataInicio: string
  dataFinal: string
  horas: number | null
}

type OpcoesFiltro = Record<string, string[]>

const WD = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const DAY_PX = 28
const BAR_H = 20
const LANE_GAP = 2

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  return new Date(y, m - 1, d)
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function eachDayInRange(min: Date, max: Date): Date[] {
  const out: Date[] = []
  const cur = startOfDay(min)
  const end = startOfDay(max)
  for (let t = cur.getTime(); t <= end.getTime(); t += 86400000) {
    out.push(new Date(t))
  }
  return out
}

function dayIndexInRange(day: Date, origin: Date): number {
  const a = startOfDay(origin).getTime()
  const b = startOfDay(day).getTime()
  return Math.round((b - a) / 86400000)
}

function itemDayRange(it: GanttItem, origin: Date): { s: number; e: number } {
  const di = parseLocalDate(it.dataInicio)
  const df = parseLocalDate(it.dataFinal)
  const s = dayIndexInRange(di, origin)
  const e = dayIndexInRange(df, origin)
  return { s: Math.min(s, e), e: Math.max(s, e) }
}

function barClass(status: string | null) {
  const s = (status ?? '').toLowerCase()
  if (s.includes('confirm')) return 'bg-sky-400/90'
  if (s.includes('planej')) return 'bg-blue-600/75'
  return 'bg-sky-500/70'
}

/** Greedy lanes: maior índice de fim por faixa, para barras que se sobrepõem. */
function assignLanes(items: GanttItem[], origin: Date): Map<number, number> {
  const sorted = [...items].sort(
    (a, b) => itemDayRange(a, origin).s - itemDayRange(b, origin).s,
  )
  const laneEnds: number[] = []
  const map = new Map<number, number>()
  for (const it of sorted) {
    const { s, e } = itemDayRange(it, origin)
    let L = 0
    while (L < laneEnds.length && laneEnds[L] >= s) {
      L++
    }
    if (L === laneEnds.length) {
      laneEnds.push(e)
    } else {
      laneEnds[L] = e
    }
    map.set(it.id, L)
  }
  return map
}

function recursoKey(it: GanttItem): string {
  const r = (it.recurso ?? '').trim()
  return r || '—'
}

export function AgendaGantt() {
  const [items, setItems] = useState<GanttItem[]>([])
  const [opcoes, setOpcoes] = useState<OpcoesFiltro>({})
  const [err, setErr] = useState<string | null>(null)
  const [selRecurso, setSelRecurso] = useState<string[]>([])
  const [selCliente, setSelCliente] = useState<string[]>([])
  const [selStatus, setSelStatus] = useState<string[]>([])
  const [selLocal, setSelLocal] = useState<string[]>([])
  const [selAlocadoPor, setSelAlocadoPor] = useState<string[]>([])

  useEffect(() => {
    setErr(null)
    Promise.all([
      apiFetch('/api/agenda/gantt').then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      }),
      apiFetch('/api/agenda/opcoes-filtro').then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      }),
    ])
      .then(([g, o]) => {
        setItems(g)
        setOpcoes(o)
      })
      .catch(() => setErr('Importe a agenda ou verifique a API.'))
  }, [])

  const filtrados = useMemo(() => {
    return items.filter((it) => {
      const r = (it.recurso ?? '').trim()
      const c = (it.cliente ?? '').trim()
      const st = (it.status ?? '').trim()
      const loc = (it.localAgenda ?? '').trim()
      const ap = (it.alocadoPor ?? '').trim()
      if (selRecurso.length > 0 && !selRecurso.includes(r)) return false
      if (selCliente.length > 0 && !selCliente.includes(c)) return false
      if (selStatus.length > 0 && !selStatus.includes(st)) return false
      if (selLocal.length > 0 && !selLocal.includes(loc)) return false
      if (selAlocadoPor.length > 0 && !selAlocadoPor.includes(ap)) return false
      return true
    })
  }, [items, selRecurso, selCliente, selStatus, selLocal, selAlocadoPor])

  const porRecurso = useMemo(() => {
    const m = new Map<string, GanttItem[]>()
    for (const it of filtrados) {
      const k = recursoKey(it)
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(it)
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => parseLocalDate(a.dataInicio).getTime() - parseLocalDate(b.dataInicio).getTime())
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
  }, [filtrados])

  const { origin, days, monthBands } = useMemo(() => {
    if (filtrados.length === 0) {
      const t = startOfDay(new Date())
      const end = new Date(t)
      end.setDate(end.getDate() + 30)
      const ds = eachDayInRange(t, end)
      return {
        origin: t,
        days: ds,
        monthBands: [
          {
            key: 'm0',
            label: ds[0].toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
            colSpan: ds.length,
          },
        ],
      }
    }
    let minT = Number.POSITIVE_INFINITY
    let maxT = Number.NEGATIVE_INFINITY
    for (const it of filtrados) {
      const a = parseLocalDate(it.dataInicio).getTime()
      const b = parseLocalDate(it.dataFinal).getTime()
      minT = Math.min(minT, a, b)
      maxT = Math.max(maxT, a, b)
    }
    const minD = startOfDay(new Date(minT))
    const maxD = startOfDay(new Date(maxT))
    minD.setDate(minD.getDate() - 2)
    maxD.setDate(maxD.getDate() + 2)
    const ds = eachDayInRange(minD, maxD)
    const bands: { key: string; label: string; colSpan: number }[] = []
    let i = 0
    while (i < ds.length) {
      const d0 = ds[i]
      const y = d0.getFullYear()
      const m = d0.getMonth()
      let j = i + 1
      while (j < ds.length && ds[j].getFullYear() === y && ds[j].getMonth() === m) {
        j++
      }
      bands.push({
        key: `${y}-${m}-${i}`,
        label: d0.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        colSpan: j - i,
      })
      i = j
    }
    return { origin: ds[0], days: ds, monthBands: bands }
  }, [filtrados])

  const totalDays = days.length
  const timelineWidth = totalDays * DAY_PX

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Agenda · Gantt</h1>
        <p className="mt-1 text-sm text-white/55">
          Uma linha por <strong className="text-white/75">recurso</strong>; várias alocações aparecem na mesma linha
          (empilhadas se houver sobreposição). Abra cada filtro para buscar na lista e marcar um ou mais itens (✓).
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <FiltroMulti
          label="Recurso"
          opcoes={opcoes.recurso ?? []}
          selecionados={selRecurso}
          onChange={setSelRecurso}
        />
        <FiltroMulti
          label="Cliente"
          opcoes={opcoes.cliente ?? []}
          selecionados={selCliente}
          onChange={setSelCliente}
        />
        <FiltroMulti
          label="Status"
          opcoes={opcoes.status ?? []}
          selecionados={selStatus}
          onChange={setSelStatus}
        />
        <FiltroMulti
          label="Local"
          opcoes={opcoes.local ?? []}
          selecionados={selLocal}
          onChange={setSelLocal}
        />
        <FiltroMulti
          label="Alocado por"
          opcoes={opcoes.alocado_por ?? []}
          selecionados={selAlocadoPor}
          onChange={setSelAlocadoPor}
        />
        <span className="pb-2 text-xs text-white/40">
          {porRecurso.length} recurso(s) · {filtrados.length} alocação(ões) · {items.length} no total
        </span>
      </div>

      {err ? <p className="text-red-300">{err}</p> : null}

      {!items.length && !err ? (
        <p className="text-white/50">Carregando ou sem dados — importe a planilha em Agenda → Importar.</p>
      ) : null}

      {items.length > 0 && totalDays > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
          <div className="p-4" style={{ minWidth: 280 + timelineWidth + 32 }}>
            <div className="flex">
              <div className="w-[min(280px,28vw)] shrink-0" />
              <div style={{ width: timelineWidth }}>
                <div
                  className="grid text-[10px] leading-tight text-white/50"
                  style={{
                    gridTemplateColumns: `repeat(${totalDays}, ${DAY_PX}px)`,
                  }}
                >
                  {monthBands.map((band) => (
                    <div
                      key={band.key}
                      className="border-b border-l border-white/10 bg-white/[0.04] py-1 text-center font-medium capitalize"
                      style={{ gridColumn: `span ${band.colSpan}` }}
                    >
                      {band.label}
                    </div>
                  ))}
                </div>
                <div
                  className="grid border-b border-white/10 text-[9px] text-white/40"
                  style={{
                    gridTemplateColumns: `repeat(${totalDays}, ${DAY_PX}px)`,
                  }}
                >
                  {days.map((d) => (
                    <div
                      key={d.getTime()}
                      className="flex flex-col items-center border-l border-white/5 py-0.5"
                    >
                      <span>{WD[d.getDay()]}</span>
                      <span className="text-white/55">{d.getDate()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-1 space-y-2">
              {porRecurso.map(([nome, lista]) => {
                const lanes = assignLanes(lista, origin)
                const laneVals = [...lanes.values()]
                const laneCount = laneVals.length ? Math.max(...laneVals) + 1 : 1
                const rowH = laneCount * (BAR_H + LANE_GAP) + 4
                return (
                  <div key={nome} className="flex items-stretch gap-2 text-[11px]">
                    <div
                      className="flex w-[min(280px,28vw)] shrink-0 items-center border-r border-white/10 pr-2 font-medium text-white/85"
                      title={nome}
                    >
                      <span className="line-clamp-3">{nome}</span>
                    </div>
                    <div
                      className="relative shrink-0 rounded bg-white/[0.03]"
                      style={{ width: timelineWidth, height: rowH }}
                    >
                      {lista.map((it) => {
                        const { s, e } = itemDayRange(it, origin)
                        const lane = lanes.get(it.id) ?? 0
                        const span = e - s + 1
                        const left = (s / totalDays) * 100
                        const width = (span / totalDays) * 100
                        const top = lane * (BAR_H + LANE_GAP) + 2
                        const titulo = [it.atividade, it.cliente, it.status].filter(Boolean).join(' · ')
                        return (
                          <div
                            key={it.id}
                            className={`absolute flex items-center overflow-hidden rounded px-0.5 text-[9px] text-agro-950 shadow-sm ${barClass(it.status)}`}
                            style={{
                              left: `${left}%`,
                              width: `${Math.min(width, 100 - left)}%`,
                              top,
                              height: BAR_H,
                              minWidth: 4,
                            }}
                            title={`${titulo}\n${it.dataInicio} → ${it.dataFinal}${it.horas != null ? `\n${it.horas} h` : ''}`}
                          >
                            <span className="truncate">{it.atividade?.slice(0, 48) ?? '—'}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function FiltroMulti({
  label,
  opcoes,
  selecionados,
  onChange,
}: {
  label: string
  opcoes: string[]
  selecionados: string[]
  onChange: (next: string[]) => void
}) {
  const [aberto, setAberto] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const buscaRef = useRef<HTMLInputElement>(null)

  const opcoesFiltradas = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return opcoes
    return opcoes.filter((o) => o.toLowerCase().includes(q))
  }, [opcoes, query])

  useEffect(() => {
    if (!aberto) return
    setQuery('')
    const t = window.setTimeout(() => buscaRef.current?.focus(), 0)
    return () => window.clearTimeout(t)
  }, [aberto])

  useEffect(() => {
    if (!aberto) return
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [aberto])

  function alternar(valor: string) {
    if (selecionados.includes(valor)) {
      onChange(selecionados.filter((x) => x !== valor))
    } else {
      onChange([...selecionados, valor])
    }
  }

  const resumo =
    selecionados.length === 0
      ? 'Todos'
      : selecionados.length === 1
        ? truncar(selecionados[0], 28)
        : `${selecionados.length} selecionados`

  return (
    <div ref={rootRef} className="relative flex min-w-[220px] max-w-[300px] flex-col gap-1">
      <span className="text-xs text-white/50">{label}</span>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-left text-xs text-white/90 outline-none ring-agro-accent hover:bg-black/45 focus:ring-2"
        aria-expanded={aberto}
        aria-haspopup="listbox"
      >
        <span className="min-w-0 flex-1 truncate" title={selecionados.join(', ') || undefined}>
          {resumo}
        </span>
        <span className="shrink-0 text-white/45" aria-hidden>
          {aberto ? '▴' : '▾'}
        </span>
      </button>

      {aberto ? (
        <div
          className="absolute left-0 top-full z-[100] mt-1 w-full min-w-[min(100vw-2rem,320px)] rounded-xl border border-white/15 bg-[#14141a] py-2 shadow-2xl shadow-black/50 ring-1 ring-white/5"
          role="listbox"
          aria-multiselectable
        >
          <div className="border-b border-white/10 px-2 pb-2">
            <input
              ref={buscaRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite para filtrar…"
              className="w-full rounded-lg border border-white/12 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-agro-accent"
              autoComplete="off"
            />
          </div>
          <ul className="max-h-[min(240px,40vh)] overflow-y-auto overscroll-contain px-1 py-1">
            {opcoesFiltradas.length === 0 ? (
              <li className="px-2 py-3 text-center text-[11px] text-white/40">Nenhum resultado</li>
            ) : (
              opcoesFiltradas.map((o, i) => {
                const marcado = selecionados.includes(o)
                return (
                  <li key={`${o}-${i}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={marcado}
                      onClick={() => alternar(o)}
                      className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs text-white/90 hover:bg-white/10"
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-semibold leading-none ${
                          marcado
                            ? 'border-emerald-400/80 bg-emerald-500/25 text-emerald-300'
                            : 'border-white/25 bg-black/20 text-transparent'
                        }`}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <span className="min-w-0 flex-1 break-words">{o}</span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
          <div className="flex items-center justify-between border-t border-white/10 px-2 pt-2">
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] text-white/50 underline decoration-white/25 hover:text-white"
            >
              Limpar {label.toLowerCase()}
            </button>
            <span className="text-[10px] text-white/35">{selecionados.length} marcado(s)</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function truncar(s: string, max: number) {
  if (s.length <= max) return s
  return `${s.slice(0, max - 1)}…`
}
