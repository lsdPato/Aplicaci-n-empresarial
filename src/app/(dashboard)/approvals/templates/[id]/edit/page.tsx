import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { getTemplate } from "@/actions/approvals"
import { listUsers } from "@/actions/users"
import { TemplateForm } from "@/components/approvals/template-form"

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "approvals", "canEdit")) redirect("/dashboard/approvals")

  const [template, users] = await Promise.all([getTemplate(id), listUsers()])
  if (!template) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar plantilla</h1>
      <TemplateForm template={template} users={users} />
    </div>
  )
}
