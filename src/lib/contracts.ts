import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { z } from "zod"
import { apiFetch } from "@/lib/api"
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

/** Espelha o ContractResponseDto do backend (campos usados na UI). */
export interface Contract {
  contractId: string
  contractNumber: string
  processNumber: string
  adminFiscal: ContractUserRef
  /** Contrato legado devolve um único item com o texto inteiro em `name`. */
  techFiscals: ContractUserRef[]
  company: string
  subject: string
  manager: ContractUserRef
  status: ContractStatus
  hasAdjustment: AdjustmentType
  monthlyValue: string
  effectiveMonthlyValue: string
  currentYearAnnualValue: string
  adjustedMonthlyValue: string | null
  adjustmentMonthYear: string | null
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
  adminFiscalId: string
  techFiscalIds: string[]
  company: string
  subject: string
  managerId: string
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
    adminFiscalId: z.string().min(1, "Selecione o fiscal administrativo"),
    techFiscalIds: z
      .array(z.string())
      .min(1, "Selecione ao menos um fiscal técnico"),
    company: z.string().trim().min(1, "Informe a empresa"),
    subject: z.string().trim().min(1, "Informe o objeto"),
    managerId: z.string().min(1, "Selecione o gestor"),
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
    managerId: z.string(),
    adminFiscalId: z.string(),
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
 */
export type UpdateContractInput = Omit<
  UpdateContractFormValues,
  "notes" | "managerId" | "adminFiscalId" | "techFiscalIds"
> & {
  notes?: string | null
  managerId?: string
  adminFiscalId?: string
  techFiscalIds?: string[]
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
}

export function listContracts({
  page = 1,
  pageSize = 20,
}: ListContractsParams = {}): Promise<ListContractsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
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

export function useContract(contractId: string | null) {
  return useQuery({
    queryKey: [...contractsKey, "detail", contractId],
    queryFn: () => getContract(contractId as string),
    enabled: !!contractId,
  })
}

export function useCreateContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractsKey })
    },
  })
}

export function useUpdateContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      contractId,
      input,
    }: {
      contractId: string
      input: UpdateContractInput
    }) => updateContract(contractId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractsKey })
    },
  })
}

export function useChangeContractStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      contractId,
      status,
    }: {
      contractId: string
      status: ContractStatusTarget
    }) => changeContractStatus(contractId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractsKey })
    },
  })
}

export function useArchiveContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: archiveContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractsKey })
    },
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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unarchiveContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractsKey })
    },
  })
}
