"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { DollarSign, TrendingUp, AlertTriangle, Users } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { mes: "Jan", receita: 3200 },
  { mes: "Fev", receita: 4100 },
  { mes: "Mar", receita: 3800 },
  { mes: "Abr", receita: 5200 },
  { mes: "Mai", receita: 4900 },
  { mes: "Jun", receita: 6100 },
  { mes: "Jul", receita: 5800 },
  { mes: "Ago", receita: 7200 },
  { mes: "Set", receita: 6900 },
  { mes: "Out", receita: 8100 },
  { mes: "Nov", receita: 7600 },
  { mes: "Dez", receita: 9200 },
];

type StatusPagamento = "pago" | "pendente" | "atrasado";

interface Transacao {
  id: string;
  cliente: string;
  site: string;
  valor: number;
  status: StatusPagamento;
  data: string;
}

const transacoesMock: Transacao[] = [
  { id: "1", cliente: "João Silva", site: "Restaurante Sabor", valor: 197, status: "pago", data: "2026-05-15" },
  { id: "2", cliente: "Maria Oliveira", site: "Clínica Saúde+", valor: 97, status: "pago", data: "2026-05-14" },
  { id: "3", cliente: "Pedro Santos", site: "Advocacia Santos", valor: 197, status: "pendente", data: "2026-05-13" },
  { id: "4", cliente: "Ana Costa", site: "Academia Fit", valor: 147, status: "atrasado", data: "2026-05-10" },
  { id: "5", cliente: "Carlos Lima", site: "Pet Shop Amigo", valor: 97, status: "pago", data: "2026-05-09" },
  { id: "6", cliente: "Lucia Ferreira", site: "Salão Beleza Pura", valor: 197, status: "pendente", data: "2026-05-08" },
  { id: "7", cliente: "Roberto Alves", site: "Auto Peças Veloz", valor: 147, status: "pago", data: "2026-05-07" },
  { id: "8", cliente: "Fernanda Dias", site: "Imobiliária Casa", valor: 197, status: "atrasado", data: "2026-05-05" },
];

const statusStyles: Record<StatusPagamento, string> = {
  pago: "bg-vms-primaria-20 text-vms-primaria",
  pendente: "bg-vms-blue-bg text-vms-blue-light",
  atrasado: "bg-vms-red-bg text-vms-red-light",
};

const statusLabels: Record<StatusPagamento, string> = {
  pago: "Pago",
  pendente: "Pendente",
  atrasado: "Atrasado",
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-vms-borda bg-vms-card px-3 py-2 text-sm shadow-lg">
        <p className="text-vms-muted">{label}</p>
        <p className="font-medium text-vms-primaria">
          R$ {payload[0].value.toLocaleString("pt-BR")}
        </p>
      </div>
    );
  }
  return null;
}

export default function FinanceiroPage() {
  const [filtroStatus, setFiltroStatus] = useState<StatusPagamento | "todos">("todos");

  const transacoesFiltradas =
    filtroStatus === "todos"
      ? transacoesMock
      : transacoesMock.filter((t) => t.status === filtroStatus);

  return (
    <DashboardLayout title="Financeiro">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<TrendingUp size={14} />}
            label="MRR"
            value="R$ 8.732"
            sub="+12% vs mês anterior"
            green
          />
          <MetricCard
            icon={<DollarSign size={14} />}
            label="Receita Total"
            value="R$ 72.100"
            sub="Acumulado no ano"
          />
          <MetricCard
            icon={<AlertTriangle size={14} />}
            label="Inadimplência"
            value="R$ 344"
            sub="2 clientes"
          />
          <MetricCard
            icon={<Users size={14} />}
            label="Clientes Ativos"
            value="47"
            sub="+5 este mês"
            green
          />
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-medium text-vms-texto">Receita Mensal</h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#AAFF00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#AAFF00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis
                  dataKey="mes"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888888", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888888", fontSize: 12 }}
                  tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
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

        <div className="glass-card rounded-2xl">
          <div className="flex flex-col gap-3 border-b border-vms-borda p-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-medium text-vms-texto">Transações Recentes</h2>
            <div className="flex gap-2">
              {(["todos", "pago", "pendente", "atrasado"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFiltroStatus(s)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    filtroStatus === s
                      ? "bg-vms-primaria text-black"
                      : "bg-vms-dark-2 text-vms-muted hover:text-vms-texto-2"
                  }`}
                >
                  {s === "todos" ? "Todos" : statusLabels[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-vms-borda">
                  <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Site</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Data</th>
                </tr>
              </thead>
              <tbody>
                {transacoesFiltradas.map((t) => (
                  <tr key={t.id} className="border-b border-vms-borda last:border-0 hover:bg-vms-primaria-hover transition-colors">
                    <td className="px-4 py-3 text-vms-texto-2">{t.cliente}</td>
                    <td className="px-4 py-3 text-vms-muted">{t.site}</td>
                    <td className="px-4 py-3 text-vms-texto font-medium">
                      R$ {t.valor.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[t.status]}`}>
                        {statusLabels[t.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-vms-muted">
                      {new Date(t.data).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transacoesFiltradas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-vms-muted">
              <DollarSign size={32} className="mb-2 opacity-40" />
              <p className="text-sm">Nenhuma transação encontrada</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
