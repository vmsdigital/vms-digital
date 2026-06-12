"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
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
  Phone,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BrandBookPreview } from "@/components/ui/BrandBookPreview";
import { createClient } from "@/lib/supabase/client";
import { NICHOS } from "@/lib/constants";
import { podeCriarSite } from "@/lib/plan-limits";

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

const FONTES_DISPONIVEIS = [
  { value: "Inter", label: "Inter" },
  { value: "Poppins", label: "Poppins" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Roboto", label: "Roboto" },
  { value: "Space Grotesk", label: "Space Grotesk" },
  { value: "Sora", label: "Sora" },
  { value: "Outfit", label: "Outfit" },
  { value: "DM Sans", label: "DM Sans" },
];

const PROGRESS_MESSAGES = [
  "🔍 Analisando seu nicho e mercado...",
  "🎨 Gerando paleta de cores profissional...",
  "✍️ Criando textos persuasivos com IA...",
  "🏗️ Montando estrutura do site...",
  "✨ Finalizando com detalhes premium...",
];

const QUESTIONS = [
  { id: 0, text: "Qual o nome da empresa?", icon: Building2 },
  { id: 1, text: "Qual o segmento da empresa?", icon: Rocket },
  { id: 2, text: "Me conte sobre o negócio", icon: Sparkles },
  { id: 3, text: "Qual o objetivo do site?", icon: Globe },
  { id: 4, text: "Qual o idioma?", icon: Globe },
  { id: 5, text: "Como é a identidade visual?", icon: Palette },
  { id: 6, text: "Onde fica e como contatar?", icon: MapPin },
  { id: 7, text: "Pronto para criar!", icon: Rocket },
];

interface BrandIdentity {
  tem_identidade: boolean;
  cores: {
    primaria: string;
    secundaria: string;
    acento: string;
    fundo: string;
    texto: string;
  };
  fontes: {
    titulo: string;
    corpo: string;
  };
  estilo: string;
  personalidade: string;
  logo_descricao: string;
}

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
  website_url: string;
  modo_identidade: "auto" | "manual" | "nenhuma";
  favicon_url: string;
  logo_url: string;
  fonte_principal: string;
  x_twitter: string;
  youtube: string;
  cliente_id: string | null;
}

const initialForm: FormData = {
  nome_empresa: "",
  descricao: "",
  objetivo: "",
  idioma: "pt-BR",
  tem_logo: false,
  logo_file: null,
  nicho: "",
  cor_primaria: "#667eea",
  cor_secundaria: "#764ba2",
  tema: "escuro",
  endereco: "",
  sem_endereco: false,
  instagram: "",
  facebook: "",
  whatsapp: "",
  website_url: "",
  modo_identidade: "auto",
  favicon_url: "",
  logo_url: "",
  fonte_principal: "Inter",
  x_twitter: "",
  youtube: "",
  cliente_id: null,
};

export default function CriarSitePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-2 border-vms-primaria border-t-transparent rounded-full animate-spin" /></div>}>
      <CriarSiteContent />
    </Suspense>
  );
}

function TypewriterText({ text, speed = 35 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && (
        <span className="inline-block w-0.5 h-[1em] bg-vms-primaria ml-0.5 animate-pulse align-text-bottom" />
      )}
    </span>
  );
}

function CriarSiteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
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
  const [brandIdentity, setBrandIdentity] = useState<BrandIdentity | null>(null);
  const [gerandoDescricao, setGerandoDescricao] = useState(false);
  const [clientesList, setClientesList] = useState<Array<{ id: string; nome: string; whatsapp: string; email: string | null }>>([]);
  const [buscandoClientes, setBuscandoClientes] = useState(false);
  const [clienteSearchTerm, setClienteSearchTerm] = useState("");

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

  async function handleGerarDescricao() {
    if (!form.nome_empresa.trim() || !form.nicho) return;
    setGerandoDescricao(true);
    try {
      const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        const nichoLabel = NICHOS.find((n) => n.value === form.nicho)?.label || form.nicho;
        updateForm("descricao", `${form.nome_empresa} é uma empresa de ${nichoLabel.toLowerCase()} comprometida com excelência e qualidade no atendimento. Oferecemos soluções completas para nossos clientes, com foco em resultados e satisfação.`);
        return;
      }
      const nichoLabel = NICHOS.find((n) => n.value === form.nicho)?.label || form.nicho;
      const prompt = `Crie uma descrição profissional curta (2-3 frases) para a empresa "${form.nome_empresa}" do nicho ${nichoLabel}. A descrição deve ser persuasiva, destacar diferenciais e ser adequada para um site. Retorne APENAS o texto da descrição, sem aspas ou explicações.`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) updateForm("descricao", text);
      }
    } catch {
      const nichoLabel = NICHOS.find((n) => n.value === form.nicho)?.label || form.nicho;
      updateForm("descricao", `${form.nome_empresa} é uma empresa de ${nichoLabel.toLowerCase()} comprometida com excelência e qualidade no atendimento. Oferecemos soluções completas para nossos clientes, com foco em resultados e satisfação.`);
    } finally {
      setGerandoDescricao(false);
    }
  }

  async function buscarClientes(termo: string) {
    if (!termo.trim()) {
      setClientesList([]);
      return;
    }
    setBuscandoClientes(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("clientes")
        .select("id, nome, whatsapp, email")
        .eq("criador_id", user.id)
        .ilike("nome", `%${termo}%`)
        .order("nome", { ascending: true })
        .limit(10);

      setClientesList(data || []);
    } catch {
      setClientesList([]);
    } finally {
      setBuscandoClientes(false);
    }
  }

  function selecionarCliente(cliente: { id: string; nome: string; whatsapp: string; email: string | null }) {
    updateForm("cliente_id", cliente.id);
    setClienteSearchTerm(cliente.nome);
    setClientesList([]);
    if (!form.whatsapp && cliente.whatsapp) {
      updateForm("whatsapp", cliente.whatsapp);
    }
  }

  function validateQuestion(q: number): boolean {
    const newErrors: Record<string, string> = {};

    if (q === 0) {
      if (!form.nome_empresa.trim()) newErrors.nome_empresa = "Nome da empresa é obrigatório";
    }
    if (q === 1) {
      if (!form.nicho) newErrors.nicho = "Selecione um segmento";
    }
    if (q === 2) {
      if (!form.descricao.trim()) newErrors.descricao = "Descrição é obrigatória";
    }
    if (q === 3) {
      if (!form.objetivo) newErrors.objetivo = "Selecione um objetivo";
    }
    if (q === 5) {
      if (!form.cor_primaria) newErrors.cor_primaria = "Cor primária é obrigatória";
      if (!form.cor_secundaria) newErrors.cor_secundaria = "Cor secundária é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function goToQuestion(nextQ: number) {
    if (isAnimating) return;
    setDirection(nextQ > currentQuestion ? "forward" : "backward");
    setIsAnimating(true);
    setAnimationKey((prev) => prev + 1);
    setTimeout(() => {
      setCurrentQuestion(nextQ);
      setIsAnimating(false);
    }, 400);
  }

  function goNext() {
    if (!validateQuestion(currentQuestion)) return;
    if (currentQuestion < QUESTIONS.length - 1) {
      goToQuestion(currentQuestion + 1);
    }
  }

  function goBack() {
    if (currentQuestion > 0) {
      goToQuestion(currentQuestion - 1);
    }
  }

  const gerarCoresIA = useCallback(async () => {
    setGerandoCores(true);

    try {
      const res = await fetch("/api/identidade-visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_empresa: form.nome_empresa,
          nicho: form.nicho || "outro",
          descricao: form.descricao,
          website_url: form.website_url || undefined,
          instagram_url: form.instagram || undefined,
          modo: form.website_url ? "detectar" : "gerar",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.cores) {
          updateForm("cor_primaria", data.cores.primaria);
          updateForm("cor_secundaria", data.cores.secundaria);
          setBrandIdentity(data);
        }
      }
    } catch {
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
        outro: { primaria: "#667eea", secundaria: "#764ba2" },
      };
      const nicho = form.nicho || "outro";
      const cores = coresPorNicho[nicho] || coresPorNicho.outro;
      updateForm("cor_primaria", cores.primaria);
      updateForm("cor_secundaria", cores.secundaria);
    }

    setGerandoCores(false);
  }, [form]);

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
    if (!podeCriarSite(plano as "gratuito" | "starter" | "pro" | "admin", count ?? 0)) {
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
          favicon: form.favicon_url || undefined,
          logo: form.logo_url || undefined,
          fonte: form.fonte_principal || undefined,
          x_twitter: form.x_twitter || undefined,
          youtube: form.youtube || undefined,
          cliente_id: form.cliente_id || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        htmlGerado = data.html || "";
        if (data.palette) {
          updateForm("cor_primaria", data.palette.cor_primaria);
          updateForm("cor_secundaria", data.palette.cor_secundaria);
        }
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
      slug: `${slug}.startzy.com.br`,
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
        website_url: form.website_url,
        modo_identidade: form.modo_identidade,
        identidade_visual: brandIdentity,
        html_gerado: htmlGerado,
        favicon: form.favicon_url || null,
        logo: form.logo_url || null,
        fonte: form.fonte_principal,
        redes_sociais: {
          instagram: form.instagram || null,
          facebook: form.facebook || null,
          x_twitter: form.x_twitter || null,
          youtube: form.youtube || null,
          whatsapp: form.whatsapp || null,
        },
        cliente_id: form.cliente_id,
      },
    }).select().single();

    if (!error && siteData) {
      await supabase.from("propostas").insert({
        criador_id: user.id,
        site_id: siteData.id,
        cliente_id: form.cliente_id || null,
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
    if (form.nicho && !form.objetivo) {
      const nichoToObjetivo: Record<string, string> = {
        provedor: "Divulgar serviços",
        advocacia: "Captar clientes/leads",
        academia: "Captar clientes/leads",
        clinica: "Captar clientes/leads",
        dentista: "Captar clientes/leads",
        restaurante: "Divulgar serviços",
        padaria: "Divulgar produtos",
        bar: "Divulgar eventos",
        salao: "Captar clientes/leads",
        beleza: "Captar clientes/leads",
        loja: "Divulgar produtos",
        imobiliaria: "Captar clientes/leads",
        autopecas: "Divulgar produtos",
        concessionaria: "Divulgar produtos",
        petshop: "Divulgar produtos",
        construcao: "Divulgar produtos",
        farmacia: "Divulgar produtos",
        supermercado: "Divulgar produtos",
        hotel: "Divulgar serviços",
        banco: "Site institucional",
        seguro: "Captar clientes/leads",
        escola: "Site institucional",
        coworking: "Divulgar serviços",
        cafe: "Divulgar serviços",
        barbearia: "Captar clientes/leads",
        estetica: "Captar clientes/leads",
        contabilidade: "Captar clientes/leads",
        mecanico: "Divulgar serviços",
        pizzaria: "Divulgar serviços",
        fisioterapia: "Captar clientes/leads",
        psicologo: "Captar clientes/leads",
        veterinario: "Divulgar serviços",
        arquitetura: "Mostrar portfólio",
        consultoria: "Captar clientes/leads",
        marketing: "Mostrar portfólio",
        fotografia: "Mostrar portfólio",
        optica: "Divulgar produtos",
        eletronicos: "Divulgar produtos",
        moveis: "Divulgar produtos",
      };
      const objetivo = nichoToObjetivo[form.nicho];
      if (objetivo) updateForm("objetivo", objetivo);
    }
  }, [form.nicho]);

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

  const slideIn = direction === "forward"
    ? "animate-[slideInRight_0.4s_ease-out_forwards]"
    : "animate-[slideInLeft_0.4s_ease-out_forwards]";

  const slideOut = direction === "forward"
    ? "animate-[slideOutLeft_0.4s_ease-in_forwards]"
    : "animate-[slideOutRight_0.4s_ease-in_forwards]";

  const bgGlow = form.tema === "escuro"
    ? `radial-gradient(ellipse at 50% 0%, ${form.cor_primaria}08 0%, transparent 60%)`
    : `radial-gradient(ellipse at 50% 0%, ${form.cor_primaria}12 0%, transparent 60%)`;

  function renderQuestion() {
    switch (currentQuestion) {
      case 0:
        return (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                placeholder="Ex: Transportadora do Felipe"
                value={form.nome_empresa}
                onChange={(e) => updateForm("nome_empresa", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && goNext()}
                autoFocus
                className={`w-full border bg-white/5 rounded-[14px] px-5 py-4 text-lg text-vms-texto
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
          </div>
        );

      case 1:
        return (
          <div className="flex flex-col gap-4">
            {errors.nicho && (
              <span className="text-vms-erro text-xs">{errors.nicho}</span>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {NICHOS_GRID.map((n) => (
                <button
                  key={n.value}
                  type="button"
                  onClick={() => {
                    updateForm("nicho", n.value);
                    setTimeout(() => {
                      if (validateQuestion(1)) goToQuestion(2);
                    }, 300);
                  }}
                  className={`px-3 py-3 rounded-[10px] border text-sm font-medium
                    transition-all duration-200 cursor-pointer text-center
                    ${form.nicho === n.value
                      ? "border-vms-primaria/40 bg-vms-primaria/10 text-vms-primaria shadow-[0_0_16px_rgba(170,255,0,0.1)]"
                      : "border-white/5 bg-white/[0.02] text-vms-texto-2 hover:border-white/10"
                    }`}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-4">
            <div className="relative">
              <textarea
                placeholder="Ex: Empresa de logística e transporte de cargas em todo Brasil. Especializada em entregas rápidas e seguras..."
                value={form.descricao}
                onChange={(e) => updateForm("descricao", e.target.value)}
                rows={5}
                autoFocus
                className={`w-full border bg-white/5 rounded-[14px] px-5 py-4 text-base text-vms-texto
                  placeholder:text-vms-dark-5 outline-none transition-colors min-h-[140px] resize-y
                  ${errors.descricao ? "border-vms-erro" : "border-white/5 focus:border-vms-primaria"}`}
              />
              <button
                type="button"
                onClick={handleGerarDescricao}
                disabled={gerandoDescricao || !form.nome_empresa.trim() || !form.nicho}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5
                  bg-vms-primaria/10 border border-vms-primaria/20 rounded-[8px]
                  text-vms-primaria text-xs font-medium hover:bg-vms-primaria/20
                  transition-colors cursor-pointer
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles size={12} className={gerandoDescricao ? "animate-spin" : ""} />
                {gerandoDescricao ? "Gerando..." : "Gerar com IA"}
              </button>
            </div>
            <p className="text-vms-muted text-xs">
              Quanto mais detalhes, melhor o site gerado
            </p>
            {errors.descricao && (
              <span className="text-vms-erro text-xs">{errors.descricao}</span>
            )}
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col gap-3">
            {errors.objetivo && (
              <span className="text-vms-erro text-xs">{errors.objetivo}</span>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {OBJETIVOS.map((obj) => (
                <label
                  key={obj}
                  className={`flex items-center gap-3 px-5 py-4 rounded-[12px] border cursor-pointer
                    transition-all duration-200
                    ${form.objetivo === obj
                      ? "border-vms-primaria/40 bg-vms-primaria/5 shadow-[0_0_16px_rgba(170,255,0,0.08)]"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10"
                    }`}
                >
                  <input
                    type="radio"
                    name="objetivo"
                    value={obj}
                    checked={form.objetivo === obj}
                    onChange={() => {
                      updateForm("objetivo", obj);
                      setTimeout(() => goToQuestion(4), 300);
                    }}
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
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {IDIOMAS.map((idioma) => (
                <button
                  key={idioma.value}
                  type="button"
                  onClick={() => {
                    updateForm("idioma", idioma.value);
                    setTimeout(() => goToQuestion(5), 300);
                  }}
                  className={`px-5 py-4 rounded-[12px] border text-base font-medium
                    transition-all duration-200 cursor-pointer text-center
                    ${form.idioma === idioma.value
                      ? "border-vms-primaria/40 bg-vms-primaria/5 text-vms-primaria shadow-[0_0_16px_rgba(170,255,0,0.08)]"
                      : "border-white/5 bg-white/[0.02] text-vms-texto-2 hover:border-white/10"
                    }`}
                >
                  {idioma.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => updateForm("modo_identidade", "auto")}
                className={`flex flex-col items-center gap-3 p-4 rounded-[12px] border-2
                  transition-all duration-200 cursor-pointer text-center
                  ${form.modo_identidade === "auto"
                    ? "border-vms-primaria/50 bg-vms-primaria/5 shadow-[0_0_20px_rgba(170,255,0,0.1)]"
                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${form.modo_identidade === "auto" ? "bg-vms-primaria/20" : "bg-white/5"}`}>
                  <Sparkles size={18} className={form.modo_identidade === "auto" ? "text-vms-primaria" : "text-vms-muted"} />
                </div>
                <div>
                  <p className={`text-xs font-semibold ${form.modo_identidade === "auto" ? "text-vms-primaria" : "text-vms-texto"}`}>
                    Detectar Automático
                  </p>
                  <p className="text-vms-muted text-[10px] mt-0.5">
                    IA detecta cores do site/Instagram
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => updateForm("modo_identidade", "manual")}
                className={`flex flex-col items-center gap-3 p-4 rounded-[12px] border-2
                  transition-all duration-200 cursor-pointer text-center
                  ${form.modo_identidade === "manual"
                    ? "border-vms-primaria/50 bg-vms-primaria/5 shadow-[0_0_20px_rgba(170,255,0,0.1)]"
                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${form.modo_identidade === "manual" ? "bg-vms-primaria/20" : "bg-white/5"}`}>
                  <Palette size={18} className={form.modo_identidade === "manual" ? "text-vms-primaria" : "text-vms-muted"} />
                </div>
                <div>
                  <p className={`text-xs font-semibold ${form.modo_identidade === "manual" ? "text-vms-primaria" : "text-vms-texto"}`}>
                    Tenho BrandBook
                  </p>
                  <p className="text-vms-muted text-[10px] mt-0.5">
                    Inserir cores manualmente
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => updateForm("modo_identidade", "nenhuma")}
                className={`flex flex-col items-center gap-3 p-4 rounded-[12px] border-2
                  transition-all duration-200 cursor-pointer text-center
                  ${form.modo_identidade === "nenhuma"
                    ? "border-vms-primaria/50 bg-vms-primaria/5 shadow-[0_0_20px_rgba(170,255,0,0.1)]"
                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${form.modo_identidade === "nenhuma" ? "bg-vms-primaria/20" : "bg-white/5"}`}>
                  <Rocket size={18} className={form.modo_identidade === "nenhuma" ? "text-vms-primaria" : "text-vms-muted"} />
                </div>
                <div>
                  <p className={`text-xs font-semibold ${form.modo_identidade === "nenhuma" ? "text-vms-primaria" : "text-vms-texto"}`}>
                    Criar do Zero
                  </p>
                  <p className="text-vms-muted text-[10px] mt-0.5">
                    IA cria identidade profissional
                  </p>
                </div>
              </button>
            </div>

            {form.modo_identidade === "auto" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5">
                    <Globe size={14} />
                    URL do site atual (para detectar identidade)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.seusite.com.br"
                    value={form.website_url}
                    onChange={(e) => updateForm("website_url", e.target.value)}
                    className="w-full border bg-white/5 rounded-[10px] px-4 py-3 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none transition-colors
                      border-white/5 focus:border-vms-primaria"
                  />
                  <p className="text-vms-muted text-[11px]">
                    Vamos analisar as cores e fontes do seu site atual
                  </p>
                </div>

                <button
                  type="button"
                  onClick={gerarCoresIA}
                  disabled={gerandoCores || !form.website_url}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3
                    rounded-[10px] font-semibold text-sm transition-all duration-300 cursor-pointer
                    ${gerandoCores || !form.website_url
                      ? "bg-vms-primaria/20 text-vms-primaria/60 cursor-not-allowed"
                      : "bg-vms-primaria text-black hover:brightness-110 hover:shadow-[0_0_24px_rgba(170,255,0,0.2)]"
                    }`}
                >
                  <Sparkles size={18} className={gerandoCores ? "animate-spin" : ""} />
                  {gerandoCores ? "Detectando identidade..." : "Detectar Identidade Visual"}
                </button>
              </div>
            )}

            {form.modo_identidade === "nenhuma" && (
              <div className="flex flex-col gap-4">
                <div className="rounded-[10px] border border-vms-primaria/10 bg-vms-primaria/5 p-4">
                  <p className="text-vms-texto-2 text-xs">
                    ✨ A IA vai criar uma identidade visual completa e profissional para o seu negócio, incluindo paleta de cores, tipografia e conceito de logo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={gerarCoresIA}
                  disabled={gerandoCores}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3
                    rounded-[10px] font-semibold text-sm transition-all duration-300 cursor-pointer
                    ${gerandoCores
                      ? "bg-vms-primaria/20 text-vms-primaria/60 cursor-not-allowed"
                      : "bg-vms-primaria text-black hover:brightness-110 hover:shadow-[0_0_24px_rgba(170,255,0,0.2)]"
                    }`}
                >
                  <Sparkles size={18} className={gerandoCores ? "animate-spin" : ""} />
                  {gerandoCores ? "Criando identidade..." : "Gerar Identidade com IA"}
                </button>
              </div>
            )}

            {form.modo_identidade === "manual" && (
              <div className="rounded-[10px] border border-vms-blue-light/10 bg-vms-blue-bg/30 p-4">
                <p className="text-vms-texto-2 text-xs">
                  🎨 Insira as cores e fontes do seu brandbook. O site será gerado respeitando fielmente sua identidade visual.
                </p>
              </div>
            )}

            <BrandBookPreview brand={brandIdentity} nomeEmpresa={form.nome_empresa} loading={gerandoCores} />

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
                {errors.cor_primaria && (
                  <span className="text-vms-erro text-xs">{errors.cor_primaria}</span>
                )}
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
                {errors.cor_secundaria && (
                  <span className="text-vms-erro text-xs">{errors.cor_secundaria}</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-vms-texto-2 text-xs font-medium">
                Preview da Paleta
              </label>
              <div className="rounded-[10px] overflow-hidden border border-white/5">
                <div
                  className="h-8 flex items-center justify-center text-xs font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${form.cor_primaria} 0%, ${form.cor_secundaria} 100%)`,
                    color: "#fff",
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)"
                  }}
                >
                  Gradiente Principal
                </div>
                <div className="flex h-6">
                  <div
                    className="flex-1 flex items-center justify-center text-[10px] font-semibold"
                    style={{ backgroundColor: form.cor_primaria, color: "#000" }}
                  >
                    {form.cor_primaria}
                  </div>
                  <div
                    className="flex-1 flex items-center justify-center text-[10px] font-semibold text-white"
                    style={{ backgroundColor: form.cor_secundaria }}
                  >
                    {form.cor_secundaria}
                  </div>
                </div>
                <div className="flex h-4">
                  <div className="flex-1" style={{ backgroundColor: form.cor_primaria + "20" }} />
                  <div className="flex-1" style={{ backgroundColor: form.cor_secundaria + "20" }} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5">
                <span>🔤</span> Fonte principal (preview)
              </label>
              <select
                value={form.fonte_principal}
                onChange={(e) => updateForm("fonte_principal", e.target.value)}
                className="w-full border bg-white/5 rounded-[10px] px-4 py-2.5 text-sm text-vms-texto
                  outline-none transition-colors cursor-pointer
                  border-white/5 focus:border-vms-primaria appearance-none"
                style={{ fontFamily: form.fonte_principal }}
              >
                {FONTES_DISPONIVEIS.map((fonte) => (
                  <option key={fonte.value} value={fonte.value} style={{ fontFamily: fonte.value }}>
                    {fonte.label}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {FONTES_DISPONIVEIS.slice(0, 4).map((fonte) => (
                  <button
                    key={fonte.value}
                    type="button"
                    onClick={() => updateForm("fonte_principal", fonte.value)}
                    className={`px-3 py-2 rounded-[8px] border text-center transition-all duration-200 cursor-pointer
                      ${form.fonte_principal === fonte.value
                        ? "border-vms-primaria/40 bg-vms-primaria/10 shadow-[0_0_12px_rgba(170,255,0,0.08)]"
                        : "border-white/5 bg-white/[0.02] hover:border-white/10"
                      }`}
                    style={{ fontFamily: fonte.value }}
                  >
                    <span className={`text-sm ${
                      form.fonte_principal === fonte.value ? "text-vms-primaria font-semibold" : "text-vms-texto-2"
                    }`}>
                      {fonte.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {FONTES_DISPONIVEIS.slice(4).map((fonte) => (
                  <button
                    key={fonte.value}
                    type="button"
                    onClick={() => updateForm("fonte_principal", fonte.value)}
                    className={`px-3 py-2 rounded-[8px] border text-center transition-all duration-200 cursor-pointer
                      ${form.fonte_principal === fonte.value
                        ? "border-vms-primaria/40 bg-vms-primaria/10 shadow-[0_0_12px_rgba(170,255,0,0.08)]"
                        : "border-white/5 bg-white/[0.02] hover:border-white/10"
                      }`}
                    style={{ fontFamily: fonte.value }}
                  >
                    <span className={`text-sm ${
                      form.fonte_principal === fonte.value ? "text-vms-primaria font-semibold" : "text-vms-texto-2"
                    }`}>
                      {fonte.label}
                    </span>
                  </button>
                ))}
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
            {form.tem_logo && (
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
            {!form.tem_logo && (
              <p className="text-vms-muted text-xs">
                Logo será criado pela IA ✨
              </p>
            )}
          </div>
        );

      case 6:
        return (
          <div className="flex flex-col gap-5">
            <div className="rounded-[10px] border border-vms-blue-light/10 bg-vms-blue-bg/30 p-4">
              <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5 mb-3">
                <Building2 size={14} />
                Vincular a cliente existente (opcional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar cliente pelo nome..."
                  value={clienteSearchTerm}
                  onChange={(e) => {
                    setClienteSearchTerm(e.target.value);
                    if (!form.cliente_id) buscarClientes(e.target.value);
                  }}
                  className="w-full border bg-white/5 rounded-[10px] px-4 py-2.5 text-sm text-vms-texto
                    placeholder:text-vms-dark-5 outline-none transition-colors
                    border-white/5 focus:border-vms-primaria"
                />
                {form.cliente_id && (
                  <button
                    type="button"
                    onClick={() => {
                      updateForm("cliente_id", null);
                      setClienteSearchTerm("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-vms-muted hover:text-vms-erro text-xs"
                  >
                    ✕ Limpar
                  </button>
                )}
              </div>
              {buscandoClientes && (
                <div className="flex items-center gap-2 px-3 py-2 mt-2">
                  <div className="w-3 h-3 border-2 border-vms-blue-light border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-vms-blue-light">Buscando clientes...</span>
                </div>
              )}
              {!buscandoClientes && clientesList.length > 0 && (
                <div className="mt-2 border border-white/5 rounded-[8px] bg-vms-card max-h-40 overflow-y-auto">
                  {clientesList.map((cliente) => (
                    <button
                      key={cliente.id}
                      type="button"
                      onClick={() => selecionarCliente(cliente)}
                      className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/5 transition-colors"
                    >
                      <span className="text-sm text-vms-texto">{cliente.nome}</span>
                      <span className="text-xs text-vms-muted">{cliente.whatsapp}</span>
                    </button>
                  ))}
                </div>
              )}
              {form.cliente_id && !buscandoClientes && clientesList.length === 0 && (
                <div className="flex items-center gap-2 px-3 py-2 mt-2 rounded-[6px] bg-vms-primaria/5 border border-vms-primaria/20">
                  <CheckCircle2 size={12} className="text-vms-primaria" />
                  <span className="text-xs text-vms-primaria font-medium">Cliente vinculado: {clienteSearchTerm}</span>
                </div>
              )}
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
                autoFocus
                className={`w-full border bg-white/5 rounded-[12px] px-4 py-3 text-sm text-vms-texto
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5">
                  <MessageCircle size={14} />
                  WhatsApp
                </label>
                <div className="relative">
                  <MessageCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                  <input
                    type="text"
                    placeholder="(11) 91234-5678"
                    value={form.whatsapp}
                    onChange={(e) => updateForm("whatsapp", e.target.value)}
                    className="w-full border bg-white/5 rounded-[12px] pl-10 pr-4 py-3 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none transition-colors
                      border-white/5 focus:border-vms-primaria"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5">
                  <Camera size={14} />
                  Instagram (@)
                </label>
                <div className="relative">
                  <Camera size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                  <input
                    type="text"
                    placeholder="@seunegocio"
                    value={form.instagram}
                    onChange={(e) => updateForm("instagram", e.target.value)}
                    className="w-full border bg-white/5 rounded-[12px] pl-10 pr-4 py-3 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none transition-colors
                      border-white/5 focus:border-vms-primaria"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5">
                  <Link2 size={14} />
                  Facebook (URL)
                </label>
                <div className="relative">
                  <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                  <input
                    type="text"
                    placeholder="facebook.com/seunegocio"
                    value={form.facebook}
                    onChange={(e) => updateForm("facebook", e.target.value)}
                    className="w-full border bg-white/5 rounded-[12px] pl-10 pr-4 py-3 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none transition-colors
                      border-white/5 focus:border-vms-primaria"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5">
                  <Share2 size={14} />
                  X / Twitter (@)
                </label>
                <div className="relative">
                  <Share2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                  <input
                    type="text"
                    placeholder="@seunegocio"
                    value={form.x_twitter}
                    onChange={(e) => updateForm("x_twitter", e.target.value)}
                    className="w-full border bg-white/5 rounded-[12px] pl-10 pr-4 py-3 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none transition-colors
                      border-white/5 focus:border-vms-primaria"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5">
                <Globe size={14} />
                YouTube (URL)
              </label>
              <div className="relative">
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vms-muted" />
                <input
                  type="text"
                  placeholder="youtube.com/@seucanal ou link do vídeo"
                  value={form.youtube}
                  onChange={(e) => updateForm("youtube", e.target.value)}
                  className="w-full border bg-white/5 rounded-[12px] pl-10 pr-4 py-3 text-sm text-vms-texto
                    placeholder:text-vms-dark-5 outline-none transition-colors
                    border-white/5 focus:border-vms-primaria"
                />
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <p className="text-vms-texto-2 text-xs font-semibold mb-3 flex items-center gap-1.5">
                <ImageIcon size={14} />
                Identidade Visual (opcional)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-vms-muted text-[11px]">Logo URL</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/logo.png"
                    value={form.logo_url}
                    onChange={(e) => updateForm("logo_url", e.target.value)}
                    className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none transition-colors
                      border-white/5 focus:border-vms-primaria"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-vms-muted text-[11px]">Favicon URL</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/favicon.ico"
                    value={form.favicon_url}
                    onChange={(e) => updateForm("favicon_url", e.target.value)}
                    className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none transition-colors
                      border-white/5 focus:border-vms-primaria"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5">
                <span>🔤</span> Fonte principal do site
              </label>
              <select
                value={form.fonte_principal}
                onChange={(e) => updateForm("fonte_principal", e.target.value)}
                className="w-full border bg-white/5 rounded-[10px] px-4 py-3 text-sm text-vms-texto
                  outline-none transition-colors cursor-pointer
                  border-white/5 focus:border-vms-primaria appearance-none"
                style={{ fontFamily: form.fonte_principal }}
              >
                {FONTES_DISPONIVEIS.map((fonte) => (
                  <option key={fonte.value} value={fonte.value} style={{ fontFamily: fonte.value }}>
                    {fonte.label}
                  </option>
                ))}
              </select>
              <p className="text-vms-muted text-[11px]">
                Preview: <span style={{ fontFamily: form.fonte_principal }} className="text-vms-texto font-medium">{form.fonte_principal}</span>
              </p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <ReviewCard icon={<Building2 size={16} />} title="Informações do Negócio">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-vms-muted text-xs">Empresa</span>
                    <span className="text-vms-texto text-xs font-medium">{form.nome_empresa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-vms-muted text-xs">Segmento</span>
                    <span className="text-vms-texto text-xs font-medium">
                      {NICHOS_GRID.find((n) => n.value === form.nicho)?.label || "—"}
                    </span>
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

              <ReviewCard icon={<Palette size={16} />} title="Cores e Tema">
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
                  <div className="flex justify-between">
                    <span className="text-vms-muted text-xs">Fonte</span>
                    <span className="text-vms-texto text-xs font-medium" style={{ fontFamily: form.fonte_principal }}>
                      {form.fonte_principal}
                    </span>
                  </div>
                </div>
              </ReviewCard>

              <ReviewCard icon={<ImageIcon size={16} />} title="Logo e Identidade">
                <div className="flex flex-col gap-1.5">
                  <span className="text-vms-texto-2 text-xs">
                    {form.tem_logo
                      ? logoPreview
                        ? "Logo enviado ✓"
                        : "Logo será enviado"
                      : form.logo_url
                        ? "Logo URL informado ✓"
                        : "Será gerado pela IA ✨"}
                  </span>
                  {form.logo_url && (
                    <span className="text-vms-muted text-[11px] truncate max-w-[200px]">{form.logo_url}</span>
                  )}
                  {form.favicon_url && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-vms-muted text-[11px]">Favicon:</span>
                      <span className="text-vms-blue-light text-[11px] truncate max-w-[180px]">{form.favicon_url}</span>
                    </div>
                  )}
                </div>
              </ReviewCard>

              <ReviewCard icon={<Building2 size={16} />} title="Vinculação">
                <span className="text-vms-texto-2 text-xs">
                  {form.cliente_id
                    ? `Cliente vinculado: ${clienteSearchTerm} ✓`
                    : "Sem vinculação de cliente"}
                </span>
              </ReviewCard>

              <ReviewCard icon={<MapPinIcon size={16} />} title="Localização">
                <span className="text-vms-texto-2 text-xs">
                  {form.sem_endereco
                    ? "Sem endereço fixo / empresa online"
                    : form.endereco || "Não informado"}
                </span>
              </ReviewCard>

              <ReviewCard icon={<Share2 size={16} />} title="Redes Sociais">
                <div className="flex flex-col gap-1.5">
                  {form.whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageCircle size={12} className="text-vms-muted" />
                      <span className="text-vms-texto-2 text-xs">{form.whatsapp}</span>
                    </div>
                  )}
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
                  {form.x_twitter && (
                    <div className="flex items-center gap-2">
                      <Share2 size={12} className="text-vms-muted" />
                      <span className="text-vms-texto-2 text-xs">{form.x_twitter}</span>
                    </div>
                  )}
                  {form.youtube && (
                    <div className="flex items-center gap-2">
                      <Globe size={12} className="text-vms-muted" />
                      <span className="text-vms-texto-2 text-xs truncate max-w-[200px]">{form.youtube}</span>
                    </div>
                  )}
                  {!form.whatsapp && !form.instagram && !form.facebook && !form.x_twitter && !form.youtube && (
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
                bg-vms-primaria text-black font-semibold rounded-[12px] text-base
                hover:brightness-110 hover:shadow-[0_0_32px_rgba(170,255,0,0.25)]
                transition-all duration-300 cursor-pointer
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Sparkles size={20} />
              Gerar Site com IA
            </button>
          </div>
        );

      default:
        return null;
    }
  }

  const currentQ = QUESTIONS[currentQuestion];
  const Icon = currentQ?.icon ?? Building2;

  return (
    <DashboardLayout title="Criar Site">
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(60px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-60px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutLeft {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-60px); opacity: 0; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(60px); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px ${form.cor_primaria}15; }
          50% { box-shadow: 0 0 40px ${form.cor_primaria}25; }
        }
      `}</style>

      <div className="max-w-2xl mx-auto flex flex-col gap-6 min-h-[80vh]">
        <div className="flex items-center gap-2 px-2">
          {QUESTIONS.map((q, idx) => {
            const isActive = idx === currentQuestion;
            const isCompleted = idx < currentQuestion;
            return (
              <div
                key={q.id}
                className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer"
                onClick={() => {
                  if (idx < currentQuestion) goToQuestion(idx);
                }}
              >
                <div
                  className={`w-full h-1.5 rounded-full transition-all duration-500 ${
                    isCompleted
                      ? "bg-vms-primaria"
                      : isActive
                        ? "bg-vms-primaria/60"
                        : "bg-vms-borda"
                  }`}
                />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-2">
          <span className="text-vms-muted text-xs">
            {currentQuestion + 1} de {QUESTIONS.length}
          </span>
          <span className="text-vms-muted text-xs">
            {Math.round(((currentQuestion + 1) / QUESTIONS.length) * 100)}%
          </span>
        </div>

        <div
          className="flex-1 flex flex-col"
          style={{ background: bgGlow, transition: "background 0.8s ease" }}
        >
          <div
            className={`bg-vms-card border border-white/5 rounded-[16px] p-8
              shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              ${isAnimating ? slideOut : slideIn}
              transition-shadow duration-700`}
            key={animationKey}
            style={{ animation: isAnimating ? undefined : undefined }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center bg-vms-primaria/10"
                style={{ animation: "glowPulse 3s ease-in-out infinite" }}
              >
                <Icon size={18} className="text-vms-primaria" />
              </div>
              <h2 className="text-vms-texto text-2xl sm:text-3xl font-semibold leading-tight">
                <TypewriterText text={currentQ.text} />
              </h2>
            </div>

            {renderQuestion()}
          </div>
        </div>

        <div className="flex items-center justify-between pb-4">
          <button
            type="button"
            onClick={goBack}
            disabled={currentQuestion === 0 || isAnimating}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-[10px]
              bg-vms-card text-vms-texto-2 text-sm font-medium
              hover:bg-vms-dark-3 transition-colors cursor-pointer
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          {currentQuestion < QUESTIONS.length - 1 && (
            <button
              type="button"
              onClick={goNext}
              disabled={isAnimating}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-[10px]
                bg-vms-primaria text-black text-sm font-semibold
                hover:brightness-110 transition-all cursor-pointer
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Continuar
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {showOverlay && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center
          bg-vms-fundo">
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
