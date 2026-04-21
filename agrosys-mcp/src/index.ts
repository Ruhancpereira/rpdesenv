#!/usr/bin/env node
/**
 * MCP stdio — acesso à API Agrosys (chamados-api): chamados, dashboards, meta, import, agenda.
 *
 * Autenticação (Spring Security exige JWT em /api/**):
 *   - AGROSYS_JWT=bearer...  OU
 *   - AGROSYS_USERNAME + AGROSYS_PASSWORD (login automático e cache do token)
 *
 * Base URL: AGROSYS_API_BASE_URL (fallback: AGENDA_API_BASE_URL, default http://localhost:8080)
 *
 * Cursor MCP (~/.cursor/mcp.json):
 * {
 *   "mcpServers": {
 *     "agrosys": {
 *       "command": "node",
 *       "args": ["/CAMINHO/Agrosys/agrosys-mcp/dist/index.js"],
 *       "env": {
 *         "AGROSYS_API_BASE_URL": "http://localhost:8080",
 *         "AGROSYS_USERNAME": "admin",
 *         "AGROSYS_PASSWORD": "sua-senha"
 *       }
 *     }
 *   }
 * }
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import * as z from 'zod/v4'

const base = (
  process.env.AGROSYS_API_BASE_URL ??
  process.env.AGENDA_API_BASE_URL ??
  'http://localhost:8080'
).replace(/\/$/, '')

let cachedJwt: string | null = process.env.AGROSYS_JWT?.trim() || null

async function loginIfNeeded(): Promise<void> {
  if (cachedJwt) return
  const u = process.env.AGROSYS_USERNAME?.trim()
  const p = process.env.AGROSYS_PASSWORD
  if (!u || p === undefined || p === '') return
  const r = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username: u, password: p }),
  })
  const text = await r.text()
  let body: { token?: string } = {}
  try {
    body = text ? JSON.parse(text) : {}
  } catch {
    /* ignore */
  }
  if (!r.ok || !body.token) {
    throw new Error(`Login falhou (${r.status}): ${text.slice(0, 200)}`)
  }
  cachedJwt = body.token
}

function authHeaders(): HeadersInit {
  const h: Record<string, string> = { Accept: 'application/json' }
  if (cachedJwt) {
    h['Authorization'] = `Bearer ${cachedJwt}`
  }
  return h
}

async function apiGet(path: string, retry401 = true): Promise<unknown> {
  await loginIfNeeded()
  const r = await fetch(`${base}${path}`, { headers: authHeaders() })
  if (r.status === 401 && retry401 && process.env.AGROSYS_USERNAME) {
    cachedJwt = process.env.AGROSYS_JWT?.trim() || null
    await loginIfNeeded()
    return apiGet(path, false)
  }
  const text = await r.text()
  let body: unknown
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }
  if (!r.ok) {
    throw new Error(`HTTP ${r.status} ${path}: ${typeof body === 'string' ? body : JSON.stringify(body)}`)
  }
  return body
}

async function apiPost(
  path: string,
  json: Record<string, unknown>,
  retry401 = true,
): Promise<{ status: number; body: unknown }> {
  await loginIfNeeded()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...Object.fromEntries(
      Object.entries(authHeaders() as Record<string, string>).filter(([k]) => k !== 'Content-Type'),
    ),
  }
  const r = await fetch(`${base}${path}`, { method: 'POST', headers, body: JSON.stringify(json) })
  if (r.status === 401 && retry401 && process.env.AGROSYS_USERNAME) {
    cachedJwt = process.env.AGROSYS_JWT?.trim() || null
    await loginIfNeeded()
    return apiPost(path, json, false)
  }
  const text = await r.text()
  let body: unknown
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }
  return { status: r.status, body }
}

function textResult(data: unknown): { content: Array<{ type: 'text'; text: string }> } {
  return {
    content: [{ type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }],
  }
}

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const u = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      u.set(k, String(v))
    }
  }
  const s = u.toString()
  return s ? `?${s}` : ''
}

const empty = z.object({})

const queryStringRecord = z.record(z.string(), z.string()).optional()

const criarBodySchema = z
  .object({
    recurso: z.string().optional(),
    cliente: z.string().optional(),
    local: z.string().optional(),
    sedeAgrosys: z.string().optional(),
    status: z.string().optional(),
    passagem: z.string().optional(),
    aprovador: z.string().optional(),
    dataInicio: z.string().optional(),
    dataFinal: z.string().optional(),
    atividade: z.string().optional(),
    horas: z.number().optional(),
    alocadoPor: z.string().optional(),
  })
  .strict()

const server = new McpServer({
  name: 'agrosys-api',
  version: '2.0.0',
})

