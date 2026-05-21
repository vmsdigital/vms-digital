"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  CreditCard,
  ExternalLink,
  Eye,
  Calendar,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { STATUS_CLIENTE } from "@/lib/constants";
import type { Cliente, Site, PagamentoAsaas } from "@/types/database";

export default function ClienteDashboardPage() {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [pagamentos, setPagamentos] = useState<PagamentoAsaas[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageViews, setPageViews] = useState(0);

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

        const { data: siteData } = await supabase
          .from("sites")
          .select("*")
          .eq("id", clienteData.site_id)
          .single();

        if (siteData) {
          setSite(siteData as Site);
          const dados = siteData.dados_json ?? {};
          setPageViews((dados.page_views as number) || 0);
        }

        const { data: pagamentosData } = await supabase
          .from("pagamento_asaas")
          .select("*")
          .eq("cliente_id", clienteData.id)
          .order("criado_em", { ascending: false })
          .limit(5);

        if (pagamentosData) setPagamentos(pagamentosData as PagamentoAsaas[]);
      }

      setLoading(false);
    }

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-vms-primaria border-t-transparent" />
      </div>
    );
  }

  if (!cliente || !site) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-vms-texto-2">Nenhum site vinculado à sua conta.</p>
      </div>
    );
  }

  const statusInfo = STATUS_CLIENTE[cliente.status];
  const planoInfo = cliente.plano_tipo
    ? { tipo: cliente.plano_tipo, valor: cliente.valor_mensal ?? 0 }
    : null;

  const dados = site.dados_json ?? {};
  const proximoVencimento = pagamentos.find(
    (p) => p.status === "pending"
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass-card-premium rounded-[14px] p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-vms-primaria/10">
              <Globe className="h-5 w-5 text-vms-primaria" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-vms-texto">
                {site.nome_site}
              </h2>
              <p className="text-sm text-vms-muted">{site.nicho}</p>
            </div>
            <span
              className={`ml-auto inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                site.publicado
                  ? "bg-green-500/10 text-green-400"
                  : "bg-vms-purple-bg text-vms-purple-light"
              }`}
            >
              {site.publicado ? "Publicado" : "Rascunho"}
            </span>
          </div>

          <div className="relative overflow-hidden rounded-[10px] border border-vms-borda bg-vms-fundo">
            <div className="flex items-center gap-2 border-b border-vms-borda bg-vms-sidebar px-4 py-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs text-vms-muted">
                {site.dominio_personalizado ||
                  site.slug ||
                  "seusite.vmsdigital.com.br"}
              </span>
            </div>
            <div className="flex min-h-[200px] items-center justify-center p-8">
              <div className="text-center">
                <h3 className="mb-2 text-xl font-bold text-vms-texto">
                  {(dados.headline as string) || site.nome_site}
                </h3>
                <p className="mb-4 text-sm text-vms-texto-2">
                  {(dados.subheadline as string) ||
                    "Seu site profissional está no ar"}
                </p>
                <a
                  href={`https://${site.slug || "seusite"}.vmsdigital.com.br`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-[8px] bg-vms-primaria/10 px-4 py-2 text-sm text-vms-primaria transition-colors hover:bg-vms-primaria/20"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver site completo
                </a>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-[10px] bg-vms-dark-2/50 p-3 text-center">
              <Eye className="mx-auto mb-1 h-4 w-4 text-vms-primaria" />
              <p className="text-lg font-bold text-vms-texto">{pageViews}</p>
              <p className="text-[11px] text-vms-muted">Visualizações</p>
            </div>
            <div className="rounded-[10px] bg-vms-dark-2/50 p-3 text-center">
              <Globe className="mx-auto mb-1 h-4 w-4 text-vms-blue-light" />
              <p className="text-lg font-bold text-vms-texto">
                {site.dominio_personalizado ? "Custom" : "Subdomínio"}
              </p>
              <p className="text-[11px] text-vms-muted">Domínio</p>
            </div>
            <div className="rounded-[10px] bg-vms-dark-2/50 p-3 text-center">
              <Calendar className="mx-auto mb-1 h-4 w-4 text-vms-purple-light" />
              <p className="text-lg font-bold text-vms-texto">
                {cliente.vencimento
                  ? new Date(cliente.vencimento).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                  : "—"}
              </p>
              <p className="text-[11px] text-vms-muted">Vencimento</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card-premium rounded-[14px] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-vms-blue-bg">
                <CreditCard className="h-5 w-5 text-vms-blue-light" />
              </div>
              <h2 className="text-lg font-semibold text-vms-texto">
                Pagamento
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-vms-muted">Plano</p>
                <p className="text-sm font-medium text-vms-texto">
                  {planoInfo
                    ? planoInfo.tipo.charAt(0).toUpperCase() +
                      planoInfo.tipo.slice(1)
                    : "—"}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-vms-muted">Valor mensal</p>
                <p className="text-sm font-medium text-vms-primaria">
                  {planoInfo
                    ? `R$ ${planoInfo.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                    : "—"}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-vms-muted">Vencimento</p>
                <p className="text-sm font-medium text-vms-texto">
                  {cliente.vencimento
                    ? new Date(cliente.vencimento).toLocaleDateString("pt-BR")
                    : "—"}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-vms-muted">Status</p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusInfo.color === "green"
                      ? "bg-green-500/10 text-green-400"
                      : statusInfo.color === "red"
                        ? "bg-vms-red-bg text-vms-red-light"
                        : statusInfo.color === "blue"
                          ? "bg-vms-blue-bg text-vms-blue-light"
                          : "bg-white/5 text-vms-muted"
                  }`}
                >
                  {statusInfo.label}
                </span>
              </div>

              {proximoVencimento?.link_pagamento && (
                <a
                  href={proximoVencimento.link_pagamento}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-[10px] bg-vms-primaria py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:brightness-110"
                >
                  <CreditCard className="h-4 w-4" />
                  Pagar agora
                </a>
              )}
            </div>
          </div>

          <div className="glass-card-premium rounded-[14px] p-6">
            <h3 className="mb-3 text-sm font-semibold text-vms-texto">
              Dados de Acesso
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-vms-muted" />
                <span className="text-vms-texto-2">
                  {cliente.email || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-vms-muted" />
                <span className="text-vms-texto-2">
                  {cliente.whatsapp || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-3.5 w-3.5 text-vms-muted" />
                <span className="text-vms-texto-2">
                  {site.dominio_personalizado ||
                    `${site.slug || "seusite"}.vmsdigital.com.br`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-3.5 w-3.5 text-vms-muted" />
                <span className="text-vms-texto-2">
                  Desde{" "}
                  {new Date(cliente.criado_em).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {pagamentos.length > 0 && (
        <div className="glass-card-premium rounded-[14px] p-6">
          <h3 className="mb-4 text-sm font-semibold text-vms-texto">
            Últimos Pagamentos
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-vms-borda">
                  <th className="px-3 py-2 text-left text-xs font-medium text-vms-muted">
                    Data
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-vms-muted">
                    Valor
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-vms-muted">
                    Tipo
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-vms-muted">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagamentos.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-vms-borda last:border-0"
                  >
                    <td className="px-3 py-2.5 text-vms-texto-2">
                      {new Date(p.vencimento).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-vms-texto">
                      R${" "}
                      {p.valor.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-3 py-2.5 text-vms-texto-2 capitalize">
                      {p.tipo === "cartao"
                        ? "Cartão"
                        : p.tipo === "boleto"
                          ? "Boleto"
                          : "PIX"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.status === "received"
                            ? "bg-green-500/10 text-green-400"
                            : p.status === "pending"
                              ? "bg-vms-blue-bg text-vms-blue-light"
                              : p.status === "overdue"
                                ? "bg-vms-red-bg text-vms-red-light"
                                : "bg-white/5 text-vms-muted"
                        }`}
                      >
                        {p.status === "received"
                          ? "Pago"
                          : p.status === "pending"
                            ? "Pendente"
                            : p.status === "overdue"
                              ? "Vencido"
                              : "Cancelado"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
