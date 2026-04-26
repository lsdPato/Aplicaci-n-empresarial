"use client"

import { useState, useEffect } from "react"

function makeShadows(count: number, size: number) {
  const s: string[] = []
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000)
    const y = Math.floor(Math.random() * 2000)
    const op = (Math.random() * 0.6 + 0.3).toFixed(2)
    s.push(`${x}px ${y}px rgba(255,255,255,${op})`)
  }
  return s.join(",")
}

export function StarField() {
  const [layers, setLayers] = useState({ s: "", m: "", l: "" })

  useEffect(() => {
    setLayers({ s: makeShadows(700, 1), m: makeShadows(200, 2), l: makeShadows(80, 3) })
  }, [])

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Small stars — slow drift */}
      <div style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        top: 0,
        background: "transparent",
        boxShadow: layers.s,
        animation: "star-drift 150s linear infinite",
      }} />
      {/* Medium stars */}
      <div style={{
        position: "absolute",
        width: "2px",
        height: "2px",
        top: 0,
        background: "transparent",
        boxShadow: layers.m,
        animation: "star-drift 100s linear infinite",
      }} />
      {/* Large stars — faster */}
      <div style={{
        position: "absolute",
        width: "3px",
        height: "3px",
        top: 0,
        background: "transparent",
        boxShadow: layers.l,
        animation: "star-drift 60s linear infinite",
      }} />
    </div>
  )
}
