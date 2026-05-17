"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  CreditCard,
  Pencil,
  Save,
  Check,
  LogOut,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { STATUS_CLIENTE, PLANOS } from "@/lib/constants";
import type { Cliente, Site } from "@/types/database";

export default function ClienteDashboardPage() {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

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
          setHeadline((dados.headline as string) || "");
          setSubheadline((dados.subheadline as string) || "");
          setPhone((dados.telefone as string) || (dados.whatsapp as string) || "");
          setEmail((dados.email as string) || "");
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [router]);

  async function handleSave() {
    if (!site) return;
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    const { data } = await supabase
      .from("sites")
      .update({
        dados_json: {
          ...(site.dados_json ?? {}),
          headline,
          subheadline,
          telefone: phone,
          whatsapp: phone,
          email,
        },
      })
      .eq("id", site.id)
      .select()
      .single();

    if (data) setSite(data);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/cliente/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-vms-fundo">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-vms-primaria border-t-transparent" />
      </div>
    );
  }

  if (!cliente || !site) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-vms-fundo">
        <p className="text-vms-texto-2">Nenhum site vinculado à sua conta.</p>
        <button
          onClick={handleLogout}
          className="rounded-xl bg-vms-primaria px-6 py-2 text-sm font-semibold text-black hover:brightness-110"
        >
          Sair
        </button>
      </div>
    );
  }

  const statusInfo = STATUS_CLIENTE[cliente.status];
  const planoInfo = cliente.plano_tipo
    ? { tipo: cliente.plano_tipo, valor: cliente.valor_mensal ?? 0 }
    : null;

  return (
    <div className="min-h-screen bg-vms-fundo">
      <header className="sticky top-0 z-50 border-b border-vms-borda bg-vms-sidebar/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-vms-primaria/10">
              <span className="text-lg font-bold text-vms-primaria">V</span>
            </div>
            <span className="text-sm font-semibold text-vms-texto">
              VMS <span className="text-vms-primaria">DIGITAL</span>
            </span>
          </div>

          <div className="hidden sm:block">
            <span className="text-sm text-vms-texto-2">{site.nome_site}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-vms-muted">{cliente.nome}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-vms-muted transition-colors hover:bg-white/5 hover:text-vms-texto-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="glass-card rounded-2xl p-6 lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vms-primaria/10">
                <Globe className="h-5 w-5 text-vms-primaria" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-vms-texto">{site.nome_site}</h2>
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

            <div className="relative overflow-hidden rounded-xl border border-vms-borda bg-vms-fundo">
              <div className="flex items-center gap-2 border-b border-vms-borda bg-vms-sidebar px-4 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                <span className="ml-3 text-xs text-vms-muted">
                  {site.slug || "seusite.vmsdigital.com.br"}
                </span>
              </div>
              <div className="flex min-h-[200px] items-center justify-center p-8">
                <div className="text-center">
                  <h3 className="mb-2 text-xl font-bold text-vms-texto">
                    {headline || site.nome_site}
                  </h3>
                  <p className="mb-4 text-sm text-vms-texto-2">
                    {subheadline || "Seu site profissional está no ar"}
                  </p>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-vms-primaria/10 px-4 py-2 text-sm text-vms-primaria">
                    <ExternalLink className="h-4 w-4" />
                    Ver site completo
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vms-blue-bg">
                <CreditCard className="h-5 w-5 text-vms-blue-light" />
              </div>
              <h2 className="text-lg font-semibold text-vms-texto">Pagamento</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-vms-muted">Plano</p>
                <p className="text-sm font-medium text-vms-texto">
                  {planoInfo
                    ? planoInfo.tipo.charAt(0).toUpperCase() + planoInfo.tipo.slice(1)
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-vms-muted">Valor mensal</p>
                <p className="text-sm font-medium text-vms-texto">
                  {planoInfo ? `R$ ${planoInfo.valor.toFixed(2)}` : "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-vms-muted">Vencimento</p>
                <p className="text-sm font-medium text-vms-texto">
                  {cliente.vencimento
                    ? new Date(cliente.vencimento).toLocaleDateString("pt-BR")
                    : "—"}
                </p>
              </div>

              <div>
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
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vms-primaria/10">
              <Pencil className="h-5 w-5 text-vms-primaria" />
            </div>
            <h2 className="text-lg font-semibold text-vms-texto">Edição rápida</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-vms-texto-2">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Título principal do site"
                className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-vms-texto-2">Subheadline</label>
              <input
                type="text"
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                placeholder="Subtítulo do site"
                className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-vms-texto-2">Telefone / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full rounded-xl border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@email.com"
                  className="w-full rounded-xl border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-vms-primaria px-6 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-none"
            >
              {saving ? (
                "Salvando..."
              ) : saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Salvo!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar alterações
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
