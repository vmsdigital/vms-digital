"use client";

import { type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = "", ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-vms-texto-2 text-xs font-medium">{label}</label>}
      <select
        className={`
          w-full bg-vms-card border rounded-lg px-3 py-2 text-sm text-vms-texto
          outline-none transition-colors appearance-none cursor-pointer
          ${error ? "border-vms-erro" : "border-vms-borda focus:border-vms-primaria"}
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
      {error && <span className="text-vms-erro text-xs">{error}</span>}
    </div>
  );
}
