"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  ExternalLink,
  Rocket,
  Monitor,
  Tablet,
  Smartphone,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Globe,
  Palette,
  FileText,
  MessageSquare,
  Send,
  Loader2,
  Check,
  Moon,
  Sun,
  Copy,
  Info,
  PanelRightClose,
  PanelRightOpen,
  MapPin,
  Eye,
  Undo2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

type DeviceType = "desktop" | "tablet" | "mobile";

const DEVICE_SIZES: Record<DeviceType, { width: string; height: string }> = {
  desktop: { width: "100%", height: "100%" },
  tablet: { width: "768px", height: "1024px" },
  mobile: { width: "375px", height: "812px" },
};

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, icon, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-vms-texto hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <span className="text-vms-primaria shrink-0">{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        {open ? <ChevronDown size={14} className="text-vms-muted" /> : <ChevronRight size={14} className="text-vms-muted" />}
      </button>
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3.5">
          {children}
        </div>
      )}
    </div>
  );
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  html?: string;
}

export default function EditarSitePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const id = params.id as string;

  const [siteName, setSiteName] = useState("");
  const [siteNicho, setSiteNicho] = useState("");
  const [siteSlug, setSiteSlug] = useState("");
  const [sitePublished, setSitePublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [htmlGerado, setHtmlGerado] = useState("");
  const [htmlBackup, setHtmlBackup] = useState("");
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [panelOpen, setPanelOpen] = useState(true);

  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  const [primaryColor, setPrimaryColor] = useState("#C8F135");
  const [secondaryColor, setSecondaryColor] = useState("#764ba2");
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");

  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [address, setAddress] = useState("");
  const [gerandoDescricao, setGerandoDescricao] = useState(false);

  const [customDomain, setCustomDomain] = useState("");
  const [showDnsInstructions, setShowDnsInstructions] = useState(false);
  const [configuringDomain, setConfiguringDomain] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [pendingHtml, setPendingHtml] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [extractingColors, setExtractingColors] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");

  const fetchSite = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sites")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      setLoading(false);
      showToast("Site não encontrado", "info");
      return;
    }

    setSiteName(data.nome_site || "");
    setSiteNicho(data.nicho || "");
    setSiteSlug(data.slug || "");
    setSitePublished(data.publicado || false);
    setCustomDomain(data.dominio_personalizado || "");

    if (data.dados_json) {
      const dj = data.dados_json as Record<string, unknown>;

      if (dj.html_gerado) {
        setHtmlGerado(dj.html_gerado as string);
        setHtmlBackup(dj.html_gerado as string);
      }

      if (dj.seo) {
        const seo = dj.seo as Record<string, string>;
        setSeoTitle(seo.title || "");
        setSeoDescription(seo.description || "");
        setSeoKeywords(seo.keywords || "");
      }

      if (dj.colors) {
        const colors = dj.colors as Record<string, string>;
        setPrimaryColor(colors.primary || "#C8F135");
        setSecondaryColor(colors.secondary || "#764ba2");
        if (colors.theme) setThemeMode(colors.theme as "dark" | "light");
      }

      if (dj.content) {
        const content = dj.content as Record<string, string>;
        setCompanyName(content.companyName || data.nome_site || "");
        setCompanyDescription(content.description || "");
        setWhatsappNumber(content.whatsapp || "");
        setAddress(content.address || "");
      }

      if (dj.site_url) {
        setSiteUrl(dj.site_url as string);
      }
    }

    setLoading(false);
  }, [id, showToast]);

  useEffect(() => {
    fetchSite();
  }, [fetchSite]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  async function handleGerarDescricao() {
    if (!companyName) {
      showToast("Informe o nome da empresa primeiro", "info");
      return;
    }
    setGerandoDescricao(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        showToast("Chave da API Gemini não configurada", "info");
        setGerandoDescricao(false);
        return;
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Crie uma descrição profissional curta para a empresa "${companyName}" do nicho ${siteNicho || 'geral'}. Retorne apenas o texto da descrição, sem aspas ou formatação.` }] }],
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
        }),
      });

      if (res.ok) {
        const result = await res.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        setCompanyDescription(text.trim());
        showToast("Descrição gerada com sucesso!", "success");
      } else {
        showToast("Erro ao gerar descrição com IA", "info");
      }
    } catch {
      showToast("Erro ao conectar com a IA", "info");
    }
    setGerandoDescricao(false);
  }

  async function handleExtractColors() {
    if (!siteUrl) {
      showToast("Informe a URL do site ou Instagram", "info");
      return;
    }
    setExtractingColors(true);
    try {
      const res = await fetch("/api/identidade-visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_empresa: companyName,
          nicho: siteNicho,
          descricao: companyDescription,
          website_url: siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`,
          modo: "detectar",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.cores) {
          setPrimaryColor(data.cores.primaria || primaryColor);
          setSecondaryColor(data.cores.secundaria || secondaryColor);
          showToast("Cores extraídas com sucesso!", "success");
        } else {
          showToast("Não foi possível detectar cores. Usando sugestão da IA.", "info");
        }
      } else {
        showToast("Erro ao extrair cores", "info");
      }
    } catch {
      showToast("Erro ao conectar com a API", "info");
    }
    setExtractingColors(false);
  }

  async function handleChatSend() {
    const instruction = chatInput.trim();
    if (!instruction || chatLoading) return;

    const userMsg: ChatMessage = { role: "user", content: instruction };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/sites/editar-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: id,
          instrucao: instruction,
          html_atual: htmlGerado,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: "Modificação aplicada! Clique em 'Aplicar' para visualizar.",
          html: data.html,
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
        setPendingHtml(data.html);
      } else {
        const data = await res.json().catch(() => ({}));
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Erro: ${data.error || "Não foi possível processar."}` },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro de conexão com a IA. Tente novamente." },
      ]);
    }
    setChatLoading(false);
  }

  function applyPendingHtml() {
    if (pendingHtml) {
      setHtmlBackup(htmlGerado);
      setHtmlGerado(pendingHtml);
      setPendingHtml(null);
      showToast("Alterações aplicadas ao preview!", "success");
    }
  }

  function handleUndo() {
    if (htmlBackup) {
      setHtmlGerado(htmlBackup);
      setHtmlBackup("");
      showToast("Alterações desfeitas", "success");
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: currentData } = await supabase
        .from("sites")
        .select("dados_json")
        .eq("id", id)
        .single();

      const existingData = (currentData?.dados_json as Record<string, unknown>) || {};

      const dadosJson = {
        ...existingData,
        html_gerado: htmlGerado,
        seo: {
          title: seoTitle,
          description: seoDescription,
          keywords: seoKeywords,
        },
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          theme: themeMode,
        },
        content: {
          companyName,
          description: companyDescription,
          whatsapp: whatsappNumber,
          address,
        },
      };

      const { error } = await supabase
        .from("sites")
        .update({
          nome_site: siteName,
          dados_json: dadosJson,
          dominio_personalizado: customDomain || null,
        })
        .eq("id", id);

      if (error) {
        showToast("Erro ao salvar: " + error.message, "info");
      } else {
        setHtmlBackup(htmlGerado);
        showToast("Site salvo com sucesso!", "success");
      }
    } catch {
      showToast("Erro inesperado ao salvar", "info");
    }
    setSaving(false);
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      const supabase = createClient();
      const newStatus = !sitePublished;
      const { error } = await supabase
        .from("sites")
        .update({ publicado: newStatus })
        .eq("id", id);

      if (error) {
        showToast("Erro ao alterar status de publicação", "info");
      } else {
        setSitePublished(newStatus);
        showToast(newStatus ? "Site publicado com sucesso! 🚀" : "Site despublicado", "success");
      }
    } catch {
      showToast("Erro ao publicar", "info");
    }
    setPublishing(false);
  }

  function handlePreview() {
    if (!siteSlug) {
      showToast("Site não possui slug definido", "info");
      return;
    }
    window.open(`/s/${siteSlug}`, "_blank");
  }

  async function handleConfigureDomain() {
    setConfiguringDomain(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("sites")
        .update({ dominio_personalizado: customDomain || null })
        .eq("id", id);

      if (error) {
        showToast("Erro ao configurar domínio", "info");
      } else {
        setShowDnsInstructions(true);
        showToast("Domínio salvo! Configure o DNS abaixo.", "success");
      }
    } catch {
      showToast("Erro ao salvar domínio", "info");
    }
    setConfiguringDomain(false);
  }

  function applyColorsToHtml() {
    if (!htmlGerado) return;
    let updated = htmlGerado;
    updated = updated.replace(
      /tailwind\.config=\{theme:\{extend:\{colors:\{primaria:'[^']*',secundaria:'[^']*'\}\}\}\}/g,
      `tailwind.config={theme:{extend:{colors:{primaria:'${primaryColor}',secundaria:'${secondaryColor}'}}}}`
    );
    if (updated === htmlGerado) {
      updated = updated.replace(
        /<script>tailwind\.config=.*?<\/script>/g,
        `<script>tailwind.config={theme:{extend:{colors:{primaria:'${primaryColor}',secundaria:'${secondaryColor}'}}}}</script>`
      );
    }
    if (updated !== htmlGerado) {
      setHtmlBackup(htmlGerado);
      setHtmlGerado(updated);
      showToast("Cores aplicadas ao HTML!", "success");
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-vms-fundo flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-vms-primaria border-t-transparent rounded-full animate-spin" />
          <span className="text-vms-muted text-sm">Carregando editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-vms-fundo flex flex-col overflow-hidden">
      <div className="h-12 shrink-0 flex items-center gap-3 px-4 border-b border-vms-borda bg-vms-sidebar/80 backdrop-blur-xl">
        <button
          onClick={() => router.push("/sites")}
          className="flex items-center gap-1.5 text-vms-muted text-sm hover:text-vms-texto transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft size={16} />
          <span>Voltar</span>
        </button>

        <div className="h-5 w-px bg-vms-borda shrink-0" />

        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${sitePublished ? "bg-vms-primaria" : "bg-vms-muted"}`} />
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="bg-transparent text-vms-texto text-sm font-semibold outline-none border-b border-transparent focus:border-vms-primaria/30 transition-colors min-w-0 max-w-[200px] truncate"
          />
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1 bg-vms-card/60 rounded-[8px] p-0.5 shrink-0">
          {([
            { key: "desktop" as DeviceType, icon: Monitor, label: "Desktop" },
            { key: "tablet" as DeviceType, icon: Tablet, label: "Tablet" },
            { key: "mobile" as DeviceType, icon: Smartphone, label: "Mobile" },
          ]).map((d) => {
            const Icon = d.icon;
            return (
              <button
                key={d.key}
                onClick={() => setDevice(d.key)}
                className={`flex items-center justify-center w-7 h-6 rounded-[6px] transition-all cursor-pointer
                  ${device === d.key
                    ? "bg-vms-primaria text-black"
                    : "text-vms-muted hover:text-vms-texto hover:bg-white/5"
                  }`}
                title={d.label}
              >
                <Icon size={14} />
              </button>
            );
          })}
        </div>

        <div className="h-5 w-px bg-vms-borda shrink-0" />

        {htmlBackup && htmlBackup !== htmlGerado && (
          <button
            onClick={handleUndo}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-[8px] bg-vms-card text-vms-texto-2
              text-xs font-medium hover:bg-vms-dark-3 hover:text-vms-texto transition-all cursor-pointer shrink-0"
          >
            <Undo2 size={14} />
            Desfazer
          </button>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer shrink-0
            ${saving
              ? "bg-vms-primaria/20 text-vms-primaria/60 cursor-not-allowed"
              : "bg-vms-card text-vms-texto-2 hover:bg-vms-dark-3 hover:text-vms-texto"
            }`}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Salvando..." : "Salvar"}
        </button>

        <button
          onClick={handlePreview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-vms-card text-vms-texto-2
            text-xs font-medium hover:bg-vms-dark-3 hover:text-vms-texto transition-all cursor-pointer shrink-0"
        >
          <ExternalLink size={14} />
          Preview
        </button>

        <button
          onClick={handlePublish}
          disabled={publishing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer shrink-0
            ${sitePublished
              ? "bg-vms-primaria/20 text-vms-primaria hover:bg-vms-primaria/30"
              : "bg-vms-primaria text-black hover:brightness-110"
            }
            ${publishing ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {publishing ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
          {publishing ? "..." : sitePublished ? "Publicado" : "Publicar"}
        </button>

        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="flex items-center justify-center w-8 h-8 rounded-[8px] text-vms-muted
            hover:text-vms-texto hover:bg-vms-card transition-all cursor-pointer shrink-0"
          title={panelOpen ? "Fechar painel" : "Abrir painel"}
        >
          {panelOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden bg-vms-fundo">
          <div
            className="flex-1 overflow-auto p-6 flex justify-center items-start"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.1) transparent",
            }}
          >
            <div
              className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300"
              style={{
                width: DEVICE_SIZES[device].width,
                maxWidth: "100%",
                minHeight: device === "desktop" ? "100%" : DEVICE_SIZES[device].height,
              }}
            >
              {htmlGerado ? (
                <iframe
                  srcDoc={htmlGerado}
                  className="w-full border-0"
                  style={{ height: device === "desktop" ? "100%" : DEVICE_SIZES[device].height }}
                  title="Preview do site"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-vms-dark-1" style={{ minHeight: "400px" }}>
                  <div className="text-center">
                    <Globe size={48} className="text-vms-muted/30 mx-auto mb-3" />
                    <p className="text-vms-muted text-sm">Nenhum HTML gerado ainda</p>
                    <p className="text-vms-muted/60 text-xs mt-1">Use a IA para gerar ou editar o site</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {panelOpen && (
          <div className="w-[380px] shrink-0 border-l border-vms-borda bg-vms-sidebar/80 backdrop-blur-xl flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
              <CollapsibleSection title="SEO" icon={<FileText size={16} />} defaultOpen={false}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-vms-texto-2 text-xs font-medium">Título</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Título SEO do site"
                    className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none transition-colors
                      border-white/5 focus:border-vms-primaria"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-vms-texto-2 text-xs font-medium">Descrição</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Descrição SEO do site..."
                    rows={3}
                    className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none transition-colors resize-y min-h-[72px]
                      border-white/5 focus:border-vms-primaria"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-vms-texto-2 text-xs font-medium">Keywords</label>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="palavra1, palavra2, palavra3"
                    className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none transition-colors
                      border-white/5 focus:border-vms-primaria"
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Identidade / Cores" icon={<Palette size={16} />} defaultOpen={true}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-vms-texto-2 text-xs font-medium">Cor Primária</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded-[6px] border border-white/10 cursor-pointer bg-transparent p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 border bg-white/5 rounded-[6px] px-3 py-2 text-xs text-vms-texto
                        outline-none border-white/5 focus:border-vms-primaria font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-vms-texto-2 text-xs font-medium">Cor Secundária</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-9 h-9 rounded-[6px] border border-white/10 cursor-pointer bg-transparent p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 border bg-white/5 rounded-[6px] px-3 py-2 text-xs text-vms-texto
                        outline-none border-white/5 focus:border-vms-primaria font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-vms-texto-2 text-xs font-medium">Tema</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setThemeMode("dark")}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-xs font-medium transition-all cursor-pointer
                        ${themeMode === "dark" ? "bg-vms-primaria text-black" : "bg-vms-card text-vms-muted hover:text-vms-texto"}`}
                    >
                      <Moon size={12} /> Escuro
                    </button>
                    <button
                      onClick={() => setThemeMode("light")}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-xs font-medium transition-all cursor-pointer
                        ${themeMode === "light" ? "bg-vms-primaria text-black" : "bg-vms-card text-vms-muted hover:text-vms-texto"}`}
                    >
                      <Sun size={12} /> Claro
                    </button>
                  </div>
                </div>

                <button
                  onClick={applyColorsToHtml}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] bg-vms-primaria/10 text-vms-primaria
                    text-xs font-medium hover:bg-vms-primaria/20 transition-all cursor-pointer"
                >
                  <Palette size={12} />
                  Aplicar cores ao site
                </button>

                <div className="border-t border-white/5 pt-3">
                  <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5 mb-2">
                    <Sparkles size={12} className="text-vms-primaria" />
                    Extrair cores de site/Instagram
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                      placeholder="URL do site ou @instagram"
                      className="flex-1 border bg-white/5 rounded-[6px] px-3 py-2 text-xs text-vms-texto
                        outline-none border-white/5 focus:border-vms-primaria"
                    />
                    <button
                      onClick={handleExtractColors}
                      disabled={extractingColors}
                      className="flex items-center justify-center w-8 h-8 rounded-[6px] bg-vms-primaria/10 text-vms-primaria
                        hover:bg-vms-primaria/20 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {extractingColors ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Conteúdo" icon={<FileText size={16} />} defaultOpen={true}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-vms-texto-2 text-xs font-medium">Nome da Empresa</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nome da empresa"
                    className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none border-white/5 focus:border-vms-primaria"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5">
                    Descrição
                    <button
                      onClick={handleGerarDescricao}
                      disabled={gerandoDescricao}
                      className="text-vms-primaria hover:text-vms-primaria-bright transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {gerandoDescricao ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    </button>
                  </label>
                  <textarea
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    placeholder="Descrição da empresa..."
                    rows={3}
                    className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none border-white/5 focus:border-vms-primaria resize-y min-h-[72px]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-vms-texto-2 text-xs font-medium">WhatsApp</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="11999999999"
                    className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none border-white/5 focus:border-vms-primaria"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1">
                    <MapPin size={12} /> Endereço
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua Exemplo, 123 - Cidade"
                    className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none border-white/5 focus:border-vms-primaria"
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Domínio" icon={<Globe size={16} />} defaultOpen={false}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-vms-texto-2 text-xs font-medium">Domínio personalizado</label>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="www.seusite.com.br"
                    className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto
                      placeholder:text-vms-dark-5 outline-none border-white/5 focus:border-vms-primaria"
                  />
                </div>

                <button
                  onClick={handleConfigureDomain}
                  disabled={configuringDomain}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] bg-vms-primaria/10 text-vms-primaria
                    text-xs font-medium hover:bg-vms-primaria/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {configuringDomain ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  {configuringDomain ? "Configurando..." : "Salvar domínio"}
                </button>

                {showDnsInstructions && (
                  <div className="bg-vms-primaria/5 border border-vms-primaria/10 rounded-[8px] p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Info size={12} className="text-vms-primaria" />
                      <span className="text-vms-primaria text-xs font-medium">Instruções DNS</span>
                    </div>
                    <p className="text-vms-texto-2 text-xs leading-relaxed mb-2">
                      Configure um registro CNAME no seu provedor de DNS:
                    </p>
                    <div className="bg-vms-dark-1 rounded-[6px] p-2 mb-2">
                      <code className="text-vms-primaria text-xs">
                        CNAME: {customDomain} → cname.startzy.com.br
                      </code>
                    </div>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText("cname.startzy.com.br");
                        showToast("Copiado!", "success");
                      }}
                      className="flex items-center gap-1 text-vms-primaria text-xs hover:underline cursor-pointer"
                    >
                      <Copy size={10} /> Copiar destino CNAME
                    </button>
                  </div>
                )}
              </CollapsibleSection>

              <CollapsibleSection title="Assistente IA" icon={<MessageSquare size={16} />} defaultOpen={false}>
                <div className="flex flex-col gap-2">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-4">
                      <Sparkles size={24} className="text-vms-primaria/30 mx-auto mb-2" />
                      <p className="text-vms-muted text-xs">Peça à IA para modificar o site</p>
                      <p className="text-vms-dark-5 text-[10px] mt-1">Ex: "Mude a cor do botão para azul"</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[90%] rounded-[10px] px-3 py-2 text-xs leading-relaxed ${
                            msg.role === "user"
                              ? "bg-vms-primaria text-black"
                              : "bg-vms-card text-vms-texto-2"
                          }`}
                        >
                          {msg.content}
                        </div>
                        {msg.html && (
                          <button
                            onClick={applyPendingHtml}
                            className="flex items-center gap-1 px-2 py-1 rounded-[6px] bg-vms-primaria/10 text-vms-primaria
                              text-[10px] font-medium hover:bg-vms-primaria/20 transition-all cursor-pointer"
                          >
                            <Check size={10} /> Aplicar
                          </button>
                        )}
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex items-center gap-1.5 text-vms-muted text-xs">
                        <Loader2 size={12} className="animate-spin" />
                        Processando...
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleChatSend();
                        }
                      }}
                      placeholder="Instrução para a IA..."
                      className="flex-1 border bg-white/5 rounded-[8px] px-3 py-2 text-xs text-vms-texto
                        outline-none border-white/5 focus:border-vms-primaria"
                    />
                    <button
                      onClick={handleChatSend}
                      disabled={chatLoading || !chatInput.trim()}
                      className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-vms-primaria text-black
                        hover:brightness-110 transition-all cursor-pointer shrink-0 disabled:opacity-40"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </CollapsibleSection>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
