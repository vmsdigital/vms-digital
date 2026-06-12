"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ExternalLink,
  Pencil,
  Globe,
  Eye,
  MoreVertical,
  Trash2,
  Copy,
  Check,
  User,
  LayoutGrid,
  Star,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { SitePreview } from "@/components/ui/SitePreview";
import { createClient } from "@/lib/supabase/client";
import { NICHOS } from "@/lib/constants";
import type { Site, Cliente, Template } from "@/types/database";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const nichoOptions = [
  { value: "", label: "Todos os nichos" },
  ...NICHOS.map((n) => ({ value: n.value, label: n.label })),
];

const nichoGradients: Record<string, string> = {
  provedor: "from-blue-600 to-cyan-500",
  advocacia: "from-amber-600 to-yellow-500",
  academia: "from-red-600 to-orange-500",
  clinica: "from-teal-600 to-green-500",
  restaurante: "from-orange-600 to-amber-500",
  salao: "from-pink-600 to-rose-500",
  loja: "from-purple-600 to-violet-500",
  imobiliaria: "from-emerald-600 to-teal-500",
  autopecas: "from-gray-600 to-slate-500",
  petshop: "from-green-600 to-lime-500",
  construcao: "from-yellow-600 to-amber-500",
  dentista: "from-cyan-600 to-blue-500",
  farmacia: "from-green-600 to-emerald-500",
  bar: "from-purple-600 to-pink-500",
  cafe: "from-amber-600 to-orange-500",
  hotel: "from-indigo-600 to-blue-500",
  escola: "from-blue-600 to-indigo-500",
  banco: "from-blue-700 to-blue-500",
  seguro: "from-sky-600 to-blue-500",
  contabilidade: "from-emerald-600 to-green-500",
  posto: "from-yellow-600 to-red-500",
  floricultura: "from-pink-500 to-rose-400",
  livraria: "from-amber-700 to-amber-500",
  cinema: "from-violet-600 to-purple-500",
  hospital: "from-teal-600 to-cyan-500",
  coworking: "from-indigo-500 to-violet-500",
  outro: "from-gray-600 to-gray-500",
};

