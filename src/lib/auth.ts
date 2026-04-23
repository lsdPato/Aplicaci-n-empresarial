import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import type { User } from "@/generated/prisma/client"

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  try {
    let prismaUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { permissions: true },
    })

    if (!prismaUser) {
      try {
        await syncUserProfile(user.id, user.email!, user.user_metadata?.full_name)
      } catch (syncErr) {
        console.error("[getCurrentUser] syncUserProfile failed:", syncErr)
      }
      prismaUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { permissions: true },
      })
    }

    if (prismaUser) return prismaUser as User
  } catch (dbErr) {
    console.error("[getCurrentUser] Prisma query failed:", dbErr)
  }

  // Auth is valid but DB lookup failed — return a minimal user from Supabase
  // metadata so the dashboard can still render instead of bouncing the user.
  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.full_name ?? user.email!.split("@")[0],
    avatarUrl: null,
    role: "MEMBER",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: [],
  } as unknown as User
})

export async function syncUserProfile(supabaseUserId: string, email: string, name?: string) {
  try {
    return await prisma.user.upsert({
      where: { id: supabaseUserId },
      create: { id: supabaseUserId, email, name: name ?? email.split("@")[0], role: "MEMBER" },
      update: { email, ...(name ? { name } : {}) },
    })
  } catch (err: any) {
    if (err.code === "P2002") {
      // Stale record with conflicting email or id — delete both and recreate
      await prisma.user.deleteMany({ where: { OR: [{ email }, { id: supabaseUserId }] } })
      return await prisma.user.create({
        data: { id: supabaseUserId, email, name: name ?? email.split("@")[0], role: "MEMBER" },
      })
    }
    throw err
  }
}
