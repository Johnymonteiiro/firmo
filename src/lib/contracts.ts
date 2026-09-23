import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { apiFetch } from "@/lib/api"
import { useFeedbackMutation } from "@/lib/feedback"
import {
  contractNumberSchema,
  decimalSchema,
  processSchema,
} from "@/lib/validation"

export type ContractStatus = "VIGENTE" | "ENCERRADO" | "EXPIRADO"

export type AdjustmentType = "SIM" | "NAO"

/**
 * Responsável por um papel do contrato. `userId` é `null` nos contratos
 * anteriores à FK contrato ↔ usuário: neles `name` é o texto legado, única
 * informação disponível até alguém atribuir um usuário de verdade.
 */
export interface ContractUserRef {
  userId: string | null
  name: string
}

/** Contrato legado naquele papel — sem vínculo com usuário cadastrado. */
export function isUnlinked(ref: ContractUserRef): boolean {
  return ref.userId === null
}

/**
 * Um reajuste do histórico: o valor mensal a partir daquela competência. O
 * contrato pode ter vários, e é o mais recente até a data analisada que vale.
 */
export interface ContractAdjustment {
  /** "MM/AAAA". */
  monthYear: string
  /** Já formatado em BRL pelo backend. */
  monthlyValue: string
}

/** Espelha o ContractResponseDto do backend (campos usados na UI). */
export interface Contract {
  contractId: string
  contractNumber: string
  processNumber: string
  /** Contrato legado devolve um único item com o texto inteiro em `name`. */
  adminFiscals: ContractUserRef[]
  techFiscals: ContractUserRef[]
  company: string
  subject: string
  managers: ContractUserRef[]
  status: ContractStatus
  hasAdjustment: AdjustmentType
  monthlyValue: string
  effectiveMonthlyValue: string
  currentYearAnnualValue: string
  /** Espelho do reajuste mais recente — a lista é a fonte da verdade. */
  adjustedMonthlyValue: string | null
  adjustmentMonthYear: string | null
  /** Histórico de reajustes, da vigência mais antiga para a mais recente. */
  adjustments: ContractAdjustment[]
  startDate: string
  expiresAt: string
  daysRemaining: number
  isExpired: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

/** Body aceito pelo POST /contract — papéis por ID de usuário. */
export interface CreateContractInput {
  contractNumber: string
  processNumber: string
  adminFiscalIds: string[]
  techFiscalIds: string[]
  company: string
  subject: string
  managerIds: string[]
  startDate: string
  expiresAt: string
  monthlyValue: string
  notes?: string | null
}

/**
 * Validação do form de criação, espelhando os formatos do backend.
 * Contrato novo exige usuário cadastrado nos três papéis — o texto livre só
 * sobrevive nos contratos anteriores à FK.
 */
export const createContractSchema = z
  .object({
    contractNumber: contractNumberSchema(),
    processNumber: processSchema(),
    adminFiscalIds: z
      .array(z.string())
      .min(1, "Selecione ao menos um fiscal administrativo"),
    techFiscalIds: z
      .array(z.string())
      .min(1, "Selecione ao menos um fiscal técnico"),
    company: z.string().trim().min(1, "Informe a empresa"),
    subject: z.string().trim().min(1, "Informe o objeto"),
    managerIds: z.array(z.string()).min(1, "Selecione ao menos um gestor"),
    startDate: z.string().min(1, "Informe a data de início"),
    expiresAt: z.string().min(1, "Informe o vencimento"),
    monthlyValue: decimalSchema(),
    notes: z.string().optional(),
  })
  .refine((d) => !d.startDate || !d.expiresAt || d.expiresAt >= d.startDate, {
    message: "O vencimento deve ser maior ou igual à data de início",
    path: ["expiresAt"],
  })

export type CreateContractFormValues = z.infer<typeof createContractSchema>

/**
 * Edição (PATCH parcial). `contractNumber`/`processNumber` NÃO são editáveis
 * no backend (imutáveis) e não entram aqui.
 *
 * Os papéis são opcionais: num contrato legado eles chegam vazios e continuam
 * vazios enquanto ninguém atribuir um usuário. Papel já vinculado nunca volta
 * a ficar vazio — o picker não oferece limpar —, então "vazio" só significa
 * "segue sem vínculo".
 */
export const updateContractSchema = z
  .object({
    company: z.string().trim().min(1, "Informe a empresa"),
    subject: z.string().trim().min(1, "Informe o objeto"),
    managerIds: z.array(z.string()),
    adminFiscalIds: z.array(z.string()),
    techFiscalIds: z.array(z.string()),
    startDate: z.string().min(1, "Informe a data de início"),
    expiresAt: z.string().min(1, "Informe o vencimento"),
    monthlyValue: decimalSchema(),
    notes: z.string().optional(),
  })
  .refine((d) => !d.startDate || !d.expiresAt || d.expiresAt >= d.startDate, {
    message: "O vencimento deve ser maior ou igual à data de início",
    path: ["expiresAt"],
  })

export type UpdateContractFormValues = z.infer<typeof updateContractSchema>

/**
 * Body do PATCH. Os papéis só entram quando o usuário efetivamente escolheu
 * outro responsável — o backend recusa (422) reescrever o texto legado de um
 * papel já vinculado, e reenviar o mesmo ID à toa gera ruído na auditoria.
 * Reajuste não entra aqui: tem rota própria (`POST /contract/:id/adjustments`)
 * e a ação "Reajustar valor mensal" na tabela.
 */
export type UpdateContractInput = Omit<
  UpdateContractFormValues,
  "notes" | "managerIds" | "adminFiscalIds" | "techFiscalIds"
> & {
  notes?: string | null
  managerIds?: string[]
  adminFiscalIds?: string[]
  techFiscalIds?: string[]
}

/** Formulário de reajuste — o MonthPicker entrega "yyyy-MM". */
export const adjustContractSchema = z.object({
  monthlyValue: decimalSchema("Informe o novo valor mensal"),
  period: z.string().min(1, "Informe o mês/ano de vigência"),
})

export type AdjustContractFormValues = z.infer<typeof adjustContractSchema>

export interface AdjustContractInput {
  monthlyValue: string
  /** "MM/AAAA", como o backend grava. */
  monthYear: string
}

export function adjustContract(
  contractId: string,
  input: AdjustContractInput
): Promise<Contract> {
  return apiFetch<Contract>(`/contract/${contractId}/adjustments`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export interface ListContractsResponse {
  data: Contract[]
  total: number
  page: number
  pageSize: number
}

export interface ListContractsParams {
  page?: number
  pageSize?: number
  /** Restringe aos contratos em que o usuário ocupa algum papel (RF-U06). */
  userId?: string
}

export function listContracts({
  page = 1,
  pageSize = 20,
  userId,
}: ListContractsParams = {}): Promise<ListContractsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  if (userId) params.set("userId", userId)
  return apiFetch<ListContractsResponse>(`/contract?${params.toString()}`)
}

export function getContract(contractId: string): Promise<Contract> {
  return apiFetch<Contract>(`/contract/${contractId}`)
}

export function createContract(
  input: CreateContractInput
): Promise<{ contractId: string }> {
  return apiFetch<{ contractId: string }>("/contract", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateContract(
  contractId: string,
  input: UpdateContractInput
): Promise<unknown> {
  return apiFetch(`/contract/${contractId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

/** Status definíveis manualmente (EXPIRADO é derivado da vigência). */
export type ContractStatusTarget = "VIGENTE" | "ENCERRADO"

export function changeContractStatus(
  contractId: string,
  status: ContractStatusTarget
): Promise<unknown> {
  return apiFetch(`/contract/${contractId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}

export function archiveContract(contractId: string): Promise<unknown> {
  return apiFetch(`/contract/${contractId}`, { method: "DELETE" })
}

export function listArchivedContracts({
  page = 1,
  pageSize = 20,
}: ListContractsParams = {}): Promise<ListContractsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  return apiFetch<ListContractsResponse>(
    `/contract/archived?${params.toString()}`
  )
}

export function unarchiveContract(contractId: string): Promise<unknown> {
  return apiFetch(`/contract/${contractId}/unarchive`, { method: "POST" })
}

export const contractsKey = ["contracts"] as const
export const contractsArchivedKey = ["contracts", "archived"] as const

export function useContracts(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...contractsKey, page, pageSize],
    queryFn: () => listContracts({ page, pageSize }),
    placeholderData: (prev) => prev,
  })
}

/**
 * Contratos sob responsabilidade do usuário (RF-U06). Uma página só: a tela do
 * perfil avisa quando `total` passa do teto em vez de paginar.
 */
export function useUserContracts(userId: string | null, pageSize = 100) {
  return useQuery({
    queryKey: [...contractsKey, "byUser", userId, pageSize],
    queryFn: () => listContracts({ userId: userId as string, pageSize }),
    enabled: !!userId,
  })
}

export function useContract(contractId: string | null) {
  return useQuery({
    queryKey: [...contractsKey, "detail", contractId],
    queryFn: () => getContract(contractId as string),
    enabled: !!contractId,
  })
}

export function useCreateContract() {
  return useFeedbackMutation({
    mutationFn: createContract,
    action: "criar",
    entity: "contrato",
    invalidate: [contractsKey],
  })
}

export function useUpdateContract() {
  return useFeedbackMutation({
    mutationFn: ({
      contractId,
      input,
    }: {
      contractId: string
      input: UpdateContractInput
    }) => updateContract(contractId, input),
    action: "editar",
    entity: "contrato",
    invalidate: [contractsKey],
  })
}

/**
 * O reajuste muda o valor vigente e, com ele, o Valor Economizado de todo
 * faturamento a partir daquela competência — daí invalidar faturamentos,
 * orçamentária e painel junto.
 */
export function useAdjustContract() {
  return useFeedbackMutation({
    mutationFn: ({
      contractId,
      input,
    }: {
      contractId: string
      input: AdjustContractInput
    }) => adjustContract(contractId, input),
    action: "reajustar",
    entity: "contrato",
    invalidate: [contractsKey, ["billings"], ["budget"], ["dashboard"]],
  })
}

export function useChangeContractStatus() {
  return useFeedbackMutation({
    mutationFn: ({
      contractId,
      status,
    }: {
      contractId: string
      status: ContractStatusTarget
    }) => changeContractStatus(contractId, status),
    action: "alterar-status",
    entity: "contrato",
    invalidate: [contractsKey],
  })
}

export function useArchiveContract() {
  return useFeedbackMutation({
    mutationFn: archiveContract,
    action: "arquivar",
    entity: "contrato",
    invalidate: [contractsKey],
  })
}

export function useArchivedContracts(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...contractsArchivedKey, page, pageSize],
    queryFn: () => listArchivedContracts({ page, pageSize }),
    placeholderData: (prev) => prev,
  })
}

export function useUnarchiveContract() {
  return useFeedbackMutation({
    mutationFn: unarchiveContract,
    action: "desarquivar",
    entity: "contrato",
    invalidate: [contractsKey],
  })
}
