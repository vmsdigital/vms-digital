"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PlanCard } from "@/components/ui/PlanCard";
import { createClient } from "@/lib/supabase/client";
import { PLANOS, type PlanoKey } from "@/lib/constants";
import type { Usuario } from "@/types/database";
import { User, Mail, Phone, Save, Check, Crown, Lock, Eye, EyeOff, KeyRound } from "lucide-react";

type Tab = "perfil" | "plano" | "senha" | "notificacoes";

interface Notificacoes {
  novosClientes: boolean;
  propostas: boolean;
  pagamentos: boolean;
}

const planosOrder: PlanoKey[] = ["gratuito", "starter", "pro", "agency", "admin"];

const planFeatures: Record<PlanoKey, string[]> = {
  gratuito: ["2 sites", "1 prospecção/mês", "5 edições IA", "Sem afiliados"],
  starter: ["10 sites", "20 prospecções/mês", "20 edições IA", "Sem afiliados"],
  pro: ["50 sites", "100 prospecções/mês", "Edições IA ilimitadas", "Programa de afiliados"],
  agency: ["Sites ilimitados", "Prospecções ilimitadas", "Edições IA ilimitadas", "Programa de afiliados"],
  admin: ["Acesso total", "Prospecções ilimitadas", "Edições IA ilimitadas", "Programa de afiliados"],
};

