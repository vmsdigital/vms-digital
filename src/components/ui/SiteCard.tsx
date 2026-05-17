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
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg glass-hover transition-all duration-200">
      <div className="w-9 h-[26px] rounded-lg glass flex items-center justify-center text-vms-dark-5 text-[10px] font-medium shrink-0 overflow-hidden">
        {thumb ? (
          <img src={thumb} alt={nome} className="w-full h-full object-cover rounded" />
        ) : (
          getInitials(nome)
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-vms-texto text-sm font-medium truncate">{nome}</div>
        <div className="text-vms-dark-5 text-xs truncate">{nicho}</div>
      </div>

      {(plano || valor) && (
        <div className="text-right shrink-0">
          {plano && <div className="text-vms-texto-2 text-xs">{plano}</div>}
          {valor && <div className="text-vms-dark-5 text-[10px]">{valor}</div>}
        </div>
      )}

      <div className="shrink-0">
        <StatusBadge status={status} />
      </div>
    </div>
  );
}
