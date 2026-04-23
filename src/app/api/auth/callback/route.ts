import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { syncUserProfile } from "@/lib/auth"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const nextParam = searchParams.get("next") ?? "/dashboard"
  // Prevent open redirect: only allow relative paths
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      try {
        await syncUserProfile(
          data.user.id,
          data.user.email!,
          data.user.user_metadata?.full_name
        )
      } catch {
        // User is authenticated in Supabase — proceed even if Prisma sync fails
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
