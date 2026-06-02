import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { z } from "zod"
import { apiFetch } from "@/lib/api"
import {
  optionalDecimal,
  optionalProcess,
  optionalSne,
  periodSchema,
} from "@/lib/validation"

/** Espelha o BillingResponseDto (faturamento) do backend. */
export interface Billing {
  billingId: string
  contractId: string
  contractedCompany: string
  period: string
  sneDeduction1: string | null
  sneDeduction2: string | null
  billedAmount1: string | null
  billedAmount2: string | null
  savedAmount: string | null
  paymentProcessNumber: string | null
  paymentRequestNumber: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export const createBillingSchema = z.object({
  contractId: z.string().min(1, "Selecione o contrato"),
  period: periodSchema(),
  sneDeduction1: optionalSne("SNE", 1990),
  billedAmount1: optionalDecimal(),
  sneDeduction2: optionalSne("SNE", 1990),
  billedAmount2: optionalDecimal(),
  savedAmount: optionalDecimal(),
  paymentProcessNumber: optionalProcess(),
  paymentRequestNumber: optionalSne("Solicitação", 2000),
  notes: z.string().optional(),
})

export type CreateBillingFormValues = z.infer<typeof createBillingSchema>

export interface CreateBillingInput {
  contractId: string
  period: string
  sneDeduction1?: string | null
  billedAmount1?: string | null
  sneDeduction2?: string | null
  billedAmount2?: string | null
  savedAmount?: string | null
  paymentProcessNumber?: string | null
  paymentRequestNumber?: string | null
  notes?: string | null
}

export interface ListBillingsResponse {
  data: Billing[]
  total: number
  page: number
  pageSize: number
}

export interface ListBillingsParams {
  page?: number
  pageSize?: number
  contractId?: string
}

export function listBillings({
  page = 1,
  pageSize = 20,
  contractId,
}: ListBillingsParams = {}): Promise<ListBillingsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  if (contractId) params.set("contractId", contractId)
  return apiFetch<ListBillingsResponse>(`/billings?${params.toString()}`)
}

export function createBilling(
  input: CreateBillingInput
): Promise<{ billingId: string }> {
  return apiFetch<{ billingId: string }>("/billings", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export const billingsKey = ["billings"] as const

export function useBillings(page: number, pageSize: number) {
  return useQuery({
    queryKey: [...billingsKey, page, pageSize],
    queryFn: () => listBillings({ page, pageSize }),
    placeholderData: (prev) => prev,
  })
}

export function useCreateBilling() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBilling,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingsKey })
    },
  })
}
