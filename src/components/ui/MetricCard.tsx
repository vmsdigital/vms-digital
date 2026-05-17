"use client";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  green?: boolean;
}

export function MetricCard({ icon, label, value, sub, green }: MetricCardProps) {
  return (
    <div className="glass-card rounded-2xl p-[12px_14px] transition-all duration-200 hover:border-vms-primaria/20">
      <div className="flex items-center gap-1.5 text-vms-muted text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`text-xl font-medium mt-1 ${green ? "text-vms-primaria" : "text-vms-texto"}`}>
        {value}
      </div>
      {sub && <div className="text-vms-dark-4 text-[10px] mt-0.5">{sub}</div>}
    </div>
  );
}
