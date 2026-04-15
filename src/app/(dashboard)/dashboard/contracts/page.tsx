import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { listContracts, deleteContractAction } from "@/actions/contracts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, FileText, ExternalLink } from "lucide-react"

const typeLabel: Record<string, string> = { SERVICE: "Servicio", NDA: "NDA", EMPLOYMENT: "Empleo", PARTNERSHIP: "Asociación", OTHER: "Otro" }
const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "destructive" }> = {
  DRAFT: { label: "Borrador", variant: "secondary" },
  ACTIVE: { label: "Activo", variant: "success" },
  EXPIRED: { label: "Vencido", variant: "destructive" },
  TERMINATED: { label: "Terminado", variant: "warning" },
}

export default async function ContractsPage() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "contracts", "canView")) redirect("/dashboard")

  const contracts = await listContracts()
  const canCreate = canAccess(user, "contracts", "canCreate")
  const canDelete = canAccess(user, "contracts", "canDelete")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contratos</h1>
          <p className="text-muted-foreground">{contracts.length} contratos</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/contracts/new"><Plus className="h-4 w-4" /> Nuevo contrato</Link>
          </Button>
        )}
      </div>

      {contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No hay contratos registrados</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Título</th>
                <th className="px-4 py-3 text-left font-medium">Contraparte</th>
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-left font-medium">Valor</th>
                <th className="px-4 py-3 text-left font-medium">Firma</th>
                <th className="px-4 py-3 text-left font-medium">Vencimiento</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-left font-medium">Archivo</th>
                {canDelete && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y">
              {contracts.map((c) => {
                const sc = statusConfig[c.status] ?? { label: c.status, variant: "secondary" as const }
                return (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.createdBy.name ?? c.createdBy.email}</p>
                    </td>
                    <td className="px-4 py-3">{c.counterparty}</td>
                    <td className="px-4 py-3">{typeLabel[c.type]}</td>
                    <td className="px-4 py-3">{formatCurrency(c.value?.toString())}</td>
                    <td className="px-4 py-3">{formatDate(c.signedDate)}</td>
                    <td className="px-4 py-3">{formatDate(c.expirationDate)}</td>
                    <td className="px-4 py-3"><Badge variant={sc.variant}>{sc.label}</Badge></td>
                    <td className="px-4 py-3">
                      {c.fileUrl ? (
                        <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline text-xs">
                          <ExternalLink className="h-3 w-3" /> Ver
                        </a>
                      ) : "—"}
                    </td>
                    {canDelete && (
                      <td className="px-4 py-3">
                        <form action={async () => { "use server"; await deleteContractAction(c.id) }}>
                          <Button type="submit" variant="ghost" size="sm" className="text-destructive">Eliminar</Button>
                        </form>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
