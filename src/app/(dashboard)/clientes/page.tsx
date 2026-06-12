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
  MessageCircle,
  KeyRound,
  AlertCircle,
  Check,
  Share2,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { LoadingIA } from "@/components/ui/LoadingIA";
import { createClient } from "@/lib/supabase/client";
import { STATUS_CLIENTE, PRECOS_SITE } from "@/lib/constants";
import type { Cliente, Site } from "@/types/database";

type StatusCliente = Cliente["status"];
type PlanoTipo = NonNullable<Cliente["plano_tipo"]>;

interface ClienteComSite extends Cliente {
  sites?: { nome_site: string } | null;
}

const STATUS_FILTER_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "trial", label: "Trial" },
  { value: "ativo", label: "Ativo" },
  { value: "inadimplente", label: "Inadimplente" },
  { value: "cancelado", label: "Cancelado" },
];

const PLANO_OPTIONS = Object.entries(PRECOS_SITE).map(([key, val]) => ({
  value: key,
  label: `${val.label} — R$ ${val.preco}/mês`,
}));

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteComSite[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formSiteId, setFormSiteId] = useState("");
  const [formPlanoTipo, setFormPlanoTipo] = useState<PlanoTipo>("mensal");
  const [formValor, setFormValor] = useState(PRECOS_SITE.mensal.preco.toString());
  const [formStatus, setFormStatus] = useState<StatusCliente>("trial");
  const [formVencimento, setFormVencimento] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [criandoAcesso, setCriandoAcesso] = useState<string | null>(null);
  const [acessoMsg, setAcessoMsg] = useState<{ id: string; type: "success" | "error"; text: string } | null>(null);
  const [portalCopied, setPortalCopied] = useState<string | null>(null);

  const fetchClientes = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("clientes")
      .select("*, sites(nome_site)")
      .eq("criador_id", user.id)
      .order("criado_em", { ascending: false });

    if (data) setClientes(data as ClienteComSite[]);

    const { data: sitesData } = await supabase
      .from("sites")
      .select("id, nome_site, criador_id, nicho, slug, dados_json, template_id, publicado, criado_em")
      .eq("criador_id", user.id);

    if (sitesData) setSites(sitesData as Site[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  useEffect(() => {
    const preco = PRECOS_SITE[formPlanoTipo]?.preco;
    if (preco) setFormValor(preco.toString());
  }, [formPlanoTipo]);

  async function handleCriarCliente(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingId) {
      await supabase
        .from("clientes")
        .update({
          site_id: formSiteId || null,
          nome: formNome,
          email: formEmail || null,
          whatsapp: formWhatsapp,
          plano_tipo: formPlanoTipo,
          valor_mensal: Number(formValor),
          status: formStatus,
          vencimento: formVencimento || null,
        })
        .eq("id", editingId);
    } else {
      await supabase.from("clientes").insert({
        criador_id: user.id,
        site_id: formSiteId || null,
        nome: formNome,
        email: formEmail || null,
        whatsapp: formWhatsapp,
        plano_tipo: formPlanoTipo,
        valor_mensal: Number(formValor),
        status: formStatus,
        vencimento: formVencimento || null,
      });
    }

    setShowModal(false);
    setEditingId(null);
    resetForm();
    setSalvando(false);
    fetchClientes();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("clientes").delete().eq("id", id);
    setDeleteConfirm(null);
    fetchClientes();
  }

  function handleEdit(cliente: ClienteComSite) {
    setEditingId(cliente.id);
    setFormNome(cliente.nome);
    setFormEmail(cliente.email || "");
    setFormWhatsapp(cliente.whatsapp);
    setFormSiteId(cliente.site_id || "");
    setFormPlanoTipo(cliente.plano_tipo || "mensal");
    setFormValor((cliente.valor_mensal || PRECOS_SITE.mensal.preco).toString());
    setFormStatus(cliente.status);
    setFormVencimento(cliente.vencimento || "");
    setShowModal(true);
  }

  function handleNewProposta(cliente: ClienteComSite) {
    if (cliente.site_id) {
      window.open(`/proposta/${cliente.site_id}`, "_blank");
    }
  }

  function handleSharePortal(cliente: ClienteComSite) {
    const portalUrl = `${window.location.origin}/portal/${cliente.id}`;
    navigator.clipboard.writeText(portalUrl);
    setPortalCopied(cliente.id);
    setTimeout(() => setPortalCopied(null), 2000);
  }

  async function handleCriarAcesso(cliente: ClienteComSite) {
    if (!cliente.email) return;
    setCriandoAcesso(cliente.id);
    setAcessoMsg(null);

    try {
      const res = await fetch("/api/clientes/criar-acesso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: cliente.id,
          email: cliente.email,
          nome: cliente.nome,
        }),
      });

      const data = await res.json();

      if (data.tempPassword) {
        setAcessoMsg({
          id: cliente.id,
          type: "success",
          text: `Acesso criado! Senha: ${data.tempPassword}`,
        });
      } else if (data.error?.includes("já possui cadastro")) {
        setAcessoMsg({
          id: cliente.id,
          type: "error",
          text: "E-mail já cadastrado. Cliente pode usar senha existente.",
        });
      } else {
        setAcessoMsg({
          id: cliente.id,
          type: "error",
          text: data.error || "Erro ao criar acesso.",
        });
      }
    } catch {
      setAcessoMsg({
        id: cliente.id,
        type: "error",
        text: "Erro de conexão.",
      });
    }

    setCriandoAcesso(null);
    setTimeout(() => setAcessoMsg(null), 8000);
  }

  function resetForm() {
    setFormNome("");
    setFormEmail("");
    setFormWhatsapp("");
    setFormSiteId("");
    setFormPlanoTipo("mensal");
    setFormValor(PRECOS_SITE.mensal.preco.toString());
    setFormStatus("trial");
    setFormVencimento("");
  }

  function handleExportCSV() {
    const headers = ["Nome", "Email", "WhatsApp", "Site", "Plano", "Valor", "Status", "Vencimento"];
    const rows = filtered.map((c) => [
      c.nome,
      c.email || "",
      c.whatsapp,
      c.sites?.nome_site || "",
      c.plano_tipo || "",
      c.valor_mensal?.toString() || "0",
      c.status,
      c.vencimento || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes_vms_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

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

  const filtered = clientes.filter((c) => {
    const matchSearch =
      !search ||
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.whatsapp.includes(search);
    const matchStatus = statusFilter === "todos" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalAtivos = clientes.filter((c) => c.status === "ativo").length;
  const totalInadimplentes = clientes.filter((c) => c.status === "inadimplente").length;
  const receitaTotal = clientes
    .filter((c) => c.status === "ativo" && c.valor_mensal)
    .reduce((acc, c) => acc + (c.valor_mensal || 0), 0);

  const siteOptions = sites.map((s) => ({
    value: s.id,
    label: s.nome_site,
  }));

  if (loading) {
    return (
      <DashboardLayout title="Clientes">
        <LoadingIA message="Carregando clientes..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Clientes">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            icon={<Users size={14} />}
            label="Total clientes"
            value={clientes.length}
          />
          <MetricCard
            icon={<UserCheck size={14} />}
            label="Ativos"
            value={totalAtivos}
            green
          />
          <MetricCard
            icon={<AlertTriangle size={14} />}
            label="Inadimplentes"
            value={totalInadimplentes}
          />
          <MetricCard
            icon={<DollarSign size={14} />}
            label="Receita / mês"
            value={formatCurrency(receitaTotal)}
            green
          />
        </div>

        {acessoMsg && (
          <div className={`animate-toast-in flex items-center gap-2 px-4 py-3 rounded-[10px] border text-sm ${
            acessoMsg.type === "success"
              ? "border-vms-primaria/30 bg-vms-primaria-20 text-vms-primaria"
              : "border-vms-erro/30 bg-vms-red-bg text-vms-erro"
          }`}>
            {acessoMsg.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
            {acessoMsg.text}
          </div>
        )}

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
            <Button onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }}>
              <Plus size={14} className="mr-1.5" />
              Novo Cliente
            </Button>
          </div>
        </div>

        <div className="glass-card-premium rounded-[14px] overflow-hidden">
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-vms-borda">
                  <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Nome</th>
                  <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">WhatsApp</th>
                  <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Site</th>
                  <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Plano</th>
                  <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Valor</th>
                  <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Status</th>
                  <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Vencimento</th>
                  <th className="text-right text-vms-muted text-xs font-medium px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vms-borda">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-vms-dark-5 text-xs py-8">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                )}
                {filtered.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="hover:bg-vms-primaria-hover transition-colors"
                  >
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
                            <div className="text-vms-muted text-xs">{cliente.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-vms-texto-2 text-xs">{cliente.whatsapp}</td>
                    <td className="px-4 py-3 text-vms-texto-2 text-xs">
                      {cliente.sites?.nome_site || "—"}
                    </td>
                    <td className="px-4 py-3 text-vms-texto-2 text-xs">
                      {cliente.plano_tipo
                        ? PRECOS_SITE[cliente.plano_tipo]?.label || cliente.plano_tipo
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-vms-primaria text-sm font-medium">
                      {formatCurrency(cliente.valor_mensal)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={cliente.status} />
                    </td>
                    <td className="px-4 py-3 text-vms-texto-2 text-xs">
                      {formatDate(cliente.vencimento)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {cliente.email && (
                          <button
                            onClick={() => handleCriarAcesso(cliente)}
                            disabled={criandoAcesso === cliente.id}
                            className="p-1.5 rounded-[8px] text-vms-muted hover:text-vms-primaria hover:bg-vms-dark-2 transition-colors cursor-pointer"
                            title="Criar acesso para o cliente"
                          >
                            {criandoAcesso === cliente.id ? (
                              <div className="h-3.5 w-3.5 border-2 border-vms-primaria border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <KeyRound size={14} />
                            )}
                          </button>
                        )}
                        {cliente.site_id && (
                          <button
                            onClick={() => handleNewProposta(cliente)}
                            className="p-1.5 rounded-[8px] text-vms-muted hover:text-vms-primaria hover:bg-vms-dark-2 transition-colors cursor-pointer"
                            title="Enviar proposta"
                          >
                            <Globe size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleSharePortal(cliente)}
                          className="p-1.5 rounded-[8px] text-vms-muted hover:text-vms-primaria hover:bg-vms-dark-2 transition-colors cursor-pointer"
                          title={portalCopied === cliente.id ? "Link copiado!" : "Compartilhar portal do cliente"}
                        >
                          {portalCopied === cliente.id ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
                        </button>
                        <button
                          onClick={() => handleEdit(cliente)}
                          className="p-1.5 rounded-[8px] text-vms-muted hover:text-vms-texto-2 hover:bg-vms-dark-2 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
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
                      {cliente.email && (
                        <div className="text-vms-muted text-xs">{cliente.email}</div>
                      )}
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
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider">Site</div>
                    <div className="text-vms-texto-2 text-xs">{cliente.sites?.nome_site || "—"}</div>
                  </div>
                  <div>
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider">Plano</div>
                    <div className="text-vms-texto-2 text-xs">
                      {cliente.plano_tipo
                        ? PRECOS_SITE[cliente.plano_tipo]?.label || cliente.plano_tipo
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-vms-muted text-[10px] uppercase tracking-wider">Valor</div>
                    <div className="text-vms-primaria text-xs font-medium">
                      {formatCurrency(cliente.valor_mensal)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-vms-borda">
                  <div className="text-vms-texto-2 text-xs">
                    {formatDate(cliente.vencimento)}
                  </div>
                  <div className="flex items-center gap-1">
                    {cliente.email && (
                      <button
                        onClick={() => handleCriarAcesso(cliente)}
                        disabled={criandoAcesso === cliente.id}
                        className="p-1.5 rounded-[8px] text-vms-muted hover:text-vms-primaria hover:bg-vms-dark-2 transition-colors cursor-pointer"
                        title="Criar acesso para o cliente"
                      >
                        {criandoAcesso === cliente.id ? (
                          <div className="h-3.5 w-3.5 border-2 border-vms-primaria border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <KeyRound size={14} />
                        )}
                      </button>
                    )}
                    {cliente.site_id && (
                      <button
                        onClick={() => handleNewProposta(cliente)}
                        className="p-1.5 rounded-[8px] text-vms-muted hover:text-vms-primaria hover:bg-vms-dark-2 transition-colors cursor-pointer"
                        title="Enviar proposta"
                      >
                        <Globe size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(cliente)}
                      className="p-1.5 rounded-[8px] text-vms-muted hover:text-vms-texto-2 hover:bg-vms-dark-2 transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(cliente.id)}
                      className="p-1.5 rounded-[8px] text-vms-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
                  resetForm();
                }}
                className="text-vms-muted hover:text-vms-texto cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCriarCliente} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-vms-muted mb-1.5">Nome</label>
                <Input
                  placeholder="Nome completo"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-vms-muted mb-1.5">E-mail</label>
                <div className="relative">
                  <MailIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-vms-muted mb-1.5">WhatsApp</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                  <Input
                    placeholder="(11) 99999-9999"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-vms-muted mb-1.5">Site</label>
                <select
                  value={formSiteId}
                  onChange={(e) => setFormSiteId(e.target.value)}
                  className="w-full h-9 rounded-[8px] border border-vms-borda bg-vms-card px-3 text-sm text-vms-texto focus:outline-none focus:ring-1 focus:ring-vms-primaria"
                >
                  <option value="">Selecione um site</option>
                  {siteOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-vms-muted mb-1.5">Plano</label>
                <select
                  value={formPlanoTipo}
                  onChange={(e) => setFormPlanoTipo(e.target.value as PlanoTipo)}
                  className="w-full h-9 rounded-[8px] border border-vms-borda bg-vms-card px-3 text-sm text-vms-texto focus:outline-none focus:ring-1 focus:ring-vms-primaria"
                >
                  {PLANO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-vms-muted mb-1.5">Valor mensal (R$)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={formValor}
                    onChange={(e) => setFormValor(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-vms-muted mb-1.5">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as StatusCliente)}
                  className="w-full h-9 rounded-[8px] border border-vms-borda bg-vms-card px-3 text-sm text-vms-texto focus:outline-none focus:ring-1 focus:ring-vms-primaria"
                >
                  {Object.entries(STATUS_CLIENTE).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-vms-muted mb-1.5">Vencimento</label>
                <Input
                  type="date"
                  value={formVencimento}
                  onChange={(e) => setFormVencimento(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvando || !formNome || !formWhatsapp} className="flex-1">
                  {editingId ? (
                    <>
                      <Pencil size={14} className="mr-1.5" />
                      Salvar alterações
                    </>
                  ) : (
                    <>
                      <Plus size={14} className="mr-1.5" />
                      Criar cliente
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="glass-card-premium rounded-[14px] w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-vms-texto text-base font-medium">Excluir cliente?</h3>
                <p className="text-vms-muted text-sm mt-1">
                  Esta ação não pode ser desfeita. O cliente será removido permanentemente.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1"
                >
                  <Trash2 size={14} className="mr-1.5" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
