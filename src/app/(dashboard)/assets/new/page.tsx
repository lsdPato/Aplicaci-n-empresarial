import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { AssetForm } from "@/components/assets/asset-form"

export default async function NewAssetPage() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "assets", "canCreate")) redirect("/dashboard/assets")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nuevo activo digital</h1>
      <AssetForm />
    </div>
  )
}
