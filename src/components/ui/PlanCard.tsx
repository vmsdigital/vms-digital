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
    <div className="glass-card-premium rounded-[14px] p-5 flex flex-col gap-4">
      <div className="text-vms-texto text-[13px] font-semibold tracking-[-0.2px]">{planName}</div>

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-vms-texto-2">Sites</span>
            <span className="text-vms-ghost font-mono">{sitesUsed}/{sitesLimit}</span>
          </div>
          <ProgressBar value={sitesUsed} max={sitesLimit} />
        </div>

        <div>
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-vms-texto-2">Prospecções</span>
            <span className="text-vms-ghost font-mono">{prospeccoesUsed}/{prospeccoesLimit}</span>
          </div>
          <ProgressBar value={prospeccoesUsed} max={prospeccoesLimit} />
        </div>

        <div>
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-vms-texto-2">Edições IA</span>
            <span className="text-vms-ghost font-mono">{edicoesUsed}/{edicoesLimit}</span>
          </div>
          <ProgressBar value={edicoesUsed} max={edicoesLimit} />
        </div>
      </div>

      <button className="w-full bg-vms-primaria text-vms-fundo rounded-[10px] py-2.5 text-[13px] font-semibold cursor-pointer hover:shadow-[0_0_20px_rgba(200,241,53,0.3)] hover:brightness-110 transition-all btn-premium">
        Fazer Upgrade
      </button>
    </div>
  );
}
