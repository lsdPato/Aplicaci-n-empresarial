import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { listUsers } from "@/actions/users"
import { TemplateForm } from "@/components/approvals/template-form"

export default async function NewTemplatePage() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "approvals", "canCreate")) redirect("/dashboard/approvals")

  const users = await listUsers()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nueva plantilla de aprobación</h1>
      <TemplateForm users={users} />
    </div>
  )
}
