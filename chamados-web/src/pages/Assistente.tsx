import { useCallback, useEffect, useRef, useState } from 'react'
import { apiFetch } from '../lib/api'

type Msg = { role: 'user' | 'assistant'; content: string }

type ConversaResumo = { id: number; titulo: string; atualizadoEm: string }

export function Assistente() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [conversaId, setConversaId] = useState<number | null>(null)
  const [conversas, setConversas] = useState<ConversaResumo[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [apiOk, setApiOk] = useState<boolean | null>(null)
  const [provedor, setProvedor] = useState<string | null>(null)
  const [loadingLista, setLoadingLista] = useState(true)
  const [loadingConv, setLoadingConv] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const carregarLista = useCallback(() => {
    apiFetch('/api/assistant/conversas')
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        return r.json() as Promise<ConversaResumo[]>
      })
      .then(setConversas)
      .catch(() => setConversas([]))
      .finally(() => setLoadingLista(false))
  }, [])

  useEffect(() => {
    apiFetch('/api/assistant/status')
      .then((r) => r.json())
      .then((j: { disponivel: boolean; provedor?: string }) => {
        setApiOk(j.disponivel)
        setProvedor(j.provedor ?? null)
      })
      .catch(() => {
        setApiOk(false)
        setProvedor(null)
      })
  }, [])

  useEffect(() => {
    carregarLista()
  }, [carregarLista])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  const novaConversa = useCallback(() => {
    setConversaId(null)
    setMsgs([])
    setErr(null)
  }, [])

  const abrirConversa = useCallback((id: number) => {
    if (id === conversaId) return
    setLoadingConv(true)
    setErr(null)
    apiFetch(`/api/assistant/conversas/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        return r.json() as Promise<{ id: number; titulo: string; mensagens: Msg[] }>
      })
      .then((d) => {
        setConversaId(d.id)
        setMsgs(
          (d.mensagens ?? []).filter(
            (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string',
          ),
        )
      })
      .catch(() => setErr('Não foi possível carregar a conversa.'))
      .finally(() => setLoadingConv(false))
  }, [conversaId])

  const apagarConversa = useCallback(
    async (id: number, e: React.MouseEvent) => {
      e.stopPropagation()
      if (!window.confirm('Apagar esta conversa do histórico?')) return
      try {
        const r = await apiFetch(`/api/assistant/conversas/${id}`, { method: 'DELETE' })
        if (!r.ok) throw new Error()
        if (conversaId === id) novaConversa()
        carregarLista()
      } catch {
        setErr('Não foi possível apagar a conversa.')
      }
    },
    [carregarLista, conversaId, novaConversa],
  )

  const send = useCallback(async () => {
    const t = input.trim()
    if (!t || loading || loadingConv) return
    setErr(null)
    const next: Msg[] = [...msgs, { role: 'user', content: t }]
    setMsgs(next)
    setInput('')
    setLoading(true)
    try {
      const r = await apiFetch('/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({
          conversaId: conversaId ?? undefined,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const j = (await r.json().catch(() => ({}))) as { message?: string; conversaId?: number; erro?: string }
      if (!r.ok) {
        throw new Error(j.erro ?? r.statusText)
      }
      const message = j.message ?? ''
      const cid = j.conversaId
      if (typeof cid === 'number') setConversaId(cid)
      setMsgs([...next, { role: 'assistant', content: message }])
      carregarLista()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao enviar.')
      setMsgs(next)
    } finally {
      setLoading(false)
    }
  }, [input, loading, loadingConv, msgs, conversaId, carregarLista])

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Assistente</h1>
        <p className="mt-1 text-sm text-white/55">
          Conversa integrada no Agrosys: consulta chamados, dashboards e agenda com base nos dados
          importados.
        </p>
        {apiOk === false ? (
          <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100/90">
            Assistente indisponível: coloca <code className="text-xs">ANTHROPIC_API_KEY=…</code> num ficheiro{' '}
            <code className="text-xs">.env</code> na raiz do projeto ou em <code className="text-xs">chamados-api/</code>{' '}
            (a API carrega-o ao arrancar), ou define a variável no IDE / sistema. Vê{' '}
            <code className="text-xs">chamados-api/env.example</code>.
          </p>
        ) : null}
        {apiOk === true ? (
          <p className="mt-2 text-xs text-emerald-400/80">
            Motor configurado · provedor:{' '}
            <span className="font-medium text-emerald-300">
              {provedor === 'anthropic'
                ? 'Claude (Anthropic)'
                : provedor === 'openai'
                  ? 'OpenAI'
                  : provedor === 'gemini'
                    ? 'Gemini (Google)'
                    : provedor}
            </span>
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        <aside className="flex w-full shrink-0 flex-col rounded-2xl border border-white/10 bg-black/20 md:w-56">
          <div className="border-b border-white/10 p-3">
            <button
              type="button"
              onClick={novaConversa}
              className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-agro-accent hover:bg-white/15"
            >
              Nova conversa
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto p-2 md:max-h-[min(70vh,560px)]">
            {loadingLista ? (
              <p className="px-2 py-3 text-xs text-white/40">A carregar histórico…</p>
            ) : conversas.length === 0 ? (
              <p className="px-2 py-3 text-xs text-white/40">Nenhuma conversa guardada.</p>
            ) : (
              <ul className="space-y-1">
                {conversas.map((c) => (
                  <li key={c.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => abrirConversa(c.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          abrirConversa(c.id)
                        }
                      }}
                      className={`group flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 text-left text-sm ${
                        conversaId === c.id ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/5'
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate" title={c.titulo}>
                        {c.titulo}
                      </span>
                      <button
                        type="button"
                        className="shrink-0 text-xs text-white/35 opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100"
                        title="Apagar"
                        onClick={(e) => void apagarConversa(c.id, e)}
                      >
                        ✕
                      </button>
                    </div>
                    <p className="px-2 pb-1 text-[10px] text-white/30">
                      {new Date(c.atualizadoEm).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <div className="flex min-h-[420px] min-w-0 flex-1 flex-col rounded-2xl border border-white/10 bg-black/25">
          {loadingConv ? (
            <p className="p-4 text-sm text-white/45">A carregar conversa…</p>
          ) : null}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.length === 0 && !loadingConv ? (
              <p className="text-sm text-white/40">
                Ex.: «Quantos chamados temos?», «Resume a agenda por recurso». Escolhe uma conversa à esquerda ou
                inicia uma nova.
              </p>
            ) : null}
            {msgs.map((m, i) => (
              <div
                key={`${conversaId ?? 'new'}-${i}-${m.role}`}
                className={`max-w-[95%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'ml-auto bg-agro-accent/25 text-white'
                    : 'mr-auto border border-white/10 bg-white/5 text-white/90'
                }`}
              >
                <span className="mb-1 block text-[10px] uppercase tracking-wide text-white/35">
                  {m.role === 'user' ? 'Tu' : 'Assistente'}
                </span>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
            {loading ? <p className="text-sm text-white/45">A pensar…</p> : null}
            <div ref={bottomRef} />
          </div>
          {err ? <p className="border-t border-white/10 px-4 py-2 text-sm text-red-300">{err}</p> : null}
          <div className="flex gap-2 border-t border-white/10 p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send()
                }
              }}
              rows={2}
              placeholder="Escreve a tua pergunta…"
              className="min-h-[44px] flex-1 resize-y rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-agro-accent"
              disabled={loading || loadingConv || apiOk === false}
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={loading || loadingConv || !input.trim() || apiOk === false}
              className="shrink-0 self-end rounded-xl bg-agro-accent px-4 py-2 text-sm font-medium text-agro-950 disabled:opacity-40"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
