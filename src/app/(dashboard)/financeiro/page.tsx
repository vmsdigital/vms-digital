"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserCheck,
  AlertTriangle,
  DollarSign,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Phone,
  Mail as MailIcon,
  X,
  Globe,
  Download,
  FileText,
  Building2,
  CalendarDays,
  CreditCard,
  Ban,
  MessageCircle,
  FileUp,
  Paperclip,
  CalendarClock,
  ShoppingCart,
  Wrench,
  Repeat,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingIA } from "@/components/ui/LoadingIA";
import { createClient } from "@/lib/supabase/client";
import type { Cliente, Site } from "@/types/database";

type StatusCliente = Cliente["status"];
type PlanoTipo = NonNullable<Cliente["plano_tipo"]>;
type TipoRelacionamento = "assinatura" | "venda_avulsa" | "manutencao";

interface ClienteComSite extends Cliente {
  sites?: { nome_site: string } | null;
  tipo_relacionamento?: TipoRelacionamento | null;
  data_termino?: string | null;
  contrato_anexo?: string | null; // base64 ou URL
  contrato_nome?: string | null;
}

interface FormAssinatura {
  nome: string;
  email: string;
  whatsapp: string;
  documento: string;
  empresa: string;
  siteId: string;
  planoTipo: PlanoTipo;
  valorMensal: string;
  dataInicio: string;
  dataTermino: string;
  observacoes: string;
  tipoRelacionamento: TipoRelacionamento;
  contratoAnexo: string | null;
  contratoNome: string | null;
}

const STATUS_FILTER_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "ativo", label: "Ativos" },
  { value: "trial", label: "Trial" },
  { value: "inadimplente", label: "Inadimplentes" },
  { value: "cancelado", label: "Cancelados" },
];

const formVazio: FormAssinatura = {
  nome: "",
  email: "",
  whatsapp: "",
  documento: "",
  empresa: "",
  siteId: "",
  planoTipo: "mensal",
  valorMensal: "",
  dataInicio: "",
  dataTermino: "",
  observacoes: "",
  tipoRelacionamento: "assinatura",
  contratoAnexo: null,
  contratoNome: null,
};

