import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, setToken } from '../lib/api'

export function Login() {
  const nav = useNavigate()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('agrosys123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        setError('Usuário ou senha inválidos.')
        return
      }
      const data = (await res.json()) as { token: string }
      setToken(data.token)
      nav('/dashboard/estrategico', { replace: true })
    } catch {
      setError('Não foi possível conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-agro-900/60 p-8 shadow-2xl backdrop-blur-md">
        <h1 className="font-display text-2xl font-semibold text-white">Entrar</h1>
        <p className="mt-1 text-sm text-white/55">Dashboards de chamados Agrosys</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-white/45">
              Usuário
            </label>
            <input
              className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 text-white outline-none ring-agro-accent focus:ring-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-white/45">
              Senha
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 text-white outline-none ring-agro-accent focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-agro-accent py-3 font-medium text-agro-950 transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
