"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { DollarSign, TrendingUp, AlertTriangle, Users, Plus, X, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LoadingIA } from "@/components/ui/LoadingIA";
import { createClient } from "@/lib/supabase/client";
import type { Transacao, Cliente } from "@/types/database";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type StatusPagamento = "pago" | "pendente" | "atrasado";

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
      <div className="rounded-[8px] border border-vms-borda bg-vms-card px-3 py-2 text-sm shadow-lg">
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
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<StatusPagamento | "todos">("todos");
  const [showModal, setShowModal] = useState(false);
  const [formDescricao, setFormDescricao] = useState("");
  const [formValor, setFormValor] = useState("");
  const [formTipo, setFormTipo] = useState<"receita" | "reembolso" | "comissao">("receita");
  const [formStatus, setFormStatus] = useState<StatusPagamento>("pendente");
  const [formVencimento, setFormVencimento] = useState("");
  const [salvando, setSalvando] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [transRes, clientesRes] = await Promise.all([
      supabase.from("transacoes").select("*, clientes(nome), sites(nome_site)").eq("criador_id", user.id).order("criado_em", { ascending: false }),
      supabase.from("clientes").select("*").eq("criador_id", user.id),
    ]);

    setTransacoes((transRes.data ?? []) as unknown as Transacao[]);
    setClientes(clientesRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("financeiro-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "transacoes" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "clientes" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  async function handleCriarTransacao(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("transacoes").insert({
      criador_id: user.id,
      tipo: formTipo,
      valor: Number(formValor),
      status: formStatus,
      descricao: formDescricao || null,
      vencimento: formVencimento || null,
    });

    setShowModal(false);
    setFormDescricao("");
    setFormValor("");
    setFormTipo("receita");
    setFormStatus("pendente");
    setFormVencimento("");
    setSalvando(false);
    fetchData();
  }

  const clientesAtivos = clientes.filter((c) => c.status === "ativo" || c.status === "trial");
  const mrr = clientesAtivos.reduce((acc, c) => acc + (c.valor_mensal ?? 0), 0);
  const receitaTotal = transacoes.filter((t) => t.tipo === "receita" && t.status === "pago").reduce((acc, t) => acc + t.valor, 0);
  const inadimplencia = transacoes.filter((t) => t.status === "atrasado").reduce((acc, t) => acc + t.valor, 0);
  const inadimplentesCount = transacoes.filter((t) => t.status === "atrasado").length;

  const transacoesFiltradas = filtroStatus === "todos" ? transacoes : transacoes.filter((t) => t.status === filtroStatus);

  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const agora = new Date();
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const mesIdx = (agora.getMonth() - 5 + i + 12) % 12;
    const ano = agora.getMonth() - 5 + i < 0 ? agora.getFullYear() - 1 : agora.getFullYear();
    const inicio = new Date(ano, mesIdx, 1);
    const fim = new Date(ano, mesIdx + 1, 0);
    const receita = transacoes
      .filter((t) => {
        const d = new Date(t.criado_em);
        return d >= inicio && d <= fim && t.tipo === "receita" && t.status === "pago";
      })
      .reduce((acc, t) => acc + t.valor, 0);
    return { mes: meses[mesIdx], receita };
  });

  function handleExportFinanceiroCSV() {
    const headers = ["Cliente", "Site", "Valor", "Tipo", "Status", "Data"];
    const rows = transacoesFiltradas.map((t) => {
      const raw = t as unknown as Record<string, unknown>;
      const clienteObj = raw.clientes as Record<string, unknown> | null | undefined;
      const siteObj = raw.sites as Record<string, unknown> | null | undefined;
      return [
        clienteObj && typeof clienteObj === "object" && "nome" in clienteObj ? String(clienteObj.nome) : t.descricao || "",
        siteObj && typeof siteObj === "object" && "nome_site" in siteObj ? String(siteObj.nome_site) : "",
        t.valor.toString(),
        t.tipo,
        t.status,
        new Date(t.criado_em).toLocaleDateString("pt-BR"),
      ];
    });
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeiro_vms_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <DashboardLayout title="Financeiro">
        <LoadingIA message="Carregando dados financeiros..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Financeiro">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-vms-texto text-xl font-semibold">Financeiro</h1>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={14} className="mr-1.5" />
            Nova Transação
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportFinanceiroCSV}>
            <Download size={14} className="mr-1.5" />
            Exportar CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<TrendingUp size={14} />}
            label="MRR"
            value={`R$ ${mrr.toLocaleString("pt-BR")}`}
            sub={`${clientesAtivos.length} clientes ativos`}
            green
          />
          <MetricCard
            icon={<DollarSign size={14} />}
            label="Receita Total"
            value={`R$ ${receitaTotal.toLocaleString("pt-BR")}`}
            sub="Receita confirmada"
          />
          <MetricCard
            icon={<AlertTriangle size={14} />}
            label="Inadimplência"
            value={`R$ ${inadimplencia.toLocaleString("pt-BR")}`}
            sub={`${inadimplentesCount} pendência${inadimplentesCount !== 1 ? "s" : ""}`}
          />
          <MetricCard
            icon={<Users size={14} />}
            label="Clientes Ativos"
            value={clientesAtivos.length}
            sub={`de ${clientes.length} total`}
            green
          />
        </div>

        <div className="glass-card-premium rounded-[14px] p-5">
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
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "#888888", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#888888", fontSize: 12 }} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="receita" stroke="#AAFF00" strokeWidth={2} fill="url(#colorReceita)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card-premium rounded-[14px]">
          <div className="flex flex-col gap-3 border-b border-vms-borda p-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-medium text-vms-texto">Transações Recentes</h2>
            <div className="flex gap-2">
              {(["todos", "pago", "pendente", "atrasado"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFiltroStatus(s)}
                  className={`rounded-[8px] px-3 py-1 text-xs font-medium transition-colors ${
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
                    <td className="px-4 py-3 text-vms-texto-2">{t.clientes?.nome || t.descricao || "—"}</td>
                    <td className="px-4 py-3 text-vms-muted">{t.sites?.nome_site || "—"}</td>
                    <td className="px-4 py-3 text-vms-texto font-medium">
                      R$ {t.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[t.status]}`}>
                        {statusLabels[t.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-vms-muted">
                      {new Date(t.criado_em).toLocaleDateString("pt-BR")}
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

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="glass-card-premium rounded-[14px] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-vms-texto text-base font-medium">Nova Transação</h3>
              <button onClick={() => setShowModal(false)} className="text-vms-muted hover:text-vms-texto cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCriarTransacao} className="flex flex-col gap-4">
              <Input label="Descrição" placeholder="Ex: Mensalidade site" value={formDescricao} onChange={(e) => setFormDescricao(e.target.value)} required />
              <Input label="Valor (R$)" type="number" min={0} step={0.01} placeholder="197.00" icon={<DollarSign size={14} />} value={formValor} onChange={(e) => setFormValor(e.target.value)} required />
              <Select label="Tipo" options={[{ value: "receita", label: "Receita" }, { value: "reembolso", label: "Reembolso" }, { value: "comissao", label: "Comissão" }]} value={formTipo} onChange={(e) => setFormTipo(e.target.value as typeof formTipo)} />
              <Select label="Status" options={[{ value: "pendente", label: "Pendente" }, { value: "pago", label: "Pago" }, { value: "atrasado", label: "Atrasado" }]} value={formStatus} onChange={(e) => setFormStatus(e.target.value as StatusPagamento)} />
              <Input label="Vencimento" type="date" value={formVencimento} onChange={(e) => setFormVencimento(e.target.value)} />
              <div className="flex gap-3 mt-2">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
                <Button type="submit" disabled={salvando || !formValor} className="flex-1">
                  <Plus size={14} className="mr-1.5" />
                  Criar transação
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
