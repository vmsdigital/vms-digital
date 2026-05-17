"use client";

interface LoadingIAProps {
  message?: string;
}

export function LoadingIA({ message }: LoadingIAProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="relative w-8 h-8">
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-vms-primaria animate-ping" />
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-vms-primaria animate-spin [animation-duration:2s]" />
        </span>
      </div>
      {message && <span className="text-vms-muted text-sm">{message}</span>}
    </div>
  );
}
