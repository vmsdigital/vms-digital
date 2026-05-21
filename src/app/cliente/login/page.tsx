"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ClienteLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
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
        router.push("/cliente/dashboard");
      }
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-vms-fundo px-4">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-vms-primaria/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-vms-primaria/3 blur-[100px]" />

      <div className="animate-scale-in relative w-full max-w-md rounded-[14px] glass p-8 glow-primaria-sm">
        <div className="mb-8 text-center">
          <Image
            src="/logo-vms.svg"
            alt="Startzy"
            width={140}
            height={40}
            className="mx-auto mb-3 animate-float"
          />
        </div>

        <h2 className="mb-6 text-center text-xl font-semibold text-vms-texto">
          Acesse seu site
        </h2>

        {error && (
          <div className="animate-fade-in mb-4 rounded-[10px] border border-vms-erro/30 bg-vms-red-bg px-4 py-3 text-sm text-vms-erro">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
                className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
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
                placeholder="••••••••"
                required
                className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword((prev) => !prev);
                }}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-vms-muted hover:text-vms-texto-2 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[10px] bg-vms-primaria py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-none"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
