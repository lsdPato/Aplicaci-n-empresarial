import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { ProjectForm } from "@/components/projects/project-form"

export default async function NewProjectPage() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "projects", "canCreate")) redirect("/dashboard/projects")
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nuevo proyecto</h1>
      <ProjectForm />
    </div>
  )
}
