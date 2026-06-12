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
  MapPin,
  Eye,
  Undo2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Layout,
  Type,
  Image,
  Quote,
  HelpCircle,
  Phone,
  MousePointer2,
  GripVertical,
  Camera,
  MonitorPlay,
  Upload,
  Link2,
  EyeOff,
  Code,
  ImagePlus,
  ArrowUp,
  ArrowDown,
  History,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import { createClient } from "@/lib/supabase/client";
import { podePublicar, podeUsarDominioPersonalizado } from "@/lib/plan-limits";
import type { PlanoKey } from "@/lib/constants";

type DeviceType = "desktop" | "tablet" | "mobile";

const DEVICE_SIZES: Record<DeviceType, { width: string; height: string }> = {
  desktop: { width: "100%", height: "100%" },
  tablet: { width: "768px", height: "1024px" },
  mobile: { width: "375px", height: "812px" },
};

// ─── Tipos de seção ───
interface SiteSection {
  id: string;
  type: "nav" | "hero" | "painpoints" | "servicos" | "numeros" | "depoimentos" | "faq" | "cta" | "footer" | "mapa" | "outro";
  label: string;
  icon: React.ReactNode;
  visible: boolean;
}

// Ícones por tipo de seção
const SECTION_ICONS: Record<string, React.ReactNode> = {
  nav: <Layout size={14} />,
  hero: <Type size={14} />,
  painpoints: <MousePointer2 size={14} />,
  servicos: <GripVertical size={14} />,
  numeros: <Sparkles size={14} />,
  depoimentos: <Quote size={14} />,
  faq: <HelpCircle size={14} />,
  cta: <Phone size={14} />,
  footer: <FileText size={14} />,
  mapa: <MapPin size={14} />,
  outro: <Globe size={14} />,
};

const SECTION_LABELS: Record<string, string> = {
  nav: "Navegação",
  hero: "Hero Principal",
  painpoints: "Dores & Solução",
  servicos: "Serviços",
  numeros: "Números de Impacto",
  depoimentos: "Depoimentos",
  faq: "Perguntas Frequentes",
  cta: "Chamada para Ação",
  footer: "Rodapé",
  mapa: "Localização (Mapa)",
  outro: "Outra Seção",
};

