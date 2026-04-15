import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { listUsers, updateUserRoleFormAction, toggleUserActive } from "@/actions/users"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate } from "@/lib/utils"

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  DIRECTOR: "Director",
  MEMBER: "Miembro",
  VIEWER: "Observador",
}

export default async function UsersPage() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "settings", "canEdit")) redirect("/dashboard/settings")
  if (user.role !== "ADMIN") redirect("/dashboard/settings")

  const users = await listUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">{users.length} usuarios registrados</p>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Usuario</th>
              <th className="px-4 py-3 text-left font-medium">Rol</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Registrado</th>
              <th className="px-4 py-3 text-left font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{u.name ?? "Sin nombre"}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  {u.id === user.id ? (
                    <Badge>{roleLabels[u.role]}</Badge>
                  ) : (
                    <form action={updateUserRoleFormAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <div className="flex items-center gap-2">
                        <Select name="role" defaultValue={u.role}>
                          <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="DIRECTOR">Director</SelectItem>
                            <SelectItem value="MEMBER">Miembro</SelectItem>
                            <SelectItem value="VIEWER">Observador</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button type="submit" size="sm" variant="outline" className="h-8 text-xs">
                          Guardar
                        </Button>
                      </div>
                    </form>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.isActive ? "success" : "secondary"}>
                    {u.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  {u.id !== user.id && (
                    <form action={async () => { "use server"; await toggleUserActive(u.id) }}>
                      <Button type="submit" variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                        {u.isActive ? "Desactivar" : "Activar"}
                      </Button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
