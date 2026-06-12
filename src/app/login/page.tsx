"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      setIntroComplete(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [searchParams]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        router.refresh();
        await new Promise((r) => setTimeout(r, 300));
        router.push("/dashboard");
      }
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        if (authError.message.includes("provider is not enabled") || authError.message.includes("Unsupported provider")) {
          setError("Login com Google não está disponível no momento. Use e-mail e senha.");
        } else {
          setError(authError.message);
        }
      }
    } catch {
      setError("Erro ao conectar com Google. Tente novamente ou use e-mail e senha.");
    }
  }

  return (
    <>
      {(showIntro || !introComplete) && (
        <div className={`intro-overlay${introComplete ? " fade-out-complete" : ""}`}>
          <Image
            src="/logo-animacao.svg"
            alt="Startzy"
            width={100}
            height={47}
            priority
            className="animate-fade-in-up"
          />
        </div>
      )}
      <div className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-vms-fundo px-4${showIntro ? " login-hidden" : ""}`}>
      <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-vms-primaria/[0.02] blur-[140px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-vms-primaria/[0.015] blur-[100px]" />

      <div className="animate-scale-in relative w-full max-w-[420px] rounded-[18px] glass p-8 glow-primaria-sm">
        <div className="mb-8 text-center">
          <Image
            src="/logo-startzy.svg"
            alt="Startzy"
            width={140}
            height={40}
            className="mx-auto mb-4 animate-float"
          />
        </div>

        <h2 className="mb-6 text-center text-[17px] font-semibold text-vms-texto tracking-[-0.2px]">
          Entrar na sua conta
        </h2>

        {error && (
          <div className="animate-fade-in mb-4 rounded-[10px] border border-vms-erro/30 bg-vms-red-bg px-4 py-3 text-[13px] text-vms-erro">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] text-vms-texto-2 font-medium">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-ghost" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full rounded-[10px] border border-vms-borda bg-vms-card/60 py-[10px] pr-4 pl-10 text-[13px] text-vms-texto placeholder:text-vms-ghost outline-none transition-all focus:border-vms-primaria-border focus:bg-vms-card focus:shadow-[0_0_0_1px_rgba(200,241,53,0.08)]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] text-vms-texto-2 font-medium">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-ghost" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-[10px] border border-vms-borda bg-vms-card/60 py-[10px] pr-10 pl-10 text-[13px] text-vms-texto placeholder:text-vms-ghost outline-none transition-all focus:border-vms-primaria-border focus:bg-vms-card focus:shadow-[0_0_0_1px_rgba(200,241,53,0.08)]"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword((prev) => !prev);
                }}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-vms-ghost hover:text-vms-texto-2 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/recuperar-senha"
              className="text-[12px] text-vms-ghost hover:text-vms-primaria transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[10px] bg-vms-primaria py-[11px] text-[14px] font-semibold text-vms-fundo transition-all hover:shadow-[0_0_24px_rgba(200,241,53,0.35)] hover:brightness-110 disabled:opacity-40 disabled:hover:shadow-none btn-premium"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-vms-borda" />
          <span className="text-[11px] text-vms-ghost">ou</span>
          <div className="h-px flex-1 bg-vms-borda" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-[10px] border border-vms-borda bg-vms-card/60 py-[10px] text-[13px] text-vms-texto-2 transition-all hover:bg-vms-card hover:border-vms-borda-forte"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continuar com Google
        </button>

        <p className="mt-6 text-center text-[13px] text-vms-ghost">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-vms-primaria font-medium hover:text-vms-primaria-bright transition-colors">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
