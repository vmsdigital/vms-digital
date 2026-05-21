"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  Sparkles,
  Upload,
  MapPin,
  Camera,
  Link2,
  MessageCircle,
  Globe,
  Sun,
  Moon,
  ArrowLeft,
  ArrowRight,
  Building2,
  Palette,
  Rocket,
  Image as ImageIcon,
  MapPin as MapPinIcon,
  Share2,
  Search,
  Phone,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { LoadingIA } from "@/components/ui/LoadingIA";
import { createClient } from "@/lib/supabase/client";
import { NICHOS } from "@/lib/constants";
import { podeCriarSite } from "@/lib/plan-limits";

const STEP_CONFIG = [
  { number: 1, label: "Informações", icon: Building2 },
  { number: 2, label: "Personalização", icon: Palette },
  { number: 3, label: "Criar Site", icon: Rocket },
];

const OBJETIVOS = [
  "Divulgar serviços",
  "Divulgar produtos",
  "Mostrar portfólio",
  "Site institucional",
  "Captar clientes/leads",
  "Divulgar eventos",
];

const IDIOMAS = [
  { value: "pt-BR", label: "🇧🇷 Português (Brasil)" },
  { value: "en", label: "🇺🇸 English" },
  { value: "es", label: "🇪🇸 Español" },
];

const NICHOS_GRID = NICHOS.map((n) => ({
  value: n.value,
  label: n.label,
}));

const PROGRESS_MESSAGES = [
  "Analisando seu negócio...",
  "Gerando textos profissionais...",
  "Criando layout...",
  "Finalizando...",
];

interface FormData {
  nome_empresa: string;
  descricao: string;
  objetivo: string;
  idioma: string;
  tem_logo: boolean;
  logo_file: File | null;
  nicho: string;
  cor_primaria: string;
  cor_secundaria: string;
  tema: "claro" | "escuro";
  endereco: string;
  sem_endereco: boolean;
  instagram: string;
  facebook: string;
  whatsapp: string;
}

const initialForm: FormData = {
  nome_empresa: "",
  descricao: "",
  objetivo: "",
  idioma: "pt-BR",
  tem_logo: false,
  logo_file: null,
  nicho: "",
  cor_primaria: "#AAFF00",
  cor_secundaria: "#1E40AF",
  tema: "escuro",
  endereco: "",
  sem_endereco: false,
  instagram: "",
  facebook: "",
  whatsapp: "",
};

export default function CriarSitePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-2 border-vms-primaria border-t-transparent rounded-full animate-spin" /></div>}>
      <CriarSiteContent />
    </Suspense>
  );
}

function CriarSiteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(() => {
    const nome = searchParams.get("nome") || "";
    const endereco = searchParams.get("endereco") || "";
    const whatsapp = searchParams.get("whatsapp") || "";
    const segmento = searchParams.get("segmento") || "";
    return {
      ...initialForm,
      nome_empresa: nome,
      endereco: endereco,
      whatsapp: whatsapp,
      nicho: segmento,
      sem_endereco: !endereco,
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gerandoCores, setGerandoCores] = useState(false);
  const [gerandoSite, setGerandoSite] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [empresaEncontrada, setEmpresaEncontrada] = useState<{
    encontrado: boolean;
    nome?: string;
    endereco?: string | null;
    telefone?: string | null;
    website?: string | null;
    avaliacao?: number | null;
    total_avaliacoes?: number | null;
    fonte?: string;
  } | null>(null);
  const [buscandoEmpresa, setBuscandoEmpresa] = useState(false);

  function updateForm(field: keyof FormData, value: string | boolean | File | null) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (typeof value === "string" && value.trim()) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      updateForm("logo_file", file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  function validateStep(s: number): boolean {
    const newErrors: Record<string, string> = {};

    if (s === 1) {
      if (!form.nome_empresa.trim()) newErrors.nome_empresa = "Nome da empresa é obrigatório";
      if (!form.descricao.trim()) newErrors.descricao = "Descrição é obrigatória";
      if (!form.objetivo) newErrors.objetivo = "Selecione um objetivo";
    }

    if (s === 2) {
      if (!form.cor_primaria) newErrors.cor_primaria = "Cor primária é obrigatória";
      if (!form.cor_secundaria) newErrors.cor_secundaria = "Cor secundária é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setTransitioning(true);
    setTimeout(() => {
      setStep((prev) => Math.min(3, prev + 1));
      setTransitioning(false);
    }, 200);
  }

  function goBack() {
    setTransitioning(true);
    setTimeout(() => {
      setStep((prev) => Math.max(1, prev - 1));
      setTransitioning(false);
    }, 200);
  }

  const gerarCoresIA = useCallback(() => {
    setGerandoCores(true);

    const coresPorNicho: Record<string, { primaria: string; secundaria: string }> = {
      provedor: { primaria: "#00CFFF", secundaria: "#0057B7" },
      advocacia: { primaria: "#C9A84C", secundaria: "#1A1A2E" },
      academia: { primaria: "#FF6B35", secundaria: "#1B1B2F" },
      clinica: { primaria: "#4ECDC4", secundaria: "#2C3E50" },
      restaurante: { primaria: "#E74C3C", secundaria: "#2C1810" },
      salao: { primaria: "#E91E9C", secundaria: "#1A0A2E" },
      loja: { primaria: "#FF9F1C", secundaria: "#2B2D42" },
      imobiliaria: { primaria: "#2ECC71", secundaria: "#1A3C34" },
      autopecas: { primaria: "#F39C12", secundaria: "#2C3E50" },
      petshop: { primaria: "#FF6B8A", secundaria: "#2D1B36" },
      construcao: { primaria: "#E67E22", secundaria: "#2C3E2C" },
      outro: { primaria: "#AAFF00", secundaria: "#1E40AF" },
    };

    setTimeout(() => {
      const nicho = form.nicho || "outro";
      const cores = coresPorNicho[nicho] || coresPorNicho.outro;
      updateForm("cor_primaria", cores.primaria);
      updateForm("cor_secundaria", cores.secundaria);
      setGerandoCores(false);
    }, 2000);
  }, [form.nicho]);

  async function handleCriarSite() {
    setShowOverlay(true);
    setGerandoSite(true);

    for (let i = 0; i < PROGRESS_MESSAGES.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProgressMsg(PROGRESS_MESSAGES[i]);
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setShowOverlay(false);
      setGerandoSite(false);
      return;
    }

    const { count } = await supabase
      .from("sites")
      .select("*", { count: "exact", head: true })
      .eq("criador_id", user.id);

    const plano = (user as unknown as { plano?: string }).plano || "gratuito";
    if (!podeCriarSite(plano as "gratuito" | "starter" | "pro" | "agency", count ?? 0)) {
      setShowOverlay(false);
      setGerandoSite(false);
      return;
    }

    setProgressMsg("Gerando seu site com inteligência artificial...");

    let htmlGerado = "";

    try {
      const res = await fetch("/api/sites/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_empresa: form.nome_empresa,
          descricao: form.descricao,
          objetivo: form.objetivo,
          idioma: form.idioma,
          nicho: form.nicho || "outro",
          tem_logo: form.tem_logo,
          cor_primaria: form.cor_primaria,
          cor_secundaria: form.cor_secundaria,
          tema: form.tema,
          endereco: form.sem_endereco ? "" : form.endereco,
          instagram: form.instagram,
          facebook: form.facebook,
          whatsapp: form.whatsapp,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        htmlGerado = data.html || "";
      }
    } catch {
      htmlGerado = "";
    }

    const slug = form.nome_empresa
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const { data: siteData, error } = await supabase.from("sites").insert({
      criador_id: user.id,
      nome_site: form.nome_empresa,
      nicho: form.nicho || "outro",
      slug: `${slug}.vmsdigital.com.br`,
      publicado: true,
      dados_json: {
        descricao: form.descricao,
        objetivo: form.objetivo,
        idioma: form.idioma,
        tem_logo: form.tem_logo,
        cor_primaria: form.cor_primaria,
        cor_secundaria: form.cor_secundaria,
        tema: form.tema,
        endereco: form.sem_endereco ? "" : form.endereco,
        instagram: form.instagram,
        facebook: form.facebook,
        whatsapp: form.whatsapp,
        html_gerado: htmlGerado,
      },
    }).select().single();

    if (!error && siteData) {
      await supabase.from("propostas").insert({
        criador_id: user.id,
        site_id: siteData.id,
        nome_prospect: form.nome_empresa,
        whatsapp: form.whatsapp || null,
        status: "gerado",
        valor_proposto: null,
      });

      await supabase.from("notificacoes").insert({
        usuario_id: user.id,
        tipo: "site_publicado",
        titulo: "Novo site criado!",
        mensagem: `O site "${form.nome_empresa}" foi criado com sucesso e já está na aba de propostas.`,
        lida: false,
      });

      router.push("/propostas");
    } else {
      setShowOverlay(false);
      setGerandoSite(false);
    }
  }

  useEffect(() => {
    if (form.descricao.length > 20 && !form.nicho) {
      const desc = form.descricao.toLowerCase();
      const match = NICHOS_GRID.find((n) =>
        desc.includes(n.label.toLowerCase()) || desc.includes(n.value)
      );
      if (match) updateForm("nicho", match.value);
    }
  }, [form.descricao, form.nicho]);

  useEffect(() => {
    if (form.nome_empresa.length < 3) {
      setEmpresaEncontrada(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setBuscandoEmpresa(true);
      try {
        const params = new URLSearchParams({
          nome: form.nome_empresa,
          cidade: form.endereco || "Brasil",
        });
        const res = await fetch(`/api/prospeccao/verificar-empresa?${params}`);
        if (res.ok) {
          const data = await res.json();
          setEmpresaEncontrada(data);
          if (data.encontrado) {
            if (data.endereco && !form.endereco) {
              updateForm("endereco", data.endereco);
            }
            if (data.telefone && !form.whatsapp) {
              updateForm("whatsapp", data.telefone);
            }
          }
        }
      } catch {
        setEmpresaEncontrada(null);
      }
      setBuscandoEmpresa(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [form.nome_empresa]);

  return (
    <DashboardLayout title="Criar Site">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div className="flex items-center justify-center gap-0">
          {STEP_CONFIG.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.number;
            const isCompleted = step > s.number;
            return (
              <div key={s.number} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`
                      w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold
                      transition-all duration-500 relative
                      ${isCompleted
                        ? "bg-vms-primaria text-black scale-100"
                        : isActive
                          ? "bg-vms-primaria text-black scale-110 shadow-[0_0_20px_rgba(170,255,0,0.3)]"
                          : "bg-vms-card text-vms-muted border border-vms-borda"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check size={18} strokeWidth={3} />
                    ) : isActive ? (
                      <Icon size={18} />
                    ) : (
                      s.number
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors duration-300 ${
                      isActive || isCompleted ? "text-vms-primaria" : "text-vms-muted"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEP_CONFIG.length - 1 && (
                  <div
                    className={`w-16 sm:w-24 h-px mx-3 mb-6 transition-colors duration-500 ${
                      step > s.number ? "bg-vms-primaria" : "bg-vms-borda"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div
          className={`
            bg-vms-card/80 backdrop-blur-xl border border-white/5 rounded-[14px] p-8
            shadow-[0_8px_32px_rgba(0,0,0,0.4)]
            transition-opacity duration-200
            ${transitioning ? "opacity-0" : "opacity-100"}
          `}
        >
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-vms-texto text-xl font-semibold">
                  Informações do Negócio
                </h2>
                <p className="text-vms-muted text-sm mt-1">
                  Conte-nos sobre a empresa para criar o site perfeito
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-vms-texto-2 text-xs font-medium">
                  Nome da empresa <span className="text-vms-primaria">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Transportadora do Felipe"
                  value={form.nome_empresa}
                  onChange={(e) => updateForm("nome_empresa", e.target.value)}
                  className={`w-full border bg-white/5 rounded-[10px] px-4 py-3 text-sm text-vms-texto
                    placeholder:text-vms-dark-5 outline-none transition-colors
                    ${errors.nome_empresa ? "border-vms-erro" : "border-white/5 focus:border-vms-primaria"}`}
                />
                {errors.nome_empresa && (
                  <span className="text-vms-erro text-xs">{errors.nome_empresa}</span>
                )}

                {buscandoEmpresa && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-vms-blue-bg">
                    <div className="w-3 h-3 border-2 border-vms-blue-light border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-vms-blue-light">Buscando empresa no Google...</span>
                  </div>
                )}

                {empresaEncontrada && !buscandoEmpresa && (
                  <div className={`rounded-[10px] p-3 ${
                    empresaEncontrada.encontrado
                      ? "border border-vms-primaria/20 bg-vms-primaria/5"
                      : "border border-vms-dark-3 bg-vms-dark-1"
                  }`}>
                    {empresaEncontrada.encontrado ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-vms-primaria" />
                          <span className="text-xs font-medium text-vms-primaria">Empresa encontrada!</span>
                          {empresaEncontrada.fonte === "google" && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-vms-blue-bg text-vms-blue-light font-medium">Google</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 text-xs text-vms-texto-2">
                          {empresaEncontrada.endereco && (
                            <div className="flex items-center gap-1.5">
                              <MapPin size={10} className="text-vms-muted shrink-0" />
                              <span className="truncate">{empresaEncontrada.endereco}</span>
                            </div>
                          )}
                          {empresaEncontrada.telefone && (
                            <div className="flex items-center gap-1.5">
                              <Phone size={10} className="text-vms-muted shrink-0" />
                              <span>{empresaEncontrada.telefone}</span>
                            </div>
                          )}
                          {empresaEncontrada.website && (
                            <div className="flex items-center gap-1.5">
                              <Globe size={10} className="text-vms-muted shrink-0" />
                              <span className="truncate text-vms-blue-light">{empresaEncontrada.website}</span>
                            </div>
                          )}
                          {empresaEncontrada.avaliacao && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-yellow-400">★</span>
                              <span>{empresaEncontrada.avaliacao.toFixed(1)} ({empresaEncontrada.total_avaliacoes} avaliações)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle size={14} className="text-vms-muted" />
                        <span className="text-xs text-vms-muted">Empresa não encontrada nos bancos de dados. O site será criado com base na descrição.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-vms-texto-2 text-xs font-medium">
                  Descrição do negócio <span className="text-vms-primaria">*</span>
                </label>
                <div className="relative">
                  <textarea
                    placeholder="Ex: Empresa de logística e transporte de cargas em todo Brasil. Especializada em entregas rápidas e seguras..."
                    value={form.descricao}
                    onChange={(e) => updateForm("descricao", e.target.value)}
                    min-h={120}
                    rows={4}
                    className={`w-full border bg-white/5 rounded-[10px] px-4 py-3 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none transition-colors min-h-[120px] resize-y
                      ${errors.descricao ? "border-vms-erro" : "border-white/5 focus:border-vms-primaria"}`}
                  />
                  <button
                    type="button"
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5
                      bg-vms-primaria/10 border border-vms-primaria/20 rounded-[8px]
                      text-vms-primaria text-xs font-medium hover:bg-vms-primaria/20
                      transition-colors cursor-pointer"
                  >
                    <Sparkles size={12} />
                    Gerar com IA
                  </button>
                </div>
                <p className="text-vms-muted text-xs">
                  Quanto mais detalhes, melhor o site gerado
                </p>
                {errors.descricao && (
                  <span className="text-vms-erro text-xs">{errors.descricao}</span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-vms-texto-2 text-xs font-medium">
                  Objetivo do site <span className="text-vms-primaria">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {OBJETIVOS.map((obj) => (
                    <label
                      key={obj}
                      className={`flex items-center gap-3 px-4 py-3 rounded-[10px] border cursor-pointer
                        transition-all duration-200
                        ${form.objetivo === obj
                          ? "border-vms-primaria/40 bg-vms-primaria/5"
                          : "border-white/5 bg-white/[0.02] hover:border-white/10"
                        }`}
                    >
                      <input
                        type="radio"
                        name="objetivo"
                        value={obj}
                        checked={form.objetivo === obj}
                        onChange={() => updateForm("objetivo", obj)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                          transition-colors duration-200 shrink-0
                          ${form.objetivo === obj
                            ? "border-vms-primaria"
                            : "border-vms-muted/40"
                          }`}
                      >
                        {form.objetivo === obj && (
                          <div className="w-2 h-2 rounded-full bg-vms-primaria" />
                        )}
                      </div>
                      <span
                        className={`text-sm transition-colors ${
                          form.objetivo === obj ? "text-vms-texto font-medium" : "text-vms-texto-2"
                        }`}
                      >
                        {obj}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.objetivo && (
                  <span className="text-vms-erro text-xs">{errors.objetivo}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5">
                  <Globe size={14} />
                  Idioma do site
                </label>
                <select
                  value={form.idioma}
                  onChange={(e) => updateForm("idioma", e.target.value)}
                  className="w-full border bg-white/5 rounded-[10px] px-4 py-3 text-sm text-vms-texto
                    outline-none transition-colors appearance-none cursor-pointer
                    border-white/5 focus:border-vms-primaria"
                >
                  {IDIOMAS.map((idioma) => (
                    <option key={idioma.value} value={idioma.value}>
                      {idioma.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-vms-texto-2 text-xs font-medium">
                    Já tenho um logotipo
                  </label>
                  <button
                    type="button"
                    onClick={() => updateForm("tem_logo", !form.tem_logo)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer
                      ${form.tem_logo ? "bg-vms-primaria" : "bg-vms-dark-3"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md
                        transition-transform duration-300
                        ${form.tem_logo ? "translate-x-5.5" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>
                {!form.tem_logo ? (
                  <p className="text-vms-muted text-xs">
                    Logo será criado pela IA
                  </p>
                ) : (
                  <div
                    className="border-2 border-dashed border-white/10 rounded-[10px] p-6
                      flex flex-col items-center justify-center gap-3 hover:border-vms-primaria/30
                      transition-colors cursor-pointer"
                    onClick={() => document.getElementById("logo-upload")?.click()}
                  >
                    {logoPreview ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-20 h-20 object-contain rounded-[8px]"
                        />
                        <span className="text-vms-texto-2 text-xs">Clique para trocar</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="text-vms-muted" />
                        <span className="text-vms-muted text-sm">
                          Clique para enviar o logo
                        </span>
                        <span className="text-vms-dark-5 text-xs">
                          PNG, JPG ou SVG
                        </span>
                      </>
                    )}
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-vms-texto-2 text-xs font-medium">
                  Nicho
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {NICHOS_GRID.map((n) => (
                    <button
                      key={n.value}
                      type="button"
                      onClick={() => updateForm("nicho", n.value)}
                      className={`px-3 py-2.5 rounded-[10px] border text-xs font-medium
                        transition-all duration-200 cursor-pointer text-center
                        ${form.nicho === n.value
                          ? "border-vms-primaria/40 bg-vms-primaria/10 text-vms-primaria"
                          : "border-white/5 bg-white/[0.02] text-vms-texto-2 hover:border-white/10"
                        }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-vms-texto text-xl font-semibold">
                  Cores e Localização
                </h2>
                <p className="text-vms-muted text-sm mt-1">
                  Escolha as cores e forneça o endereço para buscar avaliações
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={gerarCoresIA}
                  disabled={gerandoCores}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4
                    rounded-[10px] font-semibold text-sm transition-all duration-300 cursor-pointer
                    ${gerandoCores
                      ? "bg-vms-primaria/20 text-vms-primaria/60"
                      : "bg-vms-primaria text-black hover:brightness-110 hover:shadow-[0_0_24px_rgba(170,255,0,0.2)]"
                    }`}
                >
                  <Sparkles size={18} className={gerandoCores ? "animate-spin" : ""} />
                  {gerandoCores ? "Gerando cores ideais..." : "Gerar Cores com I.A."}
                </button>
                <p className="text-vms-muted text-xs text-center">
                  A IA vai sugerir cores ideais com base no segmento do seu negócio
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-vms-dark-5 text-xs">ou escolha manualmente</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-vms-texto-2 text-xs font-medium">
                    Cor Primária
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.cor_primaria}
                      onChange={(e) => updateForm("cor_primaria", e.target.value)}
                      className="w-10 h-10 rounded-[8px] border border-white/10 cursor-pointer
                        bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={form.cor_primaria}
                      onChange={(e) => updateForm("cor_primaria", e.target.value)}
                      className="flex-1 border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto
                        font-mono outline-none transition-colors border-white/5 focus:border-vms-primaria"
                    />
                  </div>
                  <p className="text-vms-muted text-[11px]">
                    A cor principal do site — usada em botões, títulos e destaques
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-vms-texto-2 text-xs font-medium">
                    Cor Secundária
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.cor_secundaria}
                      onChange={(e) => updateForm("cor_secundaria", e.target.value)}
                      className="w-10 h-10 rounded-[8px] border border-white/10 cursor-pointer
                        bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={form.cor_secundaria}
                      onChange={(e) => updateForm("cor_secundaria", e.target.value)}
                      className="flex-1 border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto
                        font-mono outline-none transition-colors border-white/5 focus:border-vms-primaria"
                    />
                  </div>
                  <p className="text-vms-muted text-[11px]">
                    Complementa a primária — usada em fundos, bordas e detalhes
                  </p>
                </div>
              </div>

              <div className="flex rounded-[10px] overflow-hidden border border-white/5 h-10">
                <div
                  className="flex-1 flex items-center justify-center text-xs font-semibold"
                  style={{ backgroundColor: form.cor_primaria, color: "#000" }}
                >
                  Primária
                </div>
                <div
                  className="flex-1 flex items-center justify-center text-xs font-semibold text-white"
                  style={{ backgroundColor: form.cor_secundaria }}
                >
                  Secundária
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5">
                  <span>🌓</span> Tema do site
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateForm("tema", "claro")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-[10px] border-2
                      transition-all duration-200 cursor-pointer
                      ${form.tema === "claro"
                        ? "border-vms-primaria shadow-[0_0_12px_rgba(170,255,0,0.15)]"
                        : "border-white/5 hover:border-white/10"
                      }`}
                  >
                    <div className="w-full h-12 bg-white rounded-[8px] flex items-center justify-center">
                      <span className="text-black font-bold text-lg">Aa</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sun size={14} className="text-vms-texto-2" />
                      <span className={`text-sm font-medium ${
                        form.tema === "claro" ? "text-vms-primaria" : "text-vms-texto-2"
                      }`}>
                        Claro
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateForm("tema", "escuro")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-[10px] border-2
                      transition-all duration-200 cursor-pointer
                      ${form.tema === "escuro"
                        ? "border-vms-primaria shadow-[0_0_12px_rgba(170,255,0,0.15)]"
                        : "border-white/5 hover:border-white/10"
                      }`}
                  >
                    <div className="w-full h-12 bg-[#111] rounded-[8px] flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Aa</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Moon size={14} className="text-vms-texto-2" />
                      <span className={`text-sm font-medium ${
                        form.tema === "escuro" ? "text-vms-primaria" : "text-vms-texto-2"
                      }`}>
                        Escuro
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-vms-texto-2 text-xs font-medium">
                  Endereço da empresa
                </label>
                <input
                  type="text"
                  placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP"
                  value={form.endereco}
                  onChange={(e) => updateForm("endereco", e.target.value)}
                  disabled={form.sem_endereco}
                  className={`w-full border bg-white/5 rounded-[10px] px-4 py-3 text-sm text-vms-texto
                    placeholder:text-vms-dark-5 outline-none transition-colors
                    border-white/5 focus:border-vms-primaria
                    ${form.sem_endereco ? "opacity-40 cursor-not-allowed" : ""}`}
                />
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={form.sem_endereco}
                    onChange={(e) => updateForm("sem_endereco", e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 accent-vms-primaria cursor-pointer"
                  />
                  <span className="text-vms-muted text-xs">
                    Não tenho endereço fixo / empresa online
                  </span>
                </label>
                <p className="text-vms-muted text-xs flex items-center gap-1">
                  <MapPin size={12} />
                  Buscaremos avaliações, fotos e dados do Google automaticamente
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5">
                  <span>📱</span> Redes Sociais
                </label>

                <div className="flex flex-col gap-1.5">
                  <div className="relative">
                    <Camera size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                    <input
                      type="text"
                      placeholder="@seunegocio ou link do perfil"
                      value={form.instagram}
                      onChange={(e) => updateForm("instagram", e.target.value)}
                      className="w-full border bg-white/5 rounded-[10px] pl-10 pr-4 py-3 text-sm text-vms-texto
                        placeholder:text-vms-dark-5 outline-none transition-colors
                        border-white/5 focus:border-vms-primaria"
                    />
                  </div>
                  <p className="text-vms-muted text-[11px]">
                    Buscaremos os últimos posts para criar uma galeria no site
                  </p>
                </div>

                <div className="relative">
                  <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                  <input
                    type="text"
                    placeholder="facebook.com/seunegocio"
                    value={form.facebook}
                    onChange={(e) => updateForm("facebook", e.target.value)}
                    className="w-full border bg-white/5 rounded-[10px] pl-10 pr-4 py-3 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none transition-colors
                      border-white/5 focus:border-vms-primaria"
                  />
                </div>

                <div className="relative">
                  <MessageCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                  <input
                    type="text"
                    placeholder="(11) 91234-5678"
                    value={form.whatsapp}
                    onChange={(e) => updateForm("whatsapp", e.target.value)}
                    className="w-full border bg-white/5 rounded-[10px] pl-10 pr-4 py-3 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none transition-colors
                      border-white/5 focus:border-vms-primaria"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-vms-texto text-xl font-semibold">
                  Pronto para criar!
                </h2>
                <p className="text-vms-muted text-sm mt-1">
                  Revise as informações e gere seu site
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <ReviewCard
                  icon={<Building2 size={16} />}
                  title="Informações do Negócio"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-vms-muted text-xs">Empresa</span>
                      <span className="text-vms-texto text-xs font-medium">{form.nome_empresa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-vms-muted text-xs">Descrição</span>
                      <span className="text-vms-texto text-xs font-medium max-w-[200px] truncate">
                        {form.descricao}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-vms-muted text-xs">Objetivo</span>
                      <span className="text-vms-texto text-xs font-medium">{form.objetivo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-vms-muted text-xs">Idioma</span>
                      <span className="text-vms-texto text-xs font-medium">
                        {IDIOMAS.find((i) => i.value === form.idioma)?.label}
                      </span>
                    </div>
                  </div>
                </ReviewCard>

                <ReviewCard
                  icon={<Palette size={16} />}
                  title="Cores e Tema"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full border border-white/10"
                          style={{ backgroundColor: form.cor_primaria }}
                        />
                        <span className="text-vms-texto text-xs font-mono">{form.cor_primaria}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full border border-white/10"
                          style={{ backgroundColor: form.cor_secundaria }}
                        />
                        <span className="text-vms-texto text-xs font-mono">{form.cor_secundaria}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-vms-muted text-xs">Tema</span>
                      <span className="text-vms-texto text-xs font-medium capitalize">
                        {form.tema === "claro" ? "☀️ Claro" : "🌙 Escuro"}
                      </span>
                    </div>
                  </div>
                </ReviewCard>

                <ReviewCard
                  icon={<ImageIcon size={16} />}
                  title="Logo"
                >
                  <span className="text-vms-texto-2 text-xs">
                    {form.tem_logo
                      ? logoPreview
                        ? "Logo enviado ✓"
                        : "Logo será enviado"
                      : "Será gerado pela IA ✨"}
                  </span>
                </ReviewCard>

                <ReviewCard
                  icon={<MapPinIcon size={16} />}
                  title="Localização"
                >
                  <span className="text-vms-texto-2 text-xs">
                    {form.sem_endereco
                      ? "Sem endereço fixo / empresa online"
                      : form.endereco || "Não informado"}
                  </span>
                </ReviewCard>

                <ReviewCard
                  icon={<Share2 size={16} />}
                  title="Redes Sociais"
                >
                  <div className="flex flex-col gap-1.5">
                    {form.instagram && (
                      <div className="flex items-center gap-2">
                        <Camera size={12} className="text-vms-muted" />
                        <span className="text-vms-texto-2 text-xs">{form.instagram}</span>
                      </div>
                    )}
                    {form.facebook && (
                      <div className="flex items-center gap-2">
                        <Link2 size={12} className="text-vms-muted" />
                        <span className="text-vms-texto-2 text-xs">{form.facebook}</span>
                      </div>
                    )}
                    {form.whatsapp && (
                      <div className="flex items-center gap-2">
                        <MessageCircle size={12} className="text-vms-muted" />
                        <span className="text-vms-texto-2 text-xs">{form.whatsapp}</span>
                      </div>
                    )}
                    {!form.instagram && !form.facebook && !form.whatsapp && (
                      <span className="text-vms-muted text-xs">Nenhuma rede social informada</span>
                    )}
                  </div>
                </ReviewCard>
              </div>

              <button
                type="button"
                onClick={handleCriarSite}
                disabled={gerandoSite}
                className="w-full flex items-center justify-center gap-2 px-6 py-4
                  bg-vms-primaria text-black font-semibold rounded-[10px] text-base
                  hover:brightness-110 hover:shadow-[0_0_32px_rgba(170,255,0,0.25)]
                  transition-all duration-300 cursor-pointer
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Sparkles size={20} />
                Gerar Site com IA
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-[10px]
              bg-vms-card text-vms-texto-2 text-sm font-medium
              hover:bg-vms-dark-3 transition-colors cursor-pointer
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          {step < 3 && (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-[10px]
                bg-vms-primaria text-black text-sm font-semibold
                hover:brightness-110 transition-all cursor-pointer"
            >
              Próximo
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {showOverlay && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center
          bg-vms-fundo/95 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-6 max-w-sm text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-vms-primaria/10 flex items-center justify-center">
                <Sparkles size={28} className="text-vms-primaria animate-pulse" />
              </div>
              <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-vms-primaria/30 animate-ping" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-vms-texto text-lg font-semibold">
                Gerando seu site
              </h3>
              <p className="text-vms-primaria text-sm animate-pulse">
                {progressMsg}
              </p>
            </div>
            <div className="w-full h-1 bg-vms-card rounded-full overflow-hidden">
              <div
                className="h-full bg-vms-primaria rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: progressMsg === PROGRESS_MESSAGES[0]
                    ? "15%"
                    : progressMsg === PROGRESS_MESSAGES[1]
                      ? "40%"
                      : progressMsg === PROGRESS_MESSAGES[2]
                        ? "70%"
                        : "95%",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function ReviewCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 p-4 rounded-[10px] border border-white/5 bg-white/[0.02]">
      <div className="w-8 h-8 rounded-[8px] bg-vms-primaria/10 flex items-center justify-center
        text-vms-primaria shrink-0">
        {icon}
      </div>
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <span className="text-vms-texto text-xs font-semibold">{title}</span>
        {children}
      </div>
    </div>
  );
}
