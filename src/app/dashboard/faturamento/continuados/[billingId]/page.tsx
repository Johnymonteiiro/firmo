import { BillingDetail } from "@/components/billings/billing-detail"

export default async function Page({
  params,
}: {
  params: Promise<{ billingId: string }>
}) {
  const { billingId } = await params
  return <BillingDetail billingId={billingId} />
}
