import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { listAssets, deleteAssetAction } from "@/actions/assets"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExpiryBadge } from "@/components/assets/expiry-badge"
import { formatCurrency } from "@/lib/utils"
import { Plus, Monitor } from "lucide-react"

const typeLabel: Record<string, string> = { DOMAIN: "Dominio", HOSTING: "Hosting", LICENSE: "Licencia" }
const billingLabel: Record<string, string> = { MONTHLY: "Mensual", QUARTERLY: "Trimestral", ANNUAL: "Anual", ONE_TIME: "Único pago" }

export default async function AssetsPage() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "assets", "canView")) redirect("/dashboard")

  const assets = await listAssets()
  const canCreate = canAccess(user, "assets", "canCreate")
  const canDelete = canAccess(user, "assets", "canDelete")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activos Digitales</h1>
          <p className="text-muted-foreground">{assets.length} activos registrados</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/assets/new"><Plus className="h-4 w-4" /> Nuevo activo</Link>
          </Button>
        )}
      </div>

      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Monitor className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No hay activos registrados</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-left font-medium">Proveedor</th>
                <th className="px-4 py-3 text-left font-medium">Costo</th>
                <th className="px-4 py-3 text-left font-medium">Ciclo</th>
                <th className="px-4 py-3 text-left font-medium">Vencimiento</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                {canDelete && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y">
              {assets.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{a.name}</p>
                    {a.url && <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-xs block">{a.url}</a>}
                  </td>
                  <td className="px-4 py-3">{typeLabel[a.type]}</td>
                  <td className="px-4 py-3">{a.provider}</td>
                  <td className="px-4 py-3">{formatCurrency(a.cost?.toString())}</td>
                  <td className="px-4 py-3">{a.billingCycle ? billingLabel[a.billingCycle] : "—"}</td>
                  <td className="px-4 py-3">
                    <ExpiryBadge expirationDate={a.expirationDate} alertDays={a.alertDays} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={a.status === "ACTIVE" ? "success" : a.status === "EXPIRED" ? "destructive" : "secondary"}>
                      {a.status === "ACTIVE" ? "Activo" : a.status === "EXPIRED" ? "Vencido" : "Cancelado"}
                    </Badge>
                  </td>
                  {canDelete && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/assets/new?edit=${a.id}`}>Editar</Link>
                        </Button>
                        <form action={async () => { "use server"; await deleteAssetAction(a.id) }}>
                          <Button type="submit" variant="ghost" size="sm" className="text-destructive">Eliminar</Button>
                        </form>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
