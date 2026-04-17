import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import type { User } from "@/generated/prisma"

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    let prismaUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { permissions: true },
    })

    if (!prismaUser) {
      await syncUserProfile(user.id, user.email!, user.user_metadata?.full_name)
      prismaUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { permissions: true },
      })
    }

    return prismaUser as User | null
  } catch {
    return null
  }
}

export async function syncUserProfile(supabaseUserId: string, email: string, name?: string) {
  return prisma.user.upsert({
    where: { id: supabaseUserId },
    create: {
      id: supabaseUserId,
      email,
      name: name ?? email.split("@")[0],
      role: "MEMBER",
    },
    update: {
      email,
      ...(name ? { name } : {}),
    },
  })
}
