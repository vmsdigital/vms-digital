"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Globe,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Palette,
  Pencil,
  MessageCircle,
  ArrowLeft,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Cliente, Site } from "@/types/database";

interface Pagamento {
  id: string;
  valor: number;
  tipo: string;
  descricao: string;
  status: string;
  criado_em: string;
}

interface Vendedor {
  id: string;
  nome: string;
  email: string;
  avatar_url: string | null;
}

interface PortalData {
  cliente: Cliente;
  site: Site | null;
  pagamentos: Pagamento[];
  vendedor: Vendedor;
}

type DeviceType = "desktop" | "tablet" | "mobile";

const DEVICE_SIZES: Record<DeviceType, { width: string; height: string; icon: typeof Monitor }> = {
  desktop: { width: "100%", height: "100%", icon: Monitor },
  tablet: { width: "768px", height: "1024px", icon: Tablet },
  mobile: { width: "375px", height: "812px", icon: Smartphone },
};

export default function PortalClientePage() {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"visao" | "site" | "pagamentos" | "edicao">("visao");
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setError("Link de acesso inválido");
      setLoading(false);
      return;
    }
    fetchPortalData(token);
  }, []);

  async function fetchPortalData(token: string) {
    try {
      const res = await fetch(`/api/portal-cliente?cliente_id=${token}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Erro ao carregar dados");
        setLoading(false);
        return;
      }
      const portalData = await res.json();
      setData(portalData);
    } catch {
      setError("Erro de conexão");
    }
    setLoading(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-vms-fundo flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-vms-primaria mx-auto mb-4" />
          <p className="text-vms-ghost">Carregando portal...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-vms-fundo flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-12 h-12 text-vms-red-light mx-auto mb-4" />
          <h1 className="text-xl font-bold text-vms-texto mb-2">Acesso Negado</h1>
          <p className="text-vms-ghost">{error || "Dados não encontrados"}</p>
          <Link href="/" className="inline-block mt-6 text-vms-primaria hover:underline">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const { cliente, site, pagamentos, vendedor } = data;

  return (
    <div className="min-h-screen bg-vms-fundo">
      <header className="sticky top-0 z-50 border-b border-vms-borda bg-vms-fundo/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}
            >
              {vendedor.nome?.charAt(0) || "S"}
            </div>
            <div>
              <p className="text-sm font-semibold text-vms-texto">{vendedor.nome}</p>
              <p className="text-xs text-vms-ghost">Portal do Cliente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-vms-ghost hover:text-vms-texto hover:bg-vms-dark-3 transition"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copiado!" : "Compartilhar"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-vms-texto">Olá, {cliente.nome}! 👋</h1>
          <p className="text-vms-ghost mt-1">Acompanhe o andamento do seu projeto aqui.</p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {[
            { key: "visao" as const, label: "Visão Geral", icon: Globe },
            { key: "site" as const, label: "Meu Site", icon: Eye },
            { key: "pagamentos" as const, label: "Pagamentos", icon: CreditCard },
            { key: "edicao" as const, label: "Edição Rápida", icon: Pencil },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.key
                  ? "bg-vms-primaria text-vms-fundo"
                  : "bg-vms-dark-3 text-vms-ghost hover:text-vms-texto"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "visao" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-vms-dark-2 border border-vms-borda rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-vms-primaria/10 flex items-center justify-center">
                    <Globe className="text-vms-primaria" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-vms-ghost">Status do Projeto</p>
                    <p className="text-sm font-semibold text-vms-texto">
                      {site?.publicado ? "Publicado" : "Em Desenvolvimento"}
                    </p>
                  </div>
                </div>
                {site && (
                  <div className="mt-3 pt-3 border-t border-vms-borda">
                    <p className="text-xs text-vms-ghost">Nome do site</p>
                    <p className="text-sm text-vms-texto">{site.nome_site}</p>
                  </div>
                )}
              </div>

              <div className="bg-vms-dark-2 border border-vms-borda rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <CreditCard className="text-green-400" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-vms-ghost">Plano</p>
                    <p className="text-sm font-semibold text-vms-texto capitalize">
                      {cliente.plano_tipo || "Mensal"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-vms-borda">
                  <p className="text-xs text-vms-ghost">Valor</p>
                  <p className="text-sm text-vms-texto">
                    {cliente.valor_mensal ? formatCurrency(cliente.valor_mensal) : "—"}
                  </p>
                </div>
              </div>

              <div className="bg-vms-dark-2 border border-vms-borda rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Clock className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-vms-ghost">Vencimento</p>
                    <p className="text-sm font-semibold text-vms-texto">
                      {cliente.vencimento
                        ? `Dia ${new Date(cliente.vencimento).getDate()}`
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-vms-borda">
                  <p className="text-xs text-vms-ghost">Status</p>
                  <p
                    className={`text-sm font-medium ${
                      cliente.status === "ativo"
                        ? "text-green-400"
                        : cliente.status === "inadimplente"
                        ? "text-vms-red-light"
                        : "text-vms-ghost"
                    }`}
                  >
                    {cliente.status === "ativo"
                      ? "Em dia"
                      : cliente.status === "inadimplente"
                      ? "Inadimplente"
                      : cliente.status}
                  </p>
                </div>
              </div>
            </div>

            {site && (
              <div className="bg-vms-dark-2 border border-vms-borda rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-vms-texto mb-4">Detalhes do Projeto</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-vms-ghost mb-1">Nome do Site</p>
                    <p className="text-sm text-vms-texto">{site.nome_site}</p>
                  </div>
                  <div>
                    <p className="text-xs text-vms-ghost mb-1">Nicho</p>
                    <p className="text-sm text-vms-texto capitalize">{site.nicho || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-vms-ghost mb-1">Criado em</p>
                    <p className="text-sm text-vms-texto">
                      {site.criado_em ? formatDate(site.criado_em) : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-vms-ghost mb-1">Publicado</p>
                    <p className="text-sm text-vms-texto">
                      {site.publicado ? "Sim" : "Não"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-vms-dark-2 border border-vms-borda rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-vms-texto mb-3">Contato do Vendedor</h3>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}
                >
                  {vendedor.nome?.charAt(0) || "S"}
                </div>
                <div>
                  <p className="text-sm font-medium text-vms-texto">{vendedor.nome}</p>
                  <p className="text-xs text-vms-ghost">{vendedor.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "site" && (
          <div className="space-y-4">
            {site?.dados_json ? (
              <>
                <div className="flex items-center gap-2">
                  {(["desktop", "tablet", "mobile"] as DeviceType[]).map((d) => {
                    const Icon = DEVICE_SIZES[d].icon;
                    return (
                      <button
                        key={d}
                        onClick={() => setDevice(d)}
                        className={`p-2 rounded-lg transition ${
                          device === d
                            ? "bg-vms-primaria text-vms-fundo"
                            : "bg-vms-dark-3 text-vms-ghost hover:text-vms-texto"
                        }`}
                      >
                        <Icon size={18} />
                      </button>
                    );
                  })}
                  {site.publicado && site.slug && (
                    <a
                      href={`/s/${site.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs bg-vms-primaria/10 text-vms-primaria hover:bg-vms-primaria/20 transition"
                    >
                      <ExternalLink size={14} />
                      Ver site publicado
                    </a>
                  )}
                </div>

                <div
                  className="bg-vms-dark-3 border border-vms-borda rounded-2xl overflow-hidden mx-auto transition-all duration-300"
                  style={{
                    width: device === "desktop" ? "100%" : DEVICE_SIZES[device].width,
                    height: device === "desktop" ? "70vh" : DEVICE_SIZES[device].height,
                    maxHeight: "80vh",
                  }}
                >
                  <iframe
                    srcDoc={typeof site.dados_json === "string" ? site.dados_json : ""}
                    className="w-full h-full border-0"
                    title="Preview do Site"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </>
            ) : (
              <div className="bg-vms-dark-2 border border-vms-borda rounded-2xl p-12 text-center">
                <Globe className="w-12 h-12 text-vms-ghost mx-auto mb-4 opacity-50" />
                <p className="text-vms-ghost">Seu site ainda está sendo criado.</p>
                <p className="text-vms-ghost text-sm mt-1">Assim que estiver pronto, você poderá visualizá-lo aqui.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "pagamentos" && (
          <div className="space-y-4">
            <div className="bg-vms-dark-2 border border-vms-borda rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-vms-borda">
                <h3 className="text-sm font-semibold text-vms-texto">Histórico de Pagamentos</h3>
              </div>
              {pagamentos.length > 0 ? (
                <div className="divide-y divide-vms-borda">
                  {pagamentos.map((pag) => (
                    <div key={pag.id} className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            pag.status === "concluido"
                              ? "bg-green-500/10"
                              : "bg-yellow-500/10"
                          }`}
                        >
                          {pag.status === "concluido" ? (
                            <CheckCircle2 className="text-green-400" size={16} />
                          ) : (
                            <Clock className="text-yellow-400" size={16} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-vms-texto">{pag.descricao || "Pagamento"}</p>
                          <p className="text-xs text-vms-ghost">{formatDate(pag.criado_em)}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-vms-texto">{formatCurrency(pag.valor)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-12 text-center">
                  <CreditCard className="w-10 h-10 text-vms-ghost mx-auto mb-3 opacity-50" />
                  <p className="text-vms-ghost text-sm">Nenhum pagamento registrado ainda.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "edicao" && (
          <div className="space-y-4">
            {site?.dados_json ? (
              <div className="bg-vms-dark-2 border border-vms-borda rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-vms-texto mb-4">Edição Rápida</h3>
                <p className="text-vms-ghost text-sm mb-6">
                  Solicite alterações no seu site diretamente pelo WhatsApp do seu vendedor.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(
                        `Olá! Gostaria de solicitar uma alteração no meu site "${site.nome_site}".\n\nTipo: Alteração de texto`
                      );
                      window.open(`https://wa.me/?text=${msg}`, "_blank");
                    }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-vms-dark-3 border border-vms-borda hover:border-vms-primaria/30 transition"
                  >
                    <Pencil className="text-vms-primaria" size={18} />
                    <div className="text-left">
                      <p className="text-sm font-medium text-vms-texto">Alterar Textos</p>
                      <p className="text-xs text-vms-ghost">Solicite mudanças no conteúdo</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(
                        `Olá! Gostaria de solicitar uma alteração no meu site "${site.nome_site}".\n\nTipo: Alteração de cores`
                      );
                      window.open(`https://wa.me/?text=${msg}`, "_blank");
                    }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-vms-dark-3 border border-vms-borda hover:border-vms-primaria/30 transition"
                  >
                    <Palette className="text-vms-primaria" size={18} />
                    <div className="text-left">
                      <p className="text-sm font-medium text-vms-texto">Alterar Cores</p>
                      <p className="text-xs text-vms-ghost">Mude a paleta do site</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(
                        `Olá! Gostaria de solicitar uma alteração no meu site "${site.nome_site}".\n\nTipo: Alteração de imagens`
                      );
                      window.open(`https://wa.me/?text=${msg}`, "_blank");
                    }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-vms-dark-3 border border-vms-borda hover:border-vms-primaria/30 transition"
                  >
                    <Globe className="text-vms-primaria" size={18} />
                    <div className="text-left">
                      <p className="text-sm font-medium text-vms-texto">Alterar Imagens</p>
                      <p className="text-xs text-vms-ghost">Envie novas imagens</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(
                        `Olá! Gostaria de solicitar uma alteração no meu site "${site.nome_site}".\n\nTipo: Outra alteração`
                      );
                      window.open(`https://wa.me/?text=${msg}`, "_blank");
                    }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-vms-dark-3 border border-vms-borda hover:border-vms-primaria/30 transition"
                  >
                    <MessageCircle className="text-vms-primaria" size={18} />
                    <div className="text-left">
                      <p className="text-sm font-medium text-vms-texto">Outro</p>
                      <p className="text-xs text-vms-ghost">Descreva sua necessidade</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-vms-dark-2 border border-vms-borda rounded-2xl p-12 text-center">
                <Pencil className="w-12 h-12 text-vms-ghost mx-auto mb-4 opacity-50" />
                <p className="text-vms-ghost">Seu site ainda está sendo criado.</p>
                <p className="text-vms-ghost text-sm mt-1">As opções de edição ficarão disponíveis em breve.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="border-t border-vms-borda mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-vms-ghost">
            Powered by{" "}
            <span className="text-vms-primaria font-semibold">Startzy</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
