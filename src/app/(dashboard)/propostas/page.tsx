"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Phone, DollarSign, Calendar, ChevronRight, X } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LoadingIA } from "@/components/ui/LoadingIA";
import { createClient } from "@/lib/supabase/client";
import { STATUS_PROPOSTA } from "@/lib/constants";
import type { Proposta } from "@/types/database";

type StatusProposta = Proposta["status"];

const STATUS_ORDER: StatusProposta[] = ["gerado", "enviado", "negociando", "fechado", "perdido"];

const COLUMN_COLORS: Record<StatusProposta, string> = {
  gerado: "bg-vms-dark-2",
  enviado: "bg-vms-blue-light",
  negociando: "bg-yellow-400",
  fechado: "bg-vms-primaria",
  perdido: "bg-vms-red-light",
};

const COLUMN_BG: Record<StatusProposta, string> = {
  gerado: "border-vms-dark-2/30",
  enviado: "border-vms-blue-light/30",
  negociando: "border-yellow-400/30",
  fechado: "border-vms-primaria/30",
  perdido: "border-vms-red-light/30",
};

const statusOptions = STATUS_ORDER.map((s) => ({
  value: s,
  label: STATUS_PROPOSTA[s].label,
}));

export default function PropostasPage() {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);

  const [formNome, setFormNome] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formValor, setFormValor] = useState("");
  const [formStatus, setFormStatus] = useState<StatusProposta>("gerado");
  const [salvando, setSalvando] = useState(false);

  const fetchPropostas = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("propostas")
      .select("*")
      .eq("criador_id", user.id)
      .order("criado_em", { ascending: false });

    if (data) setPropostas(data as Proposta[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPropostas();
  }, [fetchPropostas]);

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
    });

    setShowModal(false);
    setFormNome("");
    setFormWhatsapp("");
    setFormValor("");
    setFormStatus("gerado");
    setSalvando(false);
    fetchPropostas();
  }

  async function handleMoverStatus(proposta: Proposta, novoStatus: StatusProposta) {
    if (proposta.status === novoStatus) return;
    setMovingId(proposta.id);

    const supabase = createClient();
    await supabase
      .from("propostas")
      .update({ status: novoStatus })
      .eq("id", proposta.id);

    setPropostas((prev) =>
      prev.map((p) => (p.id === proposta.id ? { ...p, status: novoStatus } : p))
    );
    setMovingId(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  }

  function formatCurrency(val: number | null) {
    if (val === null) return "—";
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  if (loading) {
    return (
      <DashboardLayout title="Propostas">
        <LoadingIA message="Carregando propostas..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Propostas">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="text-vms-muted text-sm">
            {propostas.length} proposta{propostas.length !== 1 ? "s" : ""}
          </span>
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

            return (
              <div
                key={status}
                className={`flex flex-col min-w-[260px] flex-1 border-t-2 ${COLUMN_BG[status]} glass-card rounded-2xl`}
              >
                <div className="flex items-center gap-2 px-3 py-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${COLUMN_COLORS[status]}`} />
                  <span className="text-vms-texto text-sm font-medium">
                    {STATUS_PROPOSTA[status].label}
                  </span>
                  <span className="text-vms-muted text-xs ml-auto bg-vms-dark-2 rounded-full px-2 py-0.5">
                    {colPropostas.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2 px-2 pb-3 flex-1">
                  {colPropostas.length === 0 && (
                    <div className="text-vms-dark-5 text-xs text-center py-6">
                      Nenhuma proposta
                    </div>
                  )}
                  {colPropostas.map((proposta) => (
                    <div
                      key={proposta.id}
                      className="glass rounded-xl p-3 flex flex-col gap-2"
                    >
                      <div className="text-vms-texto text-sm font-medium truncate">
                        {proposta.nome_prospect}
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

                      <div className="flex items-center gap-1 mt-1">
                        {prevStatus && (
                          <button
                            onClick={() => handleMoverStatus(proposta, prevStatus)}
                            disabled={movingId === proposta.id}
                            className="flex-1 text-vms-muted text-[10px] py-1 rounded bg-vms-dark-2 hover:bg-vms-dark-1 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            ← {STATUS_PROPOSTA[prevStatus].label}
                          </button>
                        )}
                        {nextStatus && (
                          <button
                            onClick={() => handleMoverStatus(proposta, nextStatus)}
                            disabled={movingId === proposta.id}
                            className="flex-1 text-vms-primaria text-[10px] py-1 rounded bg-vms-primaria-20 hover:brightness-110 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {STATUS_PROPOSTA[nextStatus].label} →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="glass-card rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-vms-texto text-base font-medium">Nova Proposta</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-vms-muted hover:text-vms-texto cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCriarProposta} className="flex flex-col gap-4">
              <Input
                label="Nome do prospect"
                placeholder="Ex: João Silva"
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                required
              />
              <Input
                label="WhatsApp"
                placeholder="(11) 99999-9999"
                icon={<Phone size={14} />}
                value={formWhatsapp}
                onChange={(e) => setFormWhatsapp(e.target.value)}
              />
              <Input
                label="Valor proposto (R$)"
                type="number"
                min={0}
                step={0.01}
                placeholder="197.00"
                icon={<DollarSign size={14} />}
                value={formValor}
                onChange={(e) => setFormValor(e.target.value)}
              />
              <Select
                label="Status"
                options={statusOptions}
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as StatusProposta)}
              />

              <div className="flex gap-3 mt-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
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
