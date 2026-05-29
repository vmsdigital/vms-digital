"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/plan-limits";
import type { Usuario, Cliente, Site } from "@/types/database";
import {
  Users,
  DollarSign,
  Globe,
  TrendingUp,
  Copy,
  Check,
  Store,
  UserPlus,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function AfiliadosPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"vendas" | "revendedores">("vendas");

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [usuarioRes, clientesRes, sitesRes] = await Promise.all([
      supabase.from("usuarios").select("*").eq("id", user.id).single(),
      supabase.from("clientes").select("*").eq("criador_id", user.id).order("criado_em", { ascending: false }),
      supabase.from("sites").select("*").eq("criador_id", user.id).order("criado_em", { ascending: false }),
    ]);

    if (usuarioRes.data) setUsuario(usuarioRes.data as Usuario);
    setClientes(clientesRes.data ?? []);
    setSites(sitesRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isAdm = usuario ? isAdmin(usuario.cargo) : false;
  const referralLink = usuario
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/cadastro?ref=${usuario.id}`
    : "";

  async function handleCopy() {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const clientesAtivos = clientes.filter((c) => c.status === "ativo");
  const clientesTrial = clientes.filter((c) => c.status === "trial");
  const receitaTotal = clientesAtivos.reduce((acc, c) => acc + (c.valor_mensal ?? 0), 0);
  const sitesPublicados = sites.filter((s) => s.publicado);

  if (loading) {
    return (
      <DashboardLayout title="Vendas">
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-vms-primaria border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Vendas">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-vms-texto text-xl font-semibold">Vendas & Revendedores</h1>
            <p className="text-vms-muted text-sm mt-1">Gerencie suas vendas de sites e programa de revendedores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<Globe size={14} />}
            label="Sites Publicados"
            value={sitesPublicados.length}
            sub={`de ${sites.length} criados`}
            green
          />
          <MetricCard
            icon={<Users size={14} />}
            label="Clientes Ativos"
            value={clientesAtivos.length}
            sub={`${clientesTrial.length} em trial`}
          />
          <MetricCard
            icon={<DollarSign size={14} />}
            label="Receita Mensal"
            value={`R$ ${receitaTotal.toLocaleString("pt-BR")}`}
            green
          />
          <MetricCard
            icon={<ShoppingBag size={14} />}
            label="Total de Vendas"
            value={clientes.length}
            sub="Todos os clientes"
          />
        </div>

        <div className="flex gap-1 rounded-[10px] glass-card-premium p-1">
          {(["vendas", "revendedores"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === t ? "bg-vms-primaria text-black" : "text-vms-muted hover:text-vms-texto-2"
              }`}
            >
              {t === "vendas" ? "Minhas Vendas" : "Revendedores"}
            </button>
          ))}
        </div>

        {tab === "vendas" && (
          <>
            <div className="glass-card-premium rounded-[14px] p-5">
              <h2 className="mb-3 text-sm font-medium text-vms-texto">Link de Venda</h2>
              <p className="text-vms-muted text-xs mb-3">Compartilhe este link para que novos clientes se cadastrem e comprem sites</p>
              <div className="flex gap-2">
                <div className="flex-1 rounded-[8px] border border-vms-borda bg-vms-fundo px-4 py-2.5 text-sm text-vms-primaria truncate">
                  {referralLink}
                </div>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-[8px] bg-vms-primaria px-4 py-2.5 text-sm font-medium text-black hover:brightness-110 transition-all shrink-0"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </div>

            <div className="glass-card-premium rounded-[14px]">
              <div className="border-b border-vms-borda p-4">
                <h2 className="text-sm font-medium text-vms-texto">Clientes & Vendas</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-vms-borda">
                      <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">WhatsApp</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Plano</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Valor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-vms-muted text-sm">
                          Nenhuma venda ainda. Compartilhe seu link!
                        </td>
                      </tr>
                    ) : (
                      clientes.map((c) => (
                        <tr key={c.id} className="border-b border-vms-borda last:border-0 hover:bg-vms-primaria-hover transition-colors">
                          <td className="px-4 py-3 text-vms-texto-2">{c.nome}</td>
                          <td className="px-4 py-3 text-vms-muted">{c.whatsapp}</td>
                          <td className="px-4 py-3">
                            <span className="rounded bg-vms-primaria-20 px-2 py-0.5 text-xs font-medium text-vms-primaria">
                              {c.plano_tipo || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-vms-texto font-medium">
                            {c.valor_mensal ? `R$ ${c.valor_mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={c.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card-premium rounded-[14px] p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-vms-primaria" />
                <h2 className="text-sm font-medium text-vms-texto">Como vender mais</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-[8px] bg-vms-fundo p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-vms-primaria-20 text-sm font-bold text-vms-primaria">1</div>
                  <h3 className="mb-1 text-sm font-medium text-vms-texto">Compartilhe seu link</h3>
                  <p className="text-xs text-vms-muted">Envie para empresários que precisam de um site profissional.</p>
                </div>
                <div className="rounded-[8px] bg-vms-fundo p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-vms-primaria-20 text-sm font-bold text-vms-primaria">2</div>
                  <h3 className="mb-1 text-sm font-medium text-vms-texto">Use a Prospecção</h3>
                  <p className="text-xs text-vms-muted">Encontre empresas sem site e ofereça nossos serviços.</p>
                </div>
                <div className="rounded-[8px] bg-vms-fundo p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-vms-primaria-20 text-sm font-bold text-vms-primaria">3</div>
                  <h3 className="mb-1 text-sm font-medium text-vms-texto">Feche negócio</h3>
                  <p className="text-xs text-vms-muted">Crie o site, adicione o cliente e comece a receber.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "revendedores" && (
          <div className="glass-card-premium rounded-[14px] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-vms-primaria-20">
                <Store size={20} className="text-vms-primaria" />
              </div>
              <div>
                <h2 className="text-vms-texto text-base font-medium">Programa de Revendedores</h2>
                <p className="text-vms-muted text-xs">Revenda sites da Startzy e ganhe comissões</p>
              </div>
            </div>

            <div className="rounded-[10px] border border-vms-borda bg-vms-fundo p-5 mb-6">
              <h3 className="text-vms-texto text-sm font-medium mb-3">Como funciona</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vms-primaria-20 text-sm font-bold text-vms-primaria">1</div>
                  <div>
                    <h4 className="text-vms-texto text-sm font-medium">Cadastre-se como revendedor</h4>
                    <p className="text-vms-muted text-xs">Solicite seu acesso ao programa de revendedores.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vms-primaria-20 text-sm font-bold text-vms-primaria">2</div>
                  <div>
                    <h4 className="text-vms-texto text-sm font-medium">Venda sites</h4>
                    <p className="text-vms-muted text-xs">Use seu link exclusivo para vender sites para seus clientes.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vms-primaria-20 text-sm font-bold text-vms-primaria">3</div>
                  <div>
                    <h4 className="text-vms-texto text-sm font-medium">Ganhe 30%</h4>
                    <p className="text-vms-muted text-xs">Comissão sobre cada pagamento do cliente que você indicou.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-[10px] border border-vms-primaria/30 bg-vms-primaria-20/30 p-4">
              <div>
                <p className="text-vms-texto text-sm font-medium">Quer ser um revendedor?</p>
                <p className="text-vms-muted text-xs">Solicite acesso e comece a ganhar com cada venda.</p>
              </div>
              <Button size="sm">
                <UserPlus size={14} className="mr-1.5" />
                Solicitar acesso
              </Button>
            </div>

            {isAdm && (
              <div className="mt-6 rounded-[10px] border border-vms-blue/30 bg-vms-blue-bg/30 p-4">
                <p className="text-vms-blue-light text-sm font-medium">Modo Admin</p>
                <p className="text-vms-muted text-xs mt-1">Como admin, você pode gerenciar todos os revendedores, aprovar cadastros e definir comissões.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
