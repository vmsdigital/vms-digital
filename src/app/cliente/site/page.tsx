"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Save,
  Check,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Link2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Site, Cliente } from "@/types/database";

export default function ClienteSitePage() {
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);

  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");
  const [horario, setHorario] = useState("");
  const [sobre, setSobre] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [ctaTexto, setCtaTexto] = useState("");
  const [rodape, setRodape] = useState("");

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
          const dados = siteData.dados_json ?? {};
          setHeadline((dados.headline as string) || "");
          setSubheadline((dados.subheadline as string) || "");
          setPhone((dados.telefone as string) || "");
          setEmail((dados.email as string) || "");
          setEndereco((dados.endereco as string) || "");
          setHorario((dados.horario as string) || "");
          setSobre((dados.sobre as string) || "");
          setInstagram((dados.instagram as string) || "");
          setFacebook((dados.facebook as string) || "");
          setWhatsapp((dados.whatsapp as string) || (dados.telefone as string) || "");
          setCtaTexto((dados.cta_texto as string) || "");
          setRodape((dados.rodape as string) || "");
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
          email,
          endereco,
          horario,
          sobre,
          instagram,
          facebook,
          whatsapp,
          cta_texto: ctaTexto,
          rodape,
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
    <div className={`space-y-6 ${saveFlash ? "animate-save-flash" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-vms-texto">
            Editar Conteúdo do Site
          </h2>
          <p className="text-sm text-vms-muted">
            Altere os textos e informações do seu site
          </p>
        </div>
        <button
          onClick={handleSave}
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
              Salvar alterações
            </>
          )}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card-premium rounded-[14px] p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-vms-texto">
            <Pencil className="h-4 w-4 text-vms-primaria" />
            Textos Principais
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-vms-texto-2">
                Headline (Título Principal)
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Ex: A melhor solução para você"
                className="w-full rounded-[10px] border border-white/5 bg-white/5 px-4 py-2.5 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-vms-texto-2">
                Subheadline (Subtítulo)
              </label>
              <textarea
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                placeholder="Descreva brevemente o que você oferece"
                rows={3}
                className="w-full rounded-[10px] border border-white/5 bg-white/5 px-4 py-2.5 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-vms-texto-2">
                Texto do Botão CTA
              </label>
              <input
                type="text"
                value={ctaTexto}
                onChange={(e) => setCtaTexto(e.target.value)}
                placeholder="Ex: Fale conosco"
                className="w-full rounded-[10px] border border-white/5 bg-white/5 px-4 py-2.5 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-vms-texto-2">
                Sobre / Descrição
              </label>
              <textarea
                value={sobre}
                onChange={(e) => setSobre(e.target.value)}
                placeholder="Conte um pouco sobre seu negócio"
                rows={4}
                className="w-full rounded-[10px] border border-white/5 bg-white/5 px-4 py-2.5 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-vms-texto-2">
                Texto do Rodapé
              </label>
              <input
                type="text"
                value={rodape}
                onChange={(e) => setRodape(e.target.value)}
                placeholder="Ex: © 2025 Minha Empresa"
                className="w-full rounded-[10px] border border-white/5 bg-white/5 px-4 py-2.5 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card-premium rounded-[14px] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-vms-texto">
              <Phone className="h-4 w-4 text-vms-primaria" />
              Contato
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">
                  WhatsApp (botão flutuante)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="5500000000000"
                    className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
                  />
                </div>
                <p className="mt-1 text-[11px] text-vms-muted">
                  Número com código do país (ex: 5511999999999)
                </p>
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@email.com"
                    className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card-premium rounded-[14px] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-vms-texto">
              <MapPin className="h-4 w-4 text-vms-primaria" />
              Localização & Horário
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">
                  Endereço
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua Exemplo, 123 - Cidade"
                    className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">
                  Horário de Funcionamento
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                  <input
                    type="text"
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    placeholder="Seg-Sex: 8h-18h | Sáb: 8h-12h"
                    className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card-premium rounded-[14px] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-vms-texto">
              <Globe className="h-4 w-4 text-vms-primaria" />
              Redes Sociais
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">
                  Instagram
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@seuperfil"
                    className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-vms-texto-2">
                  Facebook
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vms-muted" />
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="facebook.com/suapagina"
                    className="w-full rounded-[10px] border border-white/5 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-vms-texto placeholder:text-vms-dark-5 focus:border-vms-primaria/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-vms-primaria/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
