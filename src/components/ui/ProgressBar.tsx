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
    <div className="h-[2px] bg-vms-primaria-dim rounded-full w-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
        style={{
          width: `${pct}%`,
          boxShadow: pct >= 90 ? "0 0 6px #FF4444" : "0 0 6px #C8F135",
        }}
      />
    </div>
  );
}
