"use client"

import { useEffect } from "react"

export default function FloatingParticles() {
  useEffect(() => {
    const container = document.createElement("div")
    container.setAttribute("aria-hidden", "true")
    const particles: HTMLDivElement[] = []
    const count = 18

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div")

      const size = Math.random() * 3 + 2
      const opacity = Math.random() * 0.25 + 0.15
      const dx = Math.random() * 60 - 30
      const dy = Math.random() * 80 - 40
      const duration = Math.random() * 12 + 8
      const delay = Math.random() * 10
      const top = Math.random() * 100
      const left = Math.random() * 100

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

      container.appendChild(particle)
      particles.push(particle)
    }

    document.body.appendChild(container)

    return () => {
      document.body.removeChild(container)
    }
  }, [])

  return null
}
