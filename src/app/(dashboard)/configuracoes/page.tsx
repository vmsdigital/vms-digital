"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PlanCard } from "@/components/ui/PlanCard";
import { createClient } from "@/lib/supabase/client";
import { PLANOS, type PlanoKey } from "@/lib/constants";
import type { Usuario } from "@/types/database";
import { User, Mail, Phone, Save, Check, Crown, Lock, Eye, EyeOff, KeyRound, CreditCard, Loader2, ExternalLink, Globe, Shield, Upload, Copy, Palette, Type, Layout, Code, Link2, AlertCircle } from "lucide-react";

type Tab = "perfil" | "plano" | "senha" | "notificacoes" | "dominio" | "whitelabel" | "personalizacao";

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
  const [upgrading, setUpgrading] = useState<PlanoKey | null>(null);
  const [checkoutMsg, setCheckoutMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [dominio, setDominio] = useState("");
  const [dominioVerificado, setDominioVerificado] = useState(false);
  const [verificandoDns, setVerificandoDns] = useState(false);
  const [sslAtivo, setSslAtivo] = useState(false);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [corMarca, setCorMarca] = useState("#C8F135");
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [emailEmpresa, setEmailEmpresa] = useState("");
  const [telefoneEmpresa, setTelefoneEmpresa] = useState("");
  const [painelAtivo, setPainelAtivo] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState("");
  const [prefixoFatura, setPrefixoFatura] = useState("");
  const [envioAutomatico, setEnvioAutomatico] = useState(false);

  const [corPrimaria, setCorPrimaria] = useState("#C8F135");
  const [corSecundaria, setCorSecundaria] = useState("#1E40AF");
  const [corDestaque, setCorDestaque] = useState("#DFFE00");
  const [corFundo, setCorFundo] = useState("#080808");
  const [corTexto, setCorTexto] = useState("#F2EFE9");
  const [fonteFamilia, setFonteFamilia] = useState("Outfit");
  const [estiloBotao, setEstiloBotao] = useState("arredondado");
  const [espacamento, setEspacamento] = useState("normal");
  const [cssPersonalizado, setCssPersonalizado] = useState("");

  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  function handleCopy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  async function handleVerificarDns() {
    setVerificandoDns(true);
    await new Promise((r) => setTimeout(r, 2000));
    setDominioVerificado(true);
    setSslAtivo(true);
    setVerificandoDns(false);
  }

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

  async function handleUpgrade(novoPlano: PlanoKey) {
    if (!usuario) return;
    setUpgrading(novoPlano);
    setCheckoutMsg(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let asaasCustomerId = usuario.asaas_customer_id;

      if (!asaasCustomerId) {
        const customerRes = await fetch("/api/asaas/customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: usuario.nome,
            email: usuario.email,
            cpfCnpj: usuario.whatsapp || user.id,
            phone: usuario.whatsapp,
          }),
        });

        const customerData = await customerRes.json();

        if (!customerRes.ok || !customerData.customerId) {
          setCheckoutMsg({ type: "error", text: customerData.error || "Erro ao criar cliente no Asaas." });
          setUpgrading(null);
          return;
        }

        asaasCustomerId = customerData.customerId;
        await supabase.from("usuarios").update({ asaas_customer_id: asaasCustomerId }).eq("id", user.id);
      }

      const planoInfo = PLANOS[novoPlano];
      const subscriptionRes = await fetch("/api/asaas/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: asaasCustomerId,
          valor: planoInfo.preco,
          ciclo: "MONTHLY",
          descricao: `Assinatura Startzy - Plano ${planoInfo.nome}`,
          formaPagamento: "UNDEFINED",
        }),
      });

      const subscriptionData = await subscriptionRes.json();

      if (!subscriptionRes.ok) {
        setCheckoutMsg({ type: "error", text: subscriptionData.error || "Erro ao criar assinatura." });
        setUpgrading(null);
        return;
      }

      await supabase.from("usuarios").update({
        asaas_subscription_id: subscriptionData.subscriptionId,
      }).eq("id", user.id);

      if (subscriptionData.linkPagamento) {
        window.open(subscriptionData.linkPagamento, "_blank");
        setCheckoutMsg({ type: "success", text: "Link de pagamento aberto! Complete o pagamento para ativar seu plano." });
      } else if (subscriptionData.data?.invoiceUrl) {
        window.open(subscriptionData.data.invoiceUrl, "_blank");
        setCheckoutMsg({ type: "success", text: "Fatura aberta! Complete o pagamento para ativar seu plano." });
      } else {
        setCheckoutMsg({ type: "success", text: "Assinatura criada! Aguarde a confirmação do pagamento." });
      }
    } catch {
      setCheckoutMsg({ type: "error", text: "Erro de conexão. Tente novamente." });
    }

    setUpgrading(null);
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "perfil", label: "Perfil" },
    { key: "plano", label: "Plano" },
    { key: "senha", label: "Senha" },
    { key: "notificacoes", label: "Notificações" },
    { key: "dominio", label: "Domínio" },
    { key: "whitelabel", label: "White-label" },
    { key: "personalizacao", label: "Personalização" },
  ];

  return (
    <DashboardLayout title="Configurações">
      <div className="space-y-6">
        <div className="flex gap-1 rounded-[10px] glass-card-premium p-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
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
          <div className="glass-card-premium rounded-[14px] p-4 sm:p-6">
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
                    className="w-full rounded-[8px] border border-vms-borda bg-vms-fundo py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria focus:outline-none transition-colors"
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
                    className="w-full rounded-[8px] border border-vms-borda bg-vms-dark-2 py-2.5 pl-10 pr-4 text-sm text-vms-muted cursor-not-allowed"
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
                    className="w-full rounded-[8px] border border-vms-borda bg-vms-fundo py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-[8px] bg-vms-primaria px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saved ? <Check size={16} /> : <Save size={16} />}
                {saved ? "Salvo!" : saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        )}

        {tab === "plano" && (
          <div className="space-y-6">
            {checkoutMsg && (
              <div className={`animate-toast-in rounded-[10px] border px-4 py-3 text-sm flex items-center gap-2 ${
                checkoutMsg.type === "success"
                  ? "border-vms-primaria/30 bg-vms-primaria-20 text-vms-primaria"
                  : "border-vms-erro/30 bg-vms-red-bg text-vms-erro"
              }`}>
                {checkoutMsg.type === "success" ? <Check size={16} /> : <ExternalLink size={16} />}
                {checkoutMsg.text}
              </div>
            )}
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

            <div className="glass-card-premium rounded-[14px] p-4 sm:p-6">
              <h2 className="mb-6 text-base font-medium text-vms-texto">Comparar Planos</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {planosOrder.map((key) => {
                  const plano = PLANOS[key];
                  const isCurrent = usuario?.plano === key;
                  const isPro = key === "pro";
                  return (
                    <div
                      key={key}
                      className={`relative rounded-[10px] border p-5 flex flex-col gap-4 ${
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
                        disabled={isCurrent || upgrading !== null}
                        onClick={() => !isCurrent && handleUpgrade(key)}
                        className={`mt-auto w-full rounded-[8px] py-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          isCurrent
                            ? "bg-vms-dark-2 text-vms-muted cursor-not-allowed"
                            : isPro
                              ? "bg-vms-primaria text-black hover:brightness-110"
                              : "bg-vms-dark-2 text-vms-texto-2 hover:bg-vms-dark-3"
                        }`}
                      >
                        {upgrading === key ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Processando...
                          </>
                        ) : isCurrent ? (
                          "Plano atual"
                        ) : (
                          <>
                            <CreditCard size={14} />
                            Fazer upgrade
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "senha" && (
          <div className="glass-card-premium rounded-[14px] p-4 sm:p-6">
            <h2 className="mb-6 text-base font-medium text-vms-texto">Alterar Senha</h2>
            <div className="max-w-lg space-y-4">
              {senhaMsg && (
                <div
                  className={`animate-fade-in rounded-[10px] border px-4 py-3 text-sm ${
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
                    className="w-full rounded-[8px] border border-vms-borda bg-vms-fundo py-2.5 pl-10 pr-10 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria focus:outline-none transition-colors"
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
                    className="w-full rounded-[8px] border border-vms-borda bg-vms-fundo py-2.5 pl-10 pr-10 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria focus:outline-none transition-colors"
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
                    className="w-full rounded-[8px] border border-vms-borda bg-vms-fundo py-2.5 pl-10 pr-10 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria focus:outline-none transition-colors"
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
                  className="inline-flex items-center gap-2 rounded-[8px] bg-vms-primaria px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
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
          <div className="glass-card-premium rounded-[14px] p-4 sm:p-6">
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

        {tab === "dominio" && (
          <div className="space-y-6">
            <div className="glass-card-premium rounded-[14px] p-4 sm:p-6">
              <h2 className="mb-6 text-base font-medium text-vms-texto flex items-center gap-2">
                <Globe size={18} className="text-vms-primaria" />
                Domínio Personalizado
              </h2>
              <div className="max-w-lg space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm text-vms-texto-2">Domínio atual</label>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-vms-texto">meusite.vms.digital</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-vms-primaria-20 px-2.5 py-0.5 text-[11px] font-medium text-vms-primaria">
                      <Check size={10} />
                      Ativo
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-vms-texto-2">Domínio personalizado</label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                    <input
                      type="text"
                      value={dominio}
                      onChange={(e) => setDominio(e.target.value)}
                      placeholder="www.meusite.com.br"
                      className="w-full rounded-[8px] border border-vms-borda bg-vms-fundo py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card-premium rounded-[14px] p-4 sm:p-6">
              <h3 className="mb-4 text-sm font-medium text-vms-texto flex items-center gap-2">
                <Shield size={16} className="text-vms-primaria" />
                Verificação DNS
              </h3>
              <div className="max-w-lg space-y-4">
                <div className="rounded-[10px] border border-vms-borda bg-vms-fundo p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-vms-muted mb-1">CNAME Record</div>
                      <div className="text-sm text-vms-texto">
                        <span className="text-vms-muted">www</span>
                        <span className="mx-2 text-vms-dark-5">→</span>
                        <span>cname.startzy.com.br</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy("cname.startzy.com.br", "cname")}
                      className="flex items-center gap-1.5 rounded-md border border-vms-borda bg-vms-dark-2 px-3 py-1.5 text-xs text-vms-texto-2 transition-colors hover:border-vms-primaria hover:text-vms-primaria"
                    >
                      {copiedField === "cname" ? <Check size={12} /> : <Copy size={12} />}
                      {copiedField === "cname" ? "Copiado" : "Copiar"}
                    </button>
                  </div>

                  <div className="h-px bg-vms-borda" />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-vms-muted mb-1">A Record</div>
                      <div className="text-sm text-vms-texto">
                        <span className="text-vms-muted">@</span>
                        <span className="mx-2 text-vms-dark-5">→</span>
                        <span>76.76.21.21</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy("76.76.21.21", "a-record")}
                      className="flex items-center gap-1.5 rounded-md border border-vms-borda bg-vms-dark-2 px-3 py-1.5 text-xs text-vms-texto-2 transition-colors hover:border-vms-primaria hover:text-vms-primaria"
                    >
                      {copiedField === "a-record" ? <Check size={12} /> : <Copy size={12} />}
                      {copiedField === "a-record" ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleVerificarDns}
                  disabled={verificandoDns || !dominio}
                  className="inline-flex items-center gap-2 rounded-[8px] bg-vms-primaria px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {verificandoDns ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                  {verificandoDns ? "Verificando..." : "Verificar DNS"}
                </button>

                {dominioVerificado && (
                  <div className="flex items-center gap-2 rounded-[10px] border border-vms-primaria/30 bg-vms-primaria-20 px-4 py-3 text-sm text-vms-primaria">
                    <Check size={16} />
                    DNS verificado com sucesso! Seu domínio está apontando corretamente.
                  </div>
                )}

                {dominio && !dominioVerificado && !verificandoDns && (
                  <div className="flex items-center gap-2 rounded-[10px] border border-vms-erro/30 bg-vms-red-bg px-4 py-3 text-sm text-vms-erro">
                    <AlertCircle size={16} />
                    DNS ainda não verificado. Configure os registros acima no seu provedor de DNS.
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card-premium rounded-[14px] p-4 sm:p-6">
              <h3 className="mb-4 text-sm font-medium text-vms-texto flex items-center gap-2">
                <Shield size={16} className="text-vms-primaria" />
                Certificado SSL
              </h3>
              <div className="max-w-lg space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vms-texto-2">Status do SSL</span>
                  <span className={sslAtivo ? "text-vms-primaria" : "text-vms-muted"}>
                    {sslAtivo ? "Ativo" : "Pendente"}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-vms-dark-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sslAtivo ? "bg-vms-primaria" : "bg-vms-muted"
                    }`}
                    style={{ width: sslAtivo ? "100%" : "30%" }}
                  />
                </div>
                <p className="text-xs text-vms-muted">
                  {sslAtivo
                    ? "Certificado SSL ativo. Seu site está protegido com HTTPS."
                    : "O certificado SSL será emitido automaticamente após a verificação do DNS."}
                </p>
              </div>
            </div>

            <div className="max-w-lg">
              <button
                className="inline-flex items-center gap-2 rounded-[8px] bg-vms-primaria px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                <Save size={16} />
                Salvar domínio
              </button>
            </div>
          </div>
        )}

        {tab === "whitelabel" && (
          <div className="space-y-6">
            <div className="glass-card-premium rounded-[14px] p-4 sm:p-6">
              <h2 className="mb-6 text-base font-medium text-vms-texto flex items-center gap-2">
                <Layout size={18} className="text-vms-primaria" />
                White-label — Painel do Cliente
              </h2>
              <div className="max-w-lg space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm text-vms-texto-2">Logo da empresa</label>
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 shrink-0 rounded-[10px] border-2 border-dashed border-vms-borda bg-vms-fundo flex items-center justify-center overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="h-full w-full object-contain p-1" />
                      ) : (
                        <Upload size={20} className="text-vms-muted" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="text-xs text-vms-muted">
                      <p>Arraste ou clique para enviar</p>
                      <p className="mt-0.5">PNG, SVG ou JPG (máx. 2MB)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-vms-texto-2">Cor da marca</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={corMarca}
                      onChange={(e) => setCorMarca(e.target.value)}
                      className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-vms-borda bg-transparent"
                    />
                    <input
                      type="text"
                      value={corMarca}
                      onChange={(e) => setCorMarca(e.target.value)}
                      className="w-32 rounded-[8px] border border-vms-borda bg-vms-fundo py-2 px-3 text-sm text-vms-texto font-mono focus:border-vms-primaria focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-vms-texto-2">Nome da empresa</label>
                  <input
                    type="text"
                    value={nomeEmpresa}
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                    placeholder="Minha Agência"
                    className="w-full rounded-[8px] border border-vms-borda bg-vms-fundo py-2.5 px-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-vms-texto-2">E-mail da empresa</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                    <input
                      type="email"
                      value={emailEmpresa}
                      onChange={(e) => setEmailEmpresa(e.target.value)}
                      placeholder="contato@minhaagencia.com"
                      className="w-full rounded-[8px] border border-vms-borda bg-vms-fundo py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-vms-texto-2">Telefone da empresa</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                    <input
                      type="tel"
                      value={telefoneEmpresa}
                      onChange={(e) => setTelefoneEmpresa(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full rounded-[8px] border border-vms-borda bg-vms-fundo py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-vms-texto-2">URL do painel do cliente</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-[8px] border border-vms-borda bg-vms-dark-2 py-2.5 px-4 text-sm text-vms-muted">
                      painel.startzy.com.br/{usuario?.id?.slice(0, 8) || "slug"}
                    </div>
                    <button
                      onClick={() => handleCopy(`painel.startzy.com.br/${usuario?.id?.slice(0, 8) || "slug"}`, "painel-url")}
                      className="flex items-center gap-1.5 rounded-[8px] border border-vms-borda bg-vms-dark-2 px-3 py-2.5 text-xs text-vms-texto-2 transition-colors hover:border-vms-primaria hover:text-vms-primaria"
                    >
                      {copiedField === "painel-url" ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div>
                    <div className="text-sm font-medium text-vms-texto">Painel do cliente ativo</div>
                    <div className="text-xs text-vms-muted">Ative para que seus clientes acessem o painel personalizado</div>
                  </div>
                  <button
                    onClick={() => setPainelAtivo(!painelAtivo)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      painelAtivo ? "bg-vms-primaria" : "bg-vms-dark-3"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        painelAtivo ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card-premium rounded-[14px] p-4 sm:p-6">
              <h3 className="mb-4 text-sm font-medium text-vms-texto flex items-center gap-2">
                <CreditCard size={16} className="text-vms-primaria" />
                Configurações de Fatura
              </h3>
              <div className="max-w-lg space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm text-vms-texto-2">Método de pagamento</label>
                  <select
                    value={metodoPagamento}
                    onChange={(e) => setMetodoPagamento(e.target.value)}
                    className="w-full rounded-[8px] border border-vms-borda bg-vms-fundo py-2.5 px-4 text-sm text-vms-texto focus:border-vms-primaria focus:outline-none transition-colors"
                  >
                    <option value="">Selecione...</option>
                    <option value="boleto">Boleto</option>
                    <option value="pix">PIX</option>
                    <option value="cartao">Cartão</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-vms-texto-2">Prefixo da fatura</label>
                  <input
                    type="text"
                    value={prefixoFatura}
                    onChange={(e) => setPrefixoFatura(e.target.value)}
                    placeholder="FAT-"
                    className="w-full rounded-[8px] border border-vms-borda bg-vms-fundo py-2.5 px-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-vms-texto">Envio automático de faturas</div>
                    <div className="text-xs text-vms-muted">Enviar faturas automaticamente para os clientes</div>
                  </div>
                  <button
                    onClick={() => setEnvioAutomatico(!envioAutomatico)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      envioAutomatico ? "bg-vms-primaria" : "bg-vms-dark-3"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        envioAutomatico ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-lg">
              <button
                className="inline-flex items-center gap-2 rounded-[8px] bg-vms-primaria px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                <Save size={16} />
                Salvar white-label
              </button>
            </div>
          </div>
        )}

        {tab === "personalizacao" && (
          <div className="space-y-6">
            <div className="glass-card-premium rounded-[14px] p-4 sm:p-6">
              <h2 className="mb-6 text-base font-medium text-vms-texto flex items-center gap-2">
                <Palette size={18} className="text-vms-primaria" />
                Personalização do Tema
              </h2>
              <div className="max-w-lg space-y-5">
                <div>
                  <h3 className="mb-3 text-sm font-medium text-vms-texto-2">Cores do tema</h3>
                  <div className="space-y-3">
                    {([
                      { label: "Cor Primária", value: corPrimaria, setter: setCorPrimaria },
                      { label: "Cor Secundária", value: corSecundaria, setter: setCorSecundaria },
                      { label: "Cor de Destaque", value: corDestaque, setter: setCorDestaque },
                      { label: "Cor de Fundo", value: corFundo, setter: setCorFundo },
                      { label: "Cor do Texto", value: corTexto, setter: setCorTexto },
                    ] as const).map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <input
                          type="color"
                          value={item.value}
                          onChange={(e) => item.setter(e.target.value)}
                          className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-vms-borda bg-transparent"
                        />
                        <div className="flex-1 min-w-0">
                          <label className="text-xs text-vms-muted">{item.label}</label>
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => item.setter(e.target.value)}
                            className="w-full rounded-[6px] border border-vms-borda bg-vms-fundo py-1.5 px-2.5 text-sm text-vms-texto font-mono focus:border-vms-primaria focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card-premium rounded-[14px] p-4 sm:p-6">
              <h3 className="mb-4 text-sm font-medium text-vms-texto flex items-center gap-2">
                <Type size={16} className="text-vms-primaria" />
                Tipografia
              </h3>
              <div className="max-w-lg space-y-3">
                <label className="text-xs text-vms-muted">Font family</label>
                <select
                  value={fonteFamilia}
                  onChange={(e) => setFonteFamilia(e.target.value)}
                  className="w-full rounded-[8px] border border-vms-borda bg-vms-fundo py-2.5 px-4 text-sm text-vms-texto focus:border-vms-primaria focus:outline-none transition-colors"
                >
                  <option value="Outfit">Outfit</option>
                  <option value="Inter">Inter</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Roboto">Roboto</option>
                </select>
              </div>
            </div>

            <div className="glass-card-premium rounded-[14px] p-4 sm:p-6">
              <h3 className="mb-4 text-sm font-medium text-vms-texto flex items-center gap-2">
                <Layout size={16} className="text-vms-primaria" />
                Estilo dos Botões
              </h3>
              <div className="max-w-lg space-y-3">
                {([
                  { value: "arredondado", label: "Arredondado" },
                  { value: "quadrado", label: "Quadrado" },
                  { value: "pilula", label: "Pílula" },
                ] as const).map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setEstiloBotao(option.value)}
                      className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                        estiloBotao === option.value ? "border-vms-primaria" : "border-vms-borda"
                      }`}
                    >
                      {estiloBotao === option.value && (
                        <div className="h-2 w-2 rounded-full bg-vms-primaria" />
                      )}
                    </div>
                    <span className="text-sm text-vms-texto-2">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="glass-card-premium rounded-[14px] p-4 sm:p-6">
              <h3 className="mb-4 text-sm font-medium text-vms-texto flex items-center gap-2">
                <Layout size={16} className="text-vms-primaria" />
                Espaçamento
              </h3>
              <div className="max-w-lg space-y-3">
                {([
                  { value: "compacto", label: "Compacto" },
                  { value: "normal", label: "Normal" },
                  { value: "espacoso", label: "Espaçoso" },
                ] as const).map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setEspacamento(option.value)}
                      className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                        espacamento === option.value ? "border-vms-primaria" : "border-vms-borda"
                      }`}
                    >
                      {espacamento === option.value && (
                        <div className="h-2 w-2 rounded-full bg-vms-primaria" />
                      )}
                    </div>
                    <span className="text-sm text-vms-texto-2">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="glass-card-premium rounded-[14px] p-4 sm:p-6">
              <h3 className="mb-4 text-sm font-medium text-vms-texto flex items-center gap-2">
                <Code size={16} className="text-vms-primaria" />
                CSS Personalizado
              </h3>
              <div className="max-w-lg">
                <textarea
                  value={cssPersonalizado}
                  onChange={(e) => setCssPersonalizado(e.target.value)}
                  placeholder="/* Seu CSS personalizado aqui */"
                  rows={8}
                  className="w-full rounded-[8px] border border-vms-borda bg-[#0d0d0d] py-3 px-4 text-sm text-vms-texto font-mono placeholder:text-vms-dark-5 focus:border-vms-primaria focus:outline-none transition-colors resize-y"
                />
              </div>
            </div>

            <div className="max-w-lg">
              <button
                className="inline-flex items-center gap-2 rounded-[8px] bg-vms-primaria px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                <Save size={16} />
                Salvar personalização
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
