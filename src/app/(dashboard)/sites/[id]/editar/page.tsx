"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Monitor,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Save,
  ExternalLink,
  Rocket,
  Settings,
  Plus,
  GripVertical,
  Sparkles,
  Check,
  X,
  Globe,
  Shield,
  Upload,
  Palette,
  Type,
  Layout,
  Code,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { fireConfetti } from "@/components/ui/Confetti";
import { useToast } from "@/components/ui/Toast";
import StartzyChat from "@/components/ui/StartzyChat";
import { createClient } from "@/lib/supabase/client";

interface SectionConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  visible: boolean;
  properties: PropertyField[];
}

interface PropertyField {
  key: string;
  label: string;
  type: "text" | "textarea" | "color" | "range" | "select";
  value: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  {
    id: "hero",
    name: "Hero",
    icon: <Sparkles size={16} />,
    visible: true,
    properties: [
      { key: "tag", label: "Tag", type: "text", value: "", placeholder: "Bem-vindo" },
      { key: "titulo", label: "Título", type: "text", value: "", placeholder: "Título principal" },
      { key: "descricao", label: "Descrição", type: "textarea", value: "", placeholder: "Descrição do hero..." },
      { key: "textoBotao", label: "Texto Botão", type: "text", value: "", placeholder: "Saiba Mais" },
      { key: "corFundo", label: "Cor Fundo", type: "color", value: "#0a0a0a" },
      { key: "corTexto", label: "Cor Texto", type: "color", value: "#ffffff" },
      { key: "corBotao", label: "Cor Botão", type: "color", value: "#AAFF00" },
      { key: "paddingVertical", label: "Padding Vertical", type: "range", value: "80", min: 40, max: 200, step: 10 },
    ],
  },
  {
    id: "sobre",
    name: "Sobre",
    icon: <Layout size={16} />,
    visible: true,
    properties: [
      { key: "titulo", label: "Título", type: "text", value: "", placeholder: "Sobre Nós" },
      { key: "texto", label: "Texto", type: "textarea", value: "", placeholder: "Texto sobre a empresa..." },
      { key: "corFundo", label: "Cor Fundo", type: "color", value: "#111111" },
    ],
  },
  {
    id: "servicos",
    name: "Serviços",
    icon: <Globe size={16} />,
    visible: true,
    properties: [
      { key: "titulo", label: "Título", type: "text", value: "", placeholder: "Nossos Serviços" },
      { key: "corFundo", label: "Cor Fundo", type: "color", value: "#0a0a0a" },
      { key: "corCards", label: "Cor Cards", type: "color", value: "#1a1a1a" },
    ],
  },
  {
    id: "depoimentos",
    name: "Depoimentos",
    icon: <Type size={16} />,
    visible: true,
    properties: [
      { key: "titulo", label: "Título", type: "text", value: "", placeholder: "Depoimentos" },
      { key: "corFundo", label: "Cor Fundo", type: "color", value: "#111111" },
    ],
  },
  {
    id: "galeria",
    name: "Galeria",
    icon: <Upload size={16} />,
    visible: true,
    properties: [
      { key: "titulo", label: "Título", type: "text", value: "", placeholder: "Galeria" },
      { key: "imagem1", label: "Image URL 1", type: "text", value: "", placeholder: "https://..." },
      { key: "imagem2", label: "Image URL 2", type: "text", value: "", placeholder: "https://..." },
      { key: "imagem3", label: "Image URL 3", type: "text", value: "", placeholder: "https://..." },
      { key: "colunas", label: "Colunas", type: "select", value: "3", options: [
        { value: "2", label: "2 Colunas" },
        { value: "3", label: "3 Colunas" },
        { value: "4", label: "4 Colunas" },
      ]},
    ],
  },
  {
    id: "contato",
    name: "Contato",
    icon: <Globe size={16} />,
    visible: true,
    properties: [
      { key: "titulo", label: "Título", type: "text", value: "", placeholder: "Entre em Contato" },
      { key: "descricao", label: "Descrição", type: "textarea", value: "", placeholder: "Fale conosco..." },
      { key: "textoBotao", label: "Texto Botão", type: "text", value: "", placeholder: "Enviar" },
      { key: "corFundo", label: "Cor Fundo", type: "color", value: "#0a0a0a" },
      { key: "corBotao", label: "Cor Botão", type: "color", value: "#AAFF00" },
    ],
  },
  {
    id: "rodape",
    name: "Rodapé",
    icon: <Code size={16} />,
    visible: true,
    properties: [
      { key: "marca", label: "Marca", type: "text", value: "", placeholder: "Nome da empresa" },
      { key: "texto", label: "Texto", type: "textarea", value: "", placeholder: "Todos os direitos reservados" },
      { key: "corFundo", label: "Cor Fundo", type: "color", value: "#050505" },
      { key: "corMarca", label: "Cor Marca", type: "color", value: "#AAFF00" },
    ],
  },
];

