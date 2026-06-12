"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  X,
  Download,
  Landmark,
  CreditCard,
  Smartphone,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Hourglass,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingIA } from "@/components/ui/LoadingIA";
import { createClient } from "@/lib/supabase/client";
import type { Transacao, PagamentoAsaas, Carteira } from "@/types/database";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const METODO_CONFIG: Record<string, { label: string; icon: typeof CreditCard }> = {
  pix: { label: "PIX", icon: Smartphone },
  cartao: { label: "Cartão", icon: CreditCard },
  boleto: { label: "Boleto", icon: FileText },
};

const STATUS_PAGAMENTO: Record<string, { label: string; color: string; dot: string }> = {
  received: { label: "Recebido", color: "text-green-400", dot: "bg-green-400" },
  pending: { label: "Pendente", color: "text-yellow-400", dot: "bg-yellow-400" },
  overdue: { label: "Vencido", color: "text-red-400", dot: "bg-red-400" },
  cancelled: { label: "Cancelado", color: "text-vms-muted", dot: "bg-vms-muted" },
};

const STATUS_SAQUE: Record<string, { label: string; color: string }> = {
  processando: { label: "Processando", color: "text-yellow-400" },
  concluido: { label: "Concluído", color: "text-green-400" },
  falhou: { label: "Falhou", color: "text-red-400" },
};

interface Saque {
  id: string;
  valor: number;
  status: "processando" | "concluido" | "falhou";
  criado_em: string;
}

