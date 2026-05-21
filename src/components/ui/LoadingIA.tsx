"use client";

interface LoadingIAProps {
  message?: string;
}

export function LoadingIA({ message }: LoadingIAProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative w-10 h-10">
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-4 h-4 rounded-full bg-vms-primaria animate-ping opacity-60" />
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-4 h-4 rounded-full bg-vms-primaria animate-spin [animation-duration:2s]" />
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-vms-primaria-bright" style={{ animation: "pulse-dot 1.5s ease-in-out infinite" }} />
        </span>
      </div>
      {message && <span className="text-vms-ghost text-[12px] tracking-[2px] uppercase font-medium">{message}</span>}
    </div>
  );
}