type DeviceType = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<DeviceType, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

const FONT_FAMILIES = [
  { value: "Inter", label: "Inter" },
  { value: "Poppins", label: "Poppins" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Lato", label: "Lato" },
  { value: "Raleway", label: "Raleway" },
  { value: "Playfair Display", label: "Playfair Display" },
];

const BUTTON_STYLES = [
  { value: "rounded", label: "Arredondado" },
  { value: "pill", label: "Pílula" },
  { value: "square", label: "Quadrado" },
];

export default function EditarSitePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const id = params.id as string;

  const [siteName, setSiteName] = useState("");
  const [siteSlug, setSiteSlug] = useState("");
  const [sitePublished, setSitePublished] = useState(false);
  const [loading, setLoading] = useState(true);

  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [activeSection, setActiveSection] = useState("hero");
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [zoom, setZoom] = useState(100);
  const [saved, setSaved] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"dominio" | "painel" | "personalizacao">("dominio");

  const [customDomain, setCustomDomain] = useState("");
  const [dnsVerified, setDnsVerified] = useState(false);
  const [sslActive, setSslActive] = useState(false);

  const [clientLogo, setClientLogo] = useState<string | null>(null);
  const [clientPrimaryColor, setClientPrimaryColor] = useState("#AAFF00");
  const [clientCompanyName, setClientCompanyName] = useState("");
  const [clientPanelUrl, setClientPanelUrl] = useState("");
  const [clientPanelActive, setClientPanelActive] = useState(false);
  const [clientInvoicePrefix, setClientInvoicePrefix] = useState("VMS");

  const [themeColors, setThemeColors] = useState({
    primaria: "#AAFF00",
    secundaria: "#1E40AF",
    fundo: "#0a0a0a",
    card: "#111111",
    texto: "#ffffff",
  });
  const [themeFont, setThemeFont] = useState("Inter");
  const [themeButtonStyle, setThemeButtonStyle] = useState("rounded");
  const [themeSpacing, setThemeSpacing] = useState(16);
  const [customCss, setCustomCss] = useState("");

  const fetchSite = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sites")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      setLoading(false);
      return;
    }

    setSiteName(data.nome_site || "");
    setSiteSlug(data.slug || "");
    setSitePublished(data.publicado || false);

    if (data.dados_json) {
      const dj = data.dados_json as Record<string, unknown>;
      if (dj.cor_primaria) {
        setThemeColors((prev) => ({ ...prev, primaria: dj.cor_primaria as string }));
        setClientPrimaryColor(dj.cor_primaria as string);
      }
      if (dj.cor_secundaria) {
        setThemeColors((prev) => ({ ...prev, secundaria: dj.cor_secundaria as string }));
      }
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchSite();
  }, [fetchSite]);

  function updateProperty(sectionId: string, key: string, value: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              properties: s.properties.map((p) =>
                p.key === key ? { ...p, value } : p
              ),
            }
          : s
      )
    );
  }

  function toggleVisibility(sectionId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      )
    );
  }

  function getPropertyValue(sectionId: string, key: string): string {
    const section = sections.find((s) => s.id === sectionId);
    const prop = section?.properties.find((p) => p.key === key);
    return prop?.value || "";
  }

  async function handleSave() {
    const supabase = createClient();
    const propertiesMap: Record<string, Record<string, string>> = {};
    sections.forEach((s) => {
      propertiesMap[s.id] = {};
      s.properties.forEach((p) => {
        propertiesMap[s.id][p.key] = p.value;
      });
    });

    await supabase
      .from("sites")
      .update({
        dados_json: {
          secoes: propertiesMap,
          tema: {
            cores: themeColors,
            fonte: themeFont,
            botao: themeButtonStyle,
            espacamento: themeSpacing,
            css_customizado: customCss,
          },
        },
      })
      .eq("id", id);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handlePublish() {
    fireConfetti();
    showToast("Site publicado com sucesso! 🚀", "success");
    setSitePublished(true);
  }

  function handlePreview() {
    window.open(`/s/${siteSlug}`, "_blank");
  }

  function zoomIn() {
    setZoom((prev) => Math.min(150, prev + 10));
  }

  function zoomOut() {
    setZoom((prev) => Math.max(50, prev - 10));
  }

  function renderPropertyField(field: PropertyField) {
    switch (field.type) {
      case "text":
        return (
          <div key={field.key} className="flex flex-col gap-1.5">
            <label className="text-vms-texto-2 text-xs font-medium">
              {field.label}
            </label>
            <input
              type="text"
              value={field.value}
              onChange={(e) => updateProperty(activeSection, field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto
                placeholder:text-vms-dark-5 outline-none transition-colors
                border-white/5 focus:border-vms-primaria"
            />
          </div>
        );

      case "textarea":
        return (
          <div key={field.key} className="flex flex-col gap-1.5">
            <label className="text-vms-texto-2 text-xs font-medium">
              {field.label}
            </label>
            <textarea
              value={field.value}
              onChange={(e) => updateProperty(activeSection, field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto
                placeholder:text-vms-dark-5 outline-none transition-colors resize-y min-h-[72px]
                border-white/5 focus:border-vms-primaria"
            />
          </div>
        );

      case "color":
        return (
          <div key={field.key} className="flex flex-col gap-1.5">
            <label className="text-vms-texto-2 text-xs font-medium">
              {field.label}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={field.value}
                onChange={(e) => updateProperty(activeSection, field.key, e.target.value)}
                className="w-9 h-9 rounded-[6px] border border-white/10 cursor-pointer bg-transparent p-0.5 shrink-0"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) => updateProperty(activeSection, field.key, e.target.value)}
                className="flex-1 border bg-white/5 rounded-[6px] px-3 py-2 text-xs text-vms-texto
                  font-mono outline-none transition-colors border-white/5 focus:border-vms-primaria"
              />
            </div>
          </div>
        );

      case "range":
        return (
          <div key={field.key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-vms-texto-2 text-xs font-medium">
                {field.label}
              </label>
              <span className="text-vms-primaria text-xs font-mono">{field.value}px</span>
            </div>
            <input
              type="range"
              value={field.value}
              onChange={(e) => updateProperty(activeSection, field.key, e.target.value)}
              min={field.min}
              max={field.max}
              step={field.step}
              className="w-full accent-vms-primaria h-1.5 rounded-full cursor-pointer"
            />
          </div>
        );

      case "select":
        return (
          <div key={field.key} className="flex flex-col gap-1.5">
            <label className="text-vms-texto-2 text-xs font-medium">
              {field.label}
            </label>
            <select
              value={field.value}
              onChange={(e) => updateProperty(activeSection, field.key, e.target.value)}
              className="w-full border bg-white/5 rounded-[8px] px-3 py-2 text-sm text-vms-texto
                outline-none transition-colors appearance-none cursor-pointer
                border-white/5 focus:border-vms-primaria"
            >
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  }

  function renderPreviewSection(section: SectionConfig) {
    if (!section.visible) return null;

    const isActive = activeSection === section.id;

    switch (section.id) {
      case "hero":
        return (
          <div
            key={section.id}
            data-section={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`relative cursor-pointer transition-all ${
              isActive ? "ring-2 ring-vms-primaria ring-offset-2 ring-offset-vms-fundo" : ""
            }`}
            style={{
              backgroundColor: getPropertyValue("hero", "corFundo"),
              padding: `${getPropertyValue("hero", "paddingVertical") || 80}px 24px`,
            }}
          >
            {isActive && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-vms-primaria text-black text-[10px] font-bold rounded-[4px] z-10">
                Hero
              </div>
            )}
            <div className="max-w-3xl mx-auto text-center">
              {getPropertyValue("hero", "tag") && (
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                  style={{
                    backgroundColor: `${getPropertyValue("hero", "corBotao")}20`,
                    color: getPropertyValue("hero", "corBotao"),
                  }}
                >
                  {getPropertyValue("hero", "tag")}
                </span>
              )}
              <h1
                className="text-3xl font-bold mb-4"
                style={{ color: getPropertyValue("hero", "corTexto") }}
              >
                {getPropertyValue("hero", "titulo") || "Título Principal"}
              </h1>
              <p
                className="text-base opacity-70 mb-6 max-w-xl mx-auto"
                style={{ color: getPropertyValue("hero", "corTexto") }}
              >
                {getPropertyValue("hero", "descricao") || "Descrição do seu negócio aparece aqui."}
              </p>
              <button
                className="px-6 py-2.5 rounded-lg font-semibold text-sm text-black"
                style={{ backgroundColor: getPropertyValue("hero", "corBotao") }}
              >
                {getPropertyValue("hero", "textoBotao") || "Saiba Mais"}
              </button>
            </div>
          </div>
        );

      case "sobre":
        return (
          <div
            key={section.id}
            data-section={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`relative cursor-pointer transition-all ${
              isActive ? "ring-2 ring-vms-primaria ring-offset-2 ring-offset-vms-fundo" : ""
            }`}
            style={{ backgroundColor: getPropertyValue("sobre", "corFundo"), padding: "60px 24px" }}
          >
            {isActive && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-vms-primaria text-black text-[10px] font-bold rounded-[4px] z-10">
                Sobre
              </div>
            )}
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                {getPropertyValue("sobre", "titulo") || "Sobre Nós"}
              </h2>
              <p className="text-sm text-white/60 leading-relaxed">
                {getPropertyValue("sobre", "texto") || "Conte a história da sua empresa e o que a torna única no mercado."}
              </p>
            </div>
          </div>
        );

      case "servicos":
        return (
          <div
            key={section.id}
            data-section={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`relative cursor-pointer transition-all ${
              isActive ? "ring-2 ring-vms-primaria ring-offset-2 ring-offset-vms-fundo" : ""
            }`}
            style={{ backgroundColor: getPropertyValue("servicos", "corFundo"), padding: "60px 24px" }}
          >
            {isActive && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-vms-primaria text-black text-[10px] font-bold rounded-[4px] z-10">
                Serviços
              </div>
            )}
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {getPropertyValue("servicos", "titulo") || "Nossos Serviços"}
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg p-4 text-center"
                    style={{ backgroundColor: getPropertyValue("servicos", "corCards") }}
                  >
                    <div className="w-10 h-10 rounded-full bg-vms-primaria/20 flex items-center justify-center mx-auto mb-3">
                      <Globe size={18} className="text-vms-primaria" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">Serviço {i}</h3>
                    <p className="text-xs text-white/50">Descrição do serviço</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "depoimentos":
        return (
          <div
            key={section.id}
            data-section={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`relative cursor-pointer transition-all ${
              isActive ? "ring-2 ring-vms-primaria ring-offset-2 ring-offset-vms-fundo" : ""
            }`}
            style={{ backgroundColor: getPropertyValue("depoimentos", "corFundo"), padding: "60px 24px" }}
          >
            {isActive && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-vms-primaria text-black text-[10px] font-bold rounded-[4px] z-10">
                Depoimentos
              </div>
            )}
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {getPropertyValue("depoimentos", "titulo") || "Depoimentos"}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-lg p-4 bg-white/5">
                    <p className="text-xs text-white/60 italic mb-3">&ldquo;Excelente trabalho, recomendo!&rdquo;</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-vms-primaria/20" />
                      <div>
                        <p className="text-xs font-semibold text-white">Cliente {i}</p>
                        <p className="text-[10px] text-white/40">Empresa {i}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "galeria":
        return (
          <div
            key={section.id}
            data-section={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`relative cursor-pointer transition-all ${
              isActive ? "ring-2 ring-vms-primaria ring-offset-2 ring-offset-vms-fundo" : ""
            }`}
            style={{ backgroundColor: "#0a0a0a", padding: "60px 24px" }}
          >
            {isActive && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-vms-primaria text-black text-[10px] font-bold rounded-[4px] z-10">
                Galeria
              </div>
            )}
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {getPropertyValue("galeria", "titulo") || "Galeria"}
              </h2>
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(${getPropertyValue("galeria", "colunas") || 3}, 1fr)`,
                }}
              >
                {[1, 2, 3].map((i) => {
                  const imgUrl = getPropertyValue("galeria", `imagem${i}`);
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-white/5 flex items-center justify-center overflow-hidden"
                    >
                      {imgUrl ? (
                        <img src={imgUrl} alt={`Imagem ${i}`} className="w-full h-full object-cover" />
                      ) : (
                        <Upload size={24} className="text-vms-muted/40" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "contato":
        return (
          <div
            key={section.id}
            data-section={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`relative cursor-pointer transition-all ${
              isActive ? "ring-2 ring-vms-primaria ring-offset-2 ring-offset-vms-fundo" : ""
            }`}
            style={{ backgroundColor: getPropertyValue("contato", "corFundo"), padding: "60px 24px" }}
          >
            {isActive && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-vms-primaria text-black text-[10px] font-bold rounded-[4px] z-10">
                Contato
              </div>
            )}
            <div className="max-w-lg mx-auto text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                {getPropertyValue("contato", "titulo") || "Entre em Contato"}
              </h2>
              <p className="text-sm text-white/50 mb-6">
                {getPropertyValue("contato", "descricao") || "Fale conosco para mais informações."}
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Seu nome"
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
                  readOnly
                />
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
                  readOnly
                />
                <button
                  className="w-full py-2.5 rounded-lg font-semibold text-sm text-black"
                  style={{ backgroundColor: getPropertyValue("contato", "corBotao") }}
                >
                  {getPropertyValue("contato", "textoBotao") || "Enviar"}
                </button>
              </div>
            </div>
          </div>
        );

      case "rodape":
        return (
          <div
            key={section.id}
            data-section={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`relative cursor-pointer transition-all ${
              isActive ? "ring-2 ring-vms-primaria ring-offset-2 ring-offset-vms-fundo" : ""
            }`}
            style={{ backgroundColor: getPropertyValue("rodape", "corFundo"), padding: "32px 24px" }}
          >
            {isActive && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-vms-primaria text-black text-[10px] font-bold rounded-[4px] z-10">
                Rodapé
              </div>
            )}
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <span
                className="text-sm font-bold"
                style={{ color: getPropertyValue("rodape", "corMarca") }}
              >
                {getPropertyValue("rodape", "marca") || "Sua Empresa"}
              </span>
              <span className="text-xs text-white/40">
                {getPropertyValue("rodape", "texto") || "© 2025 Todos os direitos reservados."}
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Editar Site">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-vms-primaria border-t-transparent rounded-full animate-spin" />
            <span className="text-vms-muted text-sm">Carregando editor...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const activeSectionData = sections.find((s) => s.id === activeSection);

  return (
    <DashboardLayout title="Editar Site">
      <div className="flex h-[calc(100vh-64px-48px)] -m-6 overflow-hidden">
        {/* Left Sidebar - Sections */}
        <div className="w-[260px] shrink-0 border-r border-vms-borda bg-vms-sidebar/80 backdrop-blur-xl flex flex-col">
          <div className="p-4 border-b border-vms-borda">
            <button
              onClick={() => router.push("/sites")}
              className="flex items-center gap-2 text-vms-muted text-sm hover:text-vms-texto transition-colors cursor-pointer mb-3"
            >
              <ArrowLeft size={16} />
              Voltar ao Dashboard
            </button>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${sitePublished ? "bg-vms-primaria" : "bg-vms-muted"}`} />
              <span className="text-vms-texto text-sm font-semibold truncate">{siteName}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2 scrollbar-none" style={{ scrollbarWidth: "none" }}>
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <div
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-all group
                    ${isActive
                      ? "bg-vms-primaria/5 border-l-2 border-vms-primaria"
                      : "border-l-2 border-transparent hover:bg-white/[0.02]"
                    }
                    ${!section.visible ? "opacity-40" : ""}
                  `}
                >
                  <GripVertical size={14} className="text-vms-muted/40 shrink-0 cursor-grab" />
                  <span className={`shrink-0 ${isActive ? "text-vms-primaria" : "text-vms-muted"}`}>
                    {section.icon}
                  </span>
                  <span className={`flex-1 text-sm ${isActive ? "text-vms-texto font-medium" : "text-vms-texto-2"}`}>
                    {section.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(section.id);
                    }}
                    className="shrink-0 text-vms-muted hover:text-vms-texto transition-colors cursor-pointer"
                  >
                    {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-vms-borda">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px]
              border border-dashed border-white/10 text-vms-muted text-sm
              hover:border-vms-primaria/30 hover:text-vms-primaria hover:bg-vms-primaria/5
              transition-all cursor-pointer">
              <Plus size={16} />
              Adicionar Seção
            </button>
          </div>
        </div>

        {/* Center - Preview Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-vms-fundo">
          {/* Topbar */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-vms-borda bg-vms-sidebar/60 backdrop-blur-xl shrink-0">
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="bg-transparent text-vms-texto text-sm font-semibold outline-none border-b border-transparent
                focus:border-vms-primaria/30 transition-colors w-40"
            />

            <div className="h-5 w-px bg-vms-borda" />

            <div className="flex items-center gap-1 bg-vms-card/60 rounded-[8px] p-0.5">
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
                    className={`flex items-center justify-center w-8 h-7 rounded-[6px] transition-all cursor-pointer
                      ${device === d.key
                        ? "bg-vms-primaria text-black"
                        : "text-vms-muted hover:text-vms-texto hover:bg-white/5"
                      }`}
                    title={d.label}
                  >
                    <Icon size={15} />
                  </button>
                );
              })}
            </div>

            <div className="h-5 w-px bg-vms-borda" />

            <div className="flex items-center gap-1">
              <button
                onClick={zoomOut}
                className="flex items-center justify-center w-7 h-7 rounded-[6px] text-vms-muted
                  hover:text-vms-texto hover:bg-white/5 transition-all cursor-pointer"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-vms-texto-2 text-xs font-mono w-10 text-center">{zoom}%</span>
              <button
                onClick={zoomIn}
                className="flex items-center justify-center w-7 h-7 rounded-[6px] text-vms-muted
                  hover:text-vms-texto hover:bg-white/5 transition-all cursor-pointer"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            <div className="flex-1" />

            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium
                transition-all cursor-pointer
                ${saved
                  ? "bg-vms-primaria/20 text-vms-primaria"
                  : "bg-vms-card text-vms-texto-2 hover:bg-vms-dark-3 hover:text-vms-texto"
                }`}
            >
              {saved ? <Check size={14} /> : <Save size={14} />}
              {saved ? "Salvo!" : "Salvar"}
            </button>

            <button
              onClick={handlePreview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-vms-card text-vms-texto-2
                text-xs font-medium hover:bg-vms-dark-3 hover:text-vms-texto transition-all cursor-pointer"
            >
              <ExternalLink size={14} />
              Preview
            </button>

            <button
              onClick={handlePublish}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-vms-primaria text-black
                text-xs font-semibold hover:brightness-110 transition-all cursor-pointer"
            >
              <Rocket size={14} />
              Publicar
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center justify-center w-8 h-8 rounded-[8px] text-vms-muted
                hover:text-vms-texto hover:bg-vms-card transition-all cursor-pointer"
            >
              <Settings size={16} />
            </button>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-auto p-6 flex justify-center"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.1) transparent",
            }}
          >
            <div
              className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300"
              style={{
                width: DEVICE_WIDTHS[device],
                maxWidth: "100%",
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            >
              <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
                {sections.map((section) => renderPreviewSection(section))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="w-[320px] shrink-0 border-l border-vms-borda bg-vms-sidebar/80 backdrop-blur-xl flex flex-col">
          {activeSectionData ? (
            <>
              <div className="p-4 border-b border-vms-borda">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[8px] bg-vms-primaria/10 flex items-center justify-center text-vms-primaria">
                    {activeSectionData.icon}
                  </div>
                  <div>
                    <h3 className="text-vms-texto text-sm font-semibold">{activeSectionData.name}</h3>
                    <p className="text-vms-muted text-[11px]">Propriedades da seção</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-none"
                style={{ scrollbarWidth: "none" }}
              >
                {activeSectionData.properties.map((field) => renderPropertyField(field))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Palette size={32} className="text-vms-muted/30 mx-auto mb-3" />
                <p className="text-vms-muted text-sm">Selecione uma seção</p>
                <p className="text-vms-muted/60 text-xs mt-1">Clique em uma seção para editar suas propriedades</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card-premium rounded-[16px] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col !hover:transform-none !hover:shadow-none">
            <div className="flex items-center justify-between px-6 py-4 border-b border-vms-borda">
              <h2 className="text-vms-texto text-lg font-semibold">Configurações do Site</h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-[8px] text-vms-muted
                  hover:text-vms-texto hover:bg-vms-dark-3 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex border-b border-vms-borda">
              {([
                { key: "dominio" as const, label: "Domínio Personalizado", icon: Globe },
                { key: "painel" as const, label: "Painel do Cliente", icon: Shield },
                { key: "personalizacao" as const, label: "Personalização", icon: Palette },
              ]).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSettingsTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all cursor-pointer
                      border-b-2 ${settingsTab === tab.key
                        ? "border-vms-primaria text-vms-primaria"
                        : "border-transparent text-vms-muted hover:text-vms-texto"
                      }`}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {settingsTab === "dominio" && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h3 className="text-vms-texto text-sm font-semibold mb-1">Domínio Personalizado</h3>
                    <p className="text-vms-muted text-xs">Conecte seu próprio domínio ao site</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-vms-texto-2 text-xs font-medium">Domínio</label>
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="www.seusite.com.br"
                      className="w-full border bg-white/5 rounded-[8px] px-4 py-2.5 text-sm text-vms-texto
                        placeholder:text-vms-dark-5 outline-none transition-colors
                        border-white/5 focus:border-vms-primaria"
                    />
                  </div>

                  <div className="rounded-[10px] border border-white/5 bg-white/[0.02] p-4">
                    <h4 className="text-vms-texto text-xs font-semibold mb-3">Configuração DNS</h4>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-vms-muted text-xs">Tipo: CNAME</span>
                        <code className="text-vms-primaria text-xs bg-vms-primaria/10 px-2 py-0.5 rounded-[4px]">
                          cname.vmsdigital.com.br
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-vms-muted text-xs">Verificação DNS</span>
                        <span className={`text-xs font-medium ${dnsVerified ? "text-vms-primaria" : "text-vms-muted"}`}>
                          {dnsVerified ? "✓ Verificado" : "Pendente"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-[8px] bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className={sslActive ? "text-vms-primaria" : "text-vms-muted"} />
                      <span className="text-vms-texto-2 text-xs">Certificado SSL</span>
                    </div>
                    <span className={`text-xs font-medium ${sslActive ? "text-vms-primaria" : "text-vms-muted"}`}>
                      {sslActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setDnsVerified(true);
                      setSslActive(true);
                      showToast("Domínio configurado com sucesso!", "success");
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px]
                      bg-vms-primaria text-black text-sm font-semibold hover:brightness-110
                      transition-all cursor-pointer"
                  >
                    <Globe size={16} />
                    Verificar Domínio
                  </button>
                </div>
              )}

              {settingsTab === "painel" && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h3 className="text-vms-texto text-sm font-semibold mb-1">Painel do Cliente</h3>
                    <p className="text-vms-muted text-xs">Configure o acesso do cliente ao painel</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-vms-texto-2 text-xs font-medium">Logo da Empresa</label>
                    <div
                      className="border-2 border-dashed border-white/10 rounded-[10px] p-4
                        flex items-center justify-center gap-3 hover:border-vms-primaria/30
                        transition-colors cursor-pointer"
                      onClick={() => document.getElementById("client-logo-upload")?.click()}
                    >
                      {clientLogo ? (
                        <img src={clientLogo} alt="Logo" className="h-10 object-contain" />
                      ) : (
                        <>
                          <Upload size={20} className="text-vms-muted" />
                          <span className="text-vms-muted text-sm">Enviar logo</span>
                        </>
                      )}
                      <input
                        id="client-logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setClientLogo(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-vms-texto-2 text-xs font-medium">Cor Primária</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={clientPrimaryColor}
                        onChange={(e) => setClientPrimaryColor(e.target.value)}
                        className="w-9 h-9 rounded-[6px] border border-white/10 cursor-pointer bg-transparent p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={clientPrimaryColor}
                        onChange={(e) => setClientPrimaryColor(e.target.value)}
                        className="flex-1 border bg-white/5 rounded-[6px] px-3 py-2 text-xs text-vms-texto
                          font-mono outline-none transition-colors border-white/5 focus:border-vms-primaria"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-vms-texto-2 text-xs font-medium">Nome da Empresa</label>
                    <input
                      type="text"
                      value={clientCompanyName}
                      onChange={(e) => setClientCompanyName(e.target.value)}
                      placeholder="Nome da agência"
                      className="w-full border bg-white/5 rounded-[8px] px-4 py-2.5 text-sm text-vms-texto
                        placeholder:text-vms-dark-5 outline-none transition-colors
                        border-white/5 focus:border-vms-primaria"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-vms-texto-2 text-xs font-medium">URL do Painel do Cliente</label>
                    <input
                      type="text"
                      value={clientPanelUrl}
                      onChange={(e) => setClientPanelUrl(e.target.value)}
                      placeholder="painel.seusite.com.br"
                      className="w-full border bg-white/5 rounded-[8px] px-4 py-2.5 text-sm text-vms-texto
                        placeholder:text-vms-dark-5 outline-none transition-colors
                        border-white/5 focus:border-vms-primaria"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-vms-texto-2 text-xs font-medium">Painel Ativo</span>
                      <p className="text-vms-muted text-[11px]">Permitir acesso do cliente</p>
                    </div>
                    <button
                      onClick={() => setClientPanelActive(!clientPanelActive)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer
                        ${clientPanelActive ? "bg-vms-primaria" : "bg-vms-dark-3"}`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md
                          transition-transform duration-300
                          ${clientPanelActive ? "translate-x-5.5" : "translate-x-0.5"}`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-vms-texto-2 text-xs font-medium">Prefixo das Faturas</label>
                    <input
                      type="text"
                      value={clientInvoicePrefix}
                      onChange={(e) => setClientInvoicePrefix(e.target.value)}
                      placeholder="VMS"
                      className="w-full border bg-white/5 rounded-[8px] px-4 py-2.5 text-sm text-vms-texto
                        placeholder:text-vms-dark-5 outline-none transition-colors
                        border-white/5 focus:border-vms-primaria"
                    />
                  </div>
                </div>
              )}

              {settingsTab === "personalizacao" && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h3 className="text-vms-texto text-sm font-semibold mb-1">Personalização</h3>
                    <p className="text-vms-muted text-xs">Ajuste o visual do site</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-vms-texto-2 text-xs font-medium">Cores do Tema</label>
                    <div className="grid grid-cols-5 gap-2">
                      {([
                        { key: "primaria" as const, label: "Primária" },
                        { key: "secundaria" as const, label: "Secundária" },
                        { key: "fundo" as const, label: "Fundo" },
                        { key: "card" as const, label: "Card" },
                        { key: "texto" as const, label: "Texto" },
                      ]).map((c) => (
                        <div key={c.key} className="flex flex-col items-center gap-1">
                          <input
                            type="color"
                            value={themeColors[c.key]}
                            onChange={(e) => setThemeColors((prev) => ({ ...prev, [c.key]: e.target.value }))}
                            className="w-10 h-10 rounded-[8px] border border-white/10 cursor-pointer bg-transparent p-0.5"
                          />
                          <span className="text-vms-muted text-[10px]">{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5">
                      <Type size={14} />
                      Tipografia
                    </label>
                    <select
                      value={themeFont}
                      onChange={(e) => setThemeFont(e.target.value)}
                      className="w-full border bg-white/5 rounded-[8px] px-4 py-2.5 text-sm text-vms-texto
                        outline-none transition-colors appearance-none cursor-pointer
                        border-white/5 focus:border-vms-primaria"
                    >
                      {FONT_FAMILIES.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5">
                      <Layout size={14} />
                      Estilo do Botão
                    </label>
                    <div className="flex gap-2">
                      {BUTTON_STYLES.map((style) => (
                        <button
                          key={style.value}
                          onClick={() => setThemeButtonStyle(style.value)}
                          className={`flex-1 px-3 py-2 text-xs font-medium rounded-[8px] border transition-all cursor-pointer
                            ${themeButtonStyle === style.value
                              ? "border-vms-primaria/40 bg-vms-primaria/10 text-vms-primaria"
                              : "border-white/5 bg-white/[0.02] text-vms-texto-2 hover:border-white/10"
                            }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-vms-texto-2 text-xs font-medium">Espaçamento Base</label>
                      <span className="text-vms-primaria text-xs font-mono">{themeSpacing}px</span>
                    </div>
                    <input
                      type="range"
                      value={themeSpacing}
                      onChange={(e) => setThemeSpacing(Number(e.target.value))}
                      min={8}
                      max={32}
                      step={2}
                      className="w-full accent-vms-primaria h-1.5 rounded-full cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-vms-texto-2 text-xs font-medium flex items-center gap-1.5">
                      <Code size={14} />
                      CSS Personalizado
                    </label>
                    <textarea
                      value={customCss}
                      onChange={(e) => setCustomCss(e.target.value)}
                      placeholder="/* Seu CSS customizado aqui */"
                      rows={5}
                      className="w-full border bg-white/5 rounded-[8px] px-4 py-2.5 text-xs text-vms-texto
                        font-mono placeholder:text-vms-dark-5 outline-none transition-colors resize-y min-h-[100px]
                        border-white/5 focus:border-vms-primaria"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-vms-borda">
              <button
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 rounded-[8px] bg-vms-card text-vms-texto-2 text-sm font-medium
                  hover:bg-vms-dark-3 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleSave();
                  setSettingsOpen(false);
                }}
                className="px-4 py-2 rounded-[8px] bg-vms-primaria text-black text-sm font-semibold
                  hover:brightness-110 transition-all cursor-pointer"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}

      <StartzyChat />
    </DashboardLayout>
  );
}
