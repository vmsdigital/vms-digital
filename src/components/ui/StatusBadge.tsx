"use client";

interface StatusBadgeProps {
  status: "ativo" | "trial" | "inadimplente" | "cancelado";
}

const statusStyles: Record<StatusBadgeProps["status"], string> = {
  ativo: "bg-vms-primaria-20 text-vms-primaria border-vms-primaria-border",
  trial: "bg-vms-blue-bg text-vms-blue-light border-vms-blue/20",
  inadimplente: "bg-vms-red-bg text-vms-red-light border-vms-red-light/20",
  cancelado: "bg-vms-dark-2 text-vms-dark-6 border-vms-borda",
};

const statusDot: Record<StatusBadgeProps["status"], string> = {
  ativo: "bg-vms-primaria",
  trial: "bg-vms-blue-light",
  inadimplente: "bg-vms-red-light",
  cancelado: "bg-vms-dark-5",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-medium border ${statusStyles[status]}`}>
      <span className={`w-[5px] h-[5px] rounded-full ${statusDot[status]}`} style={status === "ativo" ? { boxShadow: "0 0 4px #C8F135" } : {}} />
      {label}
    </span>
  );
}
