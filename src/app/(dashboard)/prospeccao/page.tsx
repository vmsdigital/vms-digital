"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Sparkles,
  Phone,
  Building2,
  AlertCircle,
  Globe,
  ExternalLink,
  X,
  Navigation,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Link2,
  Share2,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { AlertaBanner } from "@/components/ui/AlertaBanner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingIA } from "@/components/ui/LoadingIA";
import { createClient } from "@/lib/supabase/client";
import { podeProcurar } from "@/lib/plan-limits";
import type { ProspeccaoResultado } from "@/types/database";
import type { PlanoKey } from "@/lib/constants";
import type { Site } from "@/types/database";

export default function ProspeccaoPage() {
  const router = useRouter();
  const [segmento, setSegmento] = useState("");
  const [cidade, setCidade] = useState("");
  const [raioKm, setRaioKm] = useState(10);
  const [resultados, setResultados] = useState<ProspeccaoResultado[]>([]);
  const [todosResultados, setTodosResultados] = useState<ProspeccaoResultado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [jaBuscou, setJaBuscou] = useState(false);
  const [semCreditos, setSemCreditos] = useState(false);
  const [plano, setPlano] = useState<PlanoKey>("gratuito");
  const [cargo, setCargo] = useState<string>("criador");
  const [prospeccoesMes, setProspeccoesMes] = useState(0);
  const [demoModal, setDemoModal] = useState<ProspeccaoResultado | null>(null);
  const [erro, setErro] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "sem_site" | "com_site">("todos");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);
  const [semSiteCount, setSemSiteCount] = useState(0);
  const [comSiteCount, setComSiteCount] = useState(0);
  const [sites, setSites] = useState<Site[]>([]);
  const [prospeccoesSalvas, setProspeccoesSalvas] = useState<{
    id: string;
    segmento: string;
    cidade: string;
    criado_em: string;
    resultados: ProspeccaoResultado[];
  }[]>([]);
  const [mostrarSalvas, setMostrarSalvas] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("usuarios")
          .select("plano, cargo")
          .eq("id", user.id)
          .single();
        if (data) {
          setPlano(data.plano as PlanoKey);
          if (data.cargo) setCargo(data.cargo);
        }

        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        const { count } = await supabase
          .from("prospeccao")
          .select("*", { count: "exact", head: true })
          .eq("criador_id", user.id)
          .gte("criado_em", inicioMes.toISOString());
        if (count !== null) setProspeccoesMes(count);

        const [sitesRes, prospeccoesRes] = await Promise.all([
          supabase.from("sites").select("id, nome_site, dados_json").eq("criador_id", user.id),
          supabase.from("prospeccao").select("id, segmento, cidade, criado_em, resultados").eq("criador_id", user.id).order("criado_em", { ascending: false }).limit(20),
        ]);
        if (sitesRes.data) setSites(sitesRes.data as Site[]);
        if (prospeccoesRes.data) setProspeccoesSalvas(prospeccoesRes.data as typeof prospeccoesSalvas);
      }
    }
    loadUser();
  }, []);

  async function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    if (!podeProcurar(plano, prospeccoesMes, cargo)) {
      setSemCreditos(true);
      return;
    }
    setSemCreditos(false);
    setBuscando(true);
    setJaBuscou(false);
    setMostrarSalvas(false);
    setErro("");
    setPagina(1);
    setResultados([]);
    setTodosResultados([]);

    try {
      const params = new URLSearchParams({
        segmento,
        cidade,
        raio_km: raioKm.toString(),
        pagina: "1",
      });

      const res = await fetch(`/api/prospeccao/buscar?${params}`);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setErro(errData.error || "Erro ao buscar empresas. Tente novamente.");
        setBuscando(false);
        return;
      }

      const data = await res.json();

      setResultados(data.resultados || []);
      setTotalResultados(data.total || 0);
      setTotalPaginas(data.total_paginas || 1);
      setSemSiteCount(data.sem_site || 0);
      setComSiteCount(data.com_site || 0);
      setBuscando(false);
      setJaBuscou(true);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("prospeccao").insert({
          criador_id: user.id,
          segmento,
          cidade,
          raio_km: raioKm,
          resultados: data.resultados || [],
        });
        setProspeccoesMes((prev) => prev + 1);

        const prospeccoesRes = await supabase
          .from("prospeccao")
          .select("id, segmento, cidade, criado_em, resultados")
          .eq("criador_id", user.id)
          .order("criado_em", { ascending: false })
          .limit(20);
        if (prospeccoesRes.data) setProspeccoesSalvas(prospeccoesRes.data as typeof prospeccoesSalvas);
      }
    } catch {
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
      setBuscando(false);
    }
  }

  async function handleProximaPagina() {
    const novaPagina = pagina + 1;
    setBuscando(true);

    try {
      const jaVistosIds = [...todosResultados, ...resultados].map((r) => r.google_place_id).join(",");

      const params = new URLSearchParams({
        segmento,
        cidade,
        raio_km: raioKm.toString(),
        pagina: novaPagina.toString(),
        ja_vistos: jaVistosIds,
      });

      const res = await fetch(`/api/prospeccao/buscar?${params}`);
      if (!res.ok) {
        setBuscando(false);
        return;
      }

      const data = await res.json();
      setTodosResultados((prev) => [...prev, ...resultados]);
      setResultados(data.resultados || []);
      setPagina(novaPagina);
      setBuscando(false);
    } catch {
      setBuscando(false);
    }
  }

  function handlePaginaAnterior() {
    if (pagina <= 1) return;
    const novaPagina = pagina - 1;
    const itensPorPagina = 10;
    const inicio = (novaPagina - 1) * itensPorPagina;

    if (novaPagina === 1 && todosResultados.length === 0) {
      setPagina(1);
      return;
    }

    const prevResults = todosResultados.slice(inicio, inicio + itensPorPagina);
    if (prevResults.length > 0) {
      setResultados(prevResults);
      setPagina(novaPagina);
    }
  }

  function siteExisteParaEmpresa(empresa: ProspeccaoResultado): Site | null {
    const nomeNormalizado = empresa.nome.toLowerCase().trim();
    return sites.find((s) => {
      const nomeSite = s.nome_site.toLowerCase().trim();
      return nomeSite.includes(nomeNormalizado) || nomeNormalizado.includes(nomeSite);
    }) ?? null;
  }

  const filteredResultados = resultados.filter((r) => {
    if (filtroTipo === "sem_site") return !r.tem_site;
    if (filtroTipo === "com_site") return r.tem_site;
    return true;
  });

  function getGoogleMapsUrl(empresa: ProspeccaoResultado) {
    if (empresa.lat && empresa.lon) {
      return `https://www.google.com/maps/search/?api=1&query=${empresa.lat},${empresa.lon}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(empresa.nome + " " + (empresa.endereco || ""))}`;
  }

  return (
    <DashboardLayout title="Prospecção">
      <div className="flex flex-col gap-5">
        {semCreditos && (
          <AlertaBanner
            message="Sem créditos de prospecção este mês. Faça upgrade do seu plano."
            actionLabel="Ver planos"
            onAction={() => {}}
          />
        )}

        <div className="glass-card-premium rounded-[14px] p-5">
          <h2 className="text-vms-texto text-sm font-medium mb-4">Buscar empresas</h2>
          <form onSubmit={handleBuscar} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="mb-1.5 block text-xs font-medium text-vms-texto-2">Segmento</label>
              <select
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
                className="w-full rounded-[10px] border border-vms-glass-border glass py-2 px-3 text-sm text-vms-texto outline-none focus:border-vms-primaria"
              >
                <option value="">Selecione...</option>
                <option value="restaurante">Restaurante</option>
                <option value="padaria">Padaria</option>
                <option value="bar">Bar</option>
                <option value="cafe">Café</option>
                <option value="salao">Salão de Beleza</option>
                <option value="beleza">Beleza / Estética</option>
                <option value="clinica">Clínica Médica</option>
                <option value="dentista">Dentista</option>
                <option value="farmacia">Farmácia</option>
                <option value="advocacia">Advocacia</option>
                <option value="imobiliaria">Imobiliária</option>
                <option value="loja">Loja de Roupas</option>
                <option value="supermercado">Supermercado</option>
                <option value="petshop">Pet Shop</option>
                <option value="academia">Academia</option>
                <option value="autopecas">Auto Peças</option>
                <option value="concessionaria">Concessionária</option>
                <option value="hotel">Hotel</option>
                <option value="escola">Escola</option>
                <option value="coworking">Coworking</option>
                <option value="banco">Banco</option>
                <option value="seguro">Seguradora</option>
                <option value="contabilidade">Contabilidade</option>
                <option value="provedor">Provedor / Eletrônicos</option>
                <option value="posto">Posto de Gasolina</option>
                <option value="construcao">Construção / Móveis</option>
                <option value="floricultura">Floricultura</option>
                <option value="livraria">Livraria</option>
                <option value="cinema">Cinema</option>
                <option value="hospital">Hospital</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <Input
                label="Cidade"
                placeholder="Ex: São Paulo"
                icon={<MapPin size={14} />}
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
            </div>
            <div className="w-[120px]">
              <Input
                label="Raio (km)"
                type="number"
                min={1}
                max={100}
                value={raioKm}
                onChange={(e) => setRaioKm(Number(e.target.value))}
              />
            </div>
            <Button type="submit" disabled={buscando || !segmento || !cidade}>
              <Search size={14} className="mr-1.5" />
              Buscar empresas
            </Button>
          </form>
        </div>

        {prospeccoesSalvas.length > 0 && !jaBuscou && !buscando && (
          <div className="glass-card-premium rounded-[14px] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-vms-texto text-sm font-medium">Prospecções anteriores</h2>
              <button
                onClick={() => setMostrarSalvas(!mostrarSalvas)}
                className="text-vms-primaria text-xs font-medium hover:underline cursor-pointer"
              >
                {mostrarSalvas ? "Ocultar" : "Ver todas"}
              </button>
            </div>
            {mostrarSalvas ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {prospeccoesSalvas.map((p) => (
                  <div
                    key={p.id}
                    className="glass rounded-[10px] p-3 hover:border-vms-primaria/20 transition-colors cursor-pointer"
                    onClick={() => {
                      setResultados(p.resultados || []);
                      setSegmento(p.segmento);
                      setCidade(p.cidade);
                      setTotalResultados(p.resultados?.length || 0);
                      setSemSiteCount((p.resultados || []).filter((r) => !r.tem_site).length);
                      setComSiteCount((p.resultados || []).filter((r) => r.tem_site).length);
                      setJaBuscou(true);
                      setMostrarSalvas(false);
                      setPagina(1);
                      setTotalPaginas(1);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 size={12} className="text-vms-primaria" />
                      <span className="text-vms-texto text-xs font-medium truncate">{p.segmento}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-vms-muted text-[11px]">
                      <MapPin size={10} />
                      {p.cidade}
                    </div>
                    <div className="text-vms-dark-5 text-[10px] mt-1">
                      {p.resultados?.length || 0} empresas · {new Date(p.criado_em).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {prospeccoesSalvas.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setResultados(p.resultados || []);
                      setSegmento(p.segmento);
                      setCidade(p.cidade);
                      setTotalResultados(p.resultados?.length || 0);
                      setSemSiteCount((p.resultados || []).filter((r) => !r.tem_site).length);
                      setComSiteCount((p.resultados || []).filter((r) => r.tem_site).length);
                      setJaBuscou(true);
                      setPagina(1);
                      setTotalPaginas(1);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-vms-dark-2 text-vms-muted text-xs hover:text-vms-texto hover:bg-vms-dark-1 transition-colors shrink-0 cursor-pointer"
                  >
                    <Building2 size={10} />
                    {p.segmento} em {p.cidade}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {buscando && <LoadingIA message="Buscando empresas na região..." />}

        {erro && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-[10px] border border-vms-erro/30 bg-vms-red-bg">
            <AlertCircle size={16} className="text-vms-erro shrink-0" />
            <span className="text-vms-erro text-sm">{erro}</span>
          </div>
        )}

        {jaBuscou && !buscando && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MetricCard
                icon={<Building2 size={14} />}
                label="Total encontradas"
                value={totalResultados}
              />
              <MetricCard
                icon={<Sparkles size={14} />}
                label="Sem site"
                value={semSiteCount}
                green
              />
              <MetricCard
                icon={<Globe size={14} />}
                label="Com site"
                value={comSiteCount}
              />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-vms-texto text-sm font-medium">Resultados</span>
                <span className="text-vms-muted text-xs">{filteredResultados.length} empresas na página {pagina}</span>
              </div>
              <div className="flex items-center gap-1 glass rounded-[8px] p-0.5">
                <button
                  onClick={() => setFiltroTipo("todos")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${filtroTipo === "todos" ? "bg-vms-primaria/20 text-vms-primaria" : "text-vms-muted hover:text-vms-texto"}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroTipo("sem_site")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${filtroTipo === "sem_site" ? "bg-vms-primaria/20 text-vms-primaria" : "text-vms-muted hover:text-vms-texto"}`}
                >
                  Sem site
                </button>
                <button
                  onClick={() => setFiltroTipo("com_site")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${filtroTipo === "com_site" ? "bg-vms-primaria/20 text-vms-primaria" : "text-vms-muted hover:text-vms-texto"}`}
                >
                  Com site
                </button>
              </div>
            </div>

            {filteredResultados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Building2 size={32} className="text-vms-muted opacity-40 mb-2" />
                <p className="text-vms-muted text-sm">Nenhuma empresa encontrada para essa busca</p>
                <p className="text-vms-dark-5 text-xs mt-1">Tente outro segmento ou cidade</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredResultados.map((empresa) => {
                  const siteExistente = siteExisteParaEmpresa(empresa);

                  return (
                    <div
                      key={empresa.google_place_id}
                      className="glass-card-premium rounded-[14px] overflow-hidden hover:border-vms-primaria/20 transition-all duration-200 hover:shadow-lg hover:shadow-vms-primaria/5 flex flex-col"
                    >
                      <div className="p-4 flex-1 flex flex-col gap-2.5">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${
                            siteExistente ? "bg-vms-primaria/20" : empresa.tem_site ? "bg-vms-dark-2" : "bg-vms-primaria/10"
                          }`}>
                            {siteExistente ? (
                              <CheckCircle2 size={18} className="text-vms-primaria" />
                            ) : (
                              <Building2 size={18} className={empresa.tem_site ? "text-vms-dark-5" : "text-vms-primaria"} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-vms-texto text-sm font-semibold truncate">{empresa.nome}</h3>
                            {siteExistente ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-vms-primaria/20 text-vms-primaria mt-1">
                                Site criado
                              </span>
                            ) : empresa.tem_site ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-vms-dark-2 text-vms-dark-5 mt-1">
                                Com site
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-vms-primaria/10 text-vms-primaria mt-1">
                                Sem site
                              </span>
                            )}
                          </div>
                        </div>

                        {empresa.endereco && (
                          <div className="flex items-start gap-1.5 text-vms-muted text-xs">
                            <MapPin size={12} className="shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{empresa.endereco}</span>
                          </div>
                        )}

                        {empresa.telefone && (
                          <div className="flex items-center gap-1.5 text-vms-muted text-xs">
                            <Phone size={12} className="shrink-0" />
                            <span>{empresa.telefone}</span>
                          </div>
                        )}

                        {empresa.site_url && (
                          <div className="flex items-center gap-1.5 text-vms-blue-light text-xs">
                            <Globe size={12} className="shrink-0" />
                            <a href={empresa.site_url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                              {empresa.site_url.replace(/^https?:\/\//, "").slice(0, 35)}
                            </a>
                          </div>
                        )}

                        {empresa.redes_sociais && empresa.redes_sociais.length > 0 && (
                          <div className="flex items-center gap-1.5 text-vms-muted text-xs">
                            <Share2 size={12} className="shrink-0" />
                            <span className="truncate">{empresa.redes_sociais[0].replace(/^https?:\/\//, "").slice(0, 30)}</span>
                            {empresa.redes_sociais.length > 1 && (
                              <span className="text-vms-dark-5">+{empresa.redes_sociais.length - 1}</span>
                            )}
                          </div>
                        )}

                        {empresa.avaliacao && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-yellow-400">★</span>
                            <span className="text-vms-texto-2">{empresa.avaliacao.toFixed(1)}</span>
                            {empresa.total_avaliacoes && (
                              <span className="text-vms-dark-5">({empresa.total_avaliacoes})</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="px-4 pb-4 flex flex-col gap-2">
                        <a
                          href={getGoogleMapsUrl(empresa)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-[10px] text-xs font-medium bg-vms-dark-2 text-vms-texto-2 hover:bg-vms-dark-1 hover:text-vms-texto transition-colors"
                        >
                          <Navigation size={12} />
                          Ver no Google Maps
                        </a>

                        {siteExistente ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            onClick={() => router.push(`/sites/${siteExistente.id}`)}
                          >
                            <Link2 size={12} className="mr-1" />
                            Ver site
                          </Button>
                        ) : !empresa.tem_site ? (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => setDemoModal(empresa)}
                          >
                            <Sparkles size={12} className="mr-1" />
                            Gerar demo
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            onClick={() => window.open(empresa.site_url!, "_blank")}
                          >
                            <ExternalLink size={12} className="mr-1" />
                            Ver site
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagina <= 1}
                  onClick={handlePaginaAnterior}
                >
                  <ChevronLeft size={14} className="mr-1" />
                  Anterior
                </Button>
                <span className="text-vms-muted text-xs">
                  Página {pagina} de {totalPaginas}
                </span>
                <Button
                  size="sm"
                  disabled={pagina >= totalPaginas}
                  onClick={handleProximaPagina}
                >
                  Próxima
                  <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            )}
          </>
        )}

        {demoModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
            <div className="glass-card-premium rounded-[14px] w-full max-w-md p-6 animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-vms-texto text-base font-medium">Gerar demo</h3>
                <button onClick={() => setDemoModal(null)} className="text-vms-muted hover:text-vms-texto cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              <p className="text-vms-texto-2 text-sm mb-4">
                Um site demo será gerado para <strong className="text-vms-primaria">{demoModal.nome}</strong> usando IA.
              </p>
              <div className="glass rounded-[10px] p-3 mb-4 space-y-1">
                {demoModal.endereco && (
                  <div className="flex items-center gap-2 text-xs text-vms-muted">
                    <MapPin size={12} />
                    {demoModal.endereco}
                  </div>
                )}
                {demoModal.telefone && (
                  <div className="flex items-center gap-2 text-xs text-vms-muted">
                    <Phone size={12} />
                    {demoModal.telefone}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setDemoModal(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    const params = new URLSearchParams({
                      nome: demoModal.nome,
                      segmento: segmento,
                      endereco: demoModal.endereco || "",
                      whatsapp: demoModal.telefone || "",
                    });
                    router.push(`/sites/novo?${params.toString()}`);
                    setDemoModal(null);
                  }}
                >
                  <Sparkles size={14} className="mr-1.5" />
                  Gerar site
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
