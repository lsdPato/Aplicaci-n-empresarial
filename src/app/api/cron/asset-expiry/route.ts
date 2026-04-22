import { NextResponse } from "next/server"
import { differenceInDays, format } from "date-fns"
import { es } from "date-fns/locale"
import { prisma } from "@/lib/prisma"
import { sendAssetExpiryEmail } from "@/lib/email"

// Called by Vercel Cron (daily). Protected by CRON_SECRET.
export async function GET(req: Request) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get("authorization")
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const now = new Date()
  const assets = await prisma.digitalAsset.findMany({
    where: { status: "ACTIVE", expirationDate: { not: null } },
    include: { alerts: true },
  })

  // Admins and directors receive expiry alerts
  const recipients = await prisma.user.findMany({
    where: { isActive: true, role: { in: ["ADMIN", "DIRECTOR"] } },
    select: { email: true, name: true },
  })

  if (recipients.length === 0) return NextResponse.json({ sent: 0 })

  const THRESHOLDS = [30, 14, 7]
  let sent = 0

  for (const asset of assets) {
    const daysLeft = differenceInDays(new Date(asset.expirationDate!), now)
    for (const threshold of THRESHOLDS) {
      if (daysLeft > threshold) continue
      const alreadySent = asset.alerts.some((a) => a.daysBeforeExpiry === threshold)
      if (alreadySent) continue

      for (const r of recipients) {
        await sendAssetExpiryEmail({
          to: r.email,
          recipientName: r.name ?? r.email,
          assetName: asset.name,
          provider: asset.provider,
          daysLeft,
          expirationDate: format(new Date(asset.expirationDate!), "dd/MM/yyyy", { locale: es }),
        })
        sent++
      }

      await prisma.digitalAssetAlert.create({
        data: { assetId: asset.id, daysBeforeExpiry: threshold },
      }).catch(() => {}) // ignore duplicate if race condition
      break // only one threshold per asset per run
    }
  }

  return NextResponse.json({ sent, checked: assets.length })
}
