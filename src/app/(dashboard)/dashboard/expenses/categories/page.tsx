import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { listCategories, createCategoryFormAction, deleteCategoryAction } from "@/actions/expenses"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

export default async function CategoriesPage() {
  const user = await getCurrentUser()
  if (!user || !canAccess(user, "expenses", "canCreate")) redirect("/dashboard/expenses")

  const categories = await listCategories()

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Categorías de gastos</h1>
        <p className="text-muted-foreground">Gestiona las categorías para clasificar los gastos</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Nueva categoría</CardTitle></CardHeader>
        <CardContent>
          <form action={createCategoryFormAction} className="flex gap-3">
            <div className="flex-1 space-y-1">
              <Input name="name" placeholder="Ej: Infraestructura" required />
            </div>
            <div className="space-y-1">
              <Input name="color" type="color" className="w-16 h-10 p-1 cursor-pointer" defaultValue="#6366f1" title="Color" />
            </div>
            <Button type="submit">Crear</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sin categorías aún</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between rounded border px-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: cat.color ?? "#6366f1" }} />
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <form action={async () => { "use server"; await deleteCategoryAction(cat.id) }}>
                    <Button type="submit" variant="ghost" size="icon" className="text-destructive h-8 w-8">
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
