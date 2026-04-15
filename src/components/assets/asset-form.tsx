"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createAssetAction, updateAssetAction } from "@/actions/assets"
import { formatDateInput } from "@/lib/utils"
import type { ActionState } from "@/types"
import type { DigitalAsset } from "@/generated/prisma"

const initial: ActionState = { success: false }

export function AssetForm({ asset }: { asset?: DigitalAsset }) {
  const action = asset ? updateAssetAction : createAssetAction
  const [state, formAction, isPending] = useActionState(action, initial)

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>{asset ? "Editar activo" : "Nuevo activo digital"}</CardTitle></CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {asset && <input type="hidden" name="id" value={asset.id} />}
          {state.error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" name="name" defaultValue={asset?.name} required />
              {state.fieldErrors?.name && <p className="text-xs text-destructive">{state.fieldErrors.name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select name="type" defaultValue={asset?.type ?? "DOMAIN"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOMAIN">Dominio</SelectItem>
                  <SelectItem value="HOSTING">Hosting</SelectItem>
                  <SelectItem value="LICENSE">Licencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Proveedor *</Label>
              <Input id="provider" name="provider" defaultValue={asset?.provider} required />
              {state.fieldErrors?.provider && <p className="text-xs text-destructive">{state.fieldErrors.provider[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select name="status" defaultValue={asset?.status ?? "ACTIVE"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="EXPIRED">Vencido</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Costo (USD)</Label>
              <Input id="cost" name="cost" type="number" step="0.01" min="0" defaultValue={asset?.cost?.toString()} />
            </div>
            <div className="space-y-2">
              <Label>Ciclo de facturación</Label>
              <Select name="billingCycle" defaultValue={asset?.billingCycle ?? ""}>
                <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Mensual</SelectItem>
                  <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                  <SelectItem value="ANNUAL">Anual</SelectItem>
                  <SelectItem value="ONE_TIME">Único pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expirationDate">Fecha de vencimiento</Label>
              <Input id="expirationDate" name="expirationDate" type="date"
                defaultValue={formatDateInput(asset?.expirationDate)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alertDays">Alertar N días antes</Label>
              <Input id="alertDays" name="alertDays" type="number" min="1" max="365"
                defaultValue={asset?.alertDays?.toString() ?? "30"} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" type="url" placeholder="https://" defaultValue={asset?.url ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" name="notes" rows={2} defaultValue={asset?.notes ?? ""} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : asset ? "Actualizar" : "Crear activo"}
            </Button>
            <Button type="button" variant="outline" onClick={() => history.back()}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
