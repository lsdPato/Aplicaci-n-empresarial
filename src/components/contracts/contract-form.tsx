"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createContractAction, updateContractAction } from "@/actions/contracts"
import { formatDateInput } from "@/lib/utils"
import type { ActionState } from "@/types"
import type { Contract } from "@/generated/prisma"
import { Upload } from "lucide-react"

const initial: ActionState = { success: false }

export function ContractForm({ contract }: { contract?: Contract }) {
  const action = contract ? updateContractAction : createContractAction
  const [state, formAction, isPending] = useActionState(action, initial)

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>{contract ? "Editar contrato" : "Nuevo contrato"}</CardTitle></CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5" encType="multipart/form-data">
          {contract && <input type="hidden" name="id" value={contract.id} />}
          {state.error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" name="title" defaultValue={contract?.title} required />
            {state.fieldErrors?.title && <p className="text-xs text-destructive">{state.fieldErrors.title[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="counterparty">Contraparte *</Label>
              <Input id="counterparty" name="counterparty" defaultValue={contract?.counterparty} required />
              {state.fieldErrors?.counterparty && <p className="text-xs text-destructive">{state.fieldErrors.counterparty[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select name="type" defaultValue={contract?.type ?? "SERVICE"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SERVICE">Servicio</SelectItem>
                  <SelectItem value="NDA">NDA</SelectItem>
                  <SelectItem value="EMPLOYMENT">Empleo</SelectItem>
                  <SelectItem value="PARTNERSHIP">Asociación</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select name="status" defaultValue={contract?.status ?? "DRAFT"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="EXPIRED">Vencido</SelectItem>
                  <SelectItem value="TERMINATED">Terminado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Valor (USD)</Label>
              <Input id="value" name="value" type="number" step="0.01" min="0" defaultValue={contract?.value?.toString()} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signedDate">Fecha de firma</Label>
              <Input id="signedDate" name="signedDate" type="date" defaultValue={formatDateInput(contract?.signedDate)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expirationDate">Fecha de vencimiento</Label>
              <Input id="expirationDate" name="expirationDate" type="date" defaultValue={formatDateInput(contract?.expirationDate)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Archivo adjunto (PDF)</Label>
            <div className="flex items-center gap-2">
              <Input id="file" name="file" type="file" accept=".pdf,.doc,.docx" className="cursor-pointer" />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {contract?.fileUrl && (
              <p className="text-xs text-muted-foreground">
                Archivo actual: <a href={contract.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver documento</a>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={contract?.notes ?? ""} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : contract ? "Actualizar" : "Crear contrato"}
            </Button>
            <Button type="button" variant="outline" onClick={() => history.back()}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