const GOOGLE_FONTS = [
  { value: "Inter", label: "Inter" },
  { value: "Poppins", label: "Poppins" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Oswald", label: "Oswald" },
  { value: "Raleway", label: "Raleway" },
  { value: "Space Grotesk", label: "Space Grotesk" },
  { value: "Sora", label: "Sora" },
  { value: "Outfit", label: "Outfit" },
  { value: "DM Sans", label: "DM Sans" },
];

const COLOR_PALETTES = [
  { name: "Startzy", primary: "#C8F135", secondary: "#764ba2" },
  { name: "Ocean", primary: "#0077B6", secondary: "#00B4D8" },
  { name: "Forest", primary: "#2D6A4F", secondary: "#95D5B2" },
  { name: "Sunset", primary: "#FF6B35", secondary: "#F7C59F" },
  { name: "Royal", primary: "#6C63FF", secondary: "#FF6584" },
];

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

  // ─── Estado do site ───
  const [siteName, setSiteName] = useState("");
  const [siteSlug, setSiteSlug] = useState("");
  const [sitePublished, setSitePublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [userPlano, setUserPlano] = useState<PlanoKey>("gratuito");
  const [userCargo, setUserCargo] = useState<string>("criador");
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; titulo: string; texto: string; feature: "publicacao" | "dominio" | "checkout" | "agente" | "prospeccao" }>({ open: false, titulo: "", texto: "", feature: "publicacao" });

  // ─── HTML & Preview ───
  const [htmlGerado, setHtmlGerado] = useState("");
  const [htmlBackup, setHtmlBackup] = useState("");
  const [device, setDevice] = useState<DeviceType>("desktop");

  // ─── Painéis ───
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // ─── Seções ───
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingInline, setEditingInline] = useState(false);

  // ─── Configurações globais ───
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

  // ─── Favicon & Logo ───
  const [faviconUrl, setFaviconUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [gerandoFaviconLogo, setGerandoFaviconLogo] = useState(false);

  // ─── Redes Sociais ───
  const [instagramHandle, setInstagramHandle] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // ─── Fonte ───
  const [selectedFont, setSelectedFont] = useState("Inter");

  // ─── Domínio ───
  const [customDomain, setCustomDomain] = useState("");
  const [showDnsInstructions, setShowDnsInstructions] = useState(false);
  const [configuringDomain, setConfiguringDomain] = useState(false);

  // ─── Chat IA ───
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [pendingHtml, setPendingHtml] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ─── Extras ───
  const [gerandoDescricao, setGerandoDescricao] = useState(false);
  const [extractingColors, setExtractingColors] = useState(false);
  const [gerandoSeo, setGerandoSeo] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");

  // ─── Undo history ───
  const [undoHistory, setUndoHistory] = useState<string[]>([]);

  // ─── Custom CSS ───
  const [customCss, setCustomCss] = useState("");
  const [showCssEditor, setShowCssEditor] = useState(false);

  // ─── Versões ───
  interface SiteVersion {
    id: string;
    timestamp: string;
    label: string;
    html: string;
  }
  const [versions, setVersions] = useState<SiteVersion[]>([]);
  const [restoringVersion, setRestoringVersion] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ─── Parsear seções do HTML ───
  function parseSectionsFromHtml(html: string): SiteSection[] {
    if (!html) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const found: SiteSection[] = [];

    // Detectar seções baseadas em tags/classes/id comuns
    const sectionPatterns: Array<{ type: SiteSection["type"]; selector: string }> = [
      { type: "nav", selector: "nav, header, [role='navigation']" },
      { type: "hero", selector: ".hero, #hero, section:first-of-type, [class*='hero'], [id*='hero']" },
      { type: "painpoints", selector: "[class*='problem'], [class*='pain'], [class*='solution'], [class*='solucao']" },
      { type: "servicos", selector: "[class*='service'], [class*='servico'], [class*='feature'], [class*='card-grid']" },
      { type: "numeros", selector: "[class*='stat'], [class*='counter'], [class*='number'], [class*='numero'], [class*='impact']" },
      { type: "depoimentos", selector: "[class*='testim'], [class*='review'], [class*='depoimento']" },
      { type: "faq", selector: "[class*='faq'], [class*='accordion'], details" },
      { type: "cta", selector: "[class*='cta'], [class*='call'], [class*='action']" },
      { type: "footer", selector: "footer" },
      { type: "mapa", selector: "[class*='map'], [class*='mapa'], iframe[src*='maps'], iframe[src*='google']" },
    ];

    for (const pattern of sectionPatterns) {
      const els = doc.querySelectorAll(pattern.selector);
      els.forEach((el, i) => {
        found.push({
          id: `${pattern.type}-${i}`,
          type: pattern.type,
          label: SECTION_LABELS[pattern.type] || "Seção",
          icon: SECTION_ICONS[pattern.type] || SECTION_ICONS.outro,
          visible: true,
        });
      });
    }

    // Se não encontrou nada, criar seções genéricas baseadas nas tags section
    if (found.length === 0) {
      const allSections = doc.querySelectorAll("section");
      allSections.forEach((el, i) => {
        const classList = el.className?.toString() || "";
        let detectedType: SiteSection["type"] = "outro";
        if (classList.includes("hero")) detectedType = "hero";
        else if (classList.includes("service") || classList.includes("servico")) detectedType = "servicos";
        else if (classList.includes("testi")) detectedType = "depoimentos";
        else if (classList.includes("faq")) detectedType = "faq";
        else if (classList.includes("cta")) detectedType = "cta";

        found.push({
          id: `section-${i}`,
          type: detectedType,
          label: el.querySelector("h1, h2, h3")?.textContent?.trim().slice(0, 40) || `Seção ${i + 1}`,
          icon: SECTION_ICONS[detectedType] || SECTION_ICONS.outro,
          visible: true,
        });
      });
    }

    return found;
  }

  // ─── Carregar site ───
  const fetchSite = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from("usuarios")
        .select("plano, cargo")
        .eq("id", user.id)
        .single();
      if (userData) {
        setUserPlano(userData.plano as PlanoKey);
        setUserCargo(userData.cargo || "criador");
      }
    }
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
    setSiteSlug(data.slug || "");
    setSitePublished(data.publicado || false);
    setCustomDomain(data.dominio_personalizado || "");

    if (data.dados_json) {
      const dj = data.dados_json as Record<string, unknown>;

      if (dj.html_gerado) {
        setHtmlGerado(dj.html_gerado as string);
        setHtmlBackup(dj.html_gerado as string);
        setSections(parseSectionsFromHtml(dj.html_gerado as string));
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
        setFaviconUrl(content.favicon || "");
        setLogoUrl(content.logo || "");
        setInstagramHandle(content.instagram || "");
        setFacebookUrl(content.facebook || "");
        setTwitterHandle(content.twitter || "");
        setYoutubeUrl(content.youtube || "");
      }

      if (dj.font) {
        setSelectedFont(dj.font as string);
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

  // ─── Habilitar edição inline no iframe ───
  function enableInlineEditing() {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const doc = iframe.contentDocument;
    doc.body.setAttribute("contenteditable", "true");
    doc.body.style.cursor = "text";
    doc.designMode = "on";

    // Adicionar estilos visuais para indicar modo de edição
    const style = doc.createElement("style");
    style.textContent = `
      [contenteditable="true"] { outline: 1px dashed rgba(200,241,53,0.3); outline-offset: 2px; }
      [contenteditable="true"]:hover { outline-color: rgba(200,241,53,0.6); background: rgba(200,241,53,0.03); }
      h1, h2, h3, p, span, a, li { transition: outline 0.15s; }
      .startzy-edit-overlay {
        position: fixed; top: 0; left: 50%; transform: translateX(-50%);
        background: rgba(10,22,40,0.95); color: #C8F135;
        padding: 6px 16px; border-radius: 20px; font-size: 12px; font-family: system-ui;
        z-index: 99999; pointer-events: none; backdrop-filter: blur(8px);
        border: 1px solid rgba(200,241,53,0.2);
      }
    `;
    doc.head.appendChild(style);

    // Badge de edição ativa
    const badge = doc.createElement("div");
    badge.className = "startzy-edit-overlay";
    badge.textContent = "Modo Edição Ativo — Clique para editar qualquer texto";
    doc.body.appendChild(badge);
    setTimeout(() => badge.remove(), 3000);

    // Marcar que há mudanças (NÃO capturar HTML a cada tecla — isso trava o editor)
    // O HTML só é capturado quando o usuário clica em "Salvar"
    doc.addEventListener("input", () => {
      setEditingInline(true);
      // Pequeno feedback visual: badge sutil no canto
      const existingBadge = doc.querySelector(".startzy-changed-badge");
      if (!existingBadge) {
        const badge = doc.createElement("div");
        badge.className = "startzy-changed-badge";
        badge.textContent = "* Alterações não salvas — clique em Salvar";
        Object.assign(badge.style, {
          position: "fixed", bottom: "12px", left: "50%", transform: "translateX(-50%)",
          background: "rgba(200,241,53,0.95)", color: "#000",
          padding: "4px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
          fontFamily: "system-ui", zIndex: "99999", pointerEvents: "none",
          transition: "opacity 0.3s",
        });
        doc.body.appendChild(badge);
        setTimeout(() => { badge.style.opacity = "0"; setTimeout(() => badge.remove(), 300); }, 2000);
      }
    });

    setEditingInline(true);
    showToast("Edição inline ativada! Clique em qualquer texto para editar.", "success");
  }

  function disableInlineEditing() {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const doc = iframe.contentDocument;
    doc.body.removeAttribute("contenteditable");
    doc.body.style.cursor = "";
    doc.designMode = "off";

    // Remover outlines de edição
    const style = doc.querySelector('style[data-startzy-edit]');
    style?.remove();

    setEditingInline(false);
    showToast("Edição inline desativada.", "info");
  }

  function captureIframeHtml() {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    const updatedHtml = iframe.contentDocument.documentElement.outerHTML;
    setHtmlGerado(updatedHtml);
    setEditingInline(true);
    showToast("Conteúdo capturado do editor!", "success");
  }

  // ─── Scroll para seção ───
  function scrollToSection(sectionId: string) {
    setActiveSectionId(sectionId);
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    // Destacar seção visualmente no iframe
    const doc = iframe.contentDocument;

    // Reset previous highlight
    doc.querySelectorAll("[data-startzy-highlight]").forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.removeAttribute("data-startzy-highlight");
      htmlEl.style.outline = "";
      htmlEl.style.transition = "";
    });

    // Tentar encontrar e destacar a seção
    const sectionPatterns: Record<string, string> = {
      "nav-": "nav, header",
      "hero-": ".hero, #hero, section:first-of-type",
      "painpoints-": "[class*='problem'], [class*='pain']",
      "servicos-": "[class*='service'], [class*='feature']",
      "numeros-": "[class*='stat'], [class*='counter']",
      "depoimentos-": "[class*='testim']",
      "faq-": "[class*='faq'], details",
      "cta-": "[class*='cta']",
      "footer-": "footer",
      "section-": "section",
    };

    let selector = "section";
    for (const [prefix, sel] of Object.entries(sectionPatterns)) {
      if (sectionId.startsWith(prefix)) {
        selector = sel;
        break;
      }
    }

    const indexMatch = sectionId.match(/-(\d+)$/);
    const targetEl = doc.querySelectorAll(selector)[indexMatch ? parseInt(indexMatch[1]) : 0];

    if (targetEl) {
      const htmlTarget = targetEl as HTMLElement;
      htmlTarget.scrollIntoView({ behavior: "smooth", block: "center" });
      htmlTarget.setAttribute("data-startzy-highlight", "true");
      htmlTarget.style.outline = "2px solid #C8F135";
      htmlTarget.style.transition = "outline 0.3s";
      setTimeout(() => {
        htmlTarget.style.outline = "";
        htmlTarget.removeAttribute("data-startzy-highlight");
      }, 3000);
    }
  }

  // ─── Salvar ───
  async function handleSave() {
    // Capturar HTML atual do iframe de forma SÍNCRONA se estiver em modo edição
    let htmlToSave = htmlGerado;
    if (editingInline && iframeRef.current?.contentDocument) {
      htmlToSave = iframeRef.current.contentDocument.documentElement.outerHTML;
      setHtmlGerado(htmlToSave);
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: currentData } = await supabase
        .from("sites")
        .select("dados_json")
        .eq("id", id)
        .single();

      const existingData = (currentData?.dados_json as Record<string, unknown>) || {};

      // Criar snapshot da versão anterior em memória (não salva no banco)
      const htmlAnterior = existingData.html_gerado as string | undefined;
      if (htmlAnterior && htmlAnterior !== htmlToSave) {
        const novasVersoes = [
          {
            id: `v_${Date.now()}`,
            timestamp: new Date().toISOString(),
            label: `Versão ${versions.length + 1}`,
            html: htmlAnterior,
          },
          ...versions,
        ].slice(0, 20);
        setVersions(novasVersoes);
      }

      const dadosJson = {
        ...existingData,
        html_gerado: htmlToSave,
        seo: { title: seoTitle, description: seoDescription, keywords: seoKeywords },
        colors: { primary: primaryColor, secondary: secondaryColor, theme: themeMode },
        content: { companyName, description: companyDescription, whatsapp: whatsappNumber, address, favicon: faviconUrl, logo: logoUrl, instagram: instagramHandle, facebook: facebookUrl, twitter: twitterHandle, youtube: youtubeUrl },
        font: selectedFont,
        custom_css: customCss || null,
        site_url: siteUrl || null,
      };

      const { error } = await supabase
        .from("sites")
        .update({ nome_site: siteName, dados_json: dadosJson, dominio_personalizado: customDomain || null })
        .eq("id", id);

      if (error) {
        showToast("Erro ao salvar: " + error.message, "info");
      } else {
        pushUndo(htmlToSave);
        setHtmlBackup(htmlGerado);
        setSections(parseSectionsFromHtml(htmlGerado));
        setEditingInline(false);
        showToast("Site salvo com sucesso!", "success");
      }
    } catch {
      showToast("Erro inesperado ao salvar", "info");
    }
    setSaving(false);
  }

  // ─── Publicar ───
  async function handlePublish() {
    if (!sitePublished && !podePublicar(userPlano, userCargo)) {
      setUpgradeModal({
        open: true,
        titulo: "Publicação disponível a partir do Starter",
        texto: "Faça upgrade para publicar seu site, ativar domínio personalizado e começar a vender.",
        feature: "publicacao",
      });
      return;
    }
    setPublishing(true);
    try {
      const supabase = createClient();
      const newStatus = !sitePublished;
      const { error } = await supabase.from("sites").update({ publicado: newStatus }).eq("id", id);
      if (error) showToast("Erro ao alterar status de publicação", "info");
      else {
        setSitePublished(newStatus);
        showToast(newStatus ? "Site publicado com sucesso!" : "Site despublicado", "success");
      }
    } catch { showToast("Erro ao publicar", "info"); }
    setPublishing(false);
  }

  function handlePreview() {
    if (!siteSlug) { showToast("Site não possui slug definido", "info"); return; }
    window.open(`/s/${siteSlug}`, "_blank");
  }

  // ─── Domínio ───
  async function handleConfigureDomain() {
    if (!podeUsarDominioPersonalizado(userPlano, userCargo)) {
      setUpgradeModal({ open: true, titulo: "Domínio personalizado disponível a partir do Starter", texto: "Faça upgrade para usar seu próprio domínio e fortalecer a marca dos seus clientes.", feature: "dominio" });
      return;
    }
    setConfiguringDomain(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("sites").update({ dominio_personalizado: customDomain || null }).eq("id", id);
      if (error) showToast("Erro ao configurar domínio", "info");
      else { setShowDnsInstructions(true); showToast("Domínio salvo! Configure o DNS abaixo.", "success"); }
    } catch { showToast("Erro ao salvar domínio", "info"); }
    setConfiguringDomain(false);
  }

  // ─── Aplicar cores ───
  function applyColorsToHtml() {
    if (!htmlGerado) return;
    let updated = htmlGerado;
    updated = updated.replace(
      /tailwind\.config=\{theme:\{extend:\{colors:\{primaria:'[^']*',secundaria:'[^']*'\}\}\}\}/g,
      `tailwind.config={theme:{extend:{colors:{primaria:'${primaryColor}',secundaria:'${secondaryColor}'}}}}`
    );
    if (updated === htmlGerado) {
      updated = updated.replace(/<script>tailwind\.config=.*?<\/script>/g,
        `<script>tailwind.config={theme:{extend:{colors:{primaria:'${primaryColor}',secundaria:'${secondaryColor}'}}}}</script>`
      );
    }
    if (updated !== htmlGerado) {
      setHtmlBackup(htmlGerado);
      setHtmlGerado(updated);
      showToast("Cores aplicadas ao HTML!", "success");
    }
  }

  // ─── Gerar descrição IA ───
  async function handleGerarDescricao() {
    if (!companyName) { showToast("Informe o nome da empresa primeiro", "info"); return; }
    setGerandoDescricao(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) { showToast("Chave da API Gemini não configurada", "info"); setGerandoDescricao(false); return; }
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Crie uma descrição profissional curta para a empresa "${companyName}". Retorne apenas o texto da descrição, sem aspas ou formatação.` }] }],
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
        }),
      });
      if (res.ok) {
        const result = await res.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        setCompanyDescription(text.trim());
        showToast("Descrição gerada com sucesso!", "success");
      } else showToast("Erro ao gerar descrição com IA", "info");
    } catch { showToast("Erro ao conectar com a IA", "info"); }
    setGerandoDescricao(false);
  }

  // ─── Gerar SEO com IA (Gemini) ───
  async function handleGerarSEO() {
    if (!companyName && !siteName) { showToast("Informe o nome da empresa primeiro", "info"); return; }
    setGerandoSeo(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) { showToast("Chave da API Gemini não configurada", "info"); setGerandoSeo(false); return; }

      const prompt = `Como especialista em SEO, gere os metadados otimizados para um site da empresa "${companyName || siteName}"${companyDescription ? ` que ${companyDescription.toLowerCase()}` : ""}.

Retorne APENAS um JSON válido (sem markdown, sem \`\`\`) com esta estrutura exata:
{
  "title": "título SEO otimizado (50-60 caracteres, inclui nome da empresa + palavra-chave principal)",
  "description": "meta description persuasiva (120-160 caracteres, com call to action sutil)",
  "keywords": "palavra1, palavra2, palavra3, palavra4, palavra5"
}

Regras:
- O title deve ser único e atrativo para cliques no Google
- A description deve convencer o usuário a clicar
- As keywords devem ser termos reais que pessoas buscam no nicho
- Seja específico, não genérico`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.4 },
        }),
      });

      if (res.ok) {
        const result = await res.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        // Tentar parsear JSON da resposta
        try {
          const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const seoData = JSON.parse(cleanText);
          if (seoData.title) setSeoTitle(seoData.title);
          if (seoData.description) setSeoDescription(seoData.description);
          if (seoData.keywords) setSeoKeywords(seoData.keywords);
          showToast("SEO gerado com IA! Revise e ajuste se necessário.", "success");
        } catch {
          // Se não for JSON válido, usar como description
          setSeoDescription(text.slice(0, 160));
          showToast("Descrição gerada! Título e keywords precisam de ajuste manual.", "info");
        }
      } else {
        showToast("Erro ao gerar SEO com IA", "info");
      }
    } catch {
      showToast("Erro ao conectar com a IA", "info");
    }
    setGerandoSeo(false);
  }

  // ─── Extrair cores ───
  async function handleExtractColors() {
    if (!siteUrl) { showToast("Informe a URL do site ou Instagram", "info"); return; }
    setExtractingColors(true);
    try {
      const res = await fetch("/api/identidade-visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_empresa: companyName, nicho: "", descricao: companyDescription, website_url: siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`, modo: "detectar" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.cores) { setPrimaryColor(data.cores.primaria || primaryColor); setSecondaryColor(data.cores.secundaria || secondaryColor); showToast("Cores extraídas com sucesso!", "success"); }
        else showToast("Não foi possível detectar cores.", "info");
      } else showToast("Erro ao extrair cores", "info");
    } catch { showToast("Erro ao conectar com a API", "info"); }
    setExtractingColors(false);
  }

  // ─── Gerar Favicon/Logo com IA ───
  async function handleGerarFaviconLogo() {
    if (!companyName) { showToast("Informe o nome da empresa primeiro", "info"); return; }
    setGerandoFaviconLogo(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) { showToast("Chave da API Gemini não configurada", "info"); setGerandoFaviconLogo(false); return; }
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Gere um favicon SVG simples e minimalista para a empresa "${companyName}". Retorne APENAS o código SVG (sem markdown, sem \`\`\`svg), pronto para usar como favicon. Use cores modernas e design limpo. O SVG deve ter viewBox="0 0 32 32" e ser adequado para favicon.` }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.8 },
        }),
      });
      if (res.ok) {
        const result = await res.json();
        const svgText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (svgText.includes("<svg")) {
          const cleanSvg = svgText.replace(/```xml\n?/g, "").replace(/```\n?/g, "").trim();
          const b64 = btoa(unescape(encodeURIComponent(cleanSvg)));
          const dataUrl = `data:image/svg+xml;base64,${b64}`;
          setFaviconUrl(dataUrl);
          setLogoUrl(dataUrl);
          showToast("Favicon e Logo gerados com sucesso!", "success");
        } else showToast("Não foi possível gerar o favicon.", "info");
      } else showToast("Erro ao gerar favicon com IA", "info");
    } catch { showToast("Erro ao conectar com a IA", "info"); }
    setGerandoFaviconLogo(false);
  }

  // ─── Upload de imagem (base64) ───
  function handleImageUpload(setter: (url: string) => void, accept?: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept || "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { setter(reader.result as string); showToast("Imagem carregada!", "success"); };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  // ─── Aplicar fonte ao HTML ───
  function applyFontToHtml() {
    if (!htmlGerado) return;
    let updated = htmlGerado;
    const googleFontLink = `<link href="https://fonts.googleapis.com/css2?family=${selectedFont.replace(/ /g, "+")}:wght@300;400;500;600;700&display=swap" rel="stylesheet">`;
    if (!updated.includes("fonts.googleapis.com")) {
      updated = updated.replace("<head>", `<head>${googleFontLink}`);
    } else {
      updated = updated.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/g, googleFontLink);
    }
    updated = updated.replace(/font-family:\s*[^;]+;/g, `font-family: '${selectedFont}', sans-serif;`);
    if (!updated.includes("font-family")) {
      updated = updated.replace("<style>", `<style>* { font-family: '${selectedFont}', sans-serif; }`);
    }
    if (updated !== htmlGerado) {
      setHtmlBackup(htmlGerado);
      setHtmlGerado(updated);
      showToast(`Fonte ${selectedFont} aplicada!`, "success");
    }
  }

  // ─── Chat IA ───
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
        body: JSON.stringify({ site_id: id, instrucao: instruction, html_atual: htmlGerado }),
      });
      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = { role: "assistant", content: "Modificação aplicada! Clique em 'Aplicar' para visualizar.", html: data.html };
        setChatMessages((prev) => [...prev, assistantMsg]);
        setPendingHtml(data.html);
      } else {
        const data = await res.json().catch(() => ({}));
        setChatMessages((prev) => [...prev, { role: "assistant", content: `Erro: ${data.error || "Não foi possível processar."}` }]);
      }
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Erro de conexão com a IA. Tente novamente." }]);
    }
    setChatLoading(false);
  }

  function applyPendingHtml() {
    if (pendingHtml) { setHtmlBackup(htmlGerado); setHtmlGerado(pendingHtml); setPendingHtml(null); setSections(parseSectionsFromHtml(pendingHtml)); showToast("Alterações aplicadas ao preview!", "success"); }
  }

  function handleUndo() {
    if (htmlBackup) { setHtmlGerado(htmlBackup); setHtmlBackup(""); setSections(parseSectionsFromHtml(htmlBackup)); showToast("Alterações desfeitas", "success"); }
  }

  // ─── Undo history ───
  function pushUndo(html: string) {
    setUndoHistory((prev) => [...prev.slice(-9), html]);
  }

  function handleMultiUndo() {
    if (undoHistory.length === 0) return;
    const prev = undoHistory[undoHistory.length - 1];
    setUndoHistory((h) => h.slice(0, -1));
    setHtmlGerado(prev);
    setSections(parseSectionsFromHtml(prev));
    showToast("Alteração desfeita!", "success");
  }



  // ─── Toggle seção visibilidade ───
  function toggleSectionVisibility(sectionId: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, visible: !s.visible } : s))
    );
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    const doc = iframe.contentDocument;

    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const sectionPatterns: Record<string, string> = {
      "nav-": "nav, header",
      "hero-": ".hero, #hero, section:first-of-type",
      "painpoints-": "[class*='problem'], [class*='pain']",
      "servicos-": "[class*='service'], [class*='feature']",
      "numeros-": "[class*='stat'], [class*='counter']",
      "depoimentos-": "[class*='testim']",
      "faq-": "[class*='faq'], details",
      "cta-": "[class*='cta']",
      "footer-": "footer",
      "section-": "section",
    };

    let selector = "section";
    for (const [prefix, sel] of Object.entries(sectionPatterns)) {
      if (sectionId.startsWith(prefix)) { selector = sel; break; }
    }

    const indexMatch = sectionId.match(/-(\d+)$/);
    const targetEl = doc.querySelectorAll(selector)[indexMatch ? parseInt(indexMatch[1]) : 0] as HTMLElement | undefined;
    if (targetEl) {
      const isNowVisible = !section.visible;
      targetEl.style.display = isNowVisible ? "" : "none";
      setEditingInline(true);
    }
  }

  // ─── Mover seção (drag & drop simplificado) ───
  function moveSection(sectionId: string, direction: "up" | "down") {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === sectionId);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const newArr = [...prev];
      [newArr[idx], newArr[newIdx]] = [newArr[newIdx], newArr[idx]];
      return newArr;
    });

    // Também mover no iframe
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    const doc = iframe.contentDocument;
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const sectionPatterns: Record<string, string> = {
      "nav-": "nav, header",
      "hero-": ".hero, #hero, section:first-of-type",
      "painpoints-": "[class*='problem'], [class*='pain']",
      "servicos-": "[class*='service'], [class*='feature']",
      "numeros-": "[class*='stat'], [class*='counter']",
      "depoimentos-": "[class*='testim']",
      "faq-": "[class*='faq'], details",
      "cta-": "[class*='cta']",
      "footer-": "footer",
      "section-": "section",
    };

    let selector = "section";
    for (const [prefix, sel] of Object.entries(sectionPatterns)) {
      if (sectionId.startsWith(prefix)) { selector = sel; break; }
    }

    const indexMatch = sectionId.match(/-(\d+)$/);
    const allEls = doc.querySelectorAll(selector);
    const el = allEls[indexMatch ? parseInt(indexMatch[1]) : 0] as HTMLElement | undefined;
    if (!el) return;

    if (direction === "up" && el.previousElementSibling) {
      el.parentNode?.insertBefore(el, el.previousElementSibling);
    } else if (direction === "down" && el.nextElementSibling) {
      el.parentNode?.insertBefore(el.nextElementSibling, el);
    }
    setEditingInline(true);
  }

  // ─── Upload de imagem no iframe ───
  function handleImageUploadInIframe() {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) {
      showToast("Abra o preview primeiro", "info");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const doc = iframe.contentDocument!;

        // Inject script to replace clicked image or insert new one
        const script = doc.createElement("script");
        script.textContent = `
          (function() {
            var imgUrl = "${dataUrl}";
            // Create overlay for image selection
            var overlay = document.createElement('div');
            overlay.id = 'startzy-img-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;z-index:999998;background:rgba(0,0,0,0.5);cursor:crosshair;';
            var hint = document.createElement('div');
            hint.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999999;background:#C8F135;color:#000;padding:8px 20px;border-radius:20px;font-size:13px;font-weight:600;font-family:system-ui;';
            hint.textContent = 'Clique na imagem que deseja substituir (ou pressione Esc para cancelar)';
            overlay.appendChild(hint);
            document.body.appendChild(overlay);

            overlay.addEventListener('click', function(e) {
              var target = e.target;
              // Find closest img or element with background-image
              var img = target.closest('img') || target.querySelector('img');
              if (img) {
                img.src = imgUrl;
                img.style.maxWidth = '100%';
                overlay.remove();
              } else if (target.style && target.style.backgroundImage) {
                target.style.backgroundImage = 'url(' + imgUrl + ')';
                overlay.remove();
              } else {
                // Insert new image
                var newImg = document.createElement('img');
                newImg.src = imgUrl;
                newImg.style.maxWidth = '100%';
                newImg.style.height = 'auto';
                newImg.style.borderRadius = '8px';
                target.appendChild(newImg);
                overlay.remove();
              }
            });

            document.addEventListener('keydown', function esc(e) {
              if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', esc);
              }
            });
          })();
        `;
        doc.body.appendChild(script);
        showToast("Clique na imagem no site para substituir", "success");
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  // ─── Aplicar CSS customizado ───
  function applyCustomCss() {
    if (!customCss.trim()) return;
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    const doc = iframe.contentDocument;

    // Remove previous custom CSS
    let styleEl = doc.getElementById("startzy-custom-css");
    if (!styleEl) {
      styleEl = doc.createElement("style");
      styleEl.id = "startzy-custom-css";
      doc.head.appendChild(styleEl);
    }
    styleEl.textContent = customCss;
    setEditingInline(true);
    showToast("CSS customizado aplicado!", "success");
  }

  // ─── Restaurar versão anterior ───
  async function handleRestoreVersion(version: SiteVersion) {
    setRestoringVersion(true);
    try {
      // Salvar versão atual em memória antes de restaurar
      const currentHtml = editingInline && iframeRef.current?.contentDocument
        ? iframeRef.current.contentDocument.documentElement.outerHTML
        : htmlGerado;

      if (currentHtml) {
        const versoesAtualizadas = [
          {
            id: `v_${Date.now()}`,
            timestamp: new Date().toISOString(),
            label: `Antes de restaurar ${version.label}`,
            html: currentHtml,
          },
          ...versions.filter((v) => v.id !== version.id),
        ].slice(0, 20);
        setVersions(versoesAtualizadas);
      }

      setHtmlGerado(version.html);
      setHtmlBackup(version.html);
      setSections(parseSectionsFromHtml(version.html));
      setEditingInline(false);
      showToast(`${version.label} restaurada com sucesso!`, "success");
    } catch {
      showToast("Erro ao restaurar versão", "info");
    }
    setRestoringVersion(false);
  }

  // ─── Deletar versão ───
  function handleDeleteVersion(versionId: string) {
    const versoesAtualizadas = versions.filter((v) => v.id !== versionId);
    setVersions(versoesAtualizadas);
    showToast("Versão removida", "success");
  }

  // ─── Loading ───
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-vms-fundo flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-vms-primaria border-t-transparent rounded-full animate-spin" />
          <span className="text-vms-muted text-sm">Carregando editor StartEngine...</span>
        </div>
      </div>
    );
  }

  // ─── RENDER ───
  return (
    <div className="fixed inset-0 z-50 bg-vms-fundo flex flex-col overflow-hidden">
      {/* ═══════ TOP BAR ═══════ */}
      <div className="h-12 shrink-0 flex items-center gap-3 px-4 border-b border-vms-borda bg-vms-sidebar">
        <button onClick={() => router.push("/sites")} className="flex items-center gap-1.5 text-vms-muted text-sm hover:text-vms-texto transition-colors cursor-pointer shrink-0">
          <ArrowLeft size={16} /><span>Voltar</span>
        </button>
        <div className="h-5 w-px bg-vms-borda shrink-0" />
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${sitePublished ? "bg-vms-primaria" : "bg-vms-muted"}`} />
          <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="bg-transparent text-vms-texto text-sm font-semibold outline-none border-b border-transparent focus:border-vms-primaria/30 transition-colors min-w-0 max-w-[200px] truncate" />
        </div>

        <div className="flex-1" />

        {/* Toggle barra esquerda */}
        <button onClick={() => setLeftPanelOpen(!leftPanelOpen)} className={`flex items-center justify-center w-8 h-8 rounded-[8px] transition-all cursor-pointer shrink-0 ${leftPanelOpen ? "bg-vms-primaria text-black" : "text-vms-muted hover:text-vms-texto hover:bg-vms-card"}`} title={leftPanelOpen ? "Fechar seções" : "Abrir seções"}>
          {leftPanelOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>

        {/* Dispositivos */}
        <div className="flex items-center gap-1 bg-vms-card/60 rounded-[8px] p-0.5 shrink-0">
          {([{ key: "desktop" as DeviceType, icon: Monitor, label: "Desktop" }, { key: "tablet" as DeviceType, icon: Tablet, label: "Tablet" }, { key: "mobile" as DeviceType, icon: Smartphone, label: "Mobile" }]).map((d) => {
            const Icon = d.icon;
            return (<button key={d.key} onClick={() => setDevice(d.key)} className={`flex items-center justify-center w-7 h-6 rounded-[6px] transition-all cursor-pointer ${device === d.key ? "bg-vms-primaria text-black" : "text-vms-muted hover:text-vms-texto hover:bg-white/5"}`} title={d.label}><Icon size={14} /></button>);
          })}
        </div>

        <div className="h-5 w-px bg-vms-borda shrink-0" />

        {/* Toggle edição inline */}
        <button onClick={editingInline ? disableInlineEditing : enableInlineEditing} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer shrink-0 ${editingInline ? "bg-vms-primaria text-black" : "bg-vms-card text-vms-texto-2 hover:bg-vms-dark-3 hover:text-vms-texto"}`}>
          <MousePointer2 size={14} /> {editingInline ? "Editando..." : "Editar"}
        </button>

        {undoHistory.length > 0 && (
          <button onClick={handleMultiUndo} className="flex items-center gap-1.5 px-2 py-1.5 rounded-[8px] bg-vms-card text-vms-texto-2 text-xs font-medium hover:bg-vms-dark-3 hover:text-vms-texto transition-all cursor-pointer shrink-0"><Undo2 size={14} />Desfazer</button>
        )}

        <button onClick={handleSave} disabled={saving} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer shrink-0 ${saving ? "bg-vms-primaria/20 text-vms-primaria/60 cursor-not-allowed" : "bg-vms-card text-vms-texto-2 hover:bg-vms-dark-3 hover:text-vms-texto"}`}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}{saving ? "Salvando..." : "Salvar"}
        </button>

        <button onClick={handlePreview} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-vms-card text-vms-texto-2 text-xs font-medium hover:bg-vms-dark-3 hover:text-vms-texto transition-all cursor-pointer shrink-0"><ExternalLink size={14} />Preview</button>
        <button onClick={handleImageUploadInIframe} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-vms-card text-vms-texto-2 text-xs font-medium hover:bg-vms-dark-3 hover:text-vms-texto transition-all cursor-pointer shrink-0" title="Upload de imagem"><ImagePlus size={14} />Imagem</button>

        <button onClick={handlePublish} disabled={publishing} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer shrink-0 ${sitePublished ? "bg-vms-primaria/20 text-vms-primaria hover:bg-vms-primaria/30" : "bg-vms-primaria text-black hover:brightness-110"} ${publishing ? "opacity-60 cursor-not-allowed" : ""}`}>
          {publishing ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}{publishing ? "..." : sitePublished ? "Publicado" : "Publicar"}
        </button>

        <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className="flex items-center justify-center w-8 h-8 rounded-[8px] text-vms-muted hover:text-vms-texto hover:bg-vms-card transition-all cursor-pointer shrink-0" title={rightPanelOpen ? "Fechar painel" : "Abrir configurações"}>
          {rightPanelOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </button>
      </div>

      {/* ═══════ CONTEÚDO PRINCIPAL ═══════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ════ BARRA ESQUERDA: SEÇÕES ════ */}
        {leftPanelOpen && (
          <div className="w-[260px] shrink-0 border-r border-vms-borda bg-vms-sidebar flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-vms-borda">
              <h3 className="text-xs font-semibold text-vms-texto uppercase tracking-wider flex items-center gap-2">
                <Layout size={13} className="text-vms-primaria" />Seções do Site
              </h3>
              <p className="text-[10px] text-vms-muted mt-1">Clique para navegar • Arraste para reordenar</p>
            </div>
            <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
              {sections.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Layout size={24} className="text-vms-muted/30 mx-auto mb-2" />
                  <p className="text-vms-muted text-xs">Nenhuma seção detectada</p>
                  <p className="text-vms-dark-5 text-[10px] mt-1">O site precisa ter HTML gerado</p>
                </div>
              ) : (
                <div className="space-y-0.5 px-2">
                  {sections.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-left transition-all cursor-pointer group ${
                        activeSectionId === sec.id
                          ? "bg-vms-primaria/10 text-vms-primaria border border-vms-primaria/20"
                          : "text-vms-texto-2 hover:bg-white/[0.03] hover:text-vms-texto border border-transparent"
                      }`}
                    >
                      <span className={`shrink-0 ${activeSectionId === sec.id ? "text-vms-primaria" : "text-vms-muted group-hover:text-vms-texto"}`}>{sec.icon}</span>
                      <span className={`flex-1 text-xs font-medium truncate ${!sec.visible ? "opacity-40 line-through" : ""}`}>{sec.label}</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); moveSection(sec.id, "up"); }} className="p-0.5 rounded text-vms-muted hover:text-vms-primaria cursor-pointer" title="Mover acima"><ArrowUp size={10} /></button>
                        <button onClick={(e) => { e.stopPropagation(); moveSection(sec.id, "down"); }} className="p-0.5 rounded text-vms-muted hover:text-vms-primaria cursor-pointer" title="Mover abaixo"><ArrowDown size={10} /></button>
                        <button onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(sec.id); }} className={`p-0.5 rounded cursor-pointer ${sec.visible ? "text-vms-muted hover:text-vms-primaria" : "text-red-400 hover:text-vms-primaria"}`} title={sec.visible ? "Ocultar seção" : "Mostrar seção"}>{sec.visible ? <Eye size={10} /> : <EyeOff size={10} />}</button>
                      </div>
                      <GripVertical size={11} className="text-vms-dark-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Info da seção ativa */}
            {activeSectionId && (
              <div className="border-t border-vms-borda p-3 bg-vms-dark-1/50">
                <p className="text-[10px] text-vms-muted leading-relaxed">
                  Selecione uma seção à esquerda para visualizá-la no canvas. Com a edição inline ativada, clique diretamente no texto para editar.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ════ CENTRO: CANVAS ════ */}
        <div className="flex-1 flex flex-col overflow-hidden bg-vms-fundo relative">
          {/* Indicador de edição inline */}
          {editingInline && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-1.5 rounded-full bg-vms-primaria/95 text-black text-xs font-semibold shadow-lg shadow-vms-primaria/20 backdrop-blur-sm">
              <MousePointer2 size={12} />
              Modo Edição Ativo — clique em qualquer texto para editar
              <button onClick={disableInlineEditing} className="ml-2 w-5 h-5 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors cursor-pointer">&times;</button>
            </div>
          )}

          <div className={`flex-1 overflow-auto p-6 flex justify-center items-start ${editingInline ? "pt-14" : ""}`} style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 relative" style={{ width: DEVICE_SIZES[device].width, maxWidth: "100%", minHeight: device === "desktop" ? "100%" : DEVICE_SIZES[device].height }}>
              {htmlGerado ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={htmlGerado}
                  className="w-full border-0"
                  style={{ height: device === "desktop" ? "100%" : DEVICE_SIZES[device].height }}
                  title="Editor StartEngine — Preview ao vivo"
                  sandbox="allow-scripts allow-same-origin"
                  onLoad={() => {
                    if (editingInline) {
                      // Re-habilitar edição quando HTML muda
                      setTimeout(() => enableInlineEditing(), 100);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-vms-dark-1" style={{ minHeight: "400px" }}>
                  <div className="text-center px-8">
                    <Globe size={48} className="text-vms-muted/30 mx-auto mb-3" />
                    <p className="text-vms-muted text-sm font-medium">Nenhum HTML gerado ainda</p>
                    <p className="text-vms-muted/60 text-xs mt-1 mb-4">Use a IA para gerar ou editar o site</p>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-vms-dark-5">
                      <span className="px-2 py-1 rounded bg-white/5">Nav</span>
                      <span className="text-vms-muted">→</span>
                      <span className="px-2 py-1 rounded bg-white/5">Hero</span>
                      <span className="text-vms-muted">→</span>
                      <span className="px-2 py-1 rounded bg-white/5">Serviços</span>
                      <span className="text-vms-muted">→</span>
                      <span className="px-2 py-1 rounded bg-white/5">CTA</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════ BARRA DIREITA: CONFIGS + IA ════ */}
        {rightPanelOpen && (
          <div className="w-[340px] shrink-0 border-l border-vms-borda bg-vms-sidebar flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
            {/* Favicon & Logo */}
            <details className="group">
              <summary className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-vms-texto hover:bg-white/[0.02] transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <Image size={14} className="text-vms-primaria shrink-0" />
                <span className="flex-1">Favicon & Logo</span>
                <ChevronDown size={14} className="text-vms-muted transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-4 pb-4 flex flex-col gap-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-vms-texto-2">Favicon</label>
                  <div className="flex items-center gap-2">
                    {faviconUrl && (
                      <img src={faviconUrl} alt="Favicon" className="w-7 h-7 rounded border border-white/10 object-contain shrink-0 bg-white/5" />
                    )}
                    <input type="text" value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} placeholder="URL da imagem ou faça upload" className="flex-1 border bg-white/5 rounded-[6px] px-3 py-2 text-xs text-vms-texto outline-none border-white/5 focus:border-vms-primaria" />
                    <button onClick={() => handleImageUpload(setFaviconUrl)} className="flex items-center justify-center w-8 h-8 rounded-[6px] bg-vms-card text-vms-muted hover:text-vms-texto hover:bg-vms-dark-3 transition-all cursor-pointer shrink-0" title="Upload de imagem"><Upload size={13} /></button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-vms-texto-2">Logo</label>
                  <div className="flex items-center gap-2">
                    {logoUrl && (
                      <img src={logoUrl} alt="Logo" className="w-10 h-7 rounded border border-white/10 object-contain shrink-0 bg-white/5 p-0.5" />
                    )}
                    <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="URL da imagem ou faça upload" className="flex-1 border bg-white/5 rounded-[6px] px-3 py-2 text-xs text-vms-texto outline-none border-white/5 focus:border-vms-primaria" />
                    <button onClick={() => handleImageUpload(setLogoUrl)} className="flex items-center justify-center w-8 h-8 rounded-[6px] bg-vms-card text-vms-muted hover:text-vms-texto hover:bg-vms-dark-3 transition-all cursor-pointer shrink-0" title="Upload de imagem"><Upload size={13} /></button>
                  </div>
                </div>
                <button onClick={handleGerarFaviconLogo} disabled={gerandoFaviconLogo || !companyName} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] bg-vms-primaria/10 text-vms-primaria text-xs font-medium hover:bg-vms-primaria/20 transition-all cursor-pointer disabled:opacity-50">
                  {gerandoFaviconLogo ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="text-yellow-400" />}
                  {gerandoFaviconLogo ? "Gerando..." : "Gerar Favicon & Logo com IA"}
                </button>
                {!companyName && <p className="text-[9px] text-vms-muted">Preencha o nome da empresa para gerar com IA</p>}
              </div>
            </details>

            {/* SEO */}
            <details open className="group">
              <summary className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-vms-texto hover:bg-white/[0.02] transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <FileText size={14} className="text-vms-primaria shrink-0" />
                <span className="flex-1 flex items-center gap-1.5">SEO<Sparkles size={12} className="text-yellow-400" /></span>
                <ChevronDown size={14} className="text-vms-muted transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-4 pb-4 flex flex-col gap-3">
                <button onClick={handleGerarSEO} disabled={gerandoSeo} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] bg-vms-primaria/10 text-vms-primaria text-xs font-medium hover:bg-vms-primaria/20 transition-all cursor-pointer disabled:opacity-50">{gerandoSeo ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}{gerandoSeo ? "Gerando SEO..." : "Gerar SEO com IA"}</button>
                <div><label className="mb-1 block text-[11px] font-medium text-vms-texto-2 flex items-center gap-1">Título<Sparkles size={11} className="text-yellow-400/70" /></label><input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Título SEO" className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto placeholder:text-vms-dark-5 outline-none border-white/5 focus:border-vms-primaria" /></div>
                <div><label className="mb-1 block text-[11px] font-medium text-vms-texto-2 flex items-center gap-1">Descrição<Sparkles size={11} className="text-yellow-400/70" /></label><textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Meta description..." rows={2} className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto placeholder:text-vms-dark-5 outline-none resize-y border-white/5 focus:border-vms-primaria min-h-[60px]" /></div>
                <div><label className="mb-1 block text-[11px] font-medium text-vms-texto-2 flex items-center gap-1">Keywords<Sparkles size={11} className="text-yellow-400/70" /></label><input type="text" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="palavra1, palavra2" className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto placeholder:text-vms-dark-5 outline-none border-white/5 focus:border-vms-primaria" /></div>
              </div>
            </details>

              {/* Cores / Identidade */}
              <details open className="group">
                <summary className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-vms-texto hover:bg-white/[0.02] transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden border-t border-vms-borda">
                  <Palette size={14} className="text-vms-primaria shrink-0" />
                  <span className="flex-1">Identidade Visual</span>
                  <ChevronDown size={14} className="text-vms-muted transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {/* Fonte */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-vms-texto-2 flex items-center gap-1.5"><Type size={11} />Fonte do Site</label>
                    <div className="flex items-center gap-2">
                      <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)} className="flex-1 border bg-white/5 rounded-[6px] px-3 py-2 text-xs text-vms-texto outline-none border-white/5 focus:border-vms-primaria appearance-none cursor-pointer" style={{ fontFamily: selectedFont }}>
                        {GOOGLE_FONTS.map((f) => (
                          <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                        ))}
                      </select>
                      <button onClick={applyFontToHtml} className="flex items-center justify-center w-8 h-8 rounded-[6px] bg-vms-primaria/10 text-vms-primaria hover:bg-vms-primaria/20 transition-all cursor-pointer shrink-0" title="Aplicar fonte ao site"><Check size={13} /></button>
                    </div>
                    <p className="text-[9px] text-vms-dark-5 mt-1">Clique em ✓ para aplicar ao HTML</p>
                  </div>

                  <div><label className="mb-1 block text-[11px] font-medium text-vms-texto-2">Cor Primária</label><div className="flex items-center gap-2"><input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-9 h-9 rounded-[6px] border border-white/10 cursor-pointer bg-transparent p-0.5 shrink-0" /><input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 border bg-white/5 rounded-[6px] px-3 py-2 text-xs text-vms-texto outline-none border-white/5 focus:border-vms-primaria font-mono" /></div></div>
                  <div><label className="mb-1 block text-[11px] font-medium text-vms-texto-2">Cor Secundária</label><div className="flex items-center gap-2"><input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-9 h-9 rounded-[6px] border border-white/10 cursor-pointer bg-transparent p-0.5 shrink-0" /><input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="flex-1 border bg-white/5 rounded-[6px] px-3 py-2 text-xs text-vms-texto outline-none border-white/5 focus:border-vms-primaria font-mono" /></div></div>
                  <div><label className="mb-1 block text-[11px] font-medium text-vms-texto-2">Tema</label><div className="flex gap-2"><button onClick={() => setThemeMode("dark")} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${themeMode === "dark" ? "bg-vms-primaria text-black" : "bg-vms-card text-vms-muted hover:text-vms-texto"}`}><Moon size={12} />Escuro</button><button onClick={() => setThemeMode("light")} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${themeMode === "light" ? "bg-vms-primaria text-black" : "bg-vms-card text-vms-muted hover:text-vms-texto"}`}><Sun size={12} />Claro</button></div></div>

                  {/* Presets de paleta */}
                  <div className="border-t border-white/5 pt-3">
                    <label className="mb-2 block text-[11px] font-medium text-vms-texto-2 flex items-center gap-1.5"><Sparkles size={11} className="text-yellow-400/70" />Sugestões de Paleta</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {COLOR_PALETTES.map((palette) => (
                        <button
                          key={palette.name}
                          onClick={() => { setPrimaryColor(palette.primary); setSecondaryColor(palette.secondary); showToast(`Paleta "${palette.name}" aplicada!`, "success"); }}
                          className={`flex flex-col items-center gap-1 p-1.5 rounded-[6px] transition-all cursor-pointer hover:bg-white/5 ${primaryColor === palette.primary && secondaryColor === palette.secondary ? "ring-1 ring-vms-primaria" : ""}`}
                          title={palette.name}
                        >
                          <div className="flex rounded-full overflow-hidden w-full h-4">
                            <div style={{ backgroundColor: palette.primary, width: "50%", height: "100%" }} />
                            <div style={{ backgroundColor: palette.secondary, width: "50%", height: "100%" }} />
                          </div>
                          <span className="text-[8px] text-vms-dark-5 leading-none">{palette.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={applyColorsToHtml} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] bg-vms-primaria/10 text-vms-primaria text-xs font-medium hover:bg-vms-primaria/20 transition-all cursor-pointer"><Palette size={12} />Aplicar cores ao site</button>
                  <div className="border-t border-white/5 pt-3">
                    <label className="mb-1.5 block text-[11px] font-semibold text-vms-primaria flex items-center gap-1.5"><Camera size={12} />Extrair Cores de Referência</label>
                    <p className="text-[10px] text-vms-muted mb-2 leading-relaxed">Cole a URL de um site ou Instagram para capturar as cores da identidade visual automaticamente.</p>
                    <div className="flex items-center gap-2"><input type="text" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://site.com ou @instagram" className="flex-1 border bg-white/5 rounded-[6px] px-3 py-2 text-xs text-vms-texto outline-none border-white/5 focus:border-vms-primaria" /><button onClick={handleExtractColors} disabled={extractingColors} className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] bg-vms-primaria text-black text-xs font-semibold hover:brightness-110 transition-all cursor-pointer shrink-0 disabled:opacity-50">{extractingColors ? <Loader2 size={14} className="animate-spin" /> : <><Camera size={12} />Extrair</>}</button></div>
                  </div>
                </div>
              </details>

              {/* Conteúdo */}
              <details className="group">
                <summary className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-vms-texto hover:bg-white/[0.02] transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden border-t border-vms-borda">
                  <FileText size={14} className="text-vms-primaria shrink-0" />
                  <span className="flex-1">Conteúdo</span>
                  <ChevronDown size={14} className="text-vms-muted transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4 flex flex-col gap-3">
                  <div><label className="mb-1 block text-[11px] font-medium text-vms-texto-2">Nome da Empresa</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nome da empresa" className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto placeholder:text-vms-dark-5 outline-none border-white/5 focus:border-vms-primaria" /></div>
                  <div><label className="mb-1 block text-[11px] font-medium text-vms-texto-2 flex items-center gap-1.5">Descrição<button onClick={handleGerarDescricao} disabled={gerandoDescricao} className="text-vms-primaria hover:text-vms-primaria-bright transition-colors cursor-pointer disabled:opacity-50">{gerandoDescricao ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}</button></label><textarea value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} placeholder="Descrição da empresa..." rows={2} className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto placeholder:text-vms-dark-5 outline-none resize-y border-white/5 focus:border-vms-primaria min-h-[60px]" /></div>

                  {/* Redes Sociais */}
                  <div className="border-t border-white/5 pt-3">
                    <label className="mb-2 block text-[11px] font-semibold text-vms-texto-2 uppercase tracking-wider">Redes Sociais</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-[10px] font-medium text-vms-texto-2 flex items-center gap-1"><Camera size={11} className="text-pink-400" />Instagram</label>
                        <input type="text" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} placeholder="@usuario" className="w-full border bg-white/5 rounded-[6px] px-2.5 py-1.5 text-xs text-vms-texto placeholder:text-vms-dark-5 outline-none border-white/5 focus:border-vms-primaria" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-medium text-vms-texto-2 flex items-center gap-1"><Link2 size={11} className="text-blue-400" />Facebook</label>
                        <input type="text" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="URL da página" className="w-full border bg-white/5 rounded-[6px] px-2.5 py-1.5 text-xs text-vms-texto placeholder:text-vms-dark-5 outline-none border-white/5 focus:border-vms-primaria" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-medium text-vms-texto-2 flex items-center gap-1"><MessageSquare size={11} className="text-sky-400" />X / Twitter</label>
                        <input type="text" value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@usuario" className="w-full border bg-white/5 rounded-[6px] px-2.5 py-1.5 text-xs text-vms-texto placeholder:text-vms-dark-5 outline-none border-white/5 focus:border-vms-primaria" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-medium text-vms-texto-2 flex items-center gap-1"><MonitorPlay size={11} className="text-red-400" />YouTube</label>
                        <input type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="URL do canal" className="w-full border bg-white/5 rounded-[6px] px-2.5 py-1.5 text-xs text-vms-texto placeholder:text-vms-dark-5 outline-none border-white/5 focus:border-vms-primaria" />
                      </div>
                    </div>
                  </div>

                  <div><label className="mb-1 block text-[11px] font-medium text-vms-texto-2">WhatsApp</label><input type="text" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="11999999999" className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto placeholder:text-vms-dark-5 outline-none border-white/5 focus:border-vms-primaria" /></div>
                  <div><label className="mb-1 block text-[11px] font-medium text-vms-texto-2 flex items-center gap-1"><MapPin size={12} />Endereço</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua Exemplo, 123 - Cidade" className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto placeholder:text-vms-dark-5 outline-none border-white/5 focus:border-vms-primaria" /></div>
                </div>
              </details>

              {/* Versões / Histórico */}
              <details className="group">
                <summary className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-vms-texto hover:bg-white/[0.02] transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden border-t border-vms-borda">
                  <History size={14} className="text-vms-primaria shrink-0" />
                  <span className="flex-1">Versões</span>
                  {versions.length > 0 && (
                    <span className="rounded-[20px] px-[7px] py-[2px] text-[9px] font-bold bg-vms-primaria-dim text-vms-primaria border border-vms-primaria-border">{versions.length}</span>
                  )}
                  <ChevronDown size={14} className="text-vms-muted transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4 flex flex-col gap-2">
                  <p className="text-[10px] text-vms-muted leading-relaxed">Cada vez que você salva, a versão anterior é guardada. Restaure qualquer versão a qualquer momento.</p>
                  {versions.length === 0 ? (
                    <div className="text-center py-4">
                      <History size={20} className="text-vms-muted/30 mx-auto mb-2" />
                      <p className="text-vms-muted text-xs">Nenhuma versão salva ainda</p>
                      <p className="text-vms-dark-5 text-[10px] mt-1">Salve o site para criar o primeiro snapshot</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[280px] overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
                      {versions.map((v) => {
                        const date = new Date(v.timestamp);
                        const timeStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                        return (
                          <div key={v.id} className="flex items-center gap-2 p-2.5 rounded-[8px] bg-vms-dark-1/50 border border-white/[0.03] hover:border-vms-primaria/20 transition-all group/ver">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-vms-texto truncate">{v.label}</p>
                              <p className="text-[10px] text-vms-muted">{timeStr}</p>
                            </div>
                            <button
                              onClick={() => handleRestoreVersion(v)}
                              disabled={restoringVersion}
                              className="p-1.5 rounded-[6px] text-vms-muted hover:text-vms-primaria hover:bg-vms-primaria/10 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                              title="Restaurar esta versão"
                            >
                              <RotateCcw size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteVersion(v.id)}
                              className="p-1.5 rounded-[6px] text-vms-muted hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer shrink-0 opacity-0 group-hover/ver:opacity-100"
                              title="Remover versão"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </details>

              {/* CSS Customizado */}
              <details className="group" open={showCssEditor}>
                <summary onClick={() => setShowCssEditor(!showCssEditor)} className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-vms-texto hover:bg-white/[0.02] transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden border-t border-vms-borda">
                  <Code size={14} className="text-vms-primaria shrink-0" />
                  <span className="flex-1">CSS Customizado</span>
                  <ChevronDown size={14} className="text-vms-muted transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4 flex flex-col gap-3">
                  <p className="text-[10px] text-vms-muted leading-relaxed">Adicione CSS customizado para personalizar além das opções visuais. As alterações são aplicadas em tempo real no preview.</p>
                  <textarea
                    value={customCss}
                    onChange={(e) => setCustomCss(e.target.value)}
                    placeholder="/* Exemplo: */
.hero h1 { font-size: 3rem; }
.cta-button { border-radius: 50px; }"
                    rows={6}
                    className="w-full border bg-vms-dark-1 rounded-[8px] px-3 py-2 text-xs text-vms-primaria font-mono placeholder:text-vms-dark-5 outline-none resize-y border-white/5 focus:border-vms-primaria min-h-[100px]"
                  />
                  <button onClick={applyCustomCss} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] bg-vms-primaria/10 text-vms-primaria text-xs font-medium hover:bg-vms-primaria/20 transition-all cursor-pointer"><Code size={12} />Aplicar CSS</button>
                </div>
              </details>

              {/* Domínio */}
              <details className="group">
                <summary className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-vms-texto hover:bg-white/[0.02] transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden border-t border-vms-borda">
                  <Globe size={14} className="text-vms-primaria shrink-0" />
                  <span className="flex-1">Domínio</span>
                  <ChevronDown size={14} className="text-vms-muted transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4 flex flex-col gap-3">
                  <div><label className="mb-1 block text-[11px] font-medium text-vms-texto-2">Domínio personalizado</label><input type="text" value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="www.seusite.com.br" className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto placeholder:text-vms-dark-5 outline-none border-white/5 focus:border-vms-primaria" /></div>
                  <button onClick={handleConfigureDomain} disabled={configuringDomain} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] bg-vms-primaria/10 text-vms-primaria text-xs font-medium hover:bg-vms-primaria/20 transition-all cursor-pointer disabled:opacity-50">{configuringDomain ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}{configuringDomain ? "Configurando..." : "Salvar domínio"}</button>
                  {showDnsInstructions && (
                    <div className="bg-vms-primaria/5 border border-vms-primaria/10 rounded-[8px] p-3">
                      <div className="flex items-center gap-1.5 mb-2"><Info size={12} className="text-vms-primaria" /><span className="text-vms-primaria text-xs font-medium">Instruções DNS</span></div>
                      <p className="text-vms-texto-2 text-xs leading-relaxed mb-2">Configure um registro CNAME:</p>
                      <div className="bg-vms-dark-1 rounded-[6px] p-2 mb-2"><code className="text-vms-primaria text-xs">CNAME → cname.startzy.com.br</code></div>
                      <button onClick={async () => { await navigator.clipboard.writeText("cname.startzy.com.br"); showToast("Copiado!", "success"); }} className="flex items-center gap-1 text-vms-primaria text-xs hover:underline cursor-pointer"><Copy size={10} />Copiar destino</button>
                    </div>
                  )}
                </div>
              </details>
            </div>

            {/* ════ CHAT IA (base da barra direita) ════ */}
            <div className="shrink-0 border-t border-vms-borda">
              <div className="px-4 py-2 flex items-center gap-2 border-b border-vms-borda/50">
                <MessageSquare size={13} className="text-vms-primaria" />
                <span className="text-xs font-semibold text-vms-texto">StartEngine AI</span>
                <span className="text-[9px] text-vms-muted ml-auto">Edite com comandos</span>
              </div>
              <div className="max-h-[260px] overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
                {chatMessages.length === 0 && (
                  <div className="text-center py-3">
                    <Sparkles size={18} className="text-vms-primaria/30 mx-auto mb-1.5" />
                    <p className="text-vms-muted text-[11px]">Peça à IA para modificar o site</p>
                    <p className="text-vms-dark-5 text-[9px] mt-0.5">&quot;Mude a cor do botão para azul&quot;</p>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`max-w-[90%] rounded-[10px] px-2.5 py-1.5 text-[11px] leading-relaxed ${msg.role === "user" ? "bg-vms-primaria text-black" : "bg-vms-card text-vms-texto-2"}`}>{msg.content}</div>
                    {msg.html && (<button onClick={applyPendingHtml} className="flex items-center gap-1 px-2 py-1 rounded-[6px] bg-vms-primaria/10 text-vms-primaria text-[10px] font-medium hover:bg-vms-primaria/20 transition-all cursor-pointer self-start"><Check size={10} />Aplicar mudança</button>)}
                  </div>
                ))}
                {chatLoading && <div className="flex items-center gap-1.5 text-vms-muted text-xs"><Loader2 size={12} className="animate-spin" />Processando...</div>}
                <div ref={chatEndRef} />
              </div>
              <div className="p-2 border-t border-vms-borda/50">
                <div className="flex items-center gap-1.5">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }} placeholder="Ex: Mude hero para cor azul..." className="flex-1 border bg-white/5 rounded-[8px] px-3 py-2 text-xs text-vms-texto outline-none border-white/5 focus:border-vms-primaria" />
                  <button onClick={handleChatSend} disabled={chatLoading || !chatInput.trim()} className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-vms-primaria text-black hover:brightness-110 transition-all cursor-pointer shrink-0 disabled:opacity-40"><Send size={13} /></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <UpgradeModal open={upgradeModal.open} onClose={() => setUpgradeModal((prev) => ({ ...prev, open: false }))} titulo={upgradeModal.titulo} texto={upgradeModal.texto} feature={upgradeModal.feature} />
    </div>
  );
}
