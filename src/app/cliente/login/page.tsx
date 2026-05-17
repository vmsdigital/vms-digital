"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/cliente/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-vms-fundo px-4">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-vms-primaria/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-vms-primaria/3 blur-[100px]" />

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
          Acesse seu site
        </h2>

        {error && (
          <div className="animate-fade-in mb-4 rounded-xl border border-vms-erro/30 bg-vms-red-bg px-4 py-3 text-sm text-vms-erro">
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
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-vms-primaria py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-none"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
