"use client";

import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = "", ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-vms-texto-2 text-[12px] font-medium tracking-[0.2px]">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-ghost">{icon}</span>
        )}
        <input
          className={`
            w-full bg-vms-card/60 border rounded-[10px] px-3 py-[9px] text-[13px] text-vms-texto
            placeholder:text-vms-ghost outline-none transition-all duration-200
            ${icon ? "pl-9" : ""}
            ${error ? "border-vms-erro/50 focus:border-vms-erro" : "border-vms-borda focus:border-vms-primaria-border focus:shadow-[0_0_0_1px_rgba(200,241,53,0.08)] focus:bg-vms-card"}
            ${className}
          `}
          {...rest}
        />
      </div>
      {error && <span className="text-vms-erro text-[11px]">{error}</span>}
    </div>
  );
}
