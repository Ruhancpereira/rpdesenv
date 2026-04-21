import type { Chart as ChartType } from 'chart.js'
import type { NavigateFunction } from 'react-router-dom'

/** Parâmetros de query aceitos pela API / lista (campos com filtro). */
export type ParamLista =
  | 'sta_ativ'
  | 'area_atend'
  | 'tipo_cha'
  | 'consultor'
  | 'bancada_atend'
  | 'area_ini'
  | 'gerente'
  | 'prioridade'

/**
 * Handlers Chart.js: clique no segmento/barra navega para Lista & filtros com o campo já preenchido.
 */
export function chartNavigateLista(navigate: NavigateFunction, param: ParamLista) {
  return {
    onHover: (_e: unknown, elements: unknown[], chart: ChartType) => {
      const canvas = chart.canvas
      if (canvas) {
        canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default'
      }
    },
    onClick: (_e: unknown, elements: { index: number }[], chart: ChartType) => {
      if (!elements?.length) {
        return
      }
      const idx = elements[0].index
      const labels = chart.data.labels
      if (!labels || idx < 0 || idx >= labels.length) {
        return
      }
      const raw = labels[idx]
      const label = typeof raw === 'string' ? raw : String(raw)
      if (label === '(vazio)') {
        return
      }
      const q = new URLSearchParams()
      q.set(param, label)
      q.set('page', '0')
      navigate(`/chamados?${q.toString()}`)
    },
  }
}

export function navigateListaComFiltro(navigate: NavigateFunction, param: ParamLista, valor: string) {
  if (!valor || valor === '(vazio)') {
    return
  }
  const q = new URLSearchParams()
  q.set(param, valor)
  q.set('page', '0')
  navigate(`/chamados?${q.toString()}`)
}
