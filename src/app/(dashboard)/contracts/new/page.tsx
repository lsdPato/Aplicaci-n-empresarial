import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { ContractForm } from "@/components/contracts/contract-form"

export default async function NewContractPage() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "contracts", "canCreate")) redirect("/dashboard/contracts")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nuevo contrato</h1>
      <ContractForm />
    </div>
  )
}
