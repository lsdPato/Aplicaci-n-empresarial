import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { listTags, createTagFormAction, deleteTagAction } from "@/actions/expenses"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

export default async function TagsPage() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "expenses", "canCreate")) redirect("/dashboard/expenses")

  const tags = await listTags()

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Etiquetas</h1>
        <p className="text-muted-foreground">
          Las etiquetas permiten clasificar y filtrar transacciones libremente
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Nueva etiqueta</CardTitle></CardHeader>
        <CardContent>
          <form action={createTagFormAction} className="flex gap-3">
            <div className="flex-1">
              <Input name="name" placeholder="Ej: Marketing, Nómina, Ventas..." required />
            </div>
            <div>
              <Input
                name="color"
                type="color"
                className="w-16 h-10 p-1 cursor-pointer"
                defaultValue="#6366f1"
                title="Color"
              />
            </div>
            <Button type="submit">Crear</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sin etiquetas aún</p>
          ) : (
            <ul className="space-y-2">
              {tags.map((tag) => (
                <li key={tag.id} className="flex items-center justify-between rounded border px-4 py-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium">{tag.name}</span>
                  </div>
                  <form action={async () => { "use server"; await deleteTagAction(tag.id) }}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
