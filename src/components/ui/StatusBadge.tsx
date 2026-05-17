"use client";

interface StatusBadgeProps {
  status: "ativo" | "trial" | "inadimplente" | "cancelado";
}

const statusStyles: Record<StatusBadgeProps["status"], string> = {
  ativo: "bg-vms-primaria-20 text-vms-primaria",
  trial: "bg-vms-blue-bg text-vms-blue-light",
  inadimplente: "bg-vms-red-bg text-vms-red-light",
  cancelado: "bg-vms-dark-2 text-vms-dark-6",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {label}
    </span>
  );
}
