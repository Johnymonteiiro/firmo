import { formatBRL, formatDate } from "@/lib/format"

/** Rótulos PT-BR para colunas (snake_case) que aparecem nos snapshots de auditoria. */
const FIELD_LABELS: Record<string, string> = {
  // contrato
  contrato: "Nº de contrato",
  processo: "Processo",
  fiscal_adm: "Fiscal Adm",
  fiscais_tec: "Fiscais Técnicos",
  empresa: "Empresa",
  objeto: "Objeto",
  gestor: "Gestor",
  status: "Status",
  ocorr_reajuste: "Ocorreu reajuste",
  valor_mes_pos_reajuste: "Valor após reajuste",
  mes_ano_reajuste: "Mês/Ano reajuste",
  obs: "Observação",
  start_date: "Início da vigência",
  venci_contrato: "Vencimento",
  valor_mensal: "Valor mensal",
  is_renewed: "Renovado",
  // empenho
  emp_contratada: "Empresa",
  sne: "SNE",
  data_sne: "Data SNE",
  process_empenho: "Processo",
  siafi: "SIAFI",
  valor_inicial_empenho: "Valor inicial",
  saldo_total: "Saldo total",
  contrato_id: "Contrato",
  // reforço
  valor_reforco: "Valor",
  data: "Data",
  reforcado_por: "Reforçado por",
  empenho_id: "Empenho",
  // faturamento
  sne_desc_1: "SNE Desconta 1",
  sne_desc_2: "SNE Desconta 2",
  valor_faturado_1: "Valor Faturado 1",
  valor_faturado_2: "Valor Faturado 2",
  competencia: "Competência",
  process_pag: "Processo de Pagamento",
  valor_ecom: "Valor Economizado",
  solici_pag: "Solicitação",
}

const MONEY_KEYS = new Set([
  "valor_mensal",
  "valor_mes_pos_reajuste",
  "valor_inicial_empenho",
  "saldo_total",
  "valor_reforco",
  "valor_faturado_1",
  "valor_faturado_2",
  "valor_ecom",
])

const DATE_KEYS = new Set([
  "start_date",
  "venci_contrato",
  "data_sne",
  "data",
  "created_at",
  "updated_at",
  "deleted_at",
])

/** Campos ignorados nas comparações/exibição. */
export const IGNORED_AUDIT_KEYS = new Set([
  "updated_at",
  "created_at",
  "deleted_at",
])

export function auditFieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/_/g, " ")
}

export function formatAuditValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "Sim" : "Não"
  if (MONEY_KEYS.has(key)) {
    const n = Number(value)
    return Number.isFinite(n) ? formatBRL(n) : String(value)
  }
  if (DATE_KEYS.has(key)) return formatDate(String(value))
  return String(value)
}
