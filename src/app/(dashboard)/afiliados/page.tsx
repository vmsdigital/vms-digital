"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/MetricCard";
import { createClient } from "@/lib/supabase/client";
import { podeUsarAfiliados } from "@/lib/plan-limits";
import type { Usuario } from "@/types/database";
import {
  Users,
  Clock,
  CheckCircle,
  DollarSign,
  Copy,
  Check,
  TrendingUp,
  Lock,
  Zap,
} from "lucide-react";

interface Indicado {
  id: string;
  nome: string;
  email: string;
  plano: string;
  comissao: number;
  status: "pendente" | "pago";
}

const indicadosMock: Indicado[] = [
  { id: "1", nome: "Carlos Mendes", email: "carlos@email.com", plano: "Pro", comissao: 29.1, status: "pago" },
  { id: "2", nome: "Ana Beatriz", email: "ana@email.com", plano: "Starter", comissao: 14.1, status: "pendente" },
  { id: "3", nome: "Roberto Lima", email: "roberto@email.com", plano: "Agency", comissao: 59.1, status: "pago" },
  { id: "4", nome: "Fernanda Alves", email: "fernanda@email.com", plano: "Pro", comissao: 29.1, status: "pendente" },
  { id: "5", nome: "Lucas Santos", email: "lucas@email.com", plano: "Starter", comissao: 14.1, status: "pago" },
];

export default function AfiliadosPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) setUsuario(data as Usuario);
      }
    }
    loadUser();
  }, []);

  const podeAfiliados = usuario ? podeUsarAfiliados(usuario.plano) : false;
  const referralLink = usuario
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/cadastro?ref=${usuario.id}`
    : "";

  async function handleCopy() {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!podeAfiliados) {
    return (
      <DashboardLayout title="Afiliados">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="rounded-2xl border border-vms-borda bg-vms-card p-10 text-center max-w-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-vms-purple-bg">
              <Lock size={28} className="text-vms-purple-light" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-vms-texto">
              Recurso exclusivo
            </h2>
            <p className="mb-6 text-sm text-vms-muted">
              O programa de afiliados está disponível apenas para os planos Pro e Agency. Faça upgrade para começar a ganhar com indicações.
            </p>
            <button className="inline-flex items-center gap-2 rounded-lg bg-vms-primaria px-6 py-2.5 text-sm font-medium text-black hover:brightness-110 transition-all">
              <Zap size={16} />
              Fazer upgrade para Pro
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Afiliados">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<Users size={14} />}
            label="Total Indicados"
            value="12"
            sub="+3 este mês"
            green
          />
          <MetricCard
            icon={<Clock size={14} />}
            label="Comissões Pendentes"
            value="R$ 43,20"
          />
          <MetricCard
            icon={<CheckCircle size={14} />}
            label="Comissões Pagas"
            value="R$ 312,60"
            green
          />
          <MetricCard
            icon={<DollarSign size={14} />}
            label="Total Ganho"
            value="R$ 355,80"
          />
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h2 className="mb-3 text-sm font-medium text-vms-texto">Seu Link de Indicação</h2>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg border border-vms-borda bg-vms-fundo px-4 py-2.5 text-sm text-vms-primaria truncate">
              {referralLink}
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-lg bg-vms-primaria px-4 py-2.5 text-sm font-medium text-black hover:brightness-110 transition-all shrink-0"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>

        <div className="glass-card rounded-2xl">
          <div className="border-b border-vms-borda p-4">
            <h2 className="text-sm font-medium text-vms-texto">Indicações</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-vms-borda">
                  <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">E-mail</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Plano</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Comissão</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-vms-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {indicadosMock.map((ind) => (
                  <tr key={ind.id} className="border-b border-vms-borda last:border-0 hover:bg-vms-primaria-hover transition-colors">
                    <td className="px-4 py-3 text-vms-texto-2">{ind.nome}</td>
                    <td className="px-4 py-3 text-vms-muted">{ind.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-vms-primaria-20 px-2 py-0.5 text-xs font-medium text-vms-primaria">
                        {ind.plano}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-vms-texto font-medium">
                      R$ {ind.comissao.toFixed(2).replace(".", ",")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        ind.status === "pago"
                          ? "bg-vms-primaria-20 text-vms-primaria"
                          : "bg-vms-blue-bg text-vms-blue-light"
                      }`}>
                        {ind.status === "pago" ? "Pago" : "Pendente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-vms-primaria" />
            <h2 className="text-sm font-medium text-vms-texto">Como funciona</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-vms-fundo p-4">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-vms-primaria-20 text-sm font-bold text-vms-primaria">
                1
              </div>
              <h3 className="mb-1 text-sm font-medium text-vms-texto">Compartilhe seu link</h3>
              <p className="text-xs text-vms-muted">
                Envie seu link exclusivo para amigos, clientes e contatos.
              </p>
            </div>
            <div className="rounded-lg bg-vms-fundo p-4">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-vms-primaria-20 text-sm font-bold text-vms-primaria">
                2
              </div>
              <h3 className="mb-1 text-sm font-medium text-vms-texto">Eles se cadastram</h3>
              <p className="text-xs text-vms-muted">
                Quando alguém se cadastra pelo seu link, a indicação é registrada automaticamente.
              </p>
            </div>
            <div className="rounded-lg bg-vms-fundo p-4">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-vms-primaria-20 text-sm font-bold text-vms-primaria">
                3
              </div>
              <h3 className="mb-1 text-sm font-medium text-vms-texto">Ganhe 30%</h3>
              <p className="text-xs text-vms-muted">
                Você recebe 30% de comissão sobre cada pagamento do indicado. Ele paga 70%, você ganha 30%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
