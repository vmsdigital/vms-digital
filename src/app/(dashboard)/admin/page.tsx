"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  DollarSign,
  Globe,
  TrendingUp,
  Shield,
  LogIn,
  Bell,
  Plus,
  X,
  Eye,
  Trash2,
  RefreshCw,
  CreditCard,
  Search,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingIA } from "@/components/ui/LoadingIA";
import { createClient } from "@/lib/supabase/client";
import type { Usuario, Cliente, Site, Notificacao } from "@/types/database";

type TabType = "visao" | "usuarios" | "clientes" | "notificacoes" | "atualizacoes";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("visao");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUsuario, setSearchUsuario] = useState("");

  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifUsuarioId, setNotifUsuarioId] = useState("");
  const [notifTipo, setNotifTipo] = useState<Notificacao["tipo"]>("sistema");
  const [notifTitulo, setNotifTitulo] = useState("");
  const [notifMensagem, setNotifMensagem] = useState("");
  const [notifSaving, setNotifSaving] = useState(false);

  const [showAtualizacaoModal, setShowAtualizacaoModal] = useState(false);
  const [atualizacaoVersao, setAtualizacaoVersao] = useState("");
  const [atualizacaoDescricao, setAtualizacaoDescricao] = useState("");
  const [atualizacaoSaving, setAtualizacaoSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: usuarioData } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .single();

    if (usuarioData?.cargo !== "admin") return;

    const [usuariosRes, clientesRes, sitesRes] = await Promise.all([
      supabase.from("usuarios").select("*").order("criado_em", { ascending: false }),
      supabase.from("clientes").select("*, sites(nome_site)").order("criado_em", { ascending: false }),
      supabase.from("sites").select("*").order("criado_em", { ascending: false }),
    ]);

    if (usuariosRes.data) setUsuarios(usuariosRes.data as Usuario[]);
    if (clientesRes.data) setClientes(clientesRes.data as Cliente[]);
    if (sitesRes.data) setSites(sitesRes.data as Site[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleLoginAs(userId: string) {
    const supabase = createClient();
    const { data: targetUser } = await supabase
      .from("usuarios")
      .select("email")
      .eq("id", userId)
      .single();

    if (!targetUser?.email) return;

    const { error } = await supabase.auth.signInWithOtp({
      email: targetUser.email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });

    if (error) {
      alert("Erro ao enviar link de acesso: " + error.message);
    } else {
      alert(`Link de acesso enviado para ${targetUser.email}!`);
    }
  }

  async function handleCriarNotificacao(e: React.FormEvent) {
    e.preventDefault();
    setNotifSaving(true);

    const supabase = createClient();

    if (notifUsuarioId === "todos") {
      for (const u of usuarios) {
        await supabase.from("notificacoes").insert({
          usuario_id: u.id,
          tipo: notifTipo,
          titulo: notifTitulo,
          mensagem: notifMensagem,
        });
      }
    } else {
      await supabase.from("notificacoes").insert({
        usuario_id: notifUsuarioId,
        tipo: notifTipo,
        titulo: notifTitulo,
        mensagem: notifMensagem,
      });
    }

    setShowNotifModal(false);
    setNotifTitulo("");
    setNotifMensagem("");
    setNotifTipo("sistema");
    setNotifUsuarioId("");
    setNotifSaving(false);
  }

  async function handleCriarAtualizacao(e: React.FormEvent) {
    e.preventDefault();
    setAtualizacaoSaving(true);

    const supabase = createClient();

    for (const u of usuarios) {
      await supabase.from("notificacoes").insert({
        usuario_id: u.id,
        tipo: "atualizacao",
        titulo: `Atualização v${atualizacaoVersao}`,
        mensagem: atualizacaoDescricao,
      });
    }

    setShowAtualizacaoModal(false);
    setAtualizacaoVersao("");
    setAtualizacaoDescricao("");
    setAtualizacaoSaving(false);
  }

  const clientesAtivos = clientes.filter((c) => c.status === "ativo");
  const receitaTotal = clientesAtivos.reduce(
    (acc, c) => acc + (c.valor_mensal ?? 0),
    0
  );
  const sitesPublicados = sites.filter((s) => s.publicado);

  const filteredUsuarios = usuarios.filter(
    (u) =>
      !searchUsuario ||
      u.nome.toLowerCase().includes(searchUsuario.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUsuario.toLowerCase())
  );

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "visao", label: "Visão Geral", icon: <TrendingUp size={16} /> },
    { key: "usuarios", label: "Usuários", icon: <Users size={16} /> },
    { key: "clientes", label: "Clientes", icon: <CreditCard size={16} /> },
    { key: "notificacoes", label: "Notificações", icon: <Bell size={16} /> },
    { key: "atualizacoes", label: "Atualizações", icon: <RefreshCw size={16} /> },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Admin">
        <LoadingIA message="Carregando painel admin..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-vms-primaria" />
          <h1 className="text-xl font-semibold text-vms-texto">
            Painel Administrativo
          </h1>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-[10px] px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-vms-primaria text-black"
                  : "bg-vms-dark-2 text-vms-muted hover:text-vms-texto-2"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "visao" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={<Users size={14} />}
                label="Total Usuários"
                value={usuarios.length}
                sub={`${usuarios.filter((u) => u.cargo === "admin").length} admins`}
              />
              <MetricCard
                icon={<CreditCard size={14} />}
                label="Clientes Ativos"
                value={clientesAtivos.length}
                sub={`de ${clientes.length} total`}
                green
              />
              <MetricCard
                icon={<DollarSign size={14} />}
                label="Receita Mensal"
                value={`R$ ${receitaTotal.toLocaleString("pt-BR")}`}
                green
              />
              <MetricCard
                icon={<Globe size={14} />}
                label="Sites Publicados"
                value={sitesPublicados.length}
                sub={`de ${sites.length} criados`}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="glass-card-premium rounded-[14px] p-5">
                <h3 className="mb-3 text-sm font-medium text-vms-texto">
                  Planos dos Usuários
                </h3>
                <div className="space-y-2">
                  {["gratuito", "starter", "pro"].map((plano) => {
                    const count = usuarios.filter((u) => u.plano === plano).length;
                    const pct = usuarios.length > 0 ? (count / usuarios.length) * 100 : 0;
                    return (
                      <div key={plano} className="flex items-center gap-3">
                        <span className="w-20 text-xs text-vms-muted capitalize">
                          {plano}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-vms-dark-3 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-vms-primaria transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-vms-texto-2 w-8 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-card-premium rounded-[14px] p-5">
                <h3 className="mb-3 text-sm font-medium text-vms-texto">
                  Status dos Clientes
                </h3>
                <div className="space-y-2">
                  {["ativo", "trial", "inadimplente", "cancelado"].map(
                    (status) => {
                      const count = clientes.filter(
                        (c) => c.status === status
                      ).length;
                      const pct =
                        clientes.length > 0
                          ? (count / clientes.length) * 100
                          : 0;
                      return (
                        <div key={status} className="flex items-center gap-3">
                          <span className="w-24 text-xs text-vms-muted capitalize">
                            {status}
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-vms-dark-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                status === "ativo"
                                  ? "bg-green-400"
                                  : status === "trial"
                                    ? "bg-vms-blue-light"
                                    : status === "inadimplente"
                                      ? "bg-vms-red-light"
                                      : "bg-vms-muted"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-vms-texto-2 w-8 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "usuarios" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-[240px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                  <input
                    type="text"
                    value={searchUsuario}
                    onChange={(e) => setSearchUsuario(e.target.value)}
                    placeholder="Buscar usuário..."
                    className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2 pl-9 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="glass-card-premium rounded-[14px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-vms-borda">
                      <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">
                        E-mail
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">
                        Plano
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">
                        Cargo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">
                        Cadastro
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-vms-muted">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsuarios.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-vms-borda last:border-0 hover:bg-vms-primaria-hover transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vms-primaria/10 text-xs font-bold text-vms-primaria">
                              {u.nome.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-vms-texto font-medium">
                              {u.nome}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-vms-texto-2">
                          {u.email}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-vms-primaria-20 px-2 py-0.5 text-xs font-medium text-vms-primaria capitalize">
                            {u.plano}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              u.cargo === "admin"
                                ? "bg-vms-red-bg text-vms-red-light"
                                : "bg-vms-blue-bg text-vms-blue-light"
                            }`}
                          >
                            {u.cargo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-vms-muted text-xs">
                          {new Date(u.criado_em).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleLoginAs(u.id)}
                              className="flex items-center gap-1 rounded-[8px] px-2 py-1 text-xs text-vms-primaria transition-colors hover:bg-vms-primaria-20"
                              title="Logar como este usuário"
                            >
                              <LogIn size={12} />
                              Login
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsuarios.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-vms-muted">
                  <Users className="mb-2 h-8 w-8 opacity-40" />
                  <p className="text-sm">Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "clientes" && (
          <div className="glass-card-premium rounded-[14px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-vms-borda">
                    <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">
                      Site
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">
                      Plano
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">
                      Valor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">
                      Asaas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-vms-borda last:border-0 hover:bg-vms-primaria-hover transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-vms-texto font-medium">{c.nome}</p>
                          <p className="text-xs text-vms-muted">{c.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-vms-texto-2 text-xs">
                        {(c as Cliente & { sites?: { nome_site: string } | null }).sites?.nome_site || "—"}
                      </td>
                      <td className="px-4 py-3 text-vms-texto-2 text-xs capitalize">
                        {c.plano_tipo || "—"}
                      </td>
                      <td className="px-4 py-3 text-vms-primaria text-sm font-medium">
                        {c.valor_mensal
                          ? `R$ ${c.valor_mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            c.status === "ativo"
                              ? "bg-green-500/10 text-green-400"
                              : c.status === "inadimplente"
                                ? "bg-vms-red-bg text-vms-red-light"
                                : c.status === "trial"
                                  ? "bg-vms-blue-bg text-vms-blue-light"
                                  : "bg-white/5 text-vms-muted"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-vms-muted">
                        {c.asaas_customer_id ? (
                          <span className="text-green-400">Conectado</span>
                        ) : (
                          <span>Pendente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "notificacoes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-vms-texto">
                Enviar Notificações
              </h3>
              <button
                onClick={() => setShowNotifModal(true)}
                className="flex items-center gap-1.5 rounded-[10px] bg-vms-primaria px-4 py-2 text-sm font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:brightness-110"
              >
                <Plus size={14} />
                Nova Notificação
              </button>
            </div>

            <div className="glass-card-premium rounded-[14px] p-5">
              <p className="text-sm text-vms-texto-2">
                Envie notificações para usuários específicos ou para todos.
                As notificações aparecem em tempo real no painel deles.
              </p>
            </div>
          </div>
        )}

        {activeTab === "atualizacoes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-vms-texto">
                Notas de Atualização
              </h3>
              <button
                onClick={() => setShowAtualizacaoModal(true)}
                className="flex items-center gap-1.5 rounded-[10px] bg-vms-primaria px-4 py-2 text-sm font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:brightness-110"
              >
                <Plus size={14} />
                Nova Atualização
              </button>
            </div>

            <div className="glass-card-premium rounded-[14px] p-5">
              <p className="text-sm text-vms-texto-2">
                Publique notas de atualização que serão notificadas a todos os
                usuários da plataforma.
              </p>
            </div>
          </div>
        )}
      </div>

      {showNotifModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="glass-card-premium rounded-[14px] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-vms-texto text-base font-medium">
                Nova Notificação
              </h3>
              <button
                onClick={() => setShowNotifModal(false)}
                className="text-vms-muted hover:text-vms-texto cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCriarNotificacao} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">
                  Destinatário
                </label>
                <select
                  value={notifUsuarioId}
                  onChange={(e) => setNotifUsuarioId(e.target.value)}
                  required
                  className="w-full rounded-[10px] border border-white/5 bg-white/5 px-4 py-2.5 text-sm text-vms-texto focus:border-vms-primaria/50 focus:outline-none transition-all"
                >
                  <option value="">Selecione...</option>
                  <option value="todos">Todos os usuários</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">
                  Tipo
                </label>
                <select
                  value={notifTipo}
                  onChange={(e) =>
                    setNotifTipo(e.target.value as Notificacao["tipo"])
                  }
                  className="w-full rounded-[10px] border border-white/5 bg-white/5 px-4 py-2.5 text-sm text-vms-texto focus:border-vms-primaria/50 focus:outline-none transition-all"
                >
                  <option value="sistema">Sistema</option>
                  <option value="cliente_novo">Cliente Novo</option>
                  <option value="pagamento">Pagamento</option>
                  <option value="atualizacao">Atualização</option>
                  <option value="site_publicado">Site Publicado</option>
                  <option value="proposta">Proposta</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">
                  Título
                </label>
                <input
                  type="text"
                  value={notifTitulo}
                  onChange={(e) => setNotifTitulo(e.target.value)}
                  placeholder="Título da notificação"
                  required
                  className="w-full rounded-[10px] border border-white/5 bg-white/5 px-4 py-2.5 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">
                  Mensagem
                </label>
                <textarea
                  value={notifMensagem}
                  onChange={(e) => setNotifMensagem(e.target.value)}
                  placeholder="Conteúdo da notificação"
                  rows={3}
                  required
                  className="w-full rounded-[10px] border border-white/5 bg-white/5 px-4 py-2.5 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowNotifModal(false)}
                  className="flex-1 rounded-[10px] bg-vms-dark-2 px-4 py-2.5 text-sm font-medium text-vms-texto-2 transition-colors hover:bg-vms-dark-3"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={notifSaving || !notifUsuarioId || !notifTitulo}
                  className="flex-1 rounded-[10px] bg-vms-primaria px-4 py-2.5 text-sm font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {notifSaving ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAtualizacaoModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="glass-card-premium rounded-[14px] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-vms-texto text-base font-medium">
                Nova Atualização
              </h3>
              <button
                onClick={() => setShowAtualizacaoModal(false)}
                className="text-vms-muted hover:text-vms-texto cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCriarAtualizacao} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">
                  Versão
                </label>
                <input
                  type="text"
                  value={atualizacaoVersao}
                  onChange={(e) => setAtualizacaoVersao(e.target.value)}
                  placeholder="Ex: 1.2.0"
                  required
                  className="w-full rounded-[10px] border border-white/5 bg-white/5 px-4 py-2.5 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">
                  Descrição
                </label>
                <textarea
                  value={atualizacaoDescricao}
                  onChange={(e) => setAtualizacaoDescricao(e.target.value)}
                  placeholder="O que mudou nesta versão?"
                  rows={4}
                  required
                  className="w-full rounded-[10px] border border-white/5 bg-white/5 px-4 py-2.5 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAtualizacaoModal(false)}
                  className="flex-1 rounded-[10px] bg-vms-dark-2 px-4 py-2.5 text-sm font-medium text-vms-texto-2 transition-colors hover:bg-vms-dark-3"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={atualizacaoSaving || !atualizacaoVersao}
                  className="flex-1 rounded-[10px] bg-vms-primaria px-4 py-2.5 text-sm font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {atualizacaoSaving ? "Publicando..." : "Publicar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
