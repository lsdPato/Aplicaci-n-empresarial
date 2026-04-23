"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation" // used by logoutAction
import { z } from "zod/v4"
import { createClient } from "@/lib/supabase/server"
import { syncUserProfile } from "@/lib/auth"
import type { ActionState } from "@/types"

const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

const registerSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) return { success: false, error: error.message }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.name } },
  })

  if (error) return { success: false, error: error.message }
  if (!data.user) return { success: false, error: "No se pudo crear el usuario" }

  // Sync to Prisma (non-fatal — user is already authenticated in Supabase)
  try {
    await syncUserProfile(data.user.id, parsed.data.email, parsed.data.name)
  } catch {
    // Will be auto-synced on first dashboard load via getCurrentUser()
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
