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
  Phone,
  Mail,
  X,
  Globe,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
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

  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formSiteId, setFormSiteId] = useState("");
  const [formPlanoTipo, setFormPlanoTipo] = useState<PlanoTipo>("mensal");
  const [formValor, setFormValor] = useState(PRECOS_SITE.mensal.preco.toString());
  const [formStatus, setFormStatus] = useState<StatusCliente>("trial");
  const [formVencimento, setFormVencimento] = useState("");
  const [salvando, setSalvando] = useState(false);

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

    setShowModal(false);
    resetForm();
    setSalvando(false);
    fetchClientes();
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

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-[240px]">
              <Input
                placeholder="Buscar cliente..."
                icon={<Search size={14} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-[160px]">
              <Select
                options={STATUS_FILTER_OPTIONS}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={14} className="mr-1.5" />
            Novo Cliente
          </Button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
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
                        <button className="p-1.5 rounded-lg text-vms-muted hover:text-vms-texto-2 hover:bg-vms-dark-2 transition-colors cursor-pointer">
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg text-vms-muted hover:text-vms-texto-2 hover:bg-vms-dark-2 transition-colors cursor-pointer">
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="glass-card rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-vms-texto text-base font-medium">Novo Cliente</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-vms-muted hover:text-vms-texto cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCriarCliente} className="flex flex-col gap-4">
              <Input
                label="Nome"
                placeholder="Nome completo"
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                required
              />
              <Input
                label="E-mail"
                type="email"
                placeholder="email@exemplo.com"
                icon={<Mail size={14} />}
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
              <Input
                label="WhatsApp"
                placeholder="(11) 99999-9999"
                icon={<Phone size={14} />}
                value={formWhatsapp}
                onChange={(e) => setFormWhatsapp(e.target.value)}
                required
              />
              <Select
                label="Site"
                options={[{ value: "", label: "Selecione um site" }, ...siteOptions]}
                value={formSiteId}
                onChange={(e) => setFormSiteId(e.target.value)}
              />
              <Select
                label="Plano"
                options={PLANO_OPTIONS}
                value={formPlanoTipo}
                onChange={(e) => setFormPlanoTipo(e.target.value as PlanoTipo)}
              />
              <Input
                label="Valor mensal (R$)"
                type="number"
                min={0}
                step={0.01}
                icon={<DollarSign size={14} />}
                value={formValor}
                onChange={(e) => setFormValor(e.target.value)}
              />
              <Select
                label="Status"
                options={Object.entries(STATUS_CLIENTE).map(([key, val]) => ({
                  value: key,
                  label: val.label,
                }))}
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as StatusCliente)}
              />
              <Input
                label="Vencimento"
                type="date"
                value={formVencimento}
                onChange={(e) => setFormVencimento(e.target.value)}
              />

              <div className="flex gap-3 mt-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvando || !formNome || !formWhatsapp} className="flex-1">
                  <Plus size={14} className="mr-1.5" />
                  Criar cliente
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
