"use client";

import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  className?: string;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-vms-primaria text-vms-fundo font-semibold hover:shadow-[0_0_20px_rgba(200,241,53,0.3)] hover:brightness-110 btn-premium",
  secondary: "bg-vms-card border border-vms-borda text-vms-texto-2 hover:border-vms-borda-forte hover:bg-vms-dark-1",
  ghost: "bg-transparent text-vms-muted hover:text-vms-texto-2 hover:bg-white/[0.03]",
  danger: "bg-vms-red-bg text-vms-red-light hover:brightness-110 border border-vms-red-light/20",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-[12px] rounded-[8px]",
  md: "px-4 py-2 text-[13px] rounded-[10px]",
  lg: "px-6 py-3 text-[15px] rounded-[12px]",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  type = "button",
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium cursor-pointer
        transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
}
