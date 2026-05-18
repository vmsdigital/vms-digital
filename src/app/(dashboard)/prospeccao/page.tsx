"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Star, Globe, ExternalLink, Sparkles, Phone, Building2, AlertCircle, Database } from "lucide-react";
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

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-vms-muted text-xs">—</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-vms-dark-3"}
        />
      ))}
      <span className="text-vms-muted text-xs ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProspeccaoPage() {
  const [segmento, setSegmento] = useState("");
  const [cidade, setCidade] = useState("");
  const [raioKm, setRaioKm] = useState(10);
  const [resultados, setResultados] = useState<ProspeccaoResultado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [jaBuscou, setJaBuscou] = useState(false);
  const [semCreditos, setSemCreditos] = useState(false);
  const [plano, setPlano] = useState<PlanoKey>("gratuito");
  const [cargo, setCargo] = useState<string>("criador");
  const [prospeccoesMes, setProspeccoesMes] = useState(0);
  const [demoModal, setDemoModal] = useState<ProspeccaoResultado | null>(null);
  const [fonte, setFonte] = useState<string>("");
  const [erro, setErro] = useState("");

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
          .from("prospeccoes")
          .select("*", { count: "exact", head: true })
          .eq("criador_id", user.id)
          .gte("criado_em", inicioMes.toISOString());
        if (count !== null) setProspeccoesMes(count);
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
    setErro("");

    try {
      const params = new URLSearchParams({
        segmento,
        cidade,
        raio_km: raioKm.toString(),
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
      setFonte(data.fonte || "");
      setBuscando(false);
      setJaBuscou(true);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("prospeccoes").insert({
          criador_id: user.id,
          segmento,
          cidade,
          raio_km: raioKm,
          resultados: data.resultados || [],
        });
        setProspeccoesMes((prev) => prev + 1);
      }
    } catch {
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
      setBuscando(false);
    }
  }

  const semSite = resultados.filter((r) => !r.tem_site).length;
  const comSite = resultados.filter((r) => r.tem_site).length;

  return (
    <DashboardLayout title="Prospecção">
      <div className="flex flex-col gap-6">
        {semCreditos && (
          <AlertaBanner
            message="Sem créditos de prospecção este mês. Faça upgrade do seu plano."
            actionLabel="Ver planos"
            onAction={() => {}}
          />
        )}

        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-vms-texto text-sm font-medium mb-4">Buscar empresas</h2>
          <form onSubmit={handleBuscar} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="mb-1.5 block text-xs font-medium text-vms-texto-2">Segmento</label>
              <select
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
                className="w-full rounded-xl border border-vms-glass-border glass py-2 px-3 text-sm text-vms-texto outline-none focus:border-vms-primaria"
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

        {buscando && <LoadingIA message="Buscando empresas na região..." />}

        {erro && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-vms-erro/30 bg-vms-red-bg">
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
                value={resultados.length}
              />
              <MetricCard
                icon={<Sparkles size={14} />}
                label="Sem site"
                value={semSite}
                green
              />
              <MetricCard
                icon={<Globe size={14} />}
                label="Com site"
                value={comSite}
              />
            </div>

            {fonte && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-vms-blue-bg">
                <Database size={14} className="text-vms-blue-light" />
                <span className="text-xs text-vms-blue-light">
                  Fonte dos dados: <strong>{fonte === "openstreetmap" ? "OpenStreetMap (gratuito)" : fonte === "google + openstreetmap" ? "Google + OpenStreetMap" : fonte}</strong>
                </span>
              </div>
            )}

            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-vms-borda flex items-center justify-between">
                <span className="text-vms-texto text-sm font-medium">Resultados</span>
                <span className="text-vms-muted text-xs">{resultados.length} empresas</span>
              </div>

              {resultados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Building2 size={32} className="text-vms-muted opacity-40 mb-2" />
                  <p className="text-vms-muted text-sm">Nenhuma empresa encontrada para essa busca</p>
                  <p className="text-vms-dark-5 text-xs mt-1">Tente outro segmento ou cidade</p>
                </div>
              ) : (
                <div className="divide-y divide-vms-borda">
                  {resultados.map((empresa) => (
                    <div
                      key={empresa.google_place_id}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-vms-primaria-hover transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg glass flex items-center justify-center shrink-0">
                        <Building2 size={16} className="text-vms-dark-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-vms-texto text-sm font-medium truncate">
                            {empresa.nome}
                          </span>
                          {empresa.tem_site ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-vms-dark-2 text-vms-dark-5">
                              Com site
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-vms-primaria-20 text-vms-primaria">
                              Sem site
                            </span>
                          )}
                          {empresa.fonte === "google" && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-vms-blue-bg text-vms-blue-light">
                              Google
                            </span>
                          )}
                        </div>
                        {empresa.endereco && (
                          <div className="text-vms-muted text-xs truncate mt-0.5">
                            {empresa.endereco}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          {empresa.telefone && (
                            <span className="flex items-center gap-1 text-vms-muted text-xs">
                              <Phone size={10} />
                              {empresa.telefone}
                            </span>
                          )}
                          <StarRating rating={empresa.avaliacao} />
                        </div>
                      </div>

                      <div className="shrink-0">
                        {empresa.tem_site ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(empresa.site_url!, "_blank")}
                          >
                            <ExternalLink size={12} className="mr-1" />
                            Ver site
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setDemoModal(empresa)}
                          >
                            <Sparkles size={12} className="mr-1" />
                            Gerar demo
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {demoModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
            <div className="glass-card rounded-2xl w-full max-w-md p-6">
              <h3 className="text-vms-texto text-base font-medium mb-1">Gerar site demo</h3>
              <p className="text-vms-muted text-xs mb-4">
                Um site demonstrativo será criado para esse prospect.
              </p>

              <div className="flex flex-col gap-3 mb-5">
                <div>
                  <span className="text-vms-muted text-xs">Empresa</span>
                  <p className="text-vms-texto text-sm">{demoModal.nome}</p>
                </div>
                {demoModal.endereco && (
                  <div>
                    <span className="text-vms-muted text-xs">Endereço</span>
                    <p className="text-vms-texto text-sm">{demoModal.endereco}</p>
                  </div>
                )}
                {demoModal.telefone && (
                  <div>
                    <span className="text-vms-muted text-xs">Telefone</span>
                    <p className="text-vms-texto text-sm">{demoModal.telefone}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setDemoModal(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    setDemoModal(null);
                  }}
                >
                  <Sparkles size={14} className="mr-1.5" />
                  Criar demo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
