"use client";

import { X, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  titulo: string;
  texto: string;
  feature?: "publicacao" | "dominio" | "checkout" | "agente" | "prospeccao";
}

export function UpgradeModal({ open, onClose, titulo, texto, feature }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0a1628] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-vms-muted hover:text-vms-texto transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-vms-primaria/10 flex items-center justify-center">
            <span className="text-3xl">🚀</span>
          </div>

          <h3 className="text-xl font-bold text-white">{titulo}</h3>
          <p className="text-sm text-[#86B8C8] leading-relaxed">{texto}</p>

          <div className="w-full flex flex-col gap-3 mt-2">
            <Link
              href="/planos"
              className="w-full py-3 rounded-xl bg-vms-primaria text-black font-semibold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              Assinar Starter por R$97/mês
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/planos"
              className="w-full py-3 rounded-xl border border-white/10 text-white font-medium text-sm hover:bg-white/5 transition-all text-center"
            >
              Ver todos os planos
            </Link>
          </div>

          {feature && (
            <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/5 w-full">
              <p className="text-xs text-[#86B8C8]">
                {feature === "publicacao" && "O plano Starter inclui publicação de sites, domínio personalizado e checkout."}
                {feature === "dominio" && "Domínio personalizado disponível a partir do plano Starter."}
                {feature === "checkout" && "Checkout personalizado disponível a partir do plano Starter."}
                {feature === "agente" && "O Agente IA Piloto Automático está disponível apenas no plano Pro."}
                {feature === "prospeccao" && "Aumente seu limite de prospecção fazendo upgrade de plano."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
