"use client";

import { useEffect, useState, useRef } from "react";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  green?: boolean;
  blue?: boolean;
  yellow?: boolean;
}

export function MetricCard({ icon, label, value, sub, green, blue, yellow }: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState<string>("0");
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const numericValue = typeof value === "number" ? value : parseFloat(String(value).replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", "."));
  const prefix = typeof value === "string" ? String(value).match(/^[^\d]*/)?.[0] || "" : "";
  const suffix = typeof value === "string" ? String(value).match(/[^\d.]*$/)?.[0] || "" : "";
  const isMonetary = typeof value === "string" && value.includes("R$");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    if (isNaN(numericValue)) {
      setDisplayValue(String(value));
      return;
    }

    const duration = 1200;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = numericValue * eased;

      if (isMonetary) {
        setDisplayValue(`R$ ${Math.round(current).toLocaleString("pt-BR")}`);
      } else if (typeof value === "number") {
        setDisplayValue(String(Math.round(current)));
      } else {
        setDisplayValue(String(value));
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(String(value));
      }
    }

    requestAnimationFrame(animate);
  }, [isVisible, numericValue, value, isMonetary]);

  return (
    <div
      ref={ref}
      className="glass-card-premium rounded-[14px] p-[14px_16px] metric-corner-glow relative animate-fade-up"
    >
      <div className="flex items-center gap-[6px] text-vms-ghost text-[11px] font-medium tracking-[0.3px] uppercase">
        <span className="text-vms-primaria opacity-60">{icon}</span>
        <span>{label}</span>
      </div>
      <div
        className={`text-[22px] font-semibold mt-[6px] tracking-[-0.3px] ${
          green ? "text-emerald-400" :
          blue ? "text-blue-400" :
          yellow ? "text-amber-400" :
          "text-vms-texto"
        }`}
      >
        {displayValue}
      </div>
      {sub && <div className="text-vms-ghost text-[10px] mt-[3px] font-mono">{sub}</div>}
    </div>
  );
}
