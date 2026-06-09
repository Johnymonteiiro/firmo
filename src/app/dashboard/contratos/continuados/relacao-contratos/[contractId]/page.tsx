import { ContractDetail } from "@/components/contracts/contract-detail"

export default async function Page({
  params,
}: {
  params: Promise<{ contractId: string }>
}) {
  const { contractId } = await params
  return <ContractDetail contractId={contractId} />
}
