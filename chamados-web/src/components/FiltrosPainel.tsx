import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import type { ColunaMeta } from '../types/filters'

type OpcoesMap = Record<string, string[]>

type Props = {
  /** Na lista de chamados, reaplica `page=0` ao filtrar */
  resetPageOnApply?: boolean
}

/** Preservados ao aplicar/limpar filtros na lista (paginação e modo “listar tudo”). */
const PARAMS_PAGINACAO = ['size', 'listarTodos', 'sort', 'direction'] as const

export function FiltrosPainel({ resetPageOnApply = false }: Props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [cols, setCols] = useState<ColunaMeta[]>([])
  const [opcoes, setOpcoes] = useState<OpcoesMap>({})

  useEffect(() => {
    apiFetch('/api/meta/colunas-filtro')
      .then((r) => r.json())
      .then((j: { colunas: ColunaMeta[] }) =>
        setCols(j.colunas.map((c) => ({ ...c, controle: c.controle ?? 'livre' }))),
      )
      .catch(() => setCols([]))
  }, [])

  useEffect(() => {
    apiFetch('/api/meta/opcoes-filtro')
      .then((r) => r.json())
      .then((j: OpcoesMap) => setOpcoes(j))
      .catch(() => setOpcoes({}))
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }
    apiFetch('/api/meta/opcoes-filtro')
      .then((r) => r.json())
      .then((j: OpcoesMap) => setOpcoes(j))
      .catch(() => setOpcoes({}))
  }, [open])

  const filterValues = useMemo(() => {
    const m: Record<string, string> = {}
    cols.forEach((c) => {
      const v = searchParams.get(c.id)
      if (v) {
        m[c.id] = v
      }
    })
    return m
  }, [cols, searchParams])

  function applyFilters(e: FormEvent) {
    e.preventDefault()
    const fd = new FormData(e.target as HTMLFormElement)
    const next = new URLSearchParams()
    PARAMS_PAGINACAO.forEach((k) => {
      const v = searchParams.get(k)
      if (v) next.set(k, v)
    })
    if (resetPageOnApply) {
      next.set('page', '0')
    } else {
      const p = searchParams.get('page')
      if (p) next.set('page', p)
    }
    cols.forEach((c) => {
      const raw = fd.get(c.id)
      const v = typeof raw === 'string' ? raw.trim() : ''
      if (v) {
        next.set(c.id, v)
      }
    })
    setSearchParams(next)
    setOpen(false)
  }

  function clearFilters() {
    const next = new URLSearchParams()
    PARAMS_PAGINACAO.forEach((k) => {
      const v = searchParams.get(k)
      if (v) next.set(k, v)
    })
    next.set('page', '0')
    setSearchParams(next)
  }

  const formKey = searchParams.toString()

  return (
    <div className="mb-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
        >
          {open ? 'Filtro ▲' : 'Filtro ▼'}
        </button>
      </div>
      {open ? (
        <form
          key={formKey}
          onSubmit={applyFilters}
          className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
        >
          <p className="mb-3 text-xs text-white/45">
            Campos com lista usam valores já vistos na planilha (atualizados a cada importação). Os
            demais aceitam texto livre (contém) ou número/data conforme o tipo.
          </p>
          <div className="grid max-h-[min(420px,55vh)] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cols.map((c) => (
              <label key={c.id} className="block text-xs">
                <span className="text-white/50">{c.label}</span>
                {c.controle === 'lista' ? (
                  <select
                    name={c.id}
                    defaultValue={filterValues[c.id] ?? ''}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-black/25 px-2 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-agro-accent"
                  >
                    <option value="">Todos</option>
                    {(opcoes[c.id] ?? []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={c.id}
                    defaultValue={filterValues[c.id] ?? ''}
                    placeholder={c.tipo === 'data' ? 'aaaa-mm-dd' : '…'}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-black/25 px-2 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-agro-accent"
                  />
                )}
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-agro-accent px-5 py-2 text-sm font-medium text-agro-950"
            >
              Aplicar filtros
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-white/20 px-5 py-2 text-sm text-white/80"
            >
              Limpar
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
