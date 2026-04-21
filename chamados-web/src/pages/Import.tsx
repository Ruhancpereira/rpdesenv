import type { FormEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

type ImportBatch = {
  id: number
  nomeArquivo: string
  criadoEm: string
  linhasLidas: number
  inseridos: number
  atualizados: number
  revertido: boolean
}

function fmtInstant(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' })
  } catch {
    return iso
  }
}

export function Import() {
  const [file, setFile] = useState<File | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [rollbackLoading, setRollbackLoading] = useState(false)
  const [historico, setHistorico] = useState<ImportBatch[] | null>(null)
  const [histErr, setHistErr] = useState<string | null>(null)

  const loadHistorico = useCallback(async () => {
    setHistErr(null)
    try {
      const res = await apiFetch('/api/import/historico')
      if (!res.ok) {
        setHistorico(null)
        setHistErr('Não foi possível carregar o histórico de importações.')
        return
      }
      const list = (await res.json()) as ImportBatch[]
      setHistorico(list)
    } catch {
      setHistorico(null)
      setHistErr('Erro ao carregar histórico.')
    }
  }, [])

  useEffect(() => {
    void loadHistorico()
  }, [loadHistorico])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) {
      setErr('Selecione um arquivo .xlsx, .xls ou .csv')
      return
    }
    setErr(null)
    setMsg(null)
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await apiFetch('/api/import', { method: 'POST', body: fd })
      if (!res.ok) {
        const t = await res.text()
        setErr(t || 'Falha na importação')
        return
      }
      const data = (await res.json()) as {
        linhasLidas: number
        inseridos: number
        atualizados: number
        mensagem: string
        importBatchId: number
      }
      setMsg(
        `${data.mensagem} Lote #${data.importBatchId}. Linhas válidas: ${data.linhasLidas}. Novos: ${data.inseridos}. Atualizados: ${data.atualizados}.`,
      )
      await loadHistorico()
    } catch {
      setErr('Erro de rede ou servidor.')
    } finally {
      setLoading(false)
    }
  }

  async function rollbackUltimo() {
    setErr(null)
    setMsg(null)
    setRollbackLoading(true)
    try {
      const res = await apiFetch('/api/import/rollback/ultimo', { method: 'POST' })
      if (!res.ok) {
        const t = await res.text()
        setErr(t || 'Não foi possível desfazer a importação.')
        return
      }
      const data = (await res.json()) as { mensagem: string; nomeArquivo: string; importBatchId: number }
      setMsg(`${data.mensagem} (lote #${data.importBatchId}: ${data.nomeArquivo})`)
      await loadHistorico()
    } catch {
      setErr('Erro de rede ou servidor.')
    } finally {
      setRollbackLoading(false)
    }
  }

  const ultimaAtiva = historico?.find((h) => !h.revertido) ?? null

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Importar planilha</h1>
        <p className="mt-2 text-sm text-white/60">
          Envie diariamente o export completo. O sistema identifica cada chamado pelo número e atualiza
          status, áreas e demais colunas automaticamente (deduplicação por{' '}
          <code className="text-agro-accent">chamado</code>). Cada importação fica registrada; você pode
          desfazer apenas a <strong className="text-white/80">última importação ainda ativa</strong>, com
          rollback dos dados.
        </p>
      </div>
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-white/80 file:mr-4 file:rounded-lg file:border-0 file:bg-agro-accent file:px-4 file:py-2 file:font-medium file:text-agro-950"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-agro-warm py-3 font-medium text-agro-950 hover:brightness-110 disabled:opacity-50"
        >
          {loading ? 'Importando…' : 'Importar'}
        </button>
      </form>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-medium text-white">Histórico de importações</h2>
          <button
            type="button"
            disabled={rollbackLoading || !ultimaAtiva}
            onClick={() => void rollbackUltimo()}
            title={
              ultimaAtiva
                ? `Desfazer importação: ${ultimaAtiva.nomeArquivo}`
                : 'Não há importação ativa para desfazer'
            }
            className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-100 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {rollbackLoading ? 'Desfazendo…' : 'Desfazer última importação'}
          </button>
        </div>
        {histErr ? <p className="mt-3 text-sm text-red-200/90">{histErr}</p> : null}
        {historico === null && !histErr ? (
          <p className="mt-4 text-sm text-white/45">Carregando…</p>
        ) : historico?.length === 0 ? (
          <p className="mt-4 text-sm text-white/45">Nenhuma importação registrada ainda.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs text-white/80">
              <thead>
                <tr className="border-b border-white/10 text-white/45">
                  <th className="py-2 pr-2">Quando</th>
                  <th className="py-2 pr-2">Arquivo</th>
                  <th className="py-2 pr-2">Linhas</th>
                  <th className="py-2 pr-2">Novos</th>
                  <th className="py-2 pr-2">Atualiz.</th>
                  <th className="py-2">Situação</th>
                </tr>
              </thead>
              <tbody>
                {(historico ?? []).map((h) => (
                  <tr key={h.id} className="border-b border-white/5">
                    <td className="py-2 pr-2 text-white/55">{fmtInstant(h.criadoEm)}</td>
                    <td className="max-w-[220px] truncate py-2 pr-2" title={h.nomeArquivo}>
                      {h.nomeArquivo || '—'}
                    </td>
                    <td className="py-2 pr-2">{h.linhasLidas}</td>
                    <td className="py-2 pr-2">{h.inseridos}</td>
                    <td className="py-2 pr-2">{h.atualizados}</td>
                    <td className="py-2">
                      {h.revertido ? (
                        <span className="text-white/45">Desfeita</span>
                      ) : (
                        <span className="text-sky-200/90">Ativa</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {msg ? <p className="rounded-lg bg-sky-500/15 p-4 text-sm text-sky-200">{msg}</p> : null}
      {err ? <p className="rounded-lg bg-red-500/15 p-4 text-sm text-red-200">{err}</p> : null}
    </div>
  )
}