const nichoIcons: Record<string, string> = {
  provedor: "🌐", advocacia: "⚖️", academia: "💪", clinica: "🏥",
  restaurante: "🍽️", salao: "💇", loja: "🛒", imobiliaria: "🏠",
  autopecas: "🔧", petshop: "🐾", construcao: "🏗️", dentista: "🦷",
  farmacia: "💊", bar: "🍺", cafe: "☕", hotel: "🏨",
  escola: "📚", banco: "🏦", seguro: "🛡️", contabilidade: "📊",
  posto: "⛽", floricultura: "🌸", livraria: "📖", cinema: "🎬",
  hospital: "🏥", coworking: "💼", outro: "📋",
};

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [nichoFilter, setNichoFilter] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [favoritoFilter, setFavoritoFilter] = useState<"todos" | "favoritos">("todos");

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [sitesRes, clientesRes, templatesRes] = await Promise.all([
        supabase.from("sites").select("*").eq("criador_id", user.id).order("criado_em", { ascending: false }),
        supabase.from("clientes").select("id, site_id, nome, status").eq("criador_id", user.id),
        supabase.from("templates").select("*").eq("publico", true).limit(6),
      ]);

      setSites(sitesRes.data ?? []);
      setClientes(clientesRes.data ?? []);
      if (templatesRes.data && templatesRes.data.length > 0) {
        setTemplates(templatesRes.data as Template[]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    function handleClickOutside() {
      setMenuOpen(null);
    }
    if (menuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [menuOpen]);

  const filteredSites = sites
    .filter((site) => {
      const matchesSearch = site.nome_site.toLowerCase().includes(search.toLowerCase());
      const matchesNicho = !nichoFilter || site.nicho === nichoFilter;
      const matchesFavorito = favoritoFilter === "todos" || site.favorito;
      return matchesSearch && matchesNicho && matchesFavorito;
    })
    .sort((a, b) => {
      if (a.favorito === b.favorito) return 0;
      return a.favorito ? -1 : 1;
    });

  const handleCopySlug = useCallback((slug: string, siteId: string) => {
    const url = slug ? `https://${slug}` : "";
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedSlug(siteId);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  }, []);

  const handleDeleteSite = useCallback(async (siteId: string) => {
    const supabase = createClient();
    await supabase.from("sites").delete().eq("id", siteId);
    setSites((prev) => prev.filter((s) => s.id !== siteId));
    setMenuOpen(null);
  }, []);

  const handleToggleFavorito = useCallback(async (siteId: string, currentFav: boolean) => {
    const supabase = createClient();
    const { error } = await supabase.from("sites").update({ favorito: !currentFav }).eq("id", siteId);
    if (error) {
      console.error("Erro ao favoritar site:", error.message);
    } else {
      setSites((prev) => prev.map((s) => s.id === siteId ? { ...s, favorito: !currentFav } : s));
    }
  }, []);

  function getClienteForSite(siteId: string): Cliente | null {
    return clientes.find((c) => c.site_id === siteId) ?? null;
  }

  return (
    <DashboardLayout title="Meus Sites">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-vms-texto text-xl font-semibold">Meus Sites</h1>
            <p className="text-vms-muted text-xs mt-0.5">
              {sites.length} site{sites.length !== 1 ? "s" : ""} criado{sites.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/templates">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-vms-card border border-vms-borda text-vms-texto-2 text-[13px] font-medium hover:border-vms-primaria/30 hover:text-vms-texto transition-all">
                <LayoutGrid size={16} />
                Templates
              </button>
            </Link>
            <Link href="/sites/novo">
              <Button>
                <Plus size={16} className="mr-1.5" />
                Criar Site
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
              <Input
                placeholder="Buscar site..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFavoritoFilter("todos")}
              className={`px-3 py-2 rounded-[8px] text-xs font-medium transition-colors ${
                favoritoFilter === "todos"
                  ? "bg-vms-primaria/20 text-vms-primaria"
                  : "bg-vms-dark-2 text-vms-muted hover:text-vms-texto"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFavoritoFilter("favoritos")}
              className={`px-3 py-2 rounded-[8px] text-xs font-medium transition-colors ${
                favoritoFilter === "favoritos"
                  ? "bg-vms-primaria/20 text-vms-primaria"
                  : "bg-vms-dark-2 text-vms-muted hover:text-vms-texto"
              }`}
            >
              <Star size={12} className="inline mr-1" />
              Favoritos
            </button>
          </div>
          <div className="w-full sm:w-56">
            <select
              value={nichoFilter}
              onChange={(e) => setNichoFilter(e.target.value)}
              className="w-full h-9 rounded-[8px] border border-vms-borda bg-vms-card px-3 text-sm text-vms-texto focus:outline-none focus:ring-1 focus:ring-vms-primaria"
            >
              {nichoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card-premium rounded-[14px] overflow-hidden animate-pulse">
                <div className="h-[180px] bg-vms-dark-2" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-vms-dark-3" />
                  <div className="h-3 w-1/2 rounded bg-vms-dark-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-[14px] bg-vms-primaria/10 flex items-center justify-center">
              <Globe size={36} className="text-vms-primaria opacity-60" />
            </div>
            <div className="text-center">
              <p className="text-vms-texto text-base font-medium">
                {sites.length === 0 ? "Nenhum site criado ainda" : "Nenhum site encontrado"}
              </p>
              <p className="text-vms-muted text-sm mt-1 max-w-xs">
                {sites.length === 0
                  ? "Crie seu primeiro site com IA e comece a gerar receita."
                  : "Tente ajustar os filtros de busca."}
              </p>
            </div>
            {sites.length === 0 && (
              <Link href="/sites/novo">
                <Button>
                  <Plus size={16} className="mr-1.5" />
                  Criar Site
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSites.map((site) => {
              const htmlGerado = (site.dados_json as Record<string, unknown>)?.html_gerado as string | null;
              const siteUrl = site.slug ? `/${site.slug.replace(/\.startzy\.com\.br$/, "")}` : null;
              const cliente = getClienteForSite(site.id);
              const gradient = nichoGradients[site.nicho] ?? "from-gray-600 to-gray-500";
              const icon = nichoIcons[site.nicho] ?? "📋";
              const nichoLabel = NICHOS.find((n) => n.value === site.nicho)?.label ?? site.nicho;

              return (
                <div
                  key={site.id}
                  className="group glass-card-premium rounded-[14px] overflow-hidden hover:border-vms-primaria/30 transition-all duration-200 hover:shadow-lg hover:shadow-vms-primaria/5"
                >
                  <SitePreview html={htmlGerado || ""} title={site.nome_site}>
                    {!htmlGerado && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <span className="text-5xl drop-shadow-lg">{icon}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleToggleFavorito(site.id, site.favorito ?? false);
                      }}
                      className="absolute top-2.5 left-2.5 z-10 p-1 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-colors"
                    >
                      {site.favorito ? (
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      ) : (
                        <Star size={14} className="text-white/60" />
                      )}
                    </button>
                    {cliente && (
                      <div className="absolute top-2.5 left-9">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/15 text-white border border-white/20 backdrop-blur-md">
                          <User size={8} />
                          {cliente.nome}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md ${
                          site.publicado
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-white/10 text-white/60 border border-white/10"
                        }`}
                      >
                        {site.publicado ? "Publicado" : "Rascunho"}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Link
                          href={`/sites/${site.id}/editar`}
                          className="inline-flex items-center gap-1.5 rounded-[10px] bg-vms-primaria px-4 py-2 text-xs font-semibold text-black hover:brightness-110 transition shadow-lg"
                        >
                          <Pencil size={12} />
                          Editar
                        </Link>
                        {site.publicado && siteUrl && (
                          <a
                            href={siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-[10px] bg-white/20 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white hover:bg-white/30 transition shadow-lg"
                          >
                            <ExternalLink size={12} />
                            Ver
                          </a>
                        )}
                      </div>
                    </div>
                  </SitePreview>

                  <div className="px-4 py-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-vms-texto text-sm font-semibold truncate">
                          {site.nome_site}
                        </h3>
                        <p className="text-vms-muted text-[11px] mt-0.5">
                          {nichoLabel}
                        </p>
                      </div>
                      <div className="relative shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(menuOpen === site.id ? null : site.id);
                          }}
                          className="p-1 rounded-[8px] text-vms-muted hover:text-vms-texto hover:bg-vms-glass-hover transition-all"
                        >
                          <MoreVertical size={14} />
                        </button>
                        {menuOpen === site.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 rounded-[10px] border border-vms-borda bg-vms-card shadow-xl z-50 py-1 animate-scale-in">
                            {site.slug && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopySlug(site.slug!, site.id);
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-vms-texto-2 hover:bg-vms-glass-hover transition-colors"
                              >
                                {copiedSlug === site.id ? (
                                  <><Check size={14} className="text-vms-primaria" /> Copiado!</>
                                ) : (
                                  <><Copy size={14} /> Copiar URL</>
                                )}
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSite(site.id);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-vms-red-light hover:bg-vms-red-bg transition-colors"
                            >
                              <Trash2 size={14} /> Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-vms-dark-5 text-[11px]">{formatDate(site.criado_em)}</span>
                      {cliente && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          cliente.status === "ativo" ? "bg-emerald-500/10 text-emerald-400" :
                          cliente.status === "trial" ? "bg-vms-blue-bg text-vms-blue-light" :
                          "bg-vms-dark-2 text-vms-dark-5"
                        }`}>
                          {cliente.status === "ativo" ? "Ativo" : cliente.status === "trial" ? "Trial" : cliente.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
