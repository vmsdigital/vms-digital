"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, Phone, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationNeeded, setConfirmationNeeded] = useState(false);
  const [confirmingLoading, setConfirmingLoading] = useState(false);

  function formatWhatsApp(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const whatsappDigits = whatsapp.replace(/\D/g, "");
      const { error: dbError } = await supabase.from("usuarios").insert({
        id: authData.user.id,
        nome,
        email,
        whatsapp: whatsappDigits || null,
        plano: "gratuito",
      });

      if (dbError) {
        setError("Erro ao criar perfil. Tente novamente.");
        setLoading(false);
        return;
      }

      if (!authData.session) {
        setConfirmationNeeded(true);
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
  }

  async function handleAlreadyConfirmed() {
    setConfirmingLoading(true);
    setError("");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("E-mail ainda não confirmado. Verifique sua caixa de entrada.");
      setConfirmingLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  if (confirmationNeeded) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-vms-fundo px-4 py-8">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-vms-primaria/5 blur-[120px]" />

        <div className="animate-scale-in relative w-full max-w-md rounded-2xl glass p-8 glow-primaria-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="animate-float mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-vms-primaria-20">
              <CheckCircle size={32} className="text-vms-primaria" />
            </div>
            <h1 className="text-2xl font-bold text-vms-texto">Verifique seu e-mail</h1>
            <p className="mt-3 text-sm leading-relaxed text-vms-texto-2">
              Enviamos um link de confirmação para{" "}
              <span className="font-medium text-vms-primaria">{email}</span>. Verifique sua caixa de entrada e spam.
            </p>
          </div>

          {error && (
            <div className="animate-fade-in mb-4 rounded-xl border border-vms-erro/30 bg-vms-red-bg px-4 py-3 text-sm text-vms-erro">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <a
              href={`mailto:${email}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-vms-primaria py-2.5 text-sm font-semibold text-black transition-all hover:brightness-110"
            >
              <Mail size={16} />
              Abrir e-mail
            </a>

            <button
              onClick={handleAlreadyConfirmed}
              disabled={confirmingLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 py-2.5 text-sm text-vms-texto-2 transition-all hover:bg-white/[0.08] hover:border-white/10 disabled:opacity-50"
            >
              {confirmingLoading ? "Verificando..." : "Já confirmei"}
            </button>

            <p className="pt-2 text-center text-xs text-vms-muted">
              <Link href="/login" className="text-vms-primaria hover:underline">
                Voltar para login
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  async function handleGoogleSignup() {
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-vms-fundo px-4 py-8">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-vms-primaria/5 blur-[120px]" />
      <div className="absolute bottom-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-vms-primaria/3 blur-[100px]" />

      <div className="animate-scale-in relative w-full max-w-md rounded-2xl glass p-8 glow-primaria-sm">
        <div className="mb-8 text-center">
          <div className="animate-float mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-vms-primaria/10">
            <span className="text-2xl font-bold text-vms-primaria">V</span>
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-vms-primaria text-glow">VMS</span>
          </h1>
          <p className="mt-1 text-sm tracking-[0.3em] text-vms-muted">DIGITAL</p>
        </div>

        <h2 className="mb-6 text-center text-xl font-semibold text-vms-texto">
          Criar sua conta
        </h2>

        {error && (
          <div className="animate-fade-in mb-4 rounded-xl border border-vms-erro/30 bg-vms-red-bg px-4 py-3 text-sm text-vms-erro">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-vms-texto-2">Nome</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required
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
                placeholder="seu@email.com"
                required
                className="w-full rounded-xl border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
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
                onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                placeholder="(00) 00000-0000"
                className="w-full rounded-xl border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-vms-texto-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full rounded-xl border border-white/5 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-vms-muted hover:text-vms-texto-2 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-vms-texto-2">Confirmar senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                required
                className="w-full rounded-xl border border-white/5 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-vms-muted hover:text-vms-texto-2 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-vms-primaria py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-none"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-xs text-vms-muted">ou</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <button
          onClick={handleGoogleSignup}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/5 py-2.5 text-sm text-vms-texto-2 transition-all hover:bg-white/[0.08] hover:border-white/10"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continuar com Google
        </button>

        <p className="mt-6 text-center text-sm text-vms-muted">
          Já tem conta?{" "}
          <Link href="/login" className="text-vms-primaria hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
