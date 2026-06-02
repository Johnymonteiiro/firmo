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
  adjustedMonthlyValue: string | null
  adjustmentMonthYear: string | null
  startDate: string
  expiresAt: string
  daysRemaining: number
  isExpired: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
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

export function createContract(
  input: CreateContractInput
): Promise<{ contractId: string }> {
  return apiFetch<{ contractId: string }>("/contract", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export const contractsKey = ["contracts"] as const

export function useContracts(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...contractsKey, page, pageSize],
    queryFn: () => listContracts({ page, pageSize }),
    placeholderData: (prev) => prev,
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
