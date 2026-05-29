"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Link2,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Globe,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Site } from "@/types/database";

export default function ClienteDominioPage() {
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [dominio, setDominio] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [erro, setErro] = useState("");
  const [copied, setCopied] = useState(false);

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
        .select("site_id")
        .eq("email", user.email)
        .single();

      if (clienteData) {
        const { data: siteData } = await supabase
          .from("sites")
          .select("*")
          .eq("id", clienteData.site_id)
          .single();

        if (siteData) {
          setSite(siteData as Site);
          if (siteData.dominio_personalizado) {
            setDominio(siteData.dominio_personalizado);
            setVerificado(true);
          }
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [router]);

  async function handleSalvarDominio() {
    if (!site || !dominio) return;

    setSalvando(true);
    setErro("");

    const dominioLimpo = dominio
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .replace(/^www\./, "")
      .trim();

    if (
      !/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(
        dominioLimpo
      )
    ) {
      setErro("Domínio inválido. Use o formato: seudominio.com.br");
      setSalvando(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("sites")
      .update({ dominio_personalizado: dominioLimpo })
      .eq("id", site.id);

    if (error) {
      setErro("Erro ao salvar domínio. Tente novamente.");
    } else {
      setSite({ ...site, dominio_personalizado: dominioLimpo });
      setVerificado(false);
    }

    setSalvando(false);
  }

  async function handleVerificar() {
    setVerificando(true);
    setErro("");

    try {
      const res = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dominio, siteId: site?.id }),
      });

      const data = await res.json();

      if (data.verified) {
        setVerificado(true);
      } else {
        setErro(
          data.error ||
            "Domínio ainda não está apontando para nossos servidores. Verifique as configurações de DNS."
        );
      }
    } catch {
      setErro("Erro ao verificar domínio. Tente novamente.");
    }

    setVerificando(false);
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-vms-primaria border-t-transparent" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-vms-texto-2">Nenhum site vinculado à sua conta.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-vms-texto">
          Domínio Personalizado
        </h2>
        <p className="text-sm text-vms-muted">
          Conecte seu próprio domínio ao seu site
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card-premium rounded-[14px] p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-vms-primaria/10">
              <Globe className="h-5 w-5 text-vms-primaria" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-vms-texto">
                Configurar Domínio
              </h3>
              <p className="text-xs text-vms-muted">
                Domínio atual:{" "}
                <span className="text-vms-texto-2">
                  {site.dominio_personalizado || site.slug || "—"}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-vms-texto-2">
                Seu domínio
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                <input
                  type="text"
                  value={dominio}
                  onChange={(e) => {
                    setDominio(e.target.value);
                    setVerificado(false);
                    setErro("");
                  }}
                  placeholder="www.seuempresa.com.br"
                  className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
                />
              </div>
            </div>

            {erro && (
              <div className="flex items-start gap-2 rounded-[10px] border border-vms-erro/30 bg-vms-red-bg px-4 py-3 text-sm text-vms-erro">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {erro}
              </div>
            )}

            {verificado && dominio && (
              <div className="flex items-center gap-2 rounded-[10px] border border-green-500/30 bg-green-500/5 px-4 py-3 text-sm text-green-400">
                <Check className="h-4 w-4" />
                Domínio verificado e ativo!
              </div>
            )}

            {verificado && dominio && (
              <a
                href={`https://${dominio}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-[10px] bg-vms-primaria/10 px-4 py-2.5 text-sm font-medium text-vms-primaria transition-colors hover:bg-vms-primaria/20"
              >
                <ExternalLink className="h-4 w-4" />
                Visitar site: {dominio}
              </a>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSalvarDominio}
                disabled={salvando || !dominio}
                className="flex items-center gap-2 rounded-[10px] bg-vms-primaria px-4 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-none"
              >
                {salvando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Salvar
              </button>

              {dominio && !verificado && (
                <button
                  onClick={handleVerificar}
                  disabled={verificando}
                  className="flex items-center gap-2 rounded-[10px] bg-vms-blue-bg px-4 py-2.5 text-sm font-semibold text-vms-blue-light transition-all hover:bg-vms-blue-light/20 disabled:opacity-50"
                >
                  {verificando ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                  Verificar DNS
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card-premium rounded-[14px] p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-vms-blue-bg">
              <Shield className="h-5 w-5 text-vms-blue-light" />
            </div>
            <h3 className="text-sm font-semibold text-vms-texto">
              Instruções de DNS
            </h3>
          </div>

          <p className="mb-4 text-sm text-vms-texto-2">
            Para conectar seu domínio, crie os seguintes registros DNS no
            painel da sua registradora:
          </p>

          <div className="space-y-4">
            <div className="rounded-[10px] bg-vms-dark-2/50 p-4">
              <p className="mb-2 text-xs font-semibold text-vms-texto">
                Registro CNAME
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-vms-muted">Nome / Host</p>
                    <p className="text-sm text-vms-texto-2">www</p>
                  </div>
                  <button
                    onClick={() => handleCopy("www")}
                    className="text-vms-muted hover:text-vms-texto-2 transition-colors"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-vms-muted">Valor / Destino</p>
                    <p className="text-sm text-vms-texto-2">
                      cname.startzy.com.br
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy("cname.startzy.com.br")}
                    className="text-vms-muted hover:text-vms-texto-2 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[10px] bg-vms-dark-2/50 p-4">
              <p className="mb-2 text-xs font-semibold text-vms-texto">
                Registro A (raiz do domínio)
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-vms-muted">Nome / Host</p>
                    <p className="text-sm text-vms-texto-2">@</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-vms-muted">Valor / IP</p>
                    <p className="text-sm text-vms-texto-2">
                      76.76.21.21
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy("76.76.21.21")}
                    className="text-vms-muted hover:text-vms-texto-2 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[10px] border border-vms-primaria/10 bg-vms-primaria/5 p-4">
              <p className="text-xs text-vms-texto-2">
                <strong className="text-vms-primaria">Importante:</strong>{" "}
                Após configurar o DNS, pode levar até 48 horas para o domínio
                propagar. Clique em &quot;Verificar DNS&quot; para confirmar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {site.slug && (
        <div className="glass-card-premium rounded-[14px] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-vms-primaria/10">
              <Globe className="h-5 w-5 text-vms-primaria" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-vms-texto">URL pública do site</h3>
              <p className="text-xs text-vms-muted">Acesse seu site mesmo sem domínio personalizado</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-[10px] bg-vms-dark-2/50 px-4 py-3">
            <Link2 className="h-4 w-4 text-vms-muted shrink-0" />
            <span className="text-sm text-vms-texto-2 flex-1">{window.location.origin}/{site.slug}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${site.slug}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="text-vms-primaria hover:text-vms-primaria-hover transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
