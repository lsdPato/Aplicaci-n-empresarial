import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import type { User } from "@/generated/prisma"

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) console.error("[getCurrentUser] Supabase auth error:", authError.message)
    if (!user) return null

    let prismaUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { permissions: true },
    })

    if (!prismaUser) {
      console.log("[getCurrentUser] User not in Prisma, syncing...", user.id)
      await syncUserProfile(user.id, user.email!, user.user_metadata?.full_name)
      prismaUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { permissions: true },
      })
    }

    return prismaUser as User | null
  } catch (err) {
    console.error("[getCurrentUser] ERROR:", err)
    return null
  }
}

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
