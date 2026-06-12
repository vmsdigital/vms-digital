"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bot,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Zap,
  ChevronDown,
  ChevronUp,
  Trash2,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Star,
  Calendar,
  Sparkles,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import { createClient } from "@/lib/supabase/client";
import { NICHOS } from "@/lib/constants";
import { podeUsarAgenteIA } from "@/lib/plan-limits";
import type { AgenteTarefa } from "@/types/database";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pendente: { label: "Pendente", color: "text-yellow-400", icon: Clock },
  agendado: { label: "Agendado", color: "text-blue-400", icon: Calendar },
  prospectando: { label: "Prospectando...", color: "text-blue-400", icon: Loader2 },
  gerando: { label: "Gerando sites...", color: "text-purple-400", icon: Loader2 },
  concluido: { label: "Concluído", color: "text-green-400", icon: CheckCircle2 },
  erro: { label: "Erro", color: "text-red-400", icon: XCircle },
  parcial: { label: "Parcial", color: "text-yellow-400", icon: AlertTriangle },
  cancelado: { label: "Cancelado", color: "text-gray-400", icon: XCircle },
};

export default function AgentePage() {
  const [segmento, setSegmento] = useState("");
  const [cidade, setCidade] = useState("");
  const [raioKm, setRaioKm] = useState(25);
  const [quantidade, setQuantidade] = useState(10);
  const [filtro, setFiltro] = useState<"sem_site" | "todos">("sem_site");
  const [avaliacaoMinima, setAvaliacaoMinima] = useState(0);
  const [agendarAmanha, setAgendarAmanha] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [tarefas, setTarefas] = useState<AgenteTarefa[]>([]);
  const [tarefaExpandida, setTarefaExpandida] = useState<string | null>(null);
  const [bloqueado, setBloqueado] = useState(false);

  useEffect(() => {
    async function checkPlano() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("usuarios").select("plano,cargo").eq("id", user.id).single();
      if (data && !podeUsarAgenteIA(data.plano, data.cargo)) {
        setBloqueado(true);
      }
    }
    checkPlano();
  }, []);
  const [erro, setErro] = useState("");

  const carregarTarefas = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("agente_tarefas")
      .select("*")
      .eq("criador_id", user.id)
      .order("criado_em", { ascending: false })
      .limit(20);

    if (data) setTarefas(data as AgenteTarefa[]);
  }, []);

  useEffect(() => {
    carregarTarefas();
    const interval = setInterval(carregarTarefas, 5000);
    return () => clearInterval(interval);
  }, [carregarTarefas]);

  async function iniciarAgente() {
    if (!segmento || !cidade) {
      setErro("Preencha o segmento e a cidade");
      return;
    }

    setIniciando(true);
    setErro("");

    try {
      const res = await fetch("/api/agente/iniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segmento,
          cidade,
          raio_km: raioKm,
          quantidade,
          filtro,
          avaliacao_minima: avaliacaoMinima,
          agendar_amanha: agendarAmanha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao iniciar agente");
        return;
      }

      await carregarTarefas();
      setSegmento("");
      setCidade("");
    } catch {
      setErro("Erro de conexão");
    } finally {
      setIniciando(false);
    }
  }

  async function deletarTarefa(id: string) {
    const supabase = createClient();
    await supabase.from("agente_tarefas").delete().eq("id", id);
    await carregarTarefas();
  }

  const temAtiva = tarefas.some((t) => t.status === "prospectando" || t.status === "gerando");

  if (bloqueado) {
    return (
      <DashboardLayout title="Agente IA">
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-vms-primaria/10 flex items-center justify-center mb-6">
            <Bot className="w-10 h-10 text-vms-primaria" />
          </div>
          <h2 className="text-xl font-bold text-vms-texto mb-2">Agente IA — Piloto Automático</h2>
          <p className="text-vms-muted text-sm text-center max-w-md mb-6">Esse recurso prospecta e cria sites automaticamente para você. Disponível apenas no plano Pro.</p>
          <a href="/planos" className="px-6 py-3 rounded-xl bg-vms-primaria text-black font-semibold text-sm hover:brightness-110 transition-all">Ver planos</a>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Agente IA">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="glass-card-premium rounded-[14px] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-vms-primaria/10 flex items-center justify-center">
              <Bot className="w-6 h-6 text-vms-primaria" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-vms-text flex items-center gap-2">
                Piloto Automático
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">BETA</span>
              </h2>
              <p className="text-sm text-vms-muted">Prospecção + Criação de sites em lote</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-vms-muted mb-1.5">Segmento</label>
              <select
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
                className="w-full bg-vms-card border border-vms-borda rounded-xl px-4 py-2.5 text-vms-text focus:outline-none focus:border-vms-primaria transition"
              >
                <option value="">Selecione...</option>
                {NICHOS.map((n) => (
                  <option key={n.value} value={n.value}>{n.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-vms-muted mb-1.5">Cidade</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                <Input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-vms-muted mb-1.5">Quantidade de sites</label>
              <Input
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                min={1}
                max={50}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-vms-muted mb-1.5">Filtro</label>
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value as "sem_site" | "todos")}
                className="w-full bg-vms-card border border-vms-borda rounded-xl px-4 py-2.5 text-vms-text focus:outline-none focus:border-vms-primaria transition"
              >
                <option value="sem_site">Sem site (melhor oportunidade)</option>
                <option value="todos">Todas as empresas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-vms-muted mb-1.5">Raio</label>
              <select
                value={raioKm}
                onChange={(e) => setRaioKm(parseInt(e.target.value))}
                className="w-full bg-vms-card border border-vms-borda rounded-xl px-4 py-2.5 text-vms-text focus:outline-none focus:border-vms-primaria transition"
              >
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-vms-muted mb-1.5">
                <span className="flex items-center gap-1">Avaliação mínima <Star size={12} className="text-yellow-400" /></span>
              </label>
              <select
                value={avaliacaoMinima}
                onChange={(e) => setAvaliacaoMinima(parseFloat(e.target.value))}
                className="w-full bg-vms-card border border-vms-borda rounded-xl px-4 py-2.5 text-vms-text focus:outline-none focus:border-vms-primaria transition"
              >
                <option value={0}>Qualquer avaliação</option>
                <option value={3}>3+ estrelas</option>
                <option value={3.5}>3.5+ estrelas</option>
                <option value={4}>4+ estrelas</option>
                <option value={4.5}>4.5+ estrelas</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  agendarAmanha ? "bg-vms-primaria" : "bg-vms-card border border-vms-borda"
                }`}
                onClick={() => setAgendarAmanha(!agendarAmanha)}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    agendarAmanha ? "translate-x-5.5" : "translate-x-0.5"
                  }`}
                />
              </div>
              <div>
                <span className="text-sm font-medium text-vms-text flex items-center gap-1.5">
                  <Calendar size={14} className="text-vms-primaria" />
                  Agendar para amanhã
                </span>
                <span className="text-xs text-vms-muted">
                  O agente roda de madrugada e para às 3h. Você acorda com os sites prontos.
                </span>
              </div>
            </label>
          </div>

          {erro && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {erro}
            </div>
          )}

          <Button
            onClick={iniciarAgente}
            disabled={true}
            className="w-full py-3 text-base font-bold opacity-60 cursor-not-allowed"
          >
            <><Sparkles className="w-5 h-5 mr-2" />Em breve — Agente IA</>
          </Button>

          <div className="mt-4 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
            <p className="text-xs text-yellow-400">
              <AlertTriangle size={12} className="inline mr-1" />
              O Agente IA está em fase beta e será liberado em breve. Fique atento às atualizações!
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-vms-text">Histórico de Tarefas</h3>
            <button onClick={carregarTarefas} className="text-vms-muted hover:text-vms-primaria transition">
              <RefreshCw size={16} />
            </button>
          </div>

          {tarefas.length === 0 ? (
            <div className="glass-card-premium rounded-[14px] p-12 text-center">
              <Bot className="w-12 h-12 text-vms-muted mx-auto mb-3 opacity-40" />
              <p className="text-vms-muted">Nenhuma tarefa ainda</p>
              <p className="text-xs text-vms-muted mt-1">Configure acima e lance o Agente IA</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {tarefas.map((tarefa) => {
                const config = STATUS_CONFIG[tarefa.status] || STATUS_CONFIG.pendente;
                const StatusIcon = config.icon;
                const expandida = tarefaExpandida === tarefa.id;
                const tempo = tarefa.concluido_em && tarefa.iniciado_em
                  ? Math.round((new Date(tarefa.concluido_em).getTime() - new Date(tarefa.iniciado_em).getTime()) / 60000)
                  : null;

                return (
                  <div key={tarefa.id} className="glass-card-premium rounded-[14px] overflow-hidden">
                    <div
                      className="p-4 cursor-pointer hover:bg-vms-card/50 transition"
                      onClick={() => setTarefaExpandida(expandida ? null : tarefa.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StatusIcon className={`w-5 h-5 ${config.color} ${tarefa.status === "prospectando" || tarefa.status === "gerando" ? "animate-spin" : ""}`} />
                          <div>
                            <div className="font-semibold text-vms-text">
                              {NICHOS.find((n) => n.value === tarefa.segmento)?.label || tarefa.segmento}
                              <span className="text-vms-muted font-normal"> em {tarefa.cidade}</span>
                            </div>
                            <div className="text-xs text-vms-muted flex items-center gap-2 mt-0.5">
                              <span className={config.color}>{config.label}</span>
                              <span>•</span>
                              <span>{tarefa.total_sites_criados}/{tarefa.quantidade} sites</span>
                              {tempo && <><span>•</span><span>{tempo} min</span></>}
                              {tarefa.avaliacao_minima > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5"><Star size={10} className="text-yellow-400" />{tarefa.avaliacao_minima}+</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {(tarefa.status === "concluido" || tarefa.status === "erro" || tarefa.status === "parcial" || tarefa.status === "cancelado") && (
                            <button
                              onClick={(e) => { e.stopPropagation(); deletarTarefa(tarefa.id); }}
                              className="p-1.5 text-vms-muted hover:text-red-400 transition rounded-lg hover:bg-red-500/10"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          {expandida ? <ChevronUp size={16} className="text-vms-muted" /> : <ChevronDown size={16} className="text-vms-muted" />}
                        </div>
                      </div>

                      {(tarefa.status === "prospectando" || tarefa.status === "gerando") && (
                        <div className="mt-3">
                          <div className="h-1.5 bg-vms-card rounded-full overflow-hidden">
                            <div
                              className="h-full bg-vms-primaria rounded-full transition-all duration-1000"
                              style={{
                                width: `${
                                  tarefa.status === "prospectando"
                                    ? 20
                                    : tarefa.quantidade > 0
                                      ? (tarefa.total_sites_criados / tarefa.quantidade) * 80 + 20
                                      : 20
                                }%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-vms-muted mt-1">
                            {tarefa.status === "prospectando"
                              ? "Buscando empresas na região..."
                              : `Gerando site ${tarefa.total_sites_criados + 1} de ${tarefa.quantidade}...`}
                          </p>
                        </div>
                      )}
                    </div>

                    {expandida && (
                      <div className="px-4 pb-4 border-t border-vms-borda">
                        <div className="grid grid-cols-3 gap-3 mt-3 mb-4">
                          <div className="bg-vms-card rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-vms-primaria">{tarefa.total_prospectados}</div>
                            <div className="text-xs text-vms-muted">Prospectados</div>
                          </div>
                          <div className="bg-vms-card rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-green-400">{tarefa.total_sites_criados}</div>
                            <div className="text-xs text-vms-muted">Sites Criados</div>
                          </div>
                          <div className="bg-vms-card rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-red-400">{tarefa.total_erros}</div>
                            <div className="text-xs text-vms-muted">Erros</div>
                          </div>
                        </div>

                        {tarefa.resultados && tarefa.resultados.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-semibold text-vms-text mb-2 flex items-center gap-1.5">
                              <MapPin size={14} className="text-vms-primaria" /> Empresas Prospectadas
                            </h4>
                            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                              {tarefa.resultados.map((r, i) => (
                                <div key={i} className="flex items-center justify-between bg-vms-card rounded-lg px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-vms-text">{r.nome}</span>
                                    {r.tem_site && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">tem site</span>
                                    )}
                                  </div>
                                  <span className="text-xs text-vms-muted">{r.endereco || "—"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {tarefa.sites_criados && tarefa.sites_criados.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-semibold text-vms-text mb-2 flex items-center gap-1.5">
                              <CheckCircle2 size={14} className="text-green-400" /> Sites Criados
                            </h4>
                            <div className="flex flex-col gap-1.5">
                              {tarefa.sites_criados.map((s, i) => (
                                <div key={i} className="flex items-center justify-between bg-green-500/5 border border-green-500/10 rounded-lg px-3 py-2">
                                  <span className="text-sm text-vms-text">{s.nome}</span>
                                  <a
                                    href={`/sites/${s.site_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-vms-primaria hover:underline flex items-center gap-1"
                                  >
                                    Ver site <ExternalLink size={10} />
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {tarefa.sites_erro && tarefa.sites_erro.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-semibold text-vms-text mb-2 flex items-center gap-1.5">
                              <XCircle size={14} className="text-red-400" /> Erros
                            </h4>
                            <div className="flex flex-col gap-1.5">
                              {tarefa.sites_erro.map((s, i) => (
                                <div key={i} className="bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                                  <span className="text-sm text-vms-text">{s.nome}</span>
                                  <span className="text-xs text-vms-muted ml-2">— {s.erro}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {tarefa.log && tarefa.log.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-vms-text mb-2">Log</h4>
                            <div className="bg-vms-card rounded-xl p-3 text-xs text-vms-muted font-mono space-y-0.5">
                              {tarefa.log.map((linha, i) => (
                                <div key={i}>{linha}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
