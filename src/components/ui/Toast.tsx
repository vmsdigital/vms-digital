"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Check, Info } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "info";
}

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "info") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "info" = "success") => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toasts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex flex-col gap-2 items-center pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="glass-card-premium rounded-[12px] px-4 py-3 flex items-center gap-3 animate-toast-in pointer-events-auto min-w-[280px] max-w-[420px]"
            >
              {toast.type === "success" ? (
                <Check size={18} className="text-vms-primaria shrink-0" />
              ) : (
                <Info size={18} className="text-vms-blue-light shrink-0" />
              )}
              <span className="text-sm text-vms-texto leading-snug">
                {toast.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
