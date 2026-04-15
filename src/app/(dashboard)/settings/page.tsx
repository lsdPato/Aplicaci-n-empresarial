import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Shield } from "lucide-react"

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "settings", "canView")) redirect("/dashboard")

  const canManageUsers = canAccess(user, "settings", "canEdit")

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Administración del sistema</p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Gestión de usuarios
            </CardTitle>
            <CardDescription>Administra roles y permisos de los miembros del equipo</CardDescription>
          </CardHeader>
          <CardContent>
            {canManageUsers ? (
              <Button asChild>
                <Link href="/dashboard/settings/users">Gestionar usuarios</Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">No tienes permisos para gestionar usuarios.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Tu perfil
            </CardTitle>
            <CardDescription>Información de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium">Nombre:</span> {user.name ?? "—"}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Rol:</span> {user.role}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
