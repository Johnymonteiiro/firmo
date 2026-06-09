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

/** Espelha o ContractResponseDto do backend (campos usados na UI). */
export interface Contract {
  contractId: string
  contractNumber: string
  processNumber: string
  adminFiscal: string
  techFiscals: string
  company: string
  subject: string
  manager: string
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

/** Body aceito pelo POST /contract. */
export interface CreateContractInput {
  contractNumber: string
  processNumber: string
  adminFiscal: string
  techFiscals: string
  company: string
  subject: string
  manager: string
  startDate: string
  expiresAt: string
  monthlyValue: string
  notes?: string | null
}

/** Validação do form de criação, espelhando os formatos do backend. */
export const createContractSchema = z
  .object({
    contractNumber: contractNumberSchema(),
    processNumber: processSchema(),
    adminFiscal: z.string().trim().min(1, "Informe o fiscal administrativo"),
    techFiscals: z.string().trim().min(1, "Informe os fiscais técnicos"),
    company: z.string().trim().min(1, "Informe a empresa"),
    subject: z.string().trim().min(1, "Informe o objeto"),
    manager: z.string().trim().min(1, "Informe o gestor"),
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
 */
export const updateContractSchema = z
  .object({
    company: z.string().trim().min(1, "Informe a empresa"),
    subject: z.string().trim().min(1, "Informe o objeto"),
    manager: z.string().trim().min(1, "Informe o gestor"),
    adminFiscal: z.string().trim().min(1, "Informe o fiscal administrativo"),
    techFiscals: z.string().trim().min(1, "Informe os fiscais técnicos"),
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
export type UpdateContractInput = Omit<UpdateContractFormValues, "notes"> & {
  notes?: string | null
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
