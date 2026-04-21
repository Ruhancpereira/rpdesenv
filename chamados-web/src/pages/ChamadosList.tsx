import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiltrosPainel } from '../components/FiltrosPainel'
import { apiFetch } from '../lib/api'
import { labelCampoChamado } from '../lib/campoChamadoLabel'
import {
  CHAMADO_COLUNAS_LISTAGEM,
  formatValorCelula,
  labelColunaListagem,
} from '../lib/chamadosListaColunas'

type Chamado = Record<string, unknown>

type Movimentacao = {
  campo: string
  de: string | null
  para: string | null
  quando: string
  arquivoImportacao: string | null
  importBatchId: number | null
}

const TAMANHOS_PAGINA = [10, 25, 50, 100, 200] as const

type PageResp = {
  content: Chamado[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

function fmtInstant(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function IconHistorico({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}

export function ChamadosList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState<PageResp | null>(null)
  const [loading, setLoading] = useState(false)
  const [modalNumero, setModalNumero] = useState<number | null>(null)
  const [movCache, setMovCache] = useState<Record<number, Movimentacao[] | 'loading' | 'error'>>({})

  const page = Math.max(0, Number(searchParams.get('page') ?? '0') || 0)
  const listarTodosParam = searchParams.get('listarTodos')
  const temSize = searchParams.has('size')
  /** Sem size e sem listarTodos=false explícito: mostrar todos (predefinição para dados consolidados / IA). */
  const listarTodos =
    listarTodosParam === 'true' || listarTodosParam === '1'
      ? true
      : listarTodosParam === 'false'
        ? false
        : !temSize
  const sizeParam = Number(searchParams.get('size') ?? '25') || 25
  const size = Math.min(500, Math.max(1, sizeParam))

  useEffect(() => {
    const qs = new URLSearchParams(searchParams)
    qs.set('page', String(page))
    if (listarTodos) {
      qs.set('listarTodos', 'true')
    } else {
      qs.delete('listarTodos')
      qs.set('size', String(size))
    }
    setLoading(true)
    apiFetch(`/api/chamados?${qs.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [searchParams, page, listarTodos, size])

  function setTamanhoPagina(novo: number) {
    const n = new URLSearchParams(searchParams)
    n.set('size', String(novo))
    n.set('listarTodos', 'false')
    n.set('page', '0')
    setSearchParams(n)
  }

  function setModoListarTodos(ativo: boolean) {
    const n = new URLSearchParams(searchParams)
    if (ativo) {
      n.set('listarTodos', 'true')
      n.delete('size')
      n.set('page', '0')
    } else {
      n.set('listarTodos', 'false')
      n.set('size', String(size))
      n.set('page', '0')
    }
    setSearchParams(n)
  }

  function abrirHistorico(numeroChamado: number) {
    setModalNumero(numeroChamado)
    if (movCache[numeroChamado] !== undefined && movCache[numeroChamado] !== 'error') {
      return
    }
    setMovCache((c) => ({ ...c, [numeroChamado]: 'loading' }))
    apiFetch(`/api/chamados/numero/${numeroChamado}/movimentacoes`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((list: Movimentacao[]) => {
        setMovCache((c) => ({ ...c, [numeroChamado]: list }))
      })
      .catch(() => {
        setMovCache((c) => ({ ...c, [numeroChamado]: 'error' }))
      })
  }

  function fecharModal() {
    setModalNumero(null)
  }

  useEffect(() => {
    if (modalNumero === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') fecharModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalNumero])

  const movsModal =
    modalNumero !== null ? movCache[modalNumero] : undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Chamados</h1>
        <p className="mt-1 text-sm text-white/55">
          Listagem com os mesmos filtros dos dashboards e todas as colunas importadas. Por defeito a lista é
          paginada; podes aumentar o tamanho da página ou usar <strong className="text-white/75">Listar tudo</strong>{' '}
          (até ao limite configurado na API) para export mental ou análise pelo assistente. Use o ícone à esquerda
          para o histórico de alterações por coluna.
        </p>
      </div>

      <FiltrosPainel resetPageOnApply />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
        <label className="flex items-center gap-2">
          <span className="text-white/50">Por página</span>
          <select
            value={size}
            onChange={(e) => setTamanhoPagina(Number(e.target.value))}
            disabled={listarTodos}
            className="rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-white disabled:opacity-40"
          >
            {TAMANHOS_PAGINA.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={listarTodos}
            onChange={(e) => setModoListarTodos(e.target.checked)}
            className="rounded border-white/30 bg-black/40 text-agro-accent focus:ring-agro-accent"
          />
          <span>
            Listar tudo <span className="text-white/45">(filtros atuais; limite máx. na API)</span>
          </span>
        </label>
      </div>

      {data != null && listarTodos && data.totalElements > (data.content?.length ?? 0) ? (
        <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
          A mostrar {data.content.length.toLocaleString('pt-BR')} de {data.totalElements.toLocaleString('pt-BR')}{' '}
          registo(s) com estes filtros. Ajusta <code className="text-[10px]">CHAMADOS_LISTA_MAX_TUDO</code> na API
          se precisares de mais linhas de uma vez.
        </p>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-black/20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-sm text-white/60">
          <span>
            {data != null
              ? listarTodos
                ? `${data.totalElements.toLocaleString('pt-BR')} registo(s) — vista completa (até ao limite da API)`
                : `${data.totalElements.toLocaleString('pt-BR')} registro(s) — página ${data.number + 1} de ${Math.max(1, data.totalPages)}`
              : loading
                ? 'Carregando…'
                : '—'}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!data || listarTodos || data.number <= 0}
              onClick={() => {
                const n = new URLSearchParams(searchParams)
                n.set('page', String(Math.max(0, page - 1)))
                setSearchParams(n)
              }}
              className="rounded border border-white/15 px-3 py-1 text-white/80 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={!data || listarTodos || data.number >= data.totalPages - 1}
              onClick={() => {
                const n = new URLSearchParams(searchParams)
                n.set('page', String(page + 1))
                setSearchParams(n)
              }}
              className="rounded border border-white/15 px-3 py-1 text-white/80 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-max min-w-full border-collapse text-left text-[11px] text-white/85">
            <thead>
              <tr className="border-b border-white/10 text-white/45">
                <th className="sticky left-0 z-10 bg-agro-950/95 p-2 pr-1 backdrop-blur-sm" aria-label="Histórico" />
                {CHAMADO_COLUNAS_LISTAGEM.map((key) => (
                  <th key={key} className="whitespace-nowrap px-2 py-2">
                    {labelColunaListagem(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.content ?? []).map((row) => {
                const num = Number(row.numeroChamado ?? 0)
                const cnt = Number(row.historicoMovCount ?? 0)
                return (
                  <tr
                    key={row.id != null ? String(row.id) : `n-${String(row.numeroChamado ?? '')}`}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="sticky left-0 z-10 bg-agro-950/90 p-1 align-middle backdrop-blur-sm">
                      <button
                        type="button"
                        title={
                          cnt > 0
                            ? `Ver histórico (${cnt} movimentação(ões))`
                            : 'Ver histórico (pode estar vazio se não houver importações registradas)'
                        }
                        aria-label={`Histórico do chamado ${num}`}
                        onClick={() => abrirHistorico(num)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 ${
                          cnt > 0 ? 'text-agro-accent' : 'text-white/40'
                        }`}
                      >
                        <IconHistorico className="h-4 w-4" />
                      </button>
                    </td>
                    {CHAMADO_COLUNAS_LISTAGEM.map((key) => {
                      const raw = row[key]
                      const text = formatValorCelula(raw)
                      return (
                        <td
                          key={key}
                          className="max-w-[min(220px,28vw)] truncate border-l border-white/5 px-2 py-1.5 align-top font-mono text-[10px] text-white/80"
                          title={text}
                        >
                          {text}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalNumero !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hist-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Fechar"
            onClick={fecharModal}
          />
          <div
            className="relative z-10 flex max-h-[min(85vh,720px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-agro-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 id="hist-modal-title" className="font-display text-lg font-medium text-white">
                Histórico — chamado <span className="font-mono text-agro-accent">{modalNumero}</span>
              </h2>
              <button
                type="button"
                onClick={fecharModal}
                className="rounded-lg px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 hover:text-white"
              >
                Fechar
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {movsModal === 'loading' || movsModal === undefined ? (
                <p className="text-sm text-white/50">Carregando histórico…</p>
              ) : movsModal === 'error' ? (
                <p className="text-sm text-red-300/90">Não foi possível carregar o histórico.</p>
              ) : movsModal.length === 0 ? (
                <p className="text-sm text-white/50">Nenhum registro de movimentação.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-[11px] text-white/85">
                    <thead>
                      <tr className="border-b border-white/10 text-white/45">
                        <th className="pb-2 pr-2">Quando</th>
                        <th className="pb-2 pr-2">Coluna</th>
                        <th className="pb-2 pr-2">De</th>
                        <th className="pb-2 pr-2">Para</th>
                        <th className="pb-2">Importação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movsModal.map((m, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="py-2 pr-2 align-top text-white/55">{fmtInstant(m.quando)}</td>
                          <td className="py-2 pr-2 align-top font-medium text-white/90">
                            {labelCampoChamado(m.campo)}
                          </td>
                          <td className="max-w-[200px] whitespace-pre-wrap break-words py-2 pr-2 align-top text-sky-200/90">
                            {m.de ?? '—'}
                          </td>
                          <td className="max-w-[200px] whitespace-pre-wrap break-words py-2 pr-2 align-top text-blue-200/90">
                            {m.para ?? '—'}
                          </td>
                          <td
                            className="max-w-[180px] truncate py-2 align-top text-white/50"
                            title={m.arquivoImportacao ?? ''}
                          >
                            {m.arquivoImportacao ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
