"use client";

import { type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = "", ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-vms-texto-2 text-[12px] font-medium tracking-[0.2px]">{label}</label>}
      <select
        className={`
          w-full bg-vms-card/60 border rounded-[10px] px-3 py-[9px] text-[13px] text-vms-texto
          outline-none transition-all duration-200 appearance-none cursor-pointer
          ${error ? "border-vms-erro/50 focus:border-vms-erro" : "border-vms-borda focus:border-vms-primaria-border focus:shadow-[0_0_0_1px_rgba(200,241,53,0.08)] focus:bg-vms-card"}
          ${className}
        `}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-vms-erro text-[11px]">{error}</span>}
    </div>
  );
}
