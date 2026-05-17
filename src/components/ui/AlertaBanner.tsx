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
      className="flex items-center gap-3 px-4 py-3 rounded-lg"
      style={{
        background: "rgba(170,255,0,0.05)",
        border: "1px solid rgba(170,255,0,0.3)",
      }}
    >
      <Info className="w-4 h-4 shrink-0 text-vms-primaria" />
      <span className="text-vms-texto-2 text-sm flex-1">{message}</span>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-vms-primaria text-sm font-medium cursor-pointer hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
