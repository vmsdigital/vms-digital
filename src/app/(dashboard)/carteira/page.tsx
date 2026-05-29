"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  RefreshCw,
  ChevronDown,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import type { Transacao } from "@/types/database";

const TIPO_CONFIG: Record<string, { label: string; color: string; icon: typeof TrendingUp; bg: string }> = {
  receita: { label: "Venda de Site", color: "text-green-400", icon: TrendingUp, bg: "bg-green-500/10" },
  mensalidade: { label: "Mensalidade", color: "text-blue-400", icon: TrendingUp, bg: "bg-blue-500/10" },
  comissao: { label: "Comissão Afiliado", color: "text-cyan-400", icon: TrendingUp, bg: "bg-cyan-500/10" },
  despesa: { label: "Despesa", color: "text-red-400", icon: TrendingDown, bg: "bg-red-500/10" },
  reembolso: { label: "Reembolso", color: "text-yellow-400", icon: TrendingUp, bg: "bg-yellow-500/10" },
  assinatura: { label: "Assinatura Plano", color: "text-purple-400", icon: TrendingDown, bg: "bg-purple-500/10" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pago: { label: "Pago", color: "text-green-400" },
  pendente: { label: "Pendente", color: "text-yellow-400" },
  atrasado: { label: "Atrasado", color: "text-red-400" },
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CarteiraPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [totalSaidas, setTotalSaidas] = useState(0);
  const [custoIaMes, setCustoIaMes] = useState(0);
  const [totalMensalidades, setTotalMensalidades] = useState(0);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [novaTransacao, setNovaTransacao] = useState({
    tipo: "despesa" as Transacao["tipo"],
    valor: "",
    descricao: "",
    status: "pago" as Transacao["status"],
  });

  const carregarDados = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("transacoes")
      .select("*, clientes(nome), sites(nome_site)")
      .eq("criador_id", user.id)
      .order("criado_em", { ascending: false })
      .limit(50);

    if (data) {
      setTransacoes(data as Transacao[]);

      const agora = new Date();
      const mesAtual = agora.getMonth();
      const anoAtual = agora.getFullYear();

      let entradas = 0;
      let saidas = 0;
      let mensalidades = 0;

      for (const t of data) {
        const dataT = new Date(t.criado_em);
        const ehMesAtual = dataT.getMonth() === mesAtual && dataT.getFullYear() === anoAtual;

        if (t.tipo === "receita" || t.tipo === "comissao" || t.tipo === "reembolso" || t.tipo === "mensalidade") {
          entradas += t.valor;
          if (t.tipo === "mensalidade" && ehMesAtual) {
            mensalidades += t.valor;
          }
        } else if (t.tipo === "despesa" || t.tipo === "assinatura") {
          saidas += t.valor;
        }
      }

      setTotalEntradas(entradas);
      setTotalSaidas(saidas);
      setSaldo(entradas - saidas);
      setCustoIaMes(0);
      setTotalMensalidades(mensalidades);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  async function criarTransacao() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const valor = parseFloat(novaTransacao.valor.replace(",", "."));
    if (!valor || valor <= 0) return;

    await supabase.from("transacoes").insert({
      criador_id: user.id,
      tipo: novaTransacao.tipo,
      valor,
      descricao: novaTransacao.descricao || null,
      status: novaTransacao.status,
      pago_em: novaTransacao.status === "pago" ? new Date().toISOString() : null,
    });

    setMostrarModal(false);
    setNovaTransacao({ tipo: "despesa", valor: "", descricao: "", status: "pago" });
    await carregarDados();
  }

  const transacoesFiltradas = filtroTipo === "todos"
    ? transacoes
    : transacoes.filter((t) => t.tipo === filtroTipo);

  const lucroPercentual = totalEntradas > 0 ? ((saldo / totalEntradas) * 100).toFixed(1) : "0";

  return (
    <DashboardLayout title="Carteira">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card-premium rounded-[14px] p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={16} className="text-vms-primaria" />
              <span className="text-xs text-vms-muted font-medium">Saldo</span>
            </div>
            <div className={`text-2xl font-bold ${saldo >= 0 ? "text-green-400" : "text-red-400"}`}>
              {formatarMoeda(saldo)}
            </div>
            <div className="text-xs text-vms-muted mt-1">
              {saldo >= 0 ? "+" : ""}{lucroPercentual}% margem
            </div>
          </div>

          <div className="glass-card-premium rounded-[14px] p-5">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight size={16} className="text-green-400" />
              <span className="text-xs text-vms-muted font-medium">Entradas</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {formatarMoeda(totalEntradas)}
            </div>
            <div className="text-xs text-vms-muted mt-1">Receitas + comissões</div>
          </div>

          <div className="glass-card-premium rounded-[14px] p-5">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight size={16} className="text-red-400" />
              <span className="text-xs text-vms-muted font-medium">Saídas</span>
            </div>
            <div className="text-2xl font-bold text-red-400">
              {formatarMoeda(totalSaidas)}
            </div>
            <div className="text-xs text-vms-muted mt-1">Despesas + custos</div>
          </div>

          <div className="glass-card-premium rounded-[14px] p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-blue-400" />
              <span className="text-xs text-vms-muted font-medium">Mensalidades (mês)</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {formatarMoeda(totalMensalidades)}
            </div>
            <div className="text-xs text-vms-muted mt-1">Receita recorrente</div>
          </div>
        </div>

        <div className="glass-card-premium rounded-[14px] p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-vms-muted">Balanço</span>
            <span className="text-sm text-vms-muted">{lucroPercentual}%</span>
          </div>
          <div className="h-3 bg-vms-card rounded-full overflow-hidden flex">
            {totalEntradas > 0 && (
              <div
                className="h-full bg-green-500/60 rounded-l-full transition-all"
                style={{ width: `${Math.min((totalEntradas / (totalEntradas + totalSaidas || 1)) * 100, 100)}%` }}
              />
            )}
            {totalSaidas > 0 && (
              <div
                className="h-full bg-red-500/60 rounded-r-full transition-all"
                style={{ width: `${Math.min((totalSaidas / (totalEntradas + totalSaidas || 1)) * 100, 100)}%` }}
              />
            )}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1 text-xs text-vms-muted">
              <span className="w-2 h-2 rounded-full bg-green-500/60" /> Entradas
            </span>
            <span className="flex items-center gap-1 text-xs text-vms-muted">
              <span className="w-2 h-2 rounded-full bg-red-500/60" /> Saídas
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-vms-text">Movimentações</h3>
            <button onClick={carregarDados} className="text-vms-muted hover:text-vms-primaria transition">
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="bg-vms-card border border-vms-borda rounded-lg px-3 py-1.5 text-sm text-vms-text focus:outline-none focus:border-vms-primaria transition appearance-none pr-7"
              >
                <option value="todos">Todos</option>
                <option value="receita">Vendas de Site</option>
                <option value="mensalidade">Mensalidades</option>
                <option value="comissao">Comissões</option>
                <option value="despesa">Despesas</option>
                <option value="assinatura">Assinatura</option>
                <option value="reembolso">Reembolsos</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-vms-muted pointer-events-none" />
            </div>

            <Button onClick={() => setMostrarModal(true)} className="py-1.5 px-3 text-sm">
              <Plus size={14} className="mr-1" /> Adicionar
            </Button>
          </div>
        </div>

        {transacoesFiltradas.length === 0 ? (
          <div className="glass-card-premium rounded-[14px] p-12 text-center">
            <Wallet className="w-12 h-12 text-vms-muted mx-auto mb-3 opacity-40" />
            <p className="text-vms-muted">Nenhuma movimentação</p>
            <p className="text-xs text-vms-muted mt-1">Adicione receitas e despesas para acompanhar</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {transacoesFiltradas.map((transacao) => {
              const tipoConf = TIPO_CONFIG[transacao.tipo] || TIPO_CONFIG.despesa;
              const statusConf = STATUS_CONFIG[transacao.status] || STATUS_CONFIG.pendente;
              const TipoIcon = tipoConf.icon;
              const ehEntrada = transacao.tipo === "receita" || transacao.tipo === "comissao" || transacao.tipo === "reembolso" || transacao.tipo === "mensalidade";

              return (
                <div key={transacao.id} className="glass-card-premium rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${tipoConf.bg} flex items-center justify-center`}>
                      <TipoIcon size={16} className={tipoConf.color} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-vms-text">
                        {transacao.descricao || tipoConf.label}
                      </div>
                      <div className="text-xs text-vms-muted flex items-center gap-2">
                        <span>{new Date(transacao.criado_em).toLocaleDateString("pt-BR")}</span>
                        {transacao.clientes?.nome && (
                          <><span>•</span><span>{transacao.clientes.nome}</span></>
                        )}
                        <span>•</span>
                        <span className={statusConf.color}>{statusConf.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`text-base font-bold ${ehEntrada ? "text-green-400" : "text-red-400"}`}>
                    {ehEntrada ? "+" : "-"}{formatarMoeda(transacao.valor)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card-premium rounded-[14px] p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-vms-text">Nova Movimentação</h3>
              <button onClick={() => setMostrarModal(false)} className="text-vms-muted hover:text-vms-text transition">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-vms-muted mb-1.5">Tipo</label>
                <select
                  value={novaTransacao.tipo}
                  onChange={(e) => setNovaTransacao({ ...novaTransacao, tipo: e.target.value as Transacao["tipo"] })}
                  className="w-full bg-vms-card border border-vms-borda rounded-xl px-4 py-2.5 text-vms-text focus:outline-none focus:border-vms-primaria transition"
                >
                  <option value="receita">Venda de Site</option>
                  <option value="mensalidade">Mensalidade</option>
                  <option value="comissao">Comissão Afiliado</option>
                  <option value="despesa">Despesa</option>
                  <option value="assinatura">Assinatura Plano</option>
                  <option value="reembolso">Reembolso</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-vms-muted mb-1.5">Valor (R$)</label>
                <Input
                  value={novaTransacao.valor}
                  onChange={(e) => setNovaTransacao({ ...novaTransacao, valor: e.target.value })}
                  placeholder="0,00"
                  type="text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-vms-muted mb-1.5">Descrição</label>
                <Input
                  value={novaTransacao.descricao}
                  onChange={(e) => setNovaTransacao({ ...novaTransacao, descricao: e.target.value })}
                  placeholder="Ex: Assinatura Claude, Venda site..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-vms-muted mb-1.5">Status</label>
                <select
                  value={novaTransacao.status}
                  onChange={(e) => setNovaTransacao({ ...novaTransacao, status: e.target.value as Transacao["status"] })}
                  className="w-full bg-vms-card border border-vms-borda rounded-xl px-4 py-2.5 text-vms-text focus:outline-none focus:border-vms-primaria transition"
                >
                  <option value="pago">Pago</option>
                  <option value="pendente">Pendente</option>
                  <option value="atrasado">Atrasado</option>
                </select>
              </div>

              <Button onClick={criarTransacao} className="w-full py-2.5 font-bold">
                Adicionar Movimentação
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
