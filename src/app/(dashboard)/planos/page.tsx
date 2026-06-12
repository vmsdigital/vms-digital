"use client";

import { useState } from "react";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PLANOS } from "@/lib/constants";
import type { PlanoKey } from "@/lib/constants";

const PLANOS_ORDER: Array<{ key: PlanoKey; icon: typeof Sparkles; popular?: boolean }> = [
  { key: "gratuito", icon: Sparkles },
  { key: "starter", icon: Zap, popular: true },
  { key: "pro", icon: Crown },
];

export default function PlanosPage() {
  const [anual, setAnual] = useState(false);

  return (
    <DashboardLayout title="Planos e Preços">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-vms-texto mb-2">Escolha o plano ideal</h1>
          <p className="text-vms-muted text-sm">Escale seu negócio de criação de sites com a Startzy</p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <span className={`text-sm font-medium ${!anual ? "text-white" : "text-vms-muted"}`}>Mensal</span>
            <button
              onClick={() => setAnual(!anual)}
              className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer ${anual ? "bg-vms-primaria" : "bg-vms-dark-3 border border-vms-borda"}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${anual ? "translate-x-8" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-medium ${anual ? "text-white" : "text-vms-muted"}`}>
              Anual
              <span className="ml-2 text-xs bg-vms-primaria/20 text-vms-primaria px-2 py-0.5 rounded-full font-semibold">-20%</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANOS_ORDER.map(({ key, icon: Icon, popular }) => {
            const plano = PLANOS[key];
            const preco = anual ? plano.precoAnual : plano.preco;
            const isGratuito = key === "gratuito";

            return (
              <div
                key={key}
                className={`relative rounded-2xl border p-6 flex flex-col ${
                  popular
                    ? "border-vms-primaria bg-vms-primaria/5 shadow-[0_0_30px_rgba(200,241,53,0.1)]"
                    : "border-vms-borda bg-vms-card"
                }`}
              >
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-vms-primaria text-black text-xs font-bold px-4 py-1 rounded-full">
                    MAIS POPULAR
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${popular ? "bg-vms-primaria/20" : "bg-vms-dark-3"}`}>
                    <Icon size={20} className={popular ? "text-vms-primaria" : "text-vms-muted"} />
                  </div>
                  <h3 className="text-lg font-bold text-vms-texto">{plano.nome}</h3>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-vms-texto">
                      {isGratuito ? "Grátis" : `R$${preco}`}
                    </span>
                    {!isGratuito && <span className="text-vms-muted text-sm">/mês</span>}
                  </div>
                  {anual && !isGratuito && (
                    <p className="text-xs text-vms-muted mt-1">
                      R$ {preco * 12}/ano (economia de R$ {(plano.preco - plano.precoAnual) * 12})
                    </p>
                  )}
                </div>

                <ul className="flex-1 space-y-3 mb-6">
                  {plano.sites === Infinity ? (
                    <li className="flex items-start gap-2 text-sm text-vms-texto-2">
                      <Check size={16} className="text-vms-primaria shrink-0 mt-0.5" />
                      Sites ilimitados
                    </li>
                  ) : (
                    <li className="flex items-start gap-2 text-sm text-vms-texto-2">
                      <Check size={16} className="text-vms-primaria shrink-0 mt-0.5" />
                      {plano.sites} site{plano.sites > 1 ? "s" : ""} {plano.sites > 1 ? "por mês" : "gerado com IA"}
                    </li>
                  )}
                  <li className="flex items-start gap-2 text-sm text-vms-texto-2">
                    <Check size={16} className="text-vms-primaria shrink-0 mt-0.5" />
                    Edições ilimitadas com IA
                  </li>
                  {plano.prospeccoes === Infinity ? (
                    <li className="flex items-start gap-2 text-sm text-vms-texto-2">
                      <Check size={16} className="text-vms-primaria shrink-0 mt-0.5" />
                      Prospecção ilimitada
                    </li>
                  ) : (
                    <li className="flex items-start gap-2 text-sm text-vms-texto-2">
                      <Check size={16} className="text-vms-primaria shrink-0 mt-0.5" />
                      {plano.prospeccoes} buscas de prospecção ({plano.prospeccoes * 10} empresas)
                    </li>
                  )}
                  {plano.publicacao && (
                    <li className="flex items-start gap-2 text-sm text-vms-texto-2">
                      <Check size={16} className="text-vms-primaria shrink-0 mt-0.5" />
                      Publicação de sites
                    </li>
                  )}
                  {plano.dominio_personalizado && (
                    <li className="flex items-start gap-2 text-sm text-vms-texto-2">
                      <Check size={16} className="text-vms-primaria shrink-0 mt-0.5" />
                      Domínio personalizado
                    </li>
                  )}
                  {plano.checkout_personalizado && (
                    <li className="flex items-start gap-2 text-sm text-vms-texto-2">
                      <Check size={16} className="text-vms-primaria shrink-0 mt-0.5" />
                      Checkout personalizado
                    </li>
                  )}
                  {plano.agente_ia && (
                    <li className="flex items-start gap-2 text-sm text-vms-primaria font-medium">
                      <Check size={16} className="text-vms-primaria shrink-0 mt-0.5" />
                      Agente IA — Piloto Automático
                    </li>
                  )}
                  {plano.curso && (
                    <li className="flex items-start gap-2 text-sm text-vms-texto-2">
                      <Check size={16} className="text-vms-primaria shrink-0 mt-0.5" />
                      {plano.cursoNome || "Curso incluso"}
                    </li>
                  )}
                  {!plano.publicacao && (
                    <li className="flex items-start gap-2 text-sm text-vms-muted line-through">
                      <span className="shrink-0 mt-0.5">—</span>
                      Publicação de sites
                    </li>
                  )}
                  {!plano.dominio_personalizado && (
                    <li className="flex items-start gap-2 text-sm text-vms-muted line-through">
                      <span className="shrink-0 mt-0.5">—</span>
                      Domínio personalizado
                    </li>
                  )}
                  {!plano.checkout_personalizado && (
                    <li className="flex items-start gap-2 text-sm text-vms-muted line-through">
                      <span className="shrink-0 mt-0.5">—</span>
                      Checkout personalizado
                    </li>
                  )}
                  {!plano.agente_ia && (
                    <li className="flex items-start gap-2 text-sm text-vms-muted line-through">
                      <span className="shrink-0 mt-0.5">—</span>
                      Agente IA Piloto Automático
                    </li>
                  )}
                  <li className="flex items-start gap-2 text-sm text-vms-texto-2">
                    <Check size={16} className="text-vms-primaria shrink-0 mt-0.5" />
                    Suporte {plano.suporte}
                  </li>
                </ul>

                {isGratuito ? (
                  <div className="w-full py-3 rounded-xl border border-vms-borda text-vms-muted text-sm font-medium text-center">
                    Plano atual
                  </div>
                ) : (
                  <a
                    href={`https://asaas.com/checkout/${key === "starter" ? "starter" : "pro"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      popular
                        ? "bg-vms-primaria text-black hover:brightness-110"
                        : "border border-vms-primaria text-vms-primaria hover:bg-vms-primaria/10"
                    }`}
                  >
                    Assinar {plano.nome}
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Diferenciais */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-vms-texto text-center mb-6">Por que a Startzy?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "🤖", title: "Agente IA Piloto Automático", desc: "Prospecta e cria sites enquanto você dorme" },
              { icon: "💳", title: "Gateway próprio incluso", desc: "Checkout personalizado sem custo extra" },
              { icon: "💰", title: "Split automático", desc: "95% para você, 5% para a Startzy" },
              { icon: "🗺️", title: "Prospecção integrada", desc: "Google Maps para encontrar empresas sem site" },
              { icon: "📚", title: "Curso incluso", desc: "Aprenda a vender sites em todos os planos pagos" },
              { icon: "⚡", title: "Sites em segundos", desc: "IA gera landing pages de alta conversão" },
            ].map((item) => (
              <div key={item.title} className="glass-card-premium rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <h4 className="text-sm font-semibold text-vms-texto">{item.title}</h4>
                  <p className="text-xs text-vms-muted mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