export default function CarteiraPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [pagamentos, setPagamentos] = useState<PagamentoAsaas[]>([]);
  const [saques, setSaques] = useState<Saque[]>([]);
  const [carteira, setCarteira] = useState<Carteira | null>(null);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<"recebimentos" | "saques">("recebimentos");
  const [mostrarModalSaque, setMostrarModalSaque] = useState(false);
  const [valorSaque, setValorSaque] = useState("");
  const [solicitandoSaque, setSolicitandoSaque] = useState(false);

  const carregarDados = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [transRes, pagRes, carteiraRes] = await Promise.all([
      supabase
        .from("transacoes")
        .select("*, clientes(nome), sites(nome_site)")
        .eq("criador_id", user.id)
        .order("criado_em", { ascending: false })
        .limit(100),
      supabase
        .from("pagamentos_asaas")
        .select("*")
        .eq("criador_id", user.id)
        .order("criado_em", { ascending: false })
        .limit(100),
      supabase
        .from("carteira")
        .select("*")
        .eq("criador_id", user.id)
        .single(),
    ]);

    setTransacoes((transRes.data ?? []) as Transacao[]);
    setPagamentos((pagRes.data ?? []) as PagamentoAsaas[]);

    if (carteiraRes.data) {
      setCarteira(carteiraRes.data as Carteira);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  async function handleSolicitarSaque(e: React.FormEvent) {
    e.preventDefault();
    setSolicitandoSaque(true);

    const valor = parseFloat(valorSaque.replace(",", "."));
    if (!valor || valor <= 0) {
      setSolicitandoSaque(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSolicitandoSaque(false);
      return;
    }

    const novoSaque: Saque = {
      id: crypto.randomUUID(),
      valor,
      status: "processando",
      criado_em: new Date().toISOString(),
    };

    setSaques((prev) => [novoSaque, ...prev]);
    setMostrarModalSaque(false);
    setValorSaque("");
    setSolicitandoSaque(false);
  }

  // Resumo do mês
  const agora = new Date();
  const mesAtual = agora.getMonth();
  const anoAtual = agora.getFullYear();

  const transacoesMes = transacoes.filter((t) => {
    const d = new Date(t.criado_em);
    return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
  });

  const pagamentosMes = pagamentos.filter((p) => {
    const d = new Date(p.criado_em);
    return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
  });

  const totalRecebidoMes = transacoesMes
    .filter((t) => t.status === "pago" && (t.tipo === "receita" || t.tipo === "mensalidade" || t.tipo === "comissao"))
    .reduce((acc, t) => acc + t.valor, 0)
    + pagamentosMes
      .filter((p) => p.status === "received")
      .reduce((acc, p) => acc + p.valor, 0);

  const totalPendenteMes = transacoesMes
    .filter((t) => t.status === "pendente" || t.status === "atrasado")
    .reduce((acc, t) => acc + t.valor, 0)
    + pagamentosMes
      .filter((p) => p.status === "pending" || p.status === "overdue")
      .reduce((acc, p) => acc + p.valor, 0);

  const numTransacoesMes = transacoesMes.length + pagamentosMes.length;

  const saldoAtual = carteira?.saldo ??
    transacoes.reduce((acc, t) => {
      if (t.tipo === "receita" || t.tipo === "mensalidade" || t.tipo === "comissao" || t.tipo === "reembolso") return acc + t.valor;
      if (t.tipo === "despesa" || t.tipo === "assinatura") return acc - t.valor;
      return acc;
    }, 0);

  function handleExportCSV() {
    const headers = ["Data", "Descrição", "Cliente", "Tipo", "Método", "Valor", "Status"];
    const rows = pagamentos.map((p) => [
      formatDate(p.criado_em),
      `Pagamento #${p.asaas_payment_id ?? p.id.slice(0, 8)}`,
      p.cliente_id,
      p.tipo,
      METODO_CONFIG[p.tipo]?.label ?? p.tipo,
      p.valor.toFixed(2),
      STATUS_PAGAMENTO[p.status]?.label ?? p.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `carteira_recebimentos_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <DashboardLayout title="Carteira">
        <LoadingIA message="Carregando sua carteira..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Carteira">
      <div className="flex flex-col gap-6">
        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            icon={<Wallet size={14} />}
            label="Saldo Atual"
            value={formatarMoeda(saldoAtual)}
            sub="Disponível para saque"
            green={saldoAtual >= 0}
          />
          <MetricCard
            icon={<ArrowUpRight size={14} />}
            label="Recebido no Mês"
            value={formatarMoeda(totalRecebidoMes)}
            sub={`${numTransacoesMes} transação${numTransacoesMes !== 1 ? "ões" : ""}`}
            green
          />
          <MetricCard
            icon={<Clock size={14} />}
            label="Pendente"
            value={formatarMoeda(totalPendenteMes)}
            sub="Aguardando pagamento"
          />
          <MetricCard
            icon={<TrendingUp size={14} />}
            label="Mensalidades (mês)"
            value={formatarMoeda(
              transacoesMes
                .filter((t) => t.tipo === "mensalidade" && t.status === "pago")
                .reduce((acc, t) => acc + t.valor, 0)
            )}
            sub="Receita recorrente confirmada"
          />
        </div>

        {/* Barra de balanço */}
        <div className="glass-card-premium rounded-[14px] p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-vms-texto">Balanço do Mês</span>
            <span className="text-xs text-vms-muted">
              {totalRecebidoMes + totalPendenteMes > 0
                ? `${((totalRecebidoMes / (totalRecebidoMes + totalPendenteMes)) * 100).toFixed(0)}% recebido`
                : "Sem movimentação"}
            </span>
          </div>
          <div className="h-3 bg-vms-card rounded-full overflow-hidden flex">
            {totalRecebidoMes > 0 && (
              <div
                className="h-full bg-vms-primaria/70 rounded-l-full transition-all duration-500"
                style={{ width: `${Math.min((totalRecebidoMes / (totalRecebidoMes + totalPendenteMes || 1)) * 100, 100)}%` }}
              />
            )}
            {totalPendenteMes > 0 && (
              <div
                className="h-full bg-yellow-500/50 rounded-r-full transition-all duration-500"
                style={{ width: `${Math.min((totalPendenteMes / (totalRecebidoMes + totalPendenteMes || 1)) * 100, 100)}%` }}
              />
            )}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-vms-muted">
              <span className="w-2 h-2 rounded-full bg-vms-primaria/70" /> Recebido
            </span>
            <span className="flex items-center gap-1.5 text-xs text-vms-muted">
              <span className="w-2 h-2 rounded-full bg-yellow-500/50" /> Pendente
            </span>
          </div>
        </div>

        {/* Abas: Recebimentos / Saques */}
        <div className="flex items-center gap-1 p-1 glass-card-premium rounded-[10px] w-fit">
          <button
            onClick={() => setAbaAtiva("recebimentos")}
            className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-all cursor-pointer ${
              abaAtiva === "recebimentos"
                ? "bg-vms-primaria text-black"
                : "text-vms-muted hover:text-vms-texto"
            }`}
          >
            <ArrowDownRight size={14} className="inline mr-1.5 -mt-0.5" />
            Recebimentos
          </button>
          <button
            onClick={() => setAbaAtiva("saques")}
            className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-all cursor-pointer ${
              abaAtiva === "saques"
                ? "bg-vms-primaria text-black"
                : "text-vms-muted hover:text-vms-texto"
            }`}
          >
            <ArrowUpRight size={14} className="inline mr-1.5 -mt-0.5" />
            Saques
          </button>
        </div>

        {/* ABA: RECEBIMENTOS */}
        {abaAtiva === "recebimentos" && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-vms-texto">Faturas & Recebimentos</h3>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={handleExportCSV}>
                  <Download size={13} className="mr-1.5" />
                  Exportar
                </Button>
                <button onClick={carregarDados} className="text-vms-muted hover:text-vms-primaria transition p-1.5 rounded-[8px] hover:bg-vms-dark-2 cursor-pointer">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {pagamentos.length === 0 && transacoes.filter((t) => t.tipo === "receita" || t.tipo === "mensalidade").length === 0 ? (
              <div className="glass-card-premium rounded-[14px] p-12 text-center">
                <Wallet className="w-12 h-12 text-vms-muted mx-auto mb-3 opacity-40" />
                <p className="text-vms-muted font-medium">Nenhum recebimento registrado</p>
                <p className="text-xs text-vms-muted mt-1">Os pagamentos recebidos via Asaas aparecerão aqui</p>
              </div>
            ) : (
              <div className="glass-card-premium rounded-[14px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-vms-borda">
                        <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Data</th>
                        <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Cliente</th>
                        <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Descrição</th>
                        <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Método</th>
                        <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Valor</th>
                        <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Status</th>
                        <th className="text-left text-vms-muted text-xs font-medium px-4 py-3">Venc.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-vms-borda">
                      {pagamentos.map((pg) => {
                        const metodoConf = METODO_CONFIG[pg.tipo];
                        const statusConf = STATUS_PAGAMENTO[pg.status] ?? STATUS_PAGAMENTO.pending;
                        const MetodoIcon = metodoConf?.icon ?? FileText;

                        return (
                          <tr key={pg.id} className="hover:bg-vms-primaria-hover transition-colors">
                            <td className="px-4 py-3 text-vms-texto-2 text-xs whitespace-nowrap">
                              {formatDate(pg.criado_em)}
                            </td>
                            <td className="px-4 py-3 text-vms-texto text-xs font-medium">
                              {pg.cliente_id.slice(0, 8)}...
                            </td>
                            <td className="px-4 py-3 text-vms-texto-2 text-xs">
                              Pgto #{pg.asaas_payment_id ?? pg.id.slice(0, 8)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5 text-vms-texto-2 text-xs">
                                <MetodoIcon size={12} />
                                {metodoConf?.label ?? pg.tipo}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-vms-primaria text-sm font-semibold">
                              {formatarMoeda(pg.valor)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusConf.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                                {statusConf.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-vms-texto-2 text-xs whitespace-nowrap">
                              {formatDate(pg.vencimento)}
                            </td>
                          </tr>
                        );
                      })}

                      {transacoes
                        .filter((t) => t.tipo === "receita" || t.tipo === "mensalidade" || t.tipo === "comissao")
                        .map((t) => (
                          <tr key={t.id} className="hover:bg-vms-primaria-hover transition-colors">
                            <td className="px-4 py-3 text-vms-texto-2 text-xs whitespace-nowrap">
                              {formatDate(t.criado_em)}
                            </td>
                            <td className="px-4 py-3 text-vms-texto text-xs font-medium">
                              {t.clientes?.nome ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-vms-texto-2 text-xs">
                              {t.descricao ?? t.tipo}
                              {t.sites?.nome_site && ` (${t.sites.nome_site})`}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5 text-vms-texto-2 text-xs">
                                <Landmark size={12} />
                                Manual
                              </span>
                            </td>
                            <td className="px-4 py-3 text-green-400 text-sm font-semibold">
                              +{formatarMoeda(t.valor)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                  t.status === "pago" ? "text-green-400" :
                                  t.status === "pendente" ? "text-yellow-400" :
                                  "text-red-400"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  t.status === "pago" ? "bg-green-400" :
                                  t.status === "pendente" ? "bg-yellow-400" :
                                  "bg-red-400"
                                }`} />
                                {t.status === "pago" ? "Recebido" : t.status === "pendente" ? "Pendente" : "Vencido"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-vms-texto-2 text-xs whitespace-nowrap">
                              {formatDate(t.vencimento)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ABA: SAQUES */}
        {abaAtiva === "saques" && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-vms-texto">Saques</h3>
              <Button onClick={() => setMostrarModalSaque(true)}>
                <Landmark size={14} className="mr-1.5" />
                Solicitar Saque
              </Button>
            </div>

            {saques.length === 0 ? (
              <div className="glass-card-premium rounded-[14px] p-12 text-center">
                <Landmark className="w-12 h-12 text-vms-muted mx-auto mb-3 opacity-40" />
                <p className="text-vms-muted font-medium">Nenhum saque realizado</p>
                <p className="text-xs text-vms-muted mt-1">Solicite um saque para transferir seu saldo disponível</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {saques.map((sq) => {
                  const statusConf = STATUS_SAQUE[sq.status] ?? STATUS_SAQUE.processando;

                  return (
                    <div key={sq.id} className="glass-card-premium rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            sq.status === "concluido" ? "bg-green-500/10" :
                            sq.status === "falhou" ? "bg-red-500/10" :
                            "bg-yellow-500/10"
                          }`}
                        >
                          {sq.status === "concluido" ? (
                            <CheckCircle2 size={16} className="text-green-400" />
                          ) : sq.status === "falhou" ? (
                            <AlertCircle size={16} className="text-red-400" />
                          ) : (
                            <Hourglass size={16} className="text-yellow-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-vms-texto">
                            Saque de {formatarMoeda(sq.valor)}
                          </div>
                          <div className="text-xs text-vms-muted flex items-center gap-2">
                            <span>{new Date(sq.criado_em).toLocaleDateString("pt-BR")}</span>
                            <span>•</span>
                            <span className={statusConf.color}>{statusConf.label}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-base font-bold text-red-400`}>
                        -{formatarMoeda(sq.valor)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Modal de Solicitar Saque */}
        {mostrarModalSaque && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <div className="glass-card-premium rounded-[14px] p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-vms-texto">Solicitar Saque</h3>
                <button
                  onClick={() => setMostrarModalSaque(false)}
                  className="text-vms-muted hover:text-vms-texto transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSolicitarSaque} className="flex flex-col gap-4">
                <div className="glass-card-premium rounded-[10px] p-4">
                  <div className="text-xs text-vms-muted mb-1">Saldo disponível</div>
                  <div className="text-2xl font-bold text-vms-primaria">{formatarMoeda(saldoAtual)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-vms-muted mb-1.5">Valor do saque (R$)</label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    max={saldoAtual}
                    value={valorSaque}
                    onChange={(e) => setValorSaque(e.target.value)}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setMostrarModalSaque(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={solicitandoSaque || !valorSaque || parseFloat(valorSaque) > saldoAtual}
                    className="flex-1"
                  >
                    <Landmark size={14} className="mr-1.5" />
                    Confirmar Saque
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
