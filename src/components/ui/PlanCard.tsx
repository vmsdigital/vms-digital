"use client";

import { ProgressBar } from "./ProgressBar";

interface PlanCardProps {
  planName: string;
  sitesUsed: number;
  sitesLimit: number;
  prospeccoesUsed: number;
  prospeccoesLimit: number;
  edicoesUsed: number;
  edicoesLimit: number;
}

export function PlanCard({
  planName,
  sitesUsed,
  sitesLimit,
  prospeccoesUsed,
  prospeccoesLimit,
  edicoesUsed,
  edicoesLimit,
}: PlanCardProps) {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col gap-4">
      <div className="text-vms-texto text-sm font-medium">{planName}</div>

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-vms-texto-2">Sites</span>
            <span className="text-vms-muted">{sitesUsed}/{sitesLimit}</span>
          </div>
          <ProgressBar value={sitesUsed} max={sitesLimit} />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-vms-texto-2">Prospecções</span>
            <span className="text-vms-muted">{prospeccoesUsed}/{prospeccoesLimit}</span>
          </div>
          <ProgressBar value={prospeccoesUsed} max={prospeccoesLimit} />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-vms-texto-2">Edições IA</span>
            <span className="text-vms-muted">{edicoesUsed}/{edicoesLimit}</span>
          </div>
          <ProgressBar value={edicoesUsed} max={edicoesLimit} />
        </div>
      </div>

      <button className="w-full bg-vms-primaria text-black rounded-lg py-2 text-sm font-medium cursor-pointer hover:brightness-110 transition-all">
        Fazer Upgrade
      </button>
    </div>
  );
}
