"use client";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
}

export function ProgressBar({ value, max, color }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const barColor = color ?? (pct >= 90 ? "bg-vms-erro" : "bg-vms-primaria");

  return (
    <div className="h-[3px] bg-vms-dark-2 rounded-full w-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
