"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { loginAction } from "@/actions/auth"
import type { ActionState } from "@/types"

const initial: ActionState = { success: false }

export function LoginForm() {
  const router = useRouter()
  const [state, action, isPending] = useActionState(loginAction, initial)

  useEffect(() => {
    if (state.success) router.push("/dashboard")
  }, [state.success, router])

  return (
    <div style={{ animation: "fade-up 0.7s ease-out both" }}>
      {/* Gradient border wrapper */}
      <div style={{
        position: "relative",
        borderRadius: "20px",
        padding: "1px",
        background: "linear-gradient(135deg, rgba(124,58,237,0.7), rgba(37,99,235,0.5), rgba(6,182,212,0.6))",
        boxShadow: "0 0 60px rgba(124,58,237,0.25), 0 25px 50px rgba(0,0,0,0.6)",
        animation: "card-float 6s ease-in-out infinite",
      }}>
        {/* Glass card */}
        <div style={{
          borderRadius: "19px",
          padding: "40px 36px",
          background: "rgba(3,7,18,0.82)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
        }}>

          {/* Orbit logo */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
            <div style={{ position: "relative", width: "80px", height: "80px" }}>
              {/* Glow behind */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 70%)",
                animation: "glow-pulse 2.5s ease-in-out infinite",
              }} />
              {/* Outer ring */}
              <div style={{
                position: "absolute", inset: "2px", borderRadius: "50%",
                border: "1px dashed rgba(167,139,250,0.45)",
                animation: "orbit 12s linear infinite",
              }}>
                <div style={{
                  position: "absolute", top: "-4px", left: "50%", marginLeft: "-4px",
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "linear-gradient(135deg,#a78bfa,#60a5fa)",
                  boxShadow: "0 0 12px rgba(167,139,250,0.9)",
                }} />
              </div>
              {/* Inner ring */}
              <div style={{
                position: "absolute", inset: "16px", borderRadius: "50%",
                border: "1px dashed rgba(96,165,250,0.35)",
                animation: "orbit-rev 7s linear infinite",
              }}>
                <div style={{
                  position: "absolute", bottom: "-3px", left: "50%", marginLeft: "-3px",
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#60a5fa", boxShadow: "0 0 8px rgba(96,165,250,0.9)",
                }} />
              </div>
              {/* Core */}
              <div style={{
                position: "absolute", inset: "26px", borderRadius: "50%",
                background: "linear-gradient(135deg,rgba(124,58,237,0.8),rgba(37,99,235,0.8))",
                border: "1px solid rgba(167,139,250,0.5)",
                boxShadow: "0 0 20px rgba(124,58,237,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: "13px" }}>✦</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <h1 style={{
              margin: 0, fontSize: "24px", fontWeight: 700,
              background: "linear-gradient(135deg, #c4b5fd 0%, #93c5fd 50%, #67e8f9 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Iniciar sesión
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: "13px", color: "rgba(148,163,184,0.8)" }}>
              Accede a tu panel de control
            </p>
          </div>

          {/* Error */}
          {state.error && (
            <div style={{
              marginBottom: "16px", padding: "10px 14px",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "8px", fontSize: "13px", color: "#fca5a5",
            }}>
              {state.error}
            </div>
          )}

          <form action={action} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label className="space-label" htmlFor="email">Correo electrónico</label>
              <input
                id="email" name="email" type="email"
                placeholder="tu@empresa.com" required
                className="space-input"
              />
              {state.fieldErrors?.email && (
                <p style={{ fontSize: "12px", color: "#fca5a5", marginTop: "4px" }}>
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label className="space-label" htmlFor="password">Contraseña</label>
              <input
                id="password" name="password" type="password"
                placeholder="••••••••" required
                className="space-input"
              />
              {state.fieldErrors?.password && (
                <p style={{ fontSize: "12px", color: "#fca5a5", marginTop: "4px" }}>
                  {state.fieldErrors.password[0]}
                </p>
              )}
            </div>

            <button type="submit" disabled={isPending} className="space-btn" style={{ marginTop: "4px" }}>
              {isPending ? "Verificando…" : "Ingresar al sistema"}
            </button>
          </form>

          <p style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "rgba(148,163,184,0.7)" }}>
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="space-link">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