export default function ConfiguracoesPage() {
  const [tab, setTab] = useState<Tab>("perfil");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacoes>({
    novosClientes: true,
    propostas: true,
    pagamentos: false,
  });

  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirmar, setSenhaConfirmar] = useState("");
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showSenhaNova, setShowSenhaNova] = useState(false);
  const [showSenhaConfirmar, setShowSenhaConfirmar] = useState(false);
  const [senhaSaving, setSenhaSaving] = useState(false);
  const [senhaMsg, setSenhaMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        if (data) {
          setUsuario(data as Usuario);
          setNome(data.nome);
          setEmail(data.email);
          setWhatsapp(data.whatsapp || "");
        }
      }
    }
    loadUser();
  }, []);

  async function handleSaveProfile() {
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("usuarios")
        .update({ nome, whatsapp: whatsapp || null })
        .eq("id", user.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleChangePassword() {
    setSenhaMsg(null);

    if (senhaNova.length < 6) {
      setSenhaMsg({ type: "error", text: "A nova senha deve ter no mínimo 6 caracteres." });
      return;
    }

    if (senhaNova !== senhaConfirmar) {
      setSenhaMsg({ type: "error", text: "As senhas não coincidem." });
      return;
    }

    if (!senhaAtual) {
      setSenhaMsg({ type: "error", text: "Informe sua senha atual." });
      return;
    }

    setSenhaSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      setSenhaMsg({ type: "error", text: "Usuário não encontrado." });
      setSenhaSaving(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: senhaAtual,
    });

    if (signInError) {
      setSenhaMsg({ type: "error", text: "Senha atual incorreta." });
      setSenhaSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: senhaNova,
    });

    if (updateError) {
      setSenhaMsg({ type: "error", text: updateError.message });
      setSenhaSaving(false);
      return;
    }

    setSenhaMsg({ type: "success", text: "Senha alterada com sucesso!" });
    setSenhaAtual("");
    setSenhaNova("");
    setSenhaConfirmar("");
    setSenhaSaving(false);
  }

  async function handleResetPassword() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/configuracoes`,
      });
      setSenhaMsg({ type: "success", text: "E-mail de redefinição enviado! Verifique sua caixa de entrada." });
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "perfil", label: "Perfil" },
    { key: "plano", label: "Plano" },
    { key: "senha", label: "Senha" },
    { key: "notificacoes", label: "Notificações" },
  ];

  return (
    <DashboardLayout title="Configurações">
      <div className="space-y-6">
        <div className="flex gap-1 rounded-xl glass-card p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-vms-primaria text-black"
                  : "text-vms-muted hover:text-vms-texto-2"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "perfil" && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="mb-6 text-base font-medium text-vms-texto">Informações Pessoais</h2>
            <div className="max-w-lg space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full rounded-lg border border-vms-borda bg-vms-fundo py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-lg border border-vms-borda bg-vms-dark-2 py-2.5 pl-10 pr-4 text-sm text-vms-muted cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-lg border border-vms-borda bg-vms-fundo py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-vms-primaria px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saved ? <Check size={16} /> : <Save size={16} />}
                {saved ? "Salvo!" : saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        )}

        {tab === "plano" && (
          <div className="space-y-6">
            {usuario && (
              <PlanCard
                planName={`Plano ${PLANOS[usuario.plano].nome}`}
                sitesUsed={7}
                sitesLimit={PLANOS[usuario.plano].sites === Infinity ? 999 : PLANOS[usuario.plano].sites}
                prospeccoesUsed={12}
                prospeccoesLimit={PLANOS[usuario.plano].prospeccoes === Infinity ? 999 : PLANOS[usuario.plano].prospeccoes}
                edicoesUsed={8}
                edicoesLimit={PLANOS[usuario.plano].edicoes_ia === Infinity ? 999 : PLANOS[usuario.plano].edicoes_ia}
              />
            )}

            <div className="glass-card rounded-2xl p-6">
              <h2 className="mb-6 text-base font-medium text-vms-texto">Comparar Planos</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {planosOrder.map((key) => {
                  const plano = PLANOS[key];
                  const isCurrent = usuario?.plano === key;
                  const isPro = key === "pro";
                  return (
                    <div
                      key={key}
                      className={`relative rounded-xl border p-5 flex flex-col gap-4 ${
                        isPro
                          ? "border-vms-primaria bg-vms-card"
                          : "border-vms-borda bg-vms-card"
                      }`}
                    >
                      {isPro && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-vms-primaria px-3 py-0.5 text-[10px] font-bold text-black uppercase">
                          Popular
                        </span>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <Crown size={16} className={isPro ? "text-vms-primaria" : "text-vms-muted"} />
                          <span className="text-sm font-medium text-vms-texto">{plano.nome}</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-2xl font-bold text-vms-texto">
                            R${plano.preco}
                          </span>
                          {plano.preco > 0 && (
                            <span className="text-vms-muted text-sm">/mês</span>
                          )}
                        </div>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {planFeatures[key].map((feat) => (
                          <li key={feat} className="flex items-center gap-2 text-xs text-vms-texto-2">
                            <span className="h-1 w-1 rounded-full bg-vms-primaria shrink-0" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                      <button
                        disabled={isCurrent}
                        className={`mt-auto w-full rounded-lg py-2 text-sm font-medium transition-all ${
                          isCurrent
                            ? "bg-vms-dark-2 text-vms-muted cursor-not-allowed"
                            : isPro
                              ? "bg-vms-primaria text-black hover:brightness-110"
                              : "bg-vms-dark-2 text-vms-texto-2 hover:bg-vms-dark-3"
                        }`}
                      >
                        {isCurrent ? "Plano atual" : "Fazer upgrade"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "senha" && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="mb-6 text-base font-medium text-vms-texto">Alterar Senha</h2>
            <div className="max-w-lg space-y-4">
              {senhaMsg && (
                <div
                  className={`animate-fade-in rounded-xl border px-4 py-3 text-sm ${
                    senhaMsg.type === "success"
                      ? "border-vms-primaria/30 bg-vms-primaria-20 text-vms-primaria"
                      : "border-vms-erro/30 bg-vms-red-bg text-vms-erro"
                  }`}
                >
                  {senhaMsg.text}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">Senha atual</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                  <input
                    type={showSenhaAtual ? "text" : "password"}
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    placeholder="Digite sua senha atual"
                    className="w-full rounded-lg border border-vms-borda bg-vms-fundo py-2.5 pl-10 pr-10 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-vms-muted hover:text-vms-texto-2 transition-colors"
                  >
                    {showSenhaAtual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">Nova senha</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                  <input
                    type={showSenhaNova ? "text" : "password"}
                    value={senhaNova}
                    onChange={(e) => setSenhaNova(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-lg border border-vms-borda bg-vms-fundo py-2.5 pl-10 pr-10 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenhaNova(!showSenhaNova)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-vms-muted hover:text-vms-texto-2 transition-colors"
                  >
                    {showSenhaNova ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">Confirmar nova senha</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                  <input
                    type={showSenhaConfirmar ? "text" : "password"}
                    value={senhaConfirmar}
                    onChange={(e) => setSenhaConfirmar(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full rounded-lg border border-vms-borda bg-vms-fundo py-2.5 pl-10 pr-10 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenhaConfirmar(!showSenhaConfirmar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-vms-muted hover:text-vms-texto-2 transition-colors"
                  >
                    {showSenhaConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={senhaSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-vms-primaria px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {senhaSaving ? "Alterando..." : "Alterar senha"}
                </button>
                <button
                  onClick={handleResetPassword}
                  className="text-sm text-vms-muted transition-colors hover:text-vms-primaria"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "notificacoes" && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="mb-6 text-base font-medium text-vms-texto">Preferências de Notificação</h2>
            <div className="max-w-lg space-y-5">
              {([
                { key: "novosClientes" as const, label: "Novos clientes", desc: "Receba notificações quando um novo cliente se cadastrar" },
                { key: "propostas" as const, label: "Propostas", desc: "Receba notificações sobre atualizações de propostas" },
                { key: "pagamentos" as const, label: "Pagamentos", desc: "Receba notificações sobre pagamentos recebidos e inadimplências" },
              ]).map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-vms-texto">{item.label}</div>
                    <div className="text-xs text-vms-muted">{item.desc}</div>
                  </div>
                  <button
                    onClick={() =>
                      setNotificacoes((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key],
                      }))
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      notificacoes[item.key] ? "bg-vms-primaria" : "bg-vms-dark-3"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        notificacoes[item.key] ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
