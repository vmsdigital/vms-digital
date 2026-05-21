"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Save,
  Check,
  Lock,
  Eye,
  EyeOff,
  Key,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Cliente } from "@/types/database";

export default function ClientePerfilPage() {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirmar, setSenhaConfirmar] = useState("");
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showSenhaNova, setShowSenhaNova] = useState(false);
  const [senhaSaving, setSenhaSaving] = useState(false);
  const [senhaSaved, setSenhaSaved] = useState(false);
  const [senhaErro, setSenhaErro] = useState("");

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
        setNome(clienteData.nome);
        setEmail(clienteData.email || "");
        setWhatsapp(clienteData.whatsapp);
      }

      setLoading(false);
    }

    fetchData();
  }, [router]);

  async function handleSavePerfil() {
    if (!cliente) return;
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    await supabase
      .from("clientes")
      .update({
        nome,
        whatsapp,
      })
      .eq("id", cliente.id);

    setCliente({ ...cliente, nome, whatsapp });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault();
    setSenhaErro("");

    if (senhaNova !== senhaConfirmar) {
      setSenhaErro("As senhas não coincidem.");
      return;
    }

    if (senhaNova.length < 6) {
      setSenhaErro("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setSenhaSaving(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: senhaNova,
    });

    if (error) {
      setSenhaErro(error.message);
    } else {
      setSenhaSaved(true);
      setSenhaAtual("");
      setSenhaNova("");
      setSenhaConfirmar("");
      setTimeout(() => setSenhaSaved(false), 2000);
    }

    setSenhaSaving(false);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-vms-texto">Meu Perfil</h2>
        <p className="text-sm text-vms-muted">
          Gerencie suas informações pessoais
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card-premium rounded-[14px] p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-vms-primaria/10">
              <User className="h-5 w-5 text-vms-primaria" />
            </div>
            <h3 className="text-sm font-semibold text-vms-texto">
              Informações Pessoais
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-vms-texto-2">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-vms-texto-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-muted cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-[11px] text-vms-muted">
                O e-mail não pode ser alterado
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-vms-texto-2">
                WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleSavePerfil}
              disabled={saving}
              className="flex items-center gap-2 rounded-[10px] bg-vms-primaria px-6 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-none"
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
                  Salvar
                </>
              )}
            </button>
          </div>
        </div>

        <div className="glass-card-premium rounded-[14px] p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-vms-purple-bg">
              <Key className="h-5 w-5 text-vms-purple-light" />
            </div>
            <h3 className="text-sm font-semibold text-vms-texto">
              Alterar Senha
            </h3>
          </div>

          <form onSubmit={handleAlterarSenha} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-vms-texto-2">
                Senha atual
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                <input
                  type={showSenhaAtual ? "text" : "password"}
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vms-muted hover:text-vms-texto-2 transition-colors"
                >
                  {showSenhaAtual ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-vms-texto-2">
                Nova senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                <input
                  type={showSenhaNova ? "text" : "password"}
                  value={senhaNova}
                  onChange={(e) => setSenhaNova(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSenhaNova(!showSenhaNova)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vms-muted hover:text-vms-texto-2 transition-colors"
                >
                  {showSenhaNova ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-vms-texto-2">
                Confirmar nova senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                <input
                  type="password"
                  value={senhaConfirmar}
                  onChange={(e) => setSenhaConfirmar(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
                />
              </div>
            </div>

            {senhaErro && (
              <p className="text-sm text-vms-erro">{senhaErro}</p>
            )}

            <button
              type="submit"
              disabled={senhaSaving || !senhaNova || !senhaConfirmar}
              className="flex items-center gap-2 rounded-[10px] bg-vms-purple-bg px-6 py-2.5 text-sm font-semibold text-vms-purple-light transition-all hover:bg-vms-purple-light/20 disabled:opacity-50"
            >
              {senhaSaving ? (
                "Alterando..."
              ) : senhaSaved ? (
                <>
                  <Check className="h-4 w-4" />
                  Senha alterada!
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Alterar senha
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
