"use client";

import { StatusBadge } from "./StatusBadge";

interface SiteCardProps {
  nome: string;
  nicho: string;
  plano?: string;
  valor?: string;
  status: "ativo" | "trial" | "inadimplente" | "cancelado";
  thumb?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function SiteCard({ nome, nicho, plano, valor, status, thumb }: SiteCardProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] glass-hover transition-all duration-200 border border-transparent hover:border-vms-primaria-border">
      <div className="w-9 h-[26px] rounded-[8px] bg-vms-card border border-vms-borda flex items-center justify-center text-vms-ghost text-[10px] font-medium shrink-0 overflow-hidden">
        {thumb ? (
          <img src={thumb} alt={nome} className="w-full h-full object-cover rounded" />
        ) : (
          getInitials(nome)
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-vms-texto text-[13px] font-medium truncate">{nome}</div>
        <div className="text-vms-ghost text-[11px] truncate">{nicho}</div>
      </div>

      {(plano || valor) && (
        <div className="text-right shrink-0">
          {plano && <div className="text-vms-texto-2 text-[11px]">{plano}</div>}
          {valor && <div className="text-vms-ghost text-[10px] font-mono">{valor}</div>}
        </div>
      )}

      <div className="shrink-0">
        <StatusBadge status={status} />
      </div>
    </div>
  );
}
