import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { getProject } from "@/actions/projects"
import { ProjectForm } from "@/components/projects/project-form"

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "projects", "canEdit")) redirect("/dashboard/projects")

  const project = await getProject(id)
  if (!project) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar proyecto</h1>
      <ProjectForm project={project} />
    </div>
  )
}
