"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Phone,
  DollarSign,
  Calendar,
  X,
  PartyPopper,
  ExternalLink,
  Globe,
  MoreVertical,
  Trash2,
  MessageCircle,
  Copy,
  CheckCircle,
  StickyNote,
  User,
  Rocket,
  Send,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LoadingIA } from "@/components/ui/LoadingIA";
import { SitePreview } from "@/components/ui/SitePreview";
import { createClient } from "@/lib/supabase/client";
import { STATUS_PROPOSTA } from "@/lib/constants";
import type { Proposta, Site, Cliente } from "@/types/database";

type StatusProposta = Proposta["status"];

const STATUS_ORDER: StatusProposta[] = ["gerado", "enviado", "negociando", "fechado", "perdido"];

const COLUMN_COLORS: Record<StatusProposta, string> = {
  gerado: "bg-vms-dark-4",
  enviado: "bg-vms-blue-light",
  negociando: "bg-yellow-400",
  fechado: "bg-vms-primaria",
  perdido: "bg-vms-red-light",
};

const COLUMN_BG: Record<StatusProposta, string> = {
  gerado: "border-vms-dark-4/40",
  enviado: "border-vms-blue-light/40",
  negociando: "border-yellow-400/40",
  fechado: "border-vms-primaria/40",
  perdido: "border-vms-red-light/40",
};

const COLUMN_LABEL_BG: Record<StatusProposta, string> = {
  gerado: "bg-vms-dark-3",
  enviado: "bg-vms-blue-bg",
  negociando: "bg-yellow-400/10",
  fechado: "bg-vms-primaria/10",
  perdido: "bg-vms-red-bg",
};

const statusOptions = STATUS_ORDER.map((s) => ({
  value: s,
  label: STATUS_PROPOSTA[s].label,
}));

