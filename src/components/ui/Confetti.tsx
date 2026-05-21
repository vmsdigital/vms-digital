"use client";

import { type ReactNode } from "react";

const COLORS = [
  "#C8F135",
  "#DFFE00",
  "#7EFF5A",
  "#5588FF",
  "#FF6B6B",
  "#8888FF",
  "#6699FF",
];

export function fireConfetti() {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.pointerEvents = "none";
  container.style.zIndex = "9999";
  document.body.appendChild(container);

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement("div");
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size = Math.floor(Math.random() * 7) + 4;
    const isCircle = Math.random() > 0.5;
    const left = Math.random() * 100;
    const duration = 2 + Math.random() * 2;
    const delay = Math.random() * 0.5;

    piece.style.position = "fixed";
    piece.style.pointerEvents = "none";
    piece.style.zIndex = "9999";
    piece.style.width = `${size}px`;
    piece.style.height = `${size}px`;
    piece.style.backgroundColor = color;
    piece.style.borderRadius = isCircle ? "50%" : "2px";
    piece.style.left = `${left}vw`;
    piece.style.top = "0";
    piece.style.animation = `confetti-fall ${duration}s ease-in ${delay}s forwards`;

    container.appendChild(piece);
  }

  setTimeout(() => {
    container.remove();
  }, 5000);
}

export function Confetti({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
