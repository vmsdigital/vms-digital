"use client";

import { Info } from "lucide-react";

interface AlertaBannerProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AlertaBanner({ message, actionLabel, onAction }: AlertaBannerProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-[12px]"
      style={{
        background: "rgba(200,241,53,0.04)",
        border: "1px solid rgba(200,241,53,0.18)",
      }}
    >
      <Info className="w-4 h-4 shrink-0 text-vms-primaria opacity-70" />
      <span className="text-vms-texto-2 text-[13px] flex-1">{message}</span>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-vms-primaria text-[13px] font-semibold cursor-pointer hover:text-vms-primaria-bright transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