export default function PropostasPage() {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [detailProposta, setDetailProposta] = useState<Proposta | null>(null);

  const [formNome, setFormNome] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formValor, setFormValor] = useState("");
  const [formStatus, setFormStatus] = useState<StatusProposta>("gerado");
  const [formClienteId, setFormClienteId] = useState("");
  const [formNotas, setFormNotas] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [editNotas, setEditNotas] = useState("");
  const [editClienteId, setEditClienteId] = useState("");
  const [salvandoDetalhe, setSalvandoDetalhe] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [scriptCidade, setScriptCidade] = useState("");
  const [scriptSegmento, setScriptSegmento] = useState("");

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [propostasRes, sitesRes, clientesRes] = await Promise.all([
      supabase.from("propostas").select("*").eq("criador_id", user.id).order("criado_em", { ascending: false }),
      supabase.from("sites").select("*").eq("criador_id", user.id),
      supabase.from("clientes").select("id, nome, whatsapp, site_id, status").eq("criador_id", user.id),
    ]);

    if (propostasRes.data) setPropostas(propostasRes.data as Proposta[]);
    if (sitesRes.data) setSites(sitesRes.data as Site[]);
    if (clientesRes.data) setClientes(clientesRes.data as Cliente[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    function handleClickOutside() {
      setMenuOpen(null);
    }
    if (menuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [menuOpen]);

  async function handleCriarProposta(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("propostas").insert({
      criador_id: user.id,
      nome_prospect: formNome,
      whatsapp: formWhatsapp || null,
      valor_proposto: formValor ? Number(formValor) : null,
      status: formStatus,
      cliente_id: formClienteId || null,
      notas: formNotas || null,
    });

    setShowModal(false);
    setFormNome("");
    setFormWhatsapp("");
    setFormValor("");
    setFormStatus("gerado");
    setFormClienteId("");
    setFormNotas("");
    setSalvando(false);
    fetchData();
  }

  async function handleMoverStatus(proposta: Proposta, novoStatus: StatusProposta) {
    if (proposta.status === novoStatus) return;
    setMovingId(proposta.id);
    const supabase = createClient();
    await supabase.from("propostas").update({ status: novoStatus }).eq("id", proposta.id);

    setPropostas((prev) => prev.map((p) => (p.id === proposta.id ? { ...p, status: novoStatus } : p)));
    setMovingId(null);
    if (novoStatus === "fechado") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);

      const supabase2 = createClient();
      const { data: { user } } = await supabase2.auth.getUser();
      if (user) {
        await supabase2.from("notificacoes").insert({
          usuario_id: user.id,
          tipo: "proposta",
          titulo: "Proposta fechada!",
          mensagem: `A proposta de "${proposta.nome_prospect}" foi fechada com sucesso!`,
          lida: false,
        });
      }
    }
  }

  async function handleDeleteProposta(propostaId: string) {
    const supabase = createClient();
    await supabase.from("propostas").delete().eq("id", propostaId);
    setPropostas((prev) => prev.filter((p) => p.id !== propostaId));
    setMenuOpen(null);
  }

  async function handleSaveDetail() {
    if (!detailProposta) return;
    setSalvandoDetalhe(true);
    const supabase = createClient();
    await supabase.from("propostas").update({
      notas: editNotas || null,
      cliente_id: editClienteId || null,
    }).eq("id", detailProposta.id);
    setDetailProposta({ ...detailProposta, notas: editNotas || null, cliente_id: editClienteId || null });
    setSalvandoDetalhe(false);
    fetchData();
  }

  async function handlePublicarSite() {
    if (!detailProposta) return;
    const linkedSite = getLinkedSite(detailProposta);
    if (!linkedSite) return;
    const supabase = createClient();
    await supabase.from("sites").update({ publicado: true }).eq("id", linkedSite.id);
    fetchData();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }

  function formatCurrency(val: number | null) {
    if (val === null) return "—";
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function getLinkedSite(proposta: Proposta): Site | null {
    if (!proposta.site_id) return null;
    return sites.find((s) => s.id === proposta.site_id) ?? null;
  }

  function getClienteForProposta(proposta: Proposta): Cliente | null {
    if (proposta.cliente_id) {
      return clientes.find((c) => c.id === proposta.cliente_id) ?? null;
    }
    if (proposta.site_id) {
      return clientes.find((c) => c.site_id === proposta.site_id) ?? null;
    }
    return null;
  }

  function getPropostaLink(proposta: Proposta): string {
    const linkedSite = getLinkedSite(proposta);
    if (linkedSite) {
      return `${window.location.origin}/proposta/${linkedSite.id}`;
    }
    return "";
  }

  function getWhatsAppLink(proposta: Proposta, message: string): string {
    const phone = proposta.whatsapp?.replace(/\D/g, "") || "";
    if (!phone) return "";
    return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
  }

  function generateScript1(proposta: Proposta) {
    const cidade = scriptCidade || "[cidade]";
    const segmento = scriptSegmento || "empresa";
    return `Opa, tudo bem?\n\nEstava pesquisando empresas de ${segmento} em ${cidade} e vi que vocês ainda não têm um site próprio aparecendo no Google.\n\nPosso te mostrar algo que pode estar travando o crescimento da sua empresa?`;
  }

  function generateScript2(proposta: Proposta) {
    const link = getPropostaLink(proposta);
    const segmento = scriptSegmento || "empresa";
    return `Analisei sua presença online e vi um baita potencial desperdiçado.\nVocês poderiam estar aparecendo muito mais no Google, isso mostra que o negócio tem potencial mas ainda não aproveita todo o potencial digital.\n\nEntão fiz algo diferente do que normalmente o mercado faz, separei um tempo da minha equipe para desenvolver um site pra você, e ele acabou de ficar pronto, queria muito que você desse uma olhada e me retornasse pra ver se gostou.\n\n🔗 ${link}`;
  }

  if (loading) {
    return (
      <DashboardLayout title="Propostas">
        <LoadingIA message="Carregando propostas..." />
      </DashboardLayout>
    );
  }

  if (detailProposta) {
    const linkedSite = getLinkedSite(detailProposta);
    const cliente = getClienteForProposta(detailProposta);
    const propostaLink = getPropostaLink(detailProposta);
    const htmlGerado = linkedSite ? ((linkedSite.dados_json as Record<string, unknown>)?.html_gerado as string | null) : null;

    return (
      <DashboardLayout title="Proposta">
        <div className="flex flex-col gap-5 max-w-3xl mx-auto">
          <button
            onClick={() => setDetailProposta(null)}
            className="text-vms-muted text-sm hover:text-vms-texto transition-colors self-start"
          >
            ← Voltar ao pipeline
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-vms-texto text-xl font-semibold">{detailProposta.nome_prospect}</h1>
              <p className="text-vms-muted text-xs mt-0.5">Proposta criada em {formatDate(detailProposta.criado_em)}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${COLUMN_LABEL_BG[detailProposta.status]} text-vms-texto-2`}>
              {STATUS_PROPOSTA[detailProposta.status].label}
            </span>
          </div>

          {linkedSite && htmlGerado && (
            <div className="glass-card-premium rounded-[14px] overflow-hidden">
              <SitePreview html={htmlGerado} title={linkedSite.nome_site} minScale={0.1}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </SitePreview>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-vms-texto text-sm font-medium">{linkedSite.nome_site}</p>
                  <p className="text-vms-muted text-xs">{linkedSite.publicado ? "Publicado" : "Rascunho"}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/sites/${linkedSite.id}`}>
                    <Button size="sm" variant="secondary">Editar site</Button>
                  </Link>
                  {!linkedSite.publicado && (
                    <Button size="sm" onClick={handlePublicarSite}>
                      <Rocket size={12} className="mr-1" />
                      Publicar Site
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {propostaLink && (
            <div className="glass-card-premium rounded-[14px] p-5">
              <h2 className="text-vms-texto text-sm font-semibold mb-3">Proposta existente</h2>
              <p className="text-vms-texto-2 text-xs mb-3">Envie este link para seu cliente visualizar e comprar o site</p>

              <div className="glass rounded-[10px] p-3 mb-3">
                <label className="text-vms-dark-5 text-[10px] uppercase tracking-wider mb-1 block">Link da proposta</label>
                <div className="flex items-center gap-2">
                  <code className="text-vms-primaria text-xs flex-1 truncate">{propostaLink}</code>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(propostaLink);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="p-1.5 rounded-[8px] bg-vms-dark-2 text-vms-muted hover:text-vms-texto transition-colors shrink-0"
                  >
                    {copiedLink ? <CheckCircle size={14} className="text-vms-primaria" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="glass rounded-[8px] p-3 mb-3">
                <p className="text-vms-dark-5 text-[10px] mb-1">Envie a proposta com SEU domínio, não o nosso</p>
                <p className="text-vms-muted text-[11px] leading-relaxed">
                  Hoje seu cliente recebe um link dinheirocomsites.com.br/proposta/... No Pro, você usa seudominio.com.br/proposta/... — passa muito mais profissionalismo e credibilidade.
                </p>
                <button className="text-vms-primaria text-[11px] font-medium mt-1.5 hover:underline">Desbloquear domínio próprio</button>
              </div>

              {cliente && (
                <div className="glass rounded-[10px] p-3 mb-3">
                  <label className="text-vms-dark-5 text-[10px] uppercase tracking-wider mb-2 block">Dados do cliente</label>
                  <p className="text-vms-texto text-sm font-medium">{cliente.nome}</p>
                  {cliente.whatsapp && (
                    <p className="text-vms-muted text-xs mt-0.5">{cliente.whatsapp}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    {cliente.whatsapp && (
                      <a
                        href={getWhatsAppLink(detailProposta, generateScript2(detailProposta))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-green-500/10 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors"
                      >
                        <MessageCircle size={12} />
                        Enviar por WhatsApp
                      </a>
                    )}
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(propostaLink);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-vms-dark-2 text-vms-texto-2 text-xs font-medium hover:text-vms-texto transition-colors"
                    >
                      <Copy size={12} />
                      Copiar link
                    </button>
                  </div>
                </div>
              )}

              <Link href="/propostas" className="text-vms-muted text-xs hover:text-vms-texto transition-colors block mt-2">
                Voltar ao painel
              </Link>
            </div>
          )}

          <div className="glass-card-premium rounded-[14px] p-5">
            <h2 className="text-vms-texto text-sm font-semibold mb-3">Script de Vendas</h2>
            <p className="text-vms-muted text-xs mb-4">Mensagens prontas para enviar via WhatsApp</p>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1">
                <Input
                  label="Segmento"
                  placeholder="Ex: Advogado"
                  value={scriptSegmento}
                  onChange={(e) => setScriptSegmento(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Cidade"
                  placeholder="Ex: São Paulo"
                  value={scriptCidade}
                  onChange={(e) => setScriptCidade(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="glass rounded-[10px] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-vms-texto-2 text-xs font-medium">Mensagem 1 — Abertura</span>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(generateScript1(detailProposta));
                    }}
                    className="text-vms-muted hover:text-vms-texto transition-colors"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                <p className="text-vms-muted text-xs whitespace-pre-line leading-relaxed">{generateScript1(detailProposta)}</p>
              </div>

              <div className="glass rounded-[10px] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-vms-texto-2 text-xs font-medium">Mensagem 2 — Apresentação + Link</span>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(generateScript2(detailProposta));
                    }}
                    className="text-vms-muted hover:text-vms-texto transition-colors"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                <p className="text-vms-muted text-xs whitespace-pre-line leading-relaxed">{generateScript2(detailProposta)}</p>
              </div>
            </div>
          </div>

          <div className="glass-card-premium rounded-[14px] p-5">
            <h2 className="text-vms-texto text-sm font-semibold mb-3">
              <StickyNote size={14} className="inline mr-1.5" />
              Notas sobre o site
            </h2>
            <textarea
              value={editNotas}
              onChange={(e) => setEditNotas(e.target.value)}
              placeholder="Anotações sobre o site, preferências do cliente, ajustes necessários..."
              rows={4}
              className="w-full bg-vms-card border border-vms-borda rounded-[8px] px-3 py-2 text-sm text-vms-texto placeholder:text-vms-dark-5 outline-none focus:border-vms-primaria resize-none"
            />
            <Button size="sm" onClick={handleSaveDetail} disabled={salvandoDetalhe} className="mt-2">
              {salvandoDetalhe ? "Salvando..." : "Salvar notas"}
            </Button>
          </div>

          <div className="glass-card-premium rounded-[14px] p-5">
            <h2 className="text-vms-texto text-sm font-semibold mb-3">
              <User size={14} className="inline mr-1.5" />
              Vincular cliente
            </h2>
            <select
              value={editClienteId}
              onChange={(e) => setEditClienteId(e.target.value)}
              className="w-full rounded-[10px] border border-vms-glass-border glass py-2 px-3 text-sm text-vms-texto outline-none focus:border-vms-primaria mb-2"
            >
              <option value="">Nenhum cliente vinculado</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            <Button size="sm" onClick={handleSaveDetail} disabled={salvandoDetalhe}>
              {salvandoDetalhe ? "Salvando..." : "Vincular cliente"}
            </Button>
          </div>

          {linkedSite && !linkedSite.publicado && (
            <div className="glass-card-premium rounded-[14px] p-5 border border-vms-primaria/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-vms-texto text-sm font-semibold">
                    <Rocket size={14} className="inline mr-1.5 text-vms-primaria" />
                    Publicar Site
                  </h2>
                  <p className="text-vms-muted text-xs mt-0.5">Publique o site para que o cliente possa acessar</p>
                </div>
                <Button onClick={handlePublicarSite}>
                  <Rocket size={14} className="mr-1.5" />
                  PUBLICAR SITE
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            {STATUS_ORDER.map((status, idx) => {
              const isCurrent = detailProposta.status === status;
              return (
                <button
                  key={status}
                  onClick={() => handleMoverStatus(detailProposta, status)}
                  disabled={movingId === detailProposta.id}
                  className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                    isCurrent
                      ? "bg-vms-primaria/20 text-vms-primaria"
                      : "bg-vms-dark-2 text-vms-muted hover:text-vms-texto"
                  }`}
                >
                  {STATUS_PROPOSTA[status].label}
                </button>
              );
            })}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Propostas">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-vms-texto text-xl font-semibold">Propostas</h1>
            <p className="text-vms-muted text-xs mt-0.5">
              {propostas.length} proposta{propostas.length !== 1 ? "s" : ""} no pipeline
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={14} className="mr-1.5" />
            Nova Proposta
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_ORDER.map((status) => {
            const colPropostas = propostas.filter((p) => p.status === status);
            const nextStatus = STATUS_ORDER[STATUS_ORDER.indexOf(status) + 1];
            const prevStatus = STATUS_ORDER[STATUS_ORDER.indexOf(status) - 1];
            const totalValor = colPropostas.reduce((acc, p) => acc + (p.valor_proposto ?? 0), 0);

            return (
              <div
                key={status}
                className={`flex flex-col min-w-[280px] flex-1 border-t-2 ${COLUMN_BG[status]} glass-card-premium rounded-[14px]`}
              >
                <div className="flex items-center gap-2 px-4 py-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${COLUMN_COLORS[status]}`} />
                  <span className="text-vms-texto text-sm font-medium">
                    {STATUS_PROPOSTA[status].label}
                  </span>
                  <span className={`text-xs ml-auto rounded-full px-2 py-0.5 ${COLUMN_LABEL_BG[status]} text-vms-texto-2`}>
                    {colPropostas.length}
                  </span>
                </div>

                {totalValor > 0 && (
                  <div className="px-4 pb-2">
                    <span className="text-vms-dark-5 text-[11px]">
                      Total: {formatCurrency(totalValor)}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-2 px-3 pb-3 flex-1">
                  {colPropostas.length === 0 && (
                    <div className="text-vms-dark-5 text-xs text-center py-8">
                      Nenhuma proposta
                    </div>
                  )}
                  {colPropostas.map((proposta) => {
                    const linkedSite = getLinkedSite(proposta);
                    const cliente = getClienteForProposta(proposta);

                    return (
                      <div
                        key={proposta.id}
                        className="glass rounded-[10px] overflow-hidden flex flex-col hover:border-vms-primaria/10 transition-all cursor-pointer"
                        onClick={() => {
                          setEditNotas(proposta.notas || "");
                          setEditClienteId(proposta.cliente_id || "");
                          setDetailProposta(proposta);
                        }}
                      >
                        {linkedSite && ((linkedSite.dados_json as Record<string, unknown>)?.html_gerado as string | null) && (
                          <SitePreview
                            html={(linkedSite.dados_json as Record<string, unknown>).html_gerado as string}
                            title={linkedSite.nome_site}
                            minScale={0.1}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          </SitePreview>
                        )}
                        <div className="p-3.5 flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-vms-texto text-sm font-medium truncate">
                                {proposta.nome_prospect}
                              </div>
                              {linkedSite && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Globe size={10} className="text-vms-primaria shrink-0" />
                                  <span className="text-vms-primaria text-[11px] truncate">
                                    {linkedSite.nome_site}
                                  </span>
                                </div>
                              )}
                              {cliente && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <User size={10} className="text-vms-muted shrink-0" />
                                  <span className="text-vms-muted text-[11px] truncate">{cliente.nome}</span>
                                </div>
                              )}
                            </div>
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpen(menuOpen === proposta.id ? null : proposta.id);
                                }}
                                className="p-1 rounded text-vms-dark-5 hover:text-vms-muted transition-colors"
                              >
                                <MoreVertical size={12} />
                              </button>
                              {menuOpen === proposta.id && (
                                <div className="absolute right-0 top-full mt-1 w-36 rounded-[10px] border border-vms-borda bg-vms-card shadow-xl z-50 py-1 animate-scale-in">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteProposta(proposta.id);
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-vms-red-light hover:bg-vms-red-bg transition-colors"
                                  >
                                    <Trash2 size={12} /> Excluir
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {proposta.whatsapp && (
                            <div className="flex items-center gap-1.5 text-vms-muted text-xs">
                              <Phone size={10} />
                              {proposta.whatsapp}
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 text-vms-texto-2 text-xs">
                            <DollarSign size={10} />
                            {formatCurrency(proposta.valor_proposto)}
                          </div>

                          <div className="flex items-center gap-1.5 text-vms-muted text-xs">
                            <Calendar size={10} />
                            {formatDate(proposta.criado_em)}
                          </div>

                          {proposta.notas && (
                            <div className="flex items-start gap-1.5 text-vms-dark-5 text-[10px] mt-0.5">
                              <StickyNote size={10} className="shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{proposta.notas}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 mt-1.5">
                            {prevStatus && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoverStatus(proposta, prevStatus);
                                }}
                                disabled={movingId === proposta.id}
                                className="flex-1 text-vms-muted text-[10px] py-1.5 rounded-[8px] bg-vms-dark-2 hover:bg-vms-dark-1 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                ← {STATUS_PROPOSTA[prevStatus].label}
                              </button>
                            )}
                            {nextStatus && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoverStatus(proposta, nextStatus);
                                }}
                                disabled={movingId === proposta.id}
                                className="flex-1 text-vms-primaria text-[10px] py-1.5 rounded-[8px] bg-vms-primaria-20 hover:brightness-110 transition-colors cursor-pointer disabled:opacity-50 font-medium"
                              >
                                {STATUS_PROPOSTA[nextStatus].label} →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showConfetti && (
        <div ref={confettiRef} className="fixed inset-0 z-[100] pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => {
            const colors = ["#AAFF00", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];
            return (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: colors[i % colors.length],
                  width: `${Math.random() * 8 + 6}px`,
                  height: `${Math.random() * 8 + 6}px`,
                  borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "0" : "2px",
                  animationDelay: `${Math.random() * 1.5}s`,
                }}
              />
            );
          })}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-bounce-in bg-vms-card border border-vms-primaria/30 rounded-[14px] px-8 py-6 text-center shadow-2xl">
              <PartyPopper size={40} className="text-vms-primaria mx-auto mb-3" />
              <h3 className="text-vms-texto text-xl font-bold">Proposta fechada!</h3>
              <p className="text-vms-primaria text-sm mt-1">Parabéns! Mais uma venda concluída 🎉</p>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="glass-card-premium rounded-[14px] w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-vms-texto text-base font-medium">Nova Proposta</h3>
              <button onClick={() => setShowModal(false)} className="text-vms-muted hover:text-vms-texto cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCriarProposta} className="flex flex-col gap-4">
              <Input label="Nome do prospect" placeholder="Ex: João Silva" value={formNome} onChange={(e) => setFormNome(e.target.value)} required />
              <Input label="WhatsApp" placeholder="(11) 99999-9999" icon={<Phone size={14} />} value={formWhatsapp} onChange={(e) => setFormWhatsapp(e.target.value)} />
              <Input label="Valor proposto (R$)" type="number" min={0} step={0.01} placeholder="197.00" icon={<DollarSign size={14} />} value={formValor} onChange={(e) => setFormValor(e.target.value)} />

              <div>
                <label className="text-vms-texto-2 text-xs font-medium mb-1.5 block">Vincular cliente</label>
                <select
                  value={formClienteId}
                  onChange={(e) => setFormClienteId(e.target.value)}
                  className="w-full rounded-[10px] border border-vms-glass-border glass py-2 px-3 text-sm text-vms-texto outline-none focus:border-vms-primaria"
                >
                  <option value="">Nenhum cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-vms-texto-2 text-xs font-medium mb-1.5 block">Notas</label>
                <textarea
                  value={formNotas}
                  onChange={(e) => setFormNotas(e.target.value)}
                  placeholder="Anotações sobre o site, preferências do cliente..."
                  rows={3}
                  className="w-full bg-vms-card border border-vms-borda rounded-[8px] px-3 py-2 text-sm text-vms-texto placeholder:text-vms-dark-5 outline-none focus:border-vms-primaria resize-none"
                />
              </div>

              <Select label="Status" options={statusOptions} value={formStatus} onChange={(e) => setFormStatus(e.target.value as StatusProposta)} />

              <div className="flex gap-3 mt-2">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvando || !formNome} className="flex-1">
                  <Plus size={14} className="mr-1.5" />
                  Criar proposta
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