function formatCurrency(val: number | null) {
  if (val === null) return "—";
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getTipoLabel(tipo: TipoRelacionamento | null | undefined) {
  switch (tipo) {
    case "venda_avulsa": return "Venda Avulsa";
    case "manutencao": return "Manutenção";
    default: return "Assinatura";
  }
}

function getTipoColor(tipo: TipoRelacionamento | null | undefined): string {
  switch (tipo) {
    case "venda_avulsa": return "bg-blue-500/15 text-blue-400 border-blue-500/25";
    case "manutencao": return "bg-yellow-500/15 text-yellow-400 border-yellow-500/25";
    default: return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
  }
}

function getTipoIcon(tipo: TipoRelacionamento | null | undefined) {
  switch (tipo) {
    case "venda_avulsa": return <ShoppingCart size={10} />;
    case "manutencao": return <Wrench size={10} />;
    default: return <Repeat size={10} />;
  }
}

function isProximoRenovacao(dataTermino: string | null | undefined): boolean {
  if (!dataTermino) return false;
  const termino = new Date(dataTermino);
  const hoje = new Date();
  const diffDias = Math.ceil((termino.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  return diffDias > 0 && diffDias <= 30;
}

export default function FinanceiroPage() {
  const [clientes, setClientes] = useState<ClienteComSite[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState<FormAssinatura>(formVazio);

  const fetchDados = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [clientesRes, sitesRes] = await Promise.all([
      supabase
        .from("clientes")
        .select("*, sites(nome_site), tipo_relacionamento, data_termino, contrato_anexo, contrato_nome")
        .eq("criador_id", user.id)
        .order("criado_em", { ascending: false }),
      supabase
        .from("sites")
        .select("id, nome_site, criador_id, nicho, slug, publicado, criado_em")
        .eq("criador_id", user.id),
    ]);

    setClientes((clientesRes.data ?? []) as ClienteComSite[]);
    setSites((sitesRes.data ?? []) as Site[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSalvando(false);
      return;
    }

    const payload = {
      criador_id: user.id,
      site_id: form.siteId || null,
      nome: form.nome,
      email: form.email || null,
      whatsapp: form.whatsapp,
      plano_tipo: form.planoTipo,
      valor_mensal: form.valorMensal ? Number(form.valorMensal) : null,
      status: "trial" as StatusCliente,
      vencimento: form.dataInicio || null,
      tipo_relacionamento: form.tipoRelacionamento,
      data_termino: form.dataTermino || null,
      contrato_anexo: form.contratoAnexo,
      contrato_nome: form.contratoNome,
    };

    if (editingId) {
      await supabase.from("clientes").update(payload).eq("id", editingId);
    } else {
      await supabase.from("clientes").insert({
        ...payload,
        status: "trial" as StatusCliente,
      });
    }

    setShowModal(false);
    setEditingId(null);
    setForm(formVazio);
    setSalvando(false);
    fetchDados();
  }

  async function handleCancelarAssinatura(id: string) {
    const supabase = createClient();
    await supabase.from("clientes").update({ status: "cancelado" }).eq("id", id);
    setDeleteConfirm(null);
    fetchDados();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("clientes").delete().eq("id", id);
    setDeleteConfirm(null);
    fetchDados();
  }

  function handleEdit(cliente: ClienteComSite) {
    setEditingId(cliente.id);
    setForm({
      nome: cliente.nome,
      email: cliente.email || "",
      whatsapp: cliente.whatsapp,
      documento: "",
      empresa: cliente.sites?.nome_site || "",
      siteId: cliente.site_id || "",
      planoTipo: cliente.plano_tipo || "mensal",
      valorMensal: cliente.valor_mensal?.toString() || "",
      dataInicio: cliente.vencimento || "",
      dataTermino: cliente.data_termino || "",
      observacoes: "",
      tipoRelacionamento: (cliente.tipo_relacionamento as TipoRelacionamento) || "assinatura",
      contratoAnexo: cliente.contrato_anexo || null,
      contratoNome: cliente.contrato_nome || null,
    });
    setShowModal(true);
  }

  function handleNovo() {
    setEditingId(null);
    setForm(formVazio);
    setShowModal(true);
  }

  function handleExportCSV() {
    const headers = [
      "Nome", "Email", "WhatsApp", "CPF/CNPJ", "Empresa/Site",
      "Tipo", "Plano", "Valor Mensal", "Data Início", "Vencimento",
      "Data Término", "Status", "Contrato Anexo",
    ];
    const rows = filtered.map((c) => [
      c.nome,
      c.email || "",
      c.whatsapp,
      "—",
      c.sites?.nome_site || "—",
      getTipoLabel(c.tipo_relacionamento),
      c.plano_tipo || "—",
      c.valor_mensal?.toString() || "0",
      c.criado_em.split("T")[0],
      c.vencimento || "—",
      c.data_termino || "Indeterminado",
      c.status,
      c.contrato_nome || (c.contrato_anexo ? "Sim" : "Não"),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assinaturas_financeiro_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = clientes.filter((c) => {
    const matchSearch =
      !search ||
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.whatsapp.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "todos" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalAtivos = clientes.filter((c) => c.status === "ativo").length;
  const totalInadimplentes = clientes.filter((c) => c.status === "inadimplente").length;
  const totalVendasAvulsas = clientes.filter((c) => c.tipo_relacionamento === "venda_avulsa").length;
  const totalManutencoes = clientes.filter((c) => c.tipo_relacionamento === "manutencao" && (c.status === "ativo" || c.status === "trial")).length;
  const mrr = clientes
    .filter((c) => c.status === "ativo" && c.valor_mensal && c.tipo_relacionamento !== "venda_avulsa")
    .reduce((acc, c) => acc + (c.valor_mensal || 0), 0);

  const siteOptions = sites.map((s) => ({ value: s.id, label: s.nome_site }));

  const viewingCliente = viewingId ? clientes.find((c) => c.id === viewingId) : null;

  if (loading) {
    return (
      <DashboardLayout title="Financeiro">
        <LoadingIA message="Carregando clientes..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Financeiro">
      <div className="flex flex-col gap-6">
        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <MetricCard
            icon={<Users size={14} />}
            label="Total Clientes"
            value={clientes.length}
            sub="Clientes cadastrados"
          />
          <MetricCard
            icon={<ShoppingCart size={14} />}
            label="Vendas Avulsas"
            value={totalVendasAvulsas}
            sub="Pagamentos únicos"
            blue
          />
          <MetricCard
            icon={<Wrench size={14} />}
            label="Manutenções Ativas"
            value={totalManutencoes}
            sub="Suporte/hospedagem"
            yellow
          />
          <MetricCard
            icon={<DollarSign size={14} />}
            label="MRR"
            value={formatCurrency(mrr)}
            sub="Receita recorrente/mês"
            green
          />
          <MetricCard
            icon={<AlertTriangle size={14} />}
            label="Inadimplentes"
            value={totalInadimplentes}
          />
        </div>

        {/* Barra de ferramentas */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-[240px]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                <Input
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-[160px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-9 rounded-[8px] border border-vms-borda bg-vms-card px-3 text-sm text-vms-texto focus:outline-none focus:ring-1 focus:ring-vms-primaria"
              >
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleExportCSV}>
              <Download size={14} className="mr-1.5" />
              Exportar CSV
            </Button>
            <Button onClick={handleNovo}>
              <Plus size={14} className="mr-1.5" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* Tabela de Assinaturas */}
        <div className="glass-card-premium rounded-[14px] overflow-hidden">
          {/* Desktop table */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-vms-borda">
                  <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Cliente</th>
                  <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Tipo</th>
                  <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Contato</th>
                  <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Plano / Site</th>
                  <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Valor</th>
                  <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Início</th>
                  <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Término</th>
                  <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Contrato</th>
                  <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Status</th>
                  <th className="text-right text-vms-muted text-xs font-medium px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vms-borda">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center text-vms-dark-5 text-xs py-8">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                )}
                {filtered.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-vms-primaria-hover transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full glass flex items-center justify-center text-vms-dark-5 text-xs font-medium shrink-0">
                          {cliente.nome
                            .split(" ")
                            .map((w) => w[0])
                            .filter(Boolean)
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="text-vms-texto text-sm font-medium">{cliente.nome}</div>
                          {cliente.email && (
                            <div className="text-vms-muted text-xs flex items-center gap-1">
                              <MailIcon size={10} />
                              {cliente.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getTipoColor(cliente.tipo_relacionamento)}`}>
                        {getTipoIcon(cliente.tipo_relacionamento)}
                        {getTipoLabel(cliente.tipo_relacionamento)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-vms-texto-2 text-xs flex items-center gap-1">
                          <Phone size={10} />
                          {cliente.whatsapp}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-vms-texto-2 text-xs">{cliente.sites?.nome_site || "—"}</div>
                        <div className="text-vms-muted text-[10px] uppercase">
                          {cliente.plano_tipo ?? "—"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-emerald-400 text-sm font-semibold">
                      {formatCurrency(cliente.valor_mensal)}
                    </td>
                    <td className="px-4 py-3 text-vms-texto-2 text-xs whitespace-nowrap">
                      {formatDate(cliente.criado_em)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-xs ${isProximoRenovacao(cliente.data_termino) ? "text-orange-400 font-medium" : "text-vms-texto-2"}`}>
                          {cliente.data_termino ? formatDate(cliente.data_termino) : "Indeterminado"}
                        </span>
                        {isProximoRenovacao(cliente.data_termino) && (
                          <span className="text-[9px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded inline-block w-fit">
                            Renovação próxima
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {cliente.contrato_anexo ? (
                        <button
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = `data:application/octet-stream;base64,${cliente.contrato_anexo}`;
                            link.download = cliente.contrato_nome || "contrato.pdf";
                            link.click();
                          }}
                          className="p-1.5 rounded-[8px] text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                          title={cliente.contrato_nome || "Baixar contrato"}
                        >
                          <Paperclip size={14} />
                        </button>
                      ) : (
                        <Paperclip size={14} className="text-vms-dark-4 opacity-30" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={cliente.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingId(cliente.id)}
                          className="p-1.5 rounded-[8px] text-vms-muted hover:text-vms-primaria hover:bg-vms-dark-2 transition-colors cursor-pointer"
                          title="Ver detalhes"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleEdit(cliente)}
                          className="p-1.5 rounded-[8px] text-vms-muted hover:text-vms-texto-2 hover:bg-vms-dark-2 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        {cliente.status !== "cancelado" && (
                          <button
                            onClick={() => setDeleteConfirm(cliente.id)}
                            className="p-1.5 rounded-[8px] text-vms-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Cancelar cliente"
                          >
                            <Ban size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirm(cliente.id)}
                          className="p-1.5 rounded-[8px] text-vms-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden grid grid-cols-1 gap-3 p-4">
            {filtered.length === 0 && (
              <div className="text-center text-vms-dark-5 text-xs py-8">
                Nenhum cliente encontrado
              </div>
            )}
            {filtered.map((cliente) => (
              <div key={cliente.id} className="glass-card-premium rounded-[10px] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full glass flex items-center justify-center text-vms-dark-5 text-xs font-medium shrink-0">
                      {cliente.nome
                        .split(" ")
                        .map((w) => w[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="text-vms-texto text-sm font-medium">{cliente.nome}</div>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${getTipoColor(cliente.tipo_relacionamento)}`}>
                        {getTipoIcon(cliente.tipo_relacionamento)}
                        {getTipoLabel(cliente.tipo_relacionamento)}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={cliente.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div>
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider">WhatsApp</div>
                    <div className="text-vms-texto-2 text-xs">{cliente.whatsapp}</div>
                  </div>
                  <div>
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider">Site / Plano</div>
                    <div className="text-vms-texto-2 text-xs">
                      {cliente.sites?.nome_site || "—"} ({cliente.plano_tipo || "—"})
                    </div>
                  </div>
                  <div>
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider">Valor</div>
                    <div className="text-emerald-400 text-xs font-medium">
                      {formatCurrency(cliente.valor_mensal)}
                    </div>
                  </div>
                  <div>
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider">Término</div>
                    <div className={`text-xs ${isProximoRenovacao(cliente.data_termino) ? "text-orange-400 font-medium" : "text-vms-texto-2"}`}>
                      {cliente.data_termino ? formatDate(cliente.data_termino) : "Indeterminado"}
                      {isProximoRenovacao(cliente.data_termino) && (
                        <span className="ml-1 text-[9px] bg-orange-500/10 text-orange-400 px-1 py-0.5 rounded">⚠️</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-vms-borda">
                  <div className="flex items-center gap-2">
                    <div className="text-vms-texto-2 text-xs">{formatDate(cliente.criado_em)}</div>
                    {cliente.contrato_anexo ? (
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = `data:application/octet-stream;base64,${cliente.contrato_anexo}`;
                          link.download = cliente.contrato_nome || "contrato.pdf";
                          link.click();
                        }}
                        className="p-1 rounded-[6px] text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                        title={cliente.contrato_nome || "Baixar contrato"}
                      >
                        <Paperclip size={12} />
                      </button>
                    ) : (
                      <Paperclip size={12} className="text-vms-dark-4 opacity-30" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingId(cliente.id)}
                      className="p-1.5 rounded-[8px] text-vms-muted hover:text-vms-primaria hover:bg-vms-dark-2 transition-colors cursor-pointer"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleEdit(cliente)}
                      className="p-1.5 rounded-[8px] text-vms-muted hover:text-vms-texto-2 hover:bg-vms-dark-2 transition-colors cursor-pointer"
                    >
                      <Pencil size={14} />
                    </button>
                    {cliente.status !== "cancelado" && (
                      <button
                        onClick={() => setDeleteConfirm(cliente.id)}
                        className="p-1.5 rounded-[8px] text-vms-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Ban size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Nova/Edita Assinatura */}
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
            <div className="glass-card-premium rounded-[14px] w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-vms-texto text-base font-medium">
                  {editingId ? "Editar Cliente" : "Novo Cliente"}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setForm(formVazio);
                  }}
                  className="text-vms-muted hover:text-vms-texto cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSalvar} className="flex flex-col gap-4">
                {/* Tipo de Relacionamento */}
                <div>
                  <label className="block text-sm font-medium text-vms-muted mb-1.5">Tipo de Relacionamento *</label>
                  <select
                    value={form.tipoRelacionamento}
                    onChange={(e) => setForm({ ...form, tipoRelacionamento: e.target.value as TipoRelacionamento })}
                    className="w-full h-9 rounded-[8px] border border-vms-borda bg-vms-card px-3 text-sm text-vms-texto focus:outline-none focus:ring-1 focus:ring-vms-primaria"
                  >
                    <option value="assinatura">📦 Assinatura Recorrente</option>
                    <option value="venda_avulsa">💰 Venda Avulsa</option>
                    <option value="manutencao">🔧 Manutenção Mensal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-vms-muted mb-1.5">Nome Completo *</label>
                  <Input placeholder="Nome do cliente" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-vms-muted mb-1.5">E-mail</label>
                    <div className="relative">
                      <MailIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                      <Input type="email" placeholder="email@exemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-vms-muted mb-1.5">WhatsApp</label>
                    <div className="relative">
                      <MessageCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                      <Input placeholder="(11) 99999-9999" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} required className="pl-9" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-vms-muted mb-1.5">CPF ou CNPJ</label>
                    <div className="relative">
                      <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                      <Input placeholder="000.000.000-00" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-vms-muted mb-1.5">Empresa / Site</label>
                    <div className="relative">
                      <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                      <Input placeholder="Nome da empresa ou site" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} className="pl-9" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-vms-muted mb-1.5">Site Vinculado</label>
                  <select
                    value={form.siteId}
                    onChange={(e) => setForm({ ...form, siteId: e.target.value })}
                    className="w-full h-9 rounded-[8px] border border-vms-borda bg-vms-card px-3 text-sm text-vms-texto focus:outline-none focus:ring-1 focus:ring-vms-primaria"
                  >
                    <option value="">Nenhum site vinculado</option>
                    {siteOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-vms-muted mb-1.5">Plano</label>
                    <select
                      value={form.planoTipo}
                      onChange={(e) => setForm({ ...form, planoTipo: e.target.value as PlanoTipo })}
                      className="w-full h-9 rounded-[8px] border border-vms-borda bg-vms-card px-3 text-sm text-vms-texto focus:outline-none focus:ring-1 focus:ring-vms-primaria"
                    >
                      <option value="mensal">Mensal</option>
                      <option value="semestral">Semestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-vms-muted mb-1.5">
                      {form.tipoRelacionamento === "venda_avulsa" ? "Valor (R$) *" : "Valor Mensal (R$) *"}
                    </label>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                      <Input type="number" min={0} step={0.01} placeholder={form.tipoRelacionamento === "venda_avulsa" ? "1.500,00" : "197,00"} value={form.valorMensal} onChange={(e) => setForm({ ...form, valorMensal: e.target.value })} className="pl-9" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-vms-muted mb-1.5">
                      {form.tipoRelacionamento === "venda_avulsa" ? "Data da Venda *" : "Data Início *"}
                    </label>
                    <div className="relative">
                      <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                      <Input type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} className="pl-9" required />
                    </div>
                  </div>
                </div>

                {/* Data de Término */}
                <div>
                  <label className="block text-sm font-medium text-vms-muted mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <CalendarClock size={13} />
                      Data de Término do Contrato
                    </span>
                  </label>
                  <div className="relative">
                    <CalendarClock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                    <Input
                      type="date"
                      value={form.dataTermino}
                      onChange={(e) => setForm({ ...form, dataTermino: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-vms-dark-4 text-[10px] mt-1">Deixe em branco para contrato indeterminado</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-vms-muted mb-1.5">Observações / Contrato</label>
                  <textarea
                    value={form.observacoes}
                    onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                    placeholder="Observações sobre a assinatura, termos do contrato, etc."
                    rows={3}
                    className="w-full min-w-0 rounded-lg border border-vms-borda bg-transparent px-3 py-2 text-sm text-vms-texto placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
                  />
                </div>

                {/* Anexo do Contrato */}
                <div>
                  <label className="block text-sm font-medium text-vms-muted mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <FileUp size={13} />
                      Anexo do Contrato
                    </span>
                  </label>
                  <div className="border border-dashed border-vms-borda rounded-[8px] p-4 bg-vms-card/50">
                    {form.contratoAnexo ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={16} className="text-blue-400 shrink-0" />
                          <span className="text-xs text-vms-texto truncate">{form.contratoNome || "contrato.pdf"}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, contratoAnexo: null, contratoNome: null })}
                          className="p-1 rounded-[6px] text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0 ml-2"
                          title="Remover anexo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-2 cursor-pointer">
                        <Paperclip size={20} className="text-vms-muted" />
                        <span className="text-xs text-vms-muted text-center">
                          Clique para anexar contrato (PDF, JPG, PNG)
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              const base64 = (reader.result as string).split(",")[1];
                              setForm({ ...form, contratoAnexo: base64, contratoNome: file.name });
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingId(null);
                      setForm(formVazio);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={salvando || !form.nome || !form.whatsapp || !form.tipoRelacionamento} className="flex-1">
                    {editingId ? (
                      <>
                        <Pencil size={14} className="mr-1.5" />
                        Salvar Alterações
                      </>
                    ) : (
                      <>
                        <Plus size={14} className="mr-1.5" />
                        {form.tipoRelacionamento === "venda_avulsa" ? "Criar Venda" : "Criar Cliente"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Ver Detalhes */}
        {viewingCliente && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
            <div className="glass-card-premium rounded-[14px] w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-vms-texto text-base font-medium">Detalhes do Cliente</h3>
                <button onClick={() => setViewingId(null)} className="text-vms-muted hover:text-vms-texto cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Header do cliente */}
                <div className="flex items-center gap-3 p-4 rounded-[10px] bg-vms-card">
                  <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-vms-dark-5 text-sm font-bold">
                    {viewingCliente.nome
                      .split(" ")
                      .map((w) => w[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="text-vms-texto font-semibold">{viewingCliente.nome}</div>
                    <StatusBadge status={viewingCliente.status} />
                  </div>
                </div>

                {/* Dados detalhados */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-[10px] bg-vms-card">
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider mb-1">Tipo</div>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getTipoColor(viewingCliente.tipo_relacionamento)}`}>
                      {getTipoIcon(viewingCliente.tipo_relacionamento)}
                      {getTipoLabel(viewingCliente.tipo_relacionamento)}
                    </span>
                  </div>
                  <div className="p-3 rounded-[10px] bg-vms-card">
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider mb-1">E-mail</div>
                    <div className="text-vms-texto text-sm flex items-center gap-1.5">
                      <MailIcon size={12} />
                      {viewingCliente.email || "—"}
                    </div>
                  </div>
                  <div className="p-3 rounded-[10px] bg-vms-card">
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider mb-1">WhatsApp</div>
                    <div className="text-vms-texto text-sm flex items-center gap-1.5">
                      <Phone size={12} />
                      {viewingCliente.whatsapp}
                    </div>
                  </div>
                  <div className="p-3 rounded-[10px] bg-vms-card">
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider mb-1">Site / Plano</div>
                    <div className="text-vms-texto text-sm">
                      {viewingCliente.sites?.nome_site || "—"}
                      <span className="text-vms-muted ml-1">({viewingCliente.plano_tipo || "—"})</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-[10px] bg-vms-card">
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider mb-1">Valor</div>
                    <div className="text-emerald-400 text-sm font-semibold">
                      {formatCurrency(viewingCliente.valor_mensal)}
                    </div>
                  </div>
                  <div className="p-3 rounded-[10px] bg-vms-card">
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider mb-1">Data de Cadastro</div>
                    <div className="text-vms-texto-2 text-sm">{formatDate(viewingCliente.criado_em)}</div>
                  </div>
                  <div className="p-3 rounded-[10px] bg-vms-card">
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <CalendarClock size={10} />
                      Término do Contrato
                    </div>
                    <div className={`text-sm ${isProximoRenovacao(viewingCliente.data_termino) ? "text-orange-400 font-medium" : "text-vms-texto-2"}`}>
                      {viewingCliente.data_termino ? formatDate(viewingCliente.data_termino) : "Indeterminado"}
                    </div>
                    {isProximoRenovacao(viewingCliente.data_termino) && (
                      <span className="inline-block mt-1 text-[9px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
                        ⚠️ Renovação próxima
                      </span>
                    )}
                  </div>
                  <div className="p-3 rounded-[10px] bg-vms-card">
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider mb-1">Próximo Vencimento</div>
                    <div className="text-vms-texto-2 text-sm">{formatDate(viewingCliente.vencimento)}</div>
                  </div>
                </div>

                {/* Contrato Anexo */}
                {viewingCliente.contrato_anexo && (
                  <div className="p-3 rounded-[10px] bg-vms-card">
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText size={12} />
                      Contrato Anexo
                    </div>
                    <button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = `data:application/octet-stream;base64,${viewingCliente.contrato_anexo}`;
                        link.download = viewingCliente.contrato_nome || "contrato.pdf";
                        link.click();
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-[8px] bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors cursor-pointer"
                    >
                      <Download size={14} />
                      Baixar {viewingCliente.contrato_nome || "contrato.pdf"}
                    </button>
                  </div>
                )}

                {/* IDs Asaas */}
                {(viewingCliente.asaas_customer_id || viewingCliente.asaas_subscription_id) && (
                  <div className="p-3 rounded-[10px] bg-vms-card">
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider mb-2">Integração Asaas</div>
                    <div className="flex flex-col gap-1 text-xs text-vms-texto-2">
                      {viewingCliente.asaas_customer_id && (
                        <div>Customer ID: <code className="bg-vms-dark-2 px-1.5 py-0.5 rounded">{viewingCliente.asaas_customer_id.slice(0, 12)}...</code></div>
                      )}
                      {viewingCliente.asaas_subscription_id && (
                        <div>Subscription ID: <code className="bg-vms-dark-2 px-1.5 py-0.5 rounded">{viewingCliente.asaas_subscription_id.slice(0, 12)}...</code></div>
                      )}
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-3 mt-2">
                  <Button variant="secondary" onClick={() => setViewingId(null)} className="flex-1">
                    Fechar
                  </Button>
                  <Button
                    onClick={() => {
                      setViewingId(null);
                      handleEdit(viewingCliente);
                    }}
                    className="flex-1"
                  >
                    <Pencil size={14} className="mr-1.5" />
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirmar Cancelamento / Exclusão */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
            <div className="glass-card-premium rounded-[14px] w-full max-w-sm p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Ban size={20} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-vms-texto text-base font-medium">
                    {clientes.find((c) => c.id === deleteConfirm)?.status !== "cancelado"
                      ? "Cancelar Cliente?"
                      : "Excluir Cliente?"}
                  </h3>
                  <p className="text-vms-muted text-sm mt-1">
                    {clientes.find((c) => c.id === deleteConfirm)?.status !== "cancelado"
                      ? "O cliente será cancelado e não será mais cobrado."
                      : "Esta ação não pode ser desfeita."}
                  </p>
                </div>
                <div className="flex gap-3 w-full">
                  <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const cliente = clientes.find((c) => c.id === deleteConfirm);
                      if (cliente?.status !== "cancelado") {
                        handleCancelarAssinatura(deleteConfirm);
                      } else {
                        handleDelete(deleteConfirm);
                      }
                    }}
                    className="flex-1"
                  >
                    <Ban size={14} className="mr-1.5" />
                    Confirmar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
