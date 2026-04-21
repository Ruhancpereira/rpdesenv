import { labelCampoChamado } from './campoChamadoLabel'

/** camelCase (JSON API) → snake_case dos rótulos da planilha */
export function javaFieldToSnake(java: string): string {
  return java.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}

/** Colunas exibidas na lista, na mesma ordem dos campos da entidade Chamado na API. */
export const CHAMADO_COLUNAS_LISTAGEM: readonly string[] = [
  'id',
  'numeroChamado',
  'tipo',
  'cliente',
  'logomarca',
  'numRet',
  'consultor',
  'gerente',
  'areaIni',
  'areaAtend',
  'tipoCha',
  'bancadaAtend',
  'dataAbre',
  'hrsOrc',
  'hrsEfe',
  'cobAprov',
  'dias',
  'userSuporte',
  'staAtiv',
  'nota',
  'categoria',
  'tipoProb',
  'dataEncAgro',
  'dataEncCli',
  'mes',
  'ano',
  'mesNum',
  'dataEncAtiv',
  'chaInt',
  'grupo',
  'userCliente',
  'titulo',
  'dataSla',
  'prioridade',
  'tipoPrior',
  'vlrPrior',
  'dataUltRet',
  'areaMae',
  'nivelAtend',
  'qttransf',
  'hrsreal',
  'motivoIns',
  'createdAt',
  'updatedAt',
]

export function labelColunaListagem(javaKey: string): string {
  switch (javaKey) {
    case 'id':
      return 'ID'
    case 'numeroChamado':
      return 'Nº chamado'
    case 'createdAt':
      return 'Criado em'
    case 'updatedAt':
      return 'Atualizado em'
    default:
      return labelCampoChamado(javaFieldToSnake(javaKey))
  }
}

export function formatValorCelula(v: unknown): string {
  if (v == null || v === '') return ''
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
    return String(v)
  }
  if (Array.isArray(v)) {
    return v.join('-')
  }
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}
