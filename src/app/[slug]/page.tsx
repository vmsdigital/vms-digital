"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-vms-fundo px-4">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute left-1/3 top-1/3 h-[400px] w-[400px] rounded-full bg-vms-primaria/5 blur-[120px]" />

      <div className="animate-scale-in relative w-full max-w-md rounded-[14px] glass p-8 glow-primaria-sm">
        <div className="mb-8 text-center">
          <div className="animate-float mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[14px] bg-vms-primaria/10">
            <span className="text-2xl font-bold text-vms-primaria">V</span>
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-vms-primaria text-glow">VMS</span>
          </h1>
          <p className="mt-1 text-sm tracking-[0.3em] text-vms-muted">DIGITAL</p>
        </div>

        <h2 className="mb-6 text-center text-xl font-semibold text-vms-texto">
          Recuperar senha
        </h2>

        {error && (
          <div className="animate-fade-in mb-4 rounded-[10px] border border-vms-erro/30 bg-vms-red-bg px-4 py-3 text-sm text-vms-erro">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="animate-scale-in flex flex-col items-center gap-3 rounded-[10px] border border-vms-sucesso/30 bg-vms-primaria-20 px-4 py-6 text-center">
              <CheckCircle className="h-10 w-10 text-vms-primaria" />
              <p className="text-sm text-vms-texto">
                Enviamos um link de recuperação para <strong className="text-vms-primaria">{email}</strong>.
              </p>
              <p className="text-xs text-vms-muted">
                Verifique sua caixa de entrada e spam.
              </p>
            </div>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-vms-primaria hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-center text-sm text-vms-muted">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[10px] bg-vms-primaria py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-none"
              >
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-vms-muted">
              Lembrou a senha?{" "}
              <Link href="/login" className="text-vms-primaria hover:underline">
                Entrar
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
