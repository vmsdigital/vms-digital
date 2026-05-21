"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  UserMinus,
  BarChart3,
  Download,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { LoadingIA } from "@/components/ui/LoadingIA";
import { createClient } from "@/lib/supabase/client";
import type { Cliente, Site } from "@/types/database";

const PIE_COLORS = ["#AAFF00", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function RelatoriosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [clientesRes, sitesRes] = await Promise.all([
      supabase.from("clientes").select("*").eq("criador_id", user.id),
      supabase.from("sites").select("*").eq("criador_id", user.id),
    ]);

    if (clientesRes.data) setClientes(clientesRes.data as Cliente[]);
    if (sitesRes.data) setSites(sitesRes.data as Site[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleExportRelatorio() {
    const headers = ["Métrica", "Valor"];
    const rows: string[][] = [
      ["Total de Clientes", String(clientes.length)],
      ["Clientes Ativos", String(clientes.filter((c) => c.status === "ativo").length)],
      ["Clientes Trial", String(clientes.filter((c) => c.status === "trial").length)],
      ["Clientes Inadimplentes", String(clientes.filter((c) => c.status === "inadimplente").length)],
      ["Clientes Cancelados", String(clientes.filter((c) => c.status === "cancelado").length)],
      ["Receita Mensal", String(receitaMensal)],
      ["Receita Total", String(receitaTotal)],
      ["Total de Sites", String(sites.length)],
      ["Sites Publicados", String(sites.filter((s) => s.publicado).length)],
      ["Taxa de Churn", `${churnRate.toFixed(1)}%`],
    ];

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_vms_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <DashboardLayout title="Relatórios">
        <LoadingIA message="Carregando relatórios..." />
      </DashboardLayout>
    );
  }

  const clientesAtivos = clientes.filter((c) => c.status === "ativo");
  const clientesTrial = clientes.filter((c) => c.status === "trial");
  const clientesInadimplentes = clientes.filter((c) => c.status === "inadimplente");
  const clientesCancelados = clientes.filter((c) => c.status === "cancelado");

  const receitaMensal = clientesAtivos.reduce((acc, c) => acc + (c.valor_mensal || 0), 0);
  const receitaTotal = clientes.reduce((acc, c) => acc + (c.valor_mensal || 0), 0);
  const ticketMedio = clientesAtivos.length > 0 ? receitaMensal / clientesAtivos.length : 0;
  const churnRate = clientes.length > 0 ? (clientesCancelados.length / clientes.length) * 100 : 0;

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
      .reduce((acc, c) => acc + (c.valor_mensal || 0), 0);
    return { mes: meses[mesIdx], receita };
  });

  const clientesPorMes = Array.from({ length: 6 }, (_, i) => {
    const mesIdx = (agora.getMonth() - 5 + i + 12) % 12;
    const ano = agora.getMonth() - 5 + i < 0 ? agora.getFullYear() - 1 : agora.getFullYear();
    const inicio = new Date(ano, mesIdx, 1);
    const fim = new Date(ano, mesIdx + 1, 0);
    const novos = clientes.filter((c) => {
      const d = new Date(c.criado_em);
      return d >= inicio && d <= fim;
    }).length;
    return { mes: meses[mesIdx], novos };
  });

  const statusData = [
    { name: "Ativos", value: clientesAtivos.length },
    { name: "Trial", value: clientesTrial.length },
    { name: "Inadimplentes", value: clientesInadimplentes.length },
    { name: "Cancelados", value: clientesCancelados.length },
  ].filter((d) => d.value > 0);

  const planoData = Object.entries(
    clientes.reduce<Record<string, number>>((acc, c) => {
      const plano = c.plano_tipo || "sem_plano";
      acc[plano] = (acc[plano] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <DashboardLayout title="Relatórios">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-vms-texto text-lg font-semibold">Relatórios</h1>
            <p className="text-vms-muted text-xs mt-0.5">Acompanhe o desempenho do seu negócio</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExportRelatorio}>
            <Download size={14} className="mr-1.5" />
            Exportar relatório
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            icon={<DollarSign size={14} />}
            label="Receita mensal"
            value={`R$ ${receitaMensal.toLocaleString("pt-BR")}`}
            green
          />
          <MetricCard
            icon={<TrendingUp size={14} />}
            label="Ticket médio"
            value={`R$ ${ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          />
          <MetricCard
            icon={<Users size={14} />}
            label="Novos clientes/mês"
            value={clientesPorMes[clientesPorMes.length - 1]?.novos || 0}
          />
          <MetricCard
            icon={<UserMinus size={14} />}
            label="Taxa de churn"
            value={`${churnRate.toFixed(1)}%`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card-premium rounded-[14px] p-5">
            <h2 className="text-vms-texto text-sm font-medium mb-4">Evolução da receita</h2>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorReceita2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#AAFF00" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#AAFF00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="mes" stroke="#555" tick={{ fill: "#888", fontSize: 12 }} />
                  <YAxis stroke="#555" tick={{ fill: "#888", fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "8px", color: "#CCC" }}
                    formatter={(value) => [`R$ ${Number(value).toLocaleString("pt-BR")}`, "Receita"]}
                  />
                  <Area type="monotone" dataKey="receita" stroke="#AAFF00" strokeWidth={2} fill="url(#colorReceita2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card-premium rounded-[14px] p-5">
            <h2 className="text-vms-texto text-sm font-medium mb-4">Novos clientes por mês</h2>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientesPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="mes" stroke="#555" tick={{ fill: "#888", fontSize: 12 }} />
                  <YAxis stroke="#555" tick={{ fill: "#888", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "8px", color: "#CCC" }}
                    formatter={(value) => [value, "Novos clientes"]}
                  />
                  <Bar dataKey="novos" fill="#AAFF00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card-premium rounded-[14px] p-5">
            <h2 className="text-vms-texto text-sm font-medium mb-4">Clientes por status</h2>
            <div className="h-[260px] flex items-center justify-center">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "8px", color: "#CCC" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-vms-muted text-sm">Sem dados</p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {statusData.map((d, idx) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="text-vms-texto-2 text-xs">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card-premium rounded-[14px] p-5">
            <h2 className="text-vms-texto text-sm font-medium mb-4">Clientes por plano</h2>
            <div className="h-[260px] flex items-center justify-center">
              {planoData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planoData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {planoData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "8px", color: "#CCC" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-vms-muted text-sm">Sem dados</p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {planoData.map((d, idx) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="text-vms-texto-2 text-xs capitalize">{d.name.replace(/_/g, " ")} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card-premium rounded-[14px] p-5">
          <h2 className="text-vms-texto text-sm font-medium mb-4">Resumo geral</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-vms-texto">{sites.length}</p>
              <p className="text-vms-muted text-xs mt-0.5">Sites criados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-vms-primaria">{sites.filter((s) => s.publicado).length}</p>
              <p className="text-vms-muted text-xs mt-0.5">Sites publicados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-vms-texto">{clientes.length}</p>
              <p className="text-vms-muted text-xs mt-0.5">Total clientes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{clientesAtivos.length}</p>
              <p className="text-vms-muted text-xs mt-0.5">Clientes ativos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-vms-texto">
                R$ {receitaMensal.toLocaleString("pt-BR")}
              </p>
              <p className="text-vms-muted text-xs mt-0.5">Receita/mês</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-vms-texto">
                R$ {receitaTotal.toLocaleString("pt-BR")}
              </p>
              <p className="text-vms-muted text-xs mt-0.5">Receita total</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
