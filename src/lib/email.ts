import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM ?? "notificaciones@yourdomain.com"

export async function sendExpenseCreatedEmail({
  to,
  approverName,
  creatorName,
  projectName,
  description,
  amount,
  expenseId,
}: {
  to: string
  approverName: string
  creatorName: string
  projectName: string
  description: string
  amount: number
  expenseId: string
}) {
  if (!process.env.RESEND_API_KEY) return
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Nuevo gasto pendiente de aprobación — ${projectName}`,
    html: `
      <p>Hola ${approverName},</p>
      <p><strong>${creatorName}</strong> ha registrado un gasto que requiere tu aprobación:</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Proyecto</td><td><strong>${projectName}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Descripción</td><td>${description}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Monto</td><td><strong>$${amount.toLocaleString("es-AR")}</strong></td></tr>
      </table>
      <p><a href="${appUrl}/dashboard/expenses" style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Ver gasto</a></p>
    `,
  })
}

export async function sendExpenseStatusEmail({
  to,
  creatorName,
  approverName,
  projectName,
  description,
  amount,
  status,
}: {
  to: string
  creatorName: string
  approverName: string
  projectName: string
  description: string
  amount: number
  status: "APPROVED" | "REJECTED"
}) {
  if (!process.env.RESEND_API_KEY) return
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const approved = status === "APPROVED"
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Gasto ${approved ? "aprobado" : "rechazado"} — ${projectName}`,
    html: `
      <p>Hola ${creatorName},</p>
      <p>Tu gasto fue <strong style="color:${approved ? "#16a34a" : "#dc2626"}">${approved ? "aprobado" : "rechazado"}</strong> por ${approverName}.</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Proyecto</td><td><strong>${projectName}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Descripción</td><td>${description}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Monto</td><td><strong>$${amount.toLocaleString("es-AR")}</strong></td></tr>
      </table>
      <p><a href="${appUrl}/dashboard/expenses" style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Ver gastos</a></p>
    `,
  })
}

export async function sendAssetExpiryEmail({
  to,
  recipientName,
  assetName,
  provider,
  daysLeft,
  expirationDate,
}: {
  to: string
  recipientName: string
  assetName: string
  provider: string
  daysLeft: number
  expirationDate: string
}) {
  if (!process.env.RESEND_API_KEY) return
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const urgent = daysLeft <= 7
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${urgent ? "⚠️ URGENTE: " : ""}Activo próximo a vencer — ${assetName}`,
    html: `
      <p>Hola ${recipientName},</p>
      <p>El activo digital <strong>${assetName}</strong> vence ${daysLeft === 0 ? "<strong>hoy</strong>" : `en <strong>${daysLeft} día${daysLeft !== 1 ? "s" : ""}</strong>`}.</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Activo</td><td><strong>${assetName}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Proveedor</td><td>${provider}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Vencimiento</td><td><strong style="color:${urgent ? "#dc2626" : "#d97706"}">${expirationDate}</strong></td></tr>
      </table>
      <p><a href="${appUrl}/dashboard/assets" style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Ver activos</a></p>
    `,
  })
}
