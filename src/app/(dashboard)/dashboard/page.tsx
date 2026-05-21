"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Globe, CheckCircle, DollarSign, TrendingUp, CirclePlus, Search, Send, Users, FileCheck, Rocket, ChevronDown, ChevronRight } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { AlertaBanner } from "@/components/ui/AlertaBanner";
import { PlanCard } from "@/components/ui/PlanCard";
import { SiteCard } from "@/components/ui/SiteCard";
import { OnboardingTour } from "@/components/ui/OnboardingTour";
import { fireConfetti } from "@/components/ui/Confetti";
import { createClient } from "@/lib/supabase/client";
import { PLANOS } from "@/lib/constants";
import type { Usuario, Site, Cliente } from "@/types/database";

interface DashboardData {
  usuario: Usuario | null;
  sites: Site[];
  clientes: Cliente[];
  prospeccoesMes: number;
  edicoesIAMes: number;
}

const funilEtapas = [
  { label: "Prospecção", valor: 48, descricao: "leads", icon: Search, cor: "vms-primaria" },
  { label: "Proposta", valor: 24, descricao: "enviadas", icon: Send, cor: "vms-blue-light", conversao: "50%" },
  { label: "Cliente", valor: 12, descricao: "ativos", icon: Users, cor: "vms-purple-light", conversao: "50%" },
  { label: "Ativo", valor: 6, descricao: "publicados", icon: Globe, cor: "vms-sucesso", conversao: "50%" },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    usuario: null,
    sites: [],
    clientes: [],
    prospeccoesMes: 0,
    edicoesIAMes: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [usuarioRes, sitesRes, clientesRes, prospeccoesRes] = await Promise.all([
      supabase.from("usuarios").select("*").eq("id", user.id).single(),
      supabase
        .from("sites")
        .select("*")
        .eq("criador_id", user.id)
        .order("criado_em", { ascending: false }),
      supabase.from("clientes").select("*").eq("criador_id", user.id),
      supabase.from("prospeccao").select("id", { count: "exact", head: true }).eq("criador_id", user.id).gte("criado_em", inicioMes),
    ]);

    setData({
      usuario: usuarioRes.data,
      sites: sitesRes.data ?? [],
      clientes: clientesRes.data ?? [],
      prospeccoesMes: prospeccoesRes.count ?? 0,
      edicoesIAMes: 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sites" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clientes" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "propostas" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card-premium rounded-[14px] p-4 relative overflow-hidden">
                <div className="h-3 w-16 rounded bg-vms-dark-3 mb-3" />
                <div className="h-6 w-20 rounded bg-vms-dark-2" />
                <div className="absolute inset-0 animate-shimmer" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card-premium rounded-[14px] p-4 relative overflow-hidden">
              <div className="h-3 w-24 rounded bg-vms-dark-3 mb-4" />
              <div className="h-[200px] sm:h-[260px] rounded-[10px] bg-vms-dark-2" />
              <div className="absolute inset-0 animate-shimmer" />
            </div>
            <div className="glass-card-premium rounded-[14px] p-4 relative overflow-hidden">
              <div className="h-3 w-20 rounded bg-vms-dark-3 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 rounded bg-vms-dark-2" />
                ))}
              </div>
              <div className="absolute inset-0 animate-shimmer" />
            </div>
          </div>
          <div className="glass-card-premium rounded-[14px] p-4 relative overflow-hidden">
            <div className="h-3 w-24 rounded bg-vms-dark-3 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-[8px] bg-vms-dark-2" />
              ))}
            </div>
            <div className="absolute inset-0 animate-shimmer" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { usuario, sites, clientes, prospeccoesMes, edicoesIAMes } = data;
  const plano = usuario?.plano ?? "gratuito";
  const planoInfo = PLANOS[plano];

  const sitesAtivos = sites.filter((s) => s.publicado);
  const clientesAtivos = clientes.filter(
    (c) => c.status === "ativo" || c.status === "trial"
  );
  const receitaMensal = clientesAtivos.reduce(
    (acc, c) => acc + (c.valor_mensal ?? 0),
    0
  );
  const receitaTotal = clientes.reduce(
    (acc, c) => acc + (c.valor_mensal ?? 0),
    0
  );

  const recentSites = sites.slice(0, 5);

  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const agora = new Date();
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const mesIdx = (agora.getMonth() - 5 + i + 12) % 12;
    const ano = agora.getMonth() - 5 + i < 0 ? agora.getFullYear() - 1 : agora.getFullYear();
    const inicio = new Date(ano, mesIdx, 1);
    const fim = new Date(ano, mesIdx + 1, 0);
    const receita = clientes
      .filter((c) => {
        const d = new Date(c.criado_em);
        return d >= inicio && d <= fim && (c.status === "ativo" || c.status === "trial");
      })
      .reduce((acc, c) => acc + (c.valor_mensal ?? 0), 0);
    return { mes: meses[mesIdx], receita };
  });

  return (
    <DashboardLayout title="Dashboard">
      <div className="flex flex-col gap-6">
        {plano === "gratuito" && (
          <AlertaBanner
            message="Plano Gratuito — 0 buscas de prospecção restantes este mês."
            actionLabel="Fazer Upgrade →"
            onAction={() => {}}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/sites/novo"
            className="glass-card-premium rounded-[14px] p-4 flex items-center gap-3 hover:border-vms-primaria/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-[10px] bg-vms-primaria/10 flex items-center justify-center shrink-0">
              <CirclePlus size={18} className="text-vms-primaria" />
            </div>
            <div>
              <p className="text-vms-texto text-sm font-medium">Criar site</p>
              <p className="text-vms-muted text-xs">Novo site com IA</p>
            </div>
          </Link>
          <Link
            href="/prospeccao"
            className="glass-card-premium rounded-[14px] p-4 flex items-center gap-3 hover:border-vms-primaria/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-[10px] bg-vms-blue-bg flex items-center justify-center shrink-0">
              <Search size={18} className="text-vms-blue-light" />
            </div>
            <div>
              <p className="text-vms-texto text-sm font-medium">Prospecção</p>
              <p className="text-vms-muted text-xs">Buscar empresas</p>
            </div>
          </Link>
          <Link
            href="/propostas"
            className="glass-card-premium rounded-[14px] p-4 flex items-center gap-3 hover:border-vms-primaria/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-[10px] bg-vms-purple-bg flex items-center justify-center shrink-0">
              <FileCheck size={18} className="text-vms-purple-light" />
            </div>
            <div>
              <p className="text-vms-texto text-sm font-medium">Propostas</p>
              <p className="text-vms-muted text-xs">Acompanhar vendas</p>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-tour="metrics">
          <MetricCard
            icon={<Globe size={14} />}
            label="Sites criados"
            value={sites.length}
          />
          <MetricCard
            icon={<CheckCircle size={14} />}
            label="Sites ativos"
            value={sitesAtivos.length}
            green
          />
          <MetricCard
            icon={<DollarSign size={14} />}
            label="Receita/mês"
            value={`R$ ${receitaMensal.toLocaleString("pt-BR")}`}
            green
          />
          <MetricCard
            icon={<TrendingUp size={14} />}
            label="Receita total"
            value={`R$ ${receitaTotal.toLocaleString("pt-BR")}`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card-premium rounded-[14px] p-4">
            <h2 className="text-vms-texto text-sm font-medium mb-4">
              Receita mensal
            </h2>
            <div className="h-[200px] sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#AAFF00" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#AAFF00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis
                    dataKey="mes"
                    stroke="#555555"
                    tick={{ fill: "#888888", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#555555"
                    tick={{ fill: "#888888", fontSize: 12 }}
                    tickFormatter={(v) => `R$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #2A2A2A",
                      borderRadius: "8px",
                      color: "#CCCCCC",
                    }}
                    formatter={(value) => [
                      `R$ ${Number(value).toLocaleString("pt-BR")}`,
                      "Receita",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="#AAFF00"
                    strokeWidth={2}
                    fill="url(#colorReceita)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div data-tour="plan-card">
            <PlanCard
              planName={`Plano ${planoInfo.nome}`}
              sitesUsed={sites.length}
              sitesLimit={planoInfo.sites === Infinity ? 999 : planoInfo.sites}
              prospeccoesUsed={prospeccoesMes}
              prospeccoesLimit={
                planoInfo.prospeccoes === Infinity
                  ? 999
                  : planoInfo.prospeccoes
              }
              edicoesUsed={edicoesIAMes}
              edicoesLimit={
                planoInfo.edicoes_ia === Infinity ? 999 : planoInfo.edicoes_ia
              }
            />
          </div>
        </div>

        <div className="glass-card-premium rounded-[14px] p-5">
          <h2 className="text-vms-texto text-sm font-medium mb-5">Funil de Vendas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {funilEtapas.map((etapa, idx) => {
              const Icon = etapa.icon;
              return (
                <div key={etapa.label} className="relative">
                  {idx > 0 && (
                    <div className="hidden lg:flex absolute -left-[14px] top-1/2 -translate-y-1/2 z-10 items-center justify-center w-6 h-6 rounded-full bg-vms-dark-2 border border-vms-borda">
                      <ChevronRight size={12} className="text-vms-muted" />
                    </div>
                  )}
                  <div className="glass-card-premium rounded-[12px] p-4 text-center hover:border-vms-primaria/20 transition-all group">
                    <div className={`w-10 h-10 rounded-[10px] mx-auto mb-3 flex items-center justify-center bg-${etapa.cor}/10`}>
                      <Icon size={18} className={`text-${etapa.cor}`} />
                    </div>
                    <span className="text-2xl font-bold text-vms-texto block">{etapa.valor}</span>
                    <span className="text-vms-texto text-sm font-medium block mt-1">{etapa.label}</span>
                    <span className="text-vms-muted text-xs block">{etapa.descricao}</span>
                    {etapa.conversao && (
                      <span className="inline-block mt-2 text-[10px] font-medium text-vms-primaria bg-vms-primaria/10 rounded-full px-2 py-0.5">
                        {etapa.conversao} conversão
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card-premium rounded-[14px] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-vms-texto text-sm font-medium">
              Sites recentes
            </h2>
            <Link
              href="/sites"
              className="text-vms-primaria text-xs font-medium hover:underline"
            >
              Ver todos →
            </Link>
          </div>

          {recentSites.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-[14px] bg-vms-primaria/10 flex items-center justify-center mx-auto mb-4">
                <Rocket size={28} className="text-vms-primaria" />
              </div>
              <p className="text-vms-texto text-base font-medium mb-1">
                Crie seu primeiro site!
              </p>
              <p className="text-vms-muted text-sm mb-4 max-w-sm mx-auto">
                Use a IA para gerar um site profissional em minutos. É rápido e fácil.
              </p>
              <Link
                href="/sites/novo"
                onClick={() => fireConfetti()}
                className="inline-flex items-center gap-2 rounded-[10px] bg-vms-primaria px-6 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:brightness-110"
              >
                <CirclePlus size={16} />
                Criar site agora
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {recentSites.map((site) => (
                <Link key={site.id} href={`/sites/${site.id}/editar`}>
                  <SiteCard
                    nome={site.nome_site}
                    nicho={site.nicho}
                    status={site.publicado ? "ativo" : "trial"}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <OnboardingTour />
    </DashboardLayout>
  );
}
