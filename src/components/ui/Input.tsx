"use client";

import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = "", ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-vms-texto-2 text-xs font-medium">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted">{icon}</span>
        )}
        <input
          className={`
            w-full bg-vms-card border rounded-lg px-3 py-2 text-sm text-vms-texto
            placeholder:text-vms-dark-5 outline-none transition-colors
            ${icon ? "pl-9" : ""}
            ${error ? "border-vms-erro" : "border-vms-borda focus:border-vms-primaria"}
            ${className}
          `}
          {...rest}
        />
      </div>
      {error && <span className="text-vms-erro text-xs">{error}</span>}
    </div>
  );
}
