"use client"

import { useEffect } from "react"

export default function FloatingParticles() {
  useEffect(() => {
    const container = document.createElement("div")
    container.setAttribute("aria-hidden", "true")
    const count = 6

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div")

      const size = 2 + (i % 3)
      const opacity = 0.15 + (i % 3) * 0.05
      const dx = -20 + (i * 13) % 60
      const dy = -30 + (i * 17) % 80
      const duration = 10 + (i % 4) * 3
      const delay = (i * 2.5) % 10
      const top = (i * 17) % 100
      const left = (i * 23) % 100

      particle.style.position = "fixed"
      particle.style.pointerEvents = "none"
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.background = `rgba(200, 241, 53, ${opacity})`
      particle.style.borderRadius = "50%"
      particle.style.top = `${top}%`
      particle.style.left = `${left}%`
      particle.style.setProperty("--dx", `${dx}px`)
      particle.style.setProperty("--dy", `${dy}px`)
      particle.style.animation = `float-particle ${duration}s ${delay}s infinite ease-in-out`
      particle.style.zIndex = "0"
      particle.style.willChange = "transform, opacity"

      container.appendChild(particle)
    }

    document.body.appendChild(container)

    return () => {
      document.body.removeChild(container)
    }
  }, [])

  return null
}
