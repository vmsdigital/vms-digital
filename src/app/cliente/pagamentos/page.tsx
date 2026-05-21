"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Cliente, PagamentoAsaas } from "@/types/database";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  received: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
};

const statusStyles: Record<string, string> = {
  pending: "bg-vms-blue-bg text-vms-blue-light",
  received: "bg-green-500/10 text-green-400",
  overdue: "bg-vms-red-bg text-vms-red-light",
  cancelled: "bg-white/5 text-vms-muted",
};

const tipoLabels: Record<string, string> = {
  boleto: "Boleto",
  pix: "PIX",
  cartao: "Cartão",
};

export default function ClientePagamentosPage() {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [pagamentos, setPagamentos] = useState<PagamentoAsaas[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/cliente/login");
        return;
      }

      const { data: clienteData } = await supabase
        .from("clientes")
        .select("*")
        .eq("email", user.email)
        .single();

      if (clienteData) {
        setCliente(clienteData as Cliente);

        const { data: pagamentosData } = await supabase
          .from("pagamento_asaas")
          .select("*")
          .eq("cliente_id", clienteData.id)
          .order("vencimento", { ascending: false });

        if (pagamentosData) setPagamentos(pagamentosData as PagamentoAsaas[]);

        if (clienteData.asaas_customer_id && (!pagamentosData || pagamentosData.length === 0)) {
          try {
            const res = await fetch("/api/asaas/payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ customerId: clienteData.asaas_customer_id }),
            });
            const apiData = await res.json();
            if (apiData.payments && apiData.payments.length > 0) {
              const mappedPayments = apiData.payments.map((p: Record<string, unknown>) => ({
                id: p.id as string || Math.random().toString(36).slice(2),
                criador_id: clienteData.criador_id,
                cliente_id: clienteData.id,
                asaas_payment_id: p.id as string,
                asaas_customer_id: clienteData.asaas_customer_id,
                tipo: (p.billingType === "CREDIT_CARD" ? "cartao" : p.billingType === "BOLETO" ? "boleto" : "pix") as string,
                valor: p.value as number,
                status: (p.status === "RECEIVED" || p.status === "CONFIRMED" ? "received" : p.status === "OVERDUE" ? "overdue" : p.status === "CANCELLED" ? "cancelled" : "pending") as string,
                link_pagamento: (p.invoiceUrl || p.bankSlipUrl) as string | null,
                vencimento: p.dueDate as string,
                pago_em: (p.status === "RECEIVED" || p.status === "CONFIRMED" ? new Date().toISOString() : null) as string | null,
                criado_em: (p.dateCreated || new Date().toISOString()) as string,
              }));
              setPagamentos(mappedPayments);
            }
          } catch {}
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [router]);

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-vms-primaria border-t-transparent" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-vms-texto-2">Nenhuma conta encontrada.</p>
      </div>
    );
  }

  const pendentes = pagamentos.filter((p) => p.status === "pending");
  const pagos = pagamentos.filter((p) => p.status === "received");
  const vencidos = pagamentos.filter((p) => p.status === "overdue");
  const totalPago = pagos.reduce((acc, p) => acc + p.valor, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-vms-texto">Pagamentos</h2>
        <p className="text-sm text-vms-muted">
          Acompanhe suas faturas e pagamentos
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card-premium rounded-[14px] p-4">
          <p className="text-xs text-vms-muted">Total Pago</p>
          <p className="mt-1 text-xl font-bold text-vms-primaria">
            R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="glass-card-premium rounded-[14px] p-4">
          <p className="text-xs text-vms-muted">Faturas Pendentes</p>
          <p className="mt-1 text-xl font-bold text-vms-blue-light">
            {pendentes.length}
          </p>
        </div>
        <div className="glass-card-premium rounded-[14px] p-4">
          <p className="text-xs text-vms-muted">Faturas Pagas</p>
          <p className="mt-1 text-xl font-bold text-green-400">{pagos.length}</p>
        </div>
        <div className="glass-card-premium rounded-[14px] p-4">
          <p className="text-xs text-vms-muted">Vencidas</p>
          <p className="mt-1 text-xl font-bold text-vms-red-light">
            {vencidos.length}
          </p>
        </div>
      </div>

      {pendentes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-vms-texto">
            Faturas Pendentes
          </h3>
          {pendentes.map((p) => (
            <div
              key={p.id}
              className="glass-card-premium rounded-[14px] p-5 border-l-4 border-l-vms-blue-light"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-vms-blue-light" />
                    <span className="text-sm font-medium text-vms-texto">
                      R${" "}
                      {p.valor.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[p.status]}`}
                    >
                      {statusLabels[p.status]}
                    </span>
                  </div>
                  <p className="text-xs text-vms-muted">
                    Vencimento:{" "}
                    {new Date(p.vencimento).toLocaleDateString("pt-BR")} •{" "}
                    {tipoLabels[p.tipo]}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {p.link_pagamento && (
                    <a
                      href={p.link_pagamento}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-[10px] bg-vms-primaria px-4 py-2 text-sm font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:brightness-110"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      Pagar
                    </a>
                  )}
                  {p.tipo === "pix" && p.asaas_payment_id && (
                    <button
                      onClick={() =>
                        handleCopy(p.asaas_payment_id!, p.id + "-pix")
                      }
                      className="flex items-center gap-1.5 rounded-[10px] bg-vms-blue-bg px-3 py-2 text-sm text-vms-blue-light transition-colors hover:bg-vms-blue-light/20"
                    >
                      {copied === p.id + "-pix" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <QrCode className="h-3.5 w-3.5" />
                      )}
                      {copied === p.id + "-pix" ? "Copiado!" : "PIX Copia e Cola"}
                    </button>
                  )}
                  {p.tipo === "boleto" && p.link_pagamento && (
                    <button
                      onClick={() =>
                        handleCopy(p.link_pagamento!, p.id + "-boleto")
                      }
                      className="flex items-center gap-1.5 rounded-[10px] bg-vms-purple-bg px-3 py-2 text-sm text-vms-purple-light transition-colors hover:bg-vms-purple-light/20"
                    >
                      {copied === p.id + "-boleto" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                      {copied === p.id + "-boleto"
                        ? "Copiado!"
                        : "Link do Boleto"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-card-premium rounded-[14px]">
        <div className="border-b border-vms-borda p-4">
          <h3 className="text-sm font-semibold text-vms-texto">
            Histórico de Pagamentos
          </h3>
        </div>

        {pagamentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-vms-muted">
            <CreditCard className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-sm">Nenhum pagamento registrado</p>
            <p className="text-xs text-vms-dark-5 mt-1">Seus pagamentos aparecerão aqui quando forem gerados</p>
          </div>
        ) : (
          <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-vms-borda">
                  <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Vencimento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Pago em</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-vms-muted">Ação</th>
                </tr>
              </thead>
              <tbody>
                {pagamentos.map((p) => (
                  <tr key={p.id} className="border-b border-vms-borda last:border-0 hover:bg-vms-primaria-hover transition-colors">
                    <td className="px-4 py-3 text-vms-texto-2">{new Date(p.vencimento).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3 font-medium text-vms-texto">R$ {p.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-vms-texto-2">{tipoLabels[p.tipo] || p.tipo}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[p.status]}`}>{statusLabels[p.status]}</span></td>
                    <td className="px-4 py-3 text-vms-muted">{p.pago_em ? new Date(p.pago_em).toLocaleDateString("pt-BR") : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      {p.link_pagamento && p.status === "pending" && (
                        <a href={p.link_pagamento} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-vms-primaria hover:text-vms-primaria-hover transition-colors">
                          <ExternalLink className="h-3 w-3" />Pagar
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden grid grid-cols-1 gap-3 p-4">
            {pagamentos.map((p) => (
              <div key={p.id} className="glass-card-premium rounded-[10px] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[p.status]}`}>{statusLabels[p.status]}</span>
                  <span className="text-vms-primaria font-bold text-sm">R$ {p.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-vms-muted">Tipo</span>
                    <p className="text-vms-texto-2">{tipoLabels[p.tipo] || p.tipo}</p>
                  </div>
                  <div>
                    <span className="text-vms-muted">Vencimento</span>
                    <p className="text-vms-texto-2">{new Date(p.vencimento).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <span className="text-vms-muted">Pago em</span>
                    <p className="text-vms-texto-2">{p.pago_em ? new Date(p.pago_em).toLocaleDateString("pt-BR") : "—"}</p>
                  </div>
                </div>
                {p.link_pagamento && p.status === "pending" && (
                  <a href={p.link_pagamento} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-[10px] bg-vms-primaria px-4 py-2 text-sm font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:brightness-110">
                    <CreditCard className="h-3.5 w-3.5" />Pagar agora
                  </a>
                )}
              </div>
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
