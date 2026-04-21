import type { FormEvent } from 'react'
import { useState } from 'react'
import { apiFetch } from '../lib/api'

export function AgendaImport() {
  const [file, setFile] = useState<File | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
      const res = await apiFetch('/api/agenda/import', { method: 'POST', body: fd })
      if (!res.ok) {
        const t = await res.text()
        setErr(t || 'Falha na importação da agenda')
        return
      }
      const data = (await res.json()) as {
        linhasValidas: number
        totalGravado: number
        mensagem: string
      }
      setMsg(
        `${data.mensagem} Linhas importadas: ${data.linhasValidas}. Registros na base: ${data.totalGravado}.`,
      )
    } catch {
      setErr('Erro de rede ou servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-white">Importar agenda de consultores</h1>
      <p className="mt-2 text-sm text-white/60">
        Envie diariamente o arquivo da agenda. A importação <strong className="text-white/85">substitui</strong>{' '}
        todos os registros anteriores (mesmo modelo dos chamados, com colunas como Recurso, Cliente, Datas,
        Horas, etc.).
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
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
          {loading ? 'Importando…' : 'Importar agenda'}
        </button>
      </form>
      {msg ? <p className="mt-4 rounded-lg bg-sky-500/15 p-4 text-sm text-sky-200">{msg}</p> : null}
      {err ? <p className="mt-4 rounded-lg bg-red-500/15 p-4 text-sm text-red-200">{err}</p> : null}
    </div>
  )
}
