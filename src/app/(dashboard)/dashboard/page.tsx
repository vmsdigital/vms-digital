"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Globe, CheckCircle, DollarSign, TrendingUp } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
import { PLANOS } from "@/lib/constants";
import type { Usuario, Site, Cliente } from "@/types/database";

interface DashboardData {
  usuario: Usuario | null;
  sites: Site[];
  clientes: Cliente[];
}

const revenueData = [
  { mes: "Dez", receita: 0 },
  { mes: "Jan", receita: 197 },
  { mes: "Fev", receita: 394 },
  { mes: "Mar", receita: 591 },
  { mes: "Abr", receita: 788 },
  { mes: "Mai", receita: 985 },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    usuario: null,
    sites: [],
    clientes: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      let usuario: Usuario | null = null;
      if (user) {
        const { data: userData } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", user.id)
          .single();
        usuario = userData;
      }

      const { data: sites } = await supabase
        .from("sites")
        .select("*")
        .eq("criador_id", user?.id ?? "")
        .order("criado_em", { ascending: false });

      const { data: clientes } = await supabase
        .from("clientes")
        .select("*")
        .eq("criador_id", user?.id ?? "");

      setData({
        usuario,
        sites: sites ?? [],
        clientes: clientes ?? [],
      });
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-vms-primaria border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const { usuario, sites, clientes } = data;
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="lg:col-span-2 glass-card rounded-2xl p-4">
            <h2 className="text-vms-texto text-sm font-medium mb-4">
              Receita mensal
            </h2>
            <div className="h-[260px]">
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

          <div>
            <PlanCard
              planName={`Plano ${planoInfo.nome}`}
              sitesUsed={sites.length}
              sitesLimit={planoInfo.sites === Infinity ? 999 : planoInfo.sites}
              prospeccoesUsed={0}
              prospeccoesLimit={
                planoInfo.prospeccoes === Infinity
                  ? 999
                  : planoInfo.prospeccoes
              }
              edicoesUsed={0}
              edicoesLimit={
                planoInfo.edicoes_ia === Infinity ? 999 : planoInfo.edicoes_ia
              }
            />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4">
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
            <div className="py-8 text-center">
              <p className="text-vms-muted text-sm">
                Nenhum site criado ainda
              </p>
              <Link
                href="/sites/novo"
                className="inline-block mt-2 text-vms-primaria text-sm font-medium hover:underline"
              >
                Criar primeiro site →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {recentSites.map((site) => (
                <Link key={site.id} href={`/sites/${site.id}`}>
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
    </DashboardLayout>
  );
}