server.registerTool(
  'agrosys_conexao',
  {
    description:
      'Verifica se a API responde e se há JWT (credenciais em env ou login). Útil antes de análises longas.',
    inputSchema: empty,
  },
  async () => {
    const temEnvJwt = Boolean(process.env.AGROSYS_JWT?.trim())
    const temUserPass = Boolean(process.env.AGROSYS_USERNAME && process.env.AGROSYS_PASSWORD)
    try {
      await loginIfNeeded()
      await apiGet('/api/meta/colunas-filtro')
      return textResult({
        ok: true,
        baseUrl: base,
        autenticado: Boolean(cachedJwt),
        modoCredencial: temEnvJwt ? 'AGROSYS_JWT' : temUserPass ? 'AGROSYS_USERNAME/PASSWORD' : 'nenhum (vai falhar em /api/**)',
      })
    } catch (e) {
      return textResult({
        ok: false,
        baseUrl: base,
        erro: String(e),
        dica: 'Defina AGROSYS_JWT ou AGROSYS_USERNAME + AGROSYS_PASSWORD (app.admin no application.properties).',
      })
    }
  },
)

server.registerTool(
  'meta_colunas_filtro',
  {
    description: 'Metadados das colunas de filtro dos chamados (ids, labels, tipo de controle).',
    inputSchema: empty,
  },
  async () => textResult(await apiGet('/api/meta/colunas-filtro')),
)

server.registerTool(
  'meta_opcoes_filtro',
  {
    description: 'Valores distintos por coluna nos chamados (planilha importada).',
    inputSchema: empty,
  },
  async () => textResult(await apiGet('/api/meta/opcoes-filtro')),
)

server.registerTool(
  'chamados_listar',
  {
    description:
      'Lista paginada de chamados. Passe query com parâmetros de filtro (mesmos nomes da API) + page, size, sort, direction.',
    inputSchema: z.object({
      query: queryStringRecord,
    }),
  },
  async (args) => {
    const q = (args as { query?: Record<string, string> }).query ?? {}
    return textResult(await apiGet(`/api/chamados${buildQuery(q)}`))
  },
)

server.registerTool(
  'chamados_movimentacoes',
  {
    description: 'Histórico de movimentações de um chamado pelo número.',
    inputSchema: z.object({
      numeroChamado: z.coerce.number(),
    }),
  },
  async (args) => {
    const n = (args as { numeroChamado: number }).numeroChamado
    return textResult(await apiGet(`/api/chamados/numero/${n}/movimentacoes`))
  },
)

server.registerTool(
  'dashboard_estrategico',
  {
    description: 'KPIs e visão estratégica (totais, distribuições).',
    inputSchema: empty,
  },
  async () => textResult(await apiGet('/api/dashboard/estrategico')),
)

server.registerTool(
  'dashboard_operacional',
  {
    description: 'Métricas operacionais dos chamados.',
    inputSchema: empty,
  },
  async () => textResult(await apiGet('/api/dashboard/operacional')),
)

server.registerTool(
  'dashboard_tatico',
  {
    description: 'Métricas táticas / volume temporal.',
    inputSchema: empty,
  },
  async () => textResult(await apiGet('/api/dashboard/tatico')),
)

server.registerTool(
  'import_historico',
  {
    description: 'Histórico de importações de planilha de chamados.',
    inputSchema: empty,
  },
  async () => textResult(await apiGet('/api/import/historico')),
)

server.registerTool(
  'import_rollback_ultimo',
  {
    description:
      'DESFAZ a última importação de chamados (restaura estado anterior). Só usar se o utilizador confirmar explicitamente.',
    inputSchema: z.object({
      confirmar: z.literal(true),
    }),
  },
  async () => {
    const { status, body } = await apiPost('/api/import/rollback/ultimo', {})
    return textResult({ status, body })
  },
)

server.registerTool(
  'agenda_meta_marcacao',
  {
    description: 'Campos obrigatórios para criar linha de agenda via API.',
    inputSchema: empty,
  },
  async () => textResult(await apiGet('/api/agenda/meta/marcacao')),
)

server.registerTool(
  'agenda_opcoes_filtro',
  {
    description: 'Valores distintos por coluna na agenda importada.',
    inputSchema: empty,
  },
  async () => textResult(await apiGet('/api/agenda/opcoes-filtro')),
)

server.registerTool(
  'agenda_gantt',
  {
    description: 'Todas as alocações (Gantt): recursos, datas, clientes, horas.',
    inputSchema: empty,
  },
  async () => textResult(await apiGet('/api/agenda/gantt')),
)

server.registerTool(
  'agenda_dashboard',
  {
    description: 'Agregados da agenda (horas por recurso, cliente, status).',
    inputSchema: empty,
  },
  async () => textResult(await apiGet('/api/agenda/dashboard')),
)

server.registerTool(
  'agenda_criar_marcacao',
  {
    description:
      'POST /api/agenda/alocacao — nova linha de agenda. 400 devolve camposFaltando. dataFinal opcional.',
    inputSchema: criarBodySchema,
  },
  async (args) => {
    const body = args as z.infer<typeof criarBodySchema>
    const clean: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(body)) {
      if (v !== undefined && v !== '') {
        clean[k] = v
      }
    }
    const { status, body: res } = await apiPost('/api/agenda/alocacao', clean)
    if (status === 400) {
      return textResult({
        ok: false,
        status,
        detalhe: res,
        instrucao:
          'Pedir ao utilizador os campos em camposFaltando e repetir agenda_criar_marcacao com o objeto completo.',
      })
    }
    if (status === 201) {
      return textResult({ ok: true, status, ...((res as object) ?? {}) })
    }
    return textResult({ ok: false, status, detalhe: res })
  },
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error(`[agrosys-mcp] stdio · ${base}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
