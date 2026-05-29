"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, Eye, Sparkles, Download, Star, Filter, Grid3X3, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Template {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  tags: string[];
  autor: string;
  estrelas: number;
  downloads: number;
  gratuito: boolean;
  destaque: boolean;
  cor: string;
}

const CATEGORIAS = [
  "Todos",
  "Hero",
  "Header",
  "Footer",
  "CTA",
  "Features",
  "Testimonials",
  "Pricing",
  "Contact",
  "Galeria",
  "Blog",
  "FAQ",
];

const templates: Template[] = [
  { id: "1", nome: "Hero Gradient Bold", categoria: "Hero", descricao: "Hero section com gradiente vibrante, título grande e CTA duplo", tags: ["gradiente", "moderno", "cta"], autor: "Startzy", estrelas: 5, downloads: 342, gratuito: true, destaque: true, cor: "from-vms-primaria/30 to-vms-primaria/5" },
  { id: "2", nome: "Hero Split Image", categoria: "Hero", descricao: "Layout dividido com imagem à direita e texto à esquerda", tags: ["split", "imagem", "layout"], autor: "Startzy", estrelas: 4, downloads: 218, gratuito: true, destaque: false, cor: "from-blue-600/30 to-blue-600/5" },
  { id: "3", nome: "Hero Minimal Dark", categoria: "Hero", descricao: "Hero minimalista com fundo escuro e tipografia clean", tags: ["minimal", "dark", "clean"], autor: "Startzy", estrelas: 5, downloads: 189, gratuito: true, destaque: true, cor: "from-purple-600/30 to-purple-600/5" },
  { id: "4", nome: "Header Sticky Glass", categoria: "Header", descricao: "Header com efeito glassmorphism e navegação sticky", tags: ["glass", "sticky", "moderno"], autor: "Startzy", estrelas: 4, downloads: 156, gratuito: true, destaque: false, cor: "from-cyan-600/30 to-cyan-600/5" },
  { id: "5", nome: "Header Mega Menu", categoria: "Header", descricao: "Header com mega menu dropdown e busca integrada", tags: ["mega menu", "dropdown", "busca"], autor: "Startzy", estrelas: 4, downloads: 98, gratuito: false, destaque: false, cor: "from-emerald-600/30 to-emerald-600/5" },
  { id: "6", nome: "Footer Completo 4 Col", categoria: "Footer", descricao: "Rodapé com 4 colunas, newsletter e redes sociais", tags: ["4 colunas", "newsletter", "social"], autor: "Startzy", estrelas: 5, downloads: 267, gratuito: true, destaque: true, cor: "from-rose-600/30 to-rose-600/5" },
  { id: "7", nome: "Footer Minimal", categoria: "Footer", descricao: "Rodapé minimalista com links essenciais e copyright", tags: ["minimal", "simples", "clean"], autor: "Startzy", estrelas: 3, downloads: 145, gratuito: true, destaque: false, cor: "from-amber-600/30 to-amber-600/5" },
  { id: "8", nome: "CTA Banner Full", categoria: "CTA", descricao: "Banner CTA full-width com gradiente e botão de ação", tags: ["full-width", "gradiente", "conversão"], autor: "Startzy", estrelas: 5, downloads: 312, gratuito: true, destaque: true, cor: "from-vms-primaria/30 to-emerald-600/5" },
  { id: "9", nome: "CTA Card Popup", categoria: "CTA", descricao: "Card CTA com efeito popup e countdown timer", tags: ["popup", "countdown", "urgência"], autor: "Startzy", estrelas: 4, downloads: 87, gratuito: false, destaque: false, cor: "from-red-600/30 to-red-600/5" },
  { id: "10", nome: "Features Grid 3x2", categoria: "Features", descricao: "Grid de funcionalidades 3x2 com ícones e descrições", tags: ["grid", "ícones", "6 items"], autor: "Startzy", estrelas: 4, downloads: 201, gratuito: true, destaque: false, cor: "from-indigo-600/30 to-indigo-600/5" },
  { id: "11", nome: "Features ZigZag", categoria: "Features", descricao: "Layout zigzag alternando imagem e texto por feature", tags: ["zigzag", "alternado", "imagem"], autor: "Startzy", estrelas: 5, downloads: 176, gratuito: true, destaque: true, cor: "from-teal-600/30 to-teal-600/5" },
  { id: "12", nome: "Testimonials Carousel", categoria: "Testimonials", descricao: "Carrossel de depoimentos com foto, nome e avaliação", tags: ["carrossel", "foto", "slider"], autor: "Startzy", estrelas: 5, downloads: 234, gratuito: true, destaque: true, cor: "from-yellow-600/30 to-yellow-600/5" },
  { id: "13", nome: "Testimonials Cards", categoria: "Testimonials", descricao: "Grid de cards com depoimentos e estrelas de avaliação", tags: ["cards", "grid", "estrelas"], autor: "Startzy", estrelas: 4, downloads: 143, gratuito: true, destaque: false, cor: "from-orange-600/30 to-orange-600/5" },
  { id: "14", nome: "Pricing 3 Planos", categoria: "Pricing", descricao: "Tabela de preços com 3 planos e destaque no recomendado", tags: ["3 planos", "destaque", "popular"], autor: "Startzy", estrelas: 5, downloads: 289, gratuito: true, destaque: true, cor: "from-vms-primaria/30 to-cyan-600/5" },
  { id: "15", nome: "Pricing Toggle Mensal/Anual", categoria: "Pricing", descricao: "Tabela com toggle entre preço mensal e anual", tags: ["toggle", "mensal", "anual"], autor: "Startzy", estrelas: 4, downloads: 167, gratuito: false, destaque: false, cor: "from-violet-600/30 to-violet-600/5" },
  { id: "16", nome: "Contact Form Map", categoria: "Contact", descricao: "Formulário de contato com mapa integrado ao lado", tags: ["mapa", "formulário", "lado a lado"], autor: "Startzy", estrelas: 4, downloads: 134, gratuito: true, destaque: false, cor: "from-sky-600/30 to-sky-600/5" },
  { id: "17", nome: "Galeria Masonry", categoria: "Galeria", descricao: "Galeria estilo masonry com lightbox e filtros", tags: ["masonry", "lightbox", "filtros"], autor: "Startzy", estrelas: 5, downloads: 198, gratuito: true, destaque: true, cor: "from-pink-600/30 to-pink-600/5" },
  { id: "18", nome: "Blog Cards", categoria: "Blog", descricao: "Grid de cards de blog com imagem, título e resumo", tags: ["blog", "cards", "imagem"], autor: "Startzy", estrelas: 4, downloads: 112, gratuito: true, destaque: false, cor: "from-lime-600/30 to-lime-600/5" },
  { id: "19", nome: "FAQ Accordion", categoria: "FAQ", descricao: "Seção de perguntas frequentes com accordion animado", tags: ["accordion", "faq", "perguntas"], autor: "Startzy", estrelas: 4, downloads: 156, gratuito: true, destaque: false, cor: "from-fuchsia-600/30 to-fuchsia-600/5" },
  { id: "20", nome: "Hero Video BG", categoria: "Hero", descricao: "Hero section com vídeo de fundo e overlay escuro", tags: ["vídeo", "background", "overlay"], autor: "Startzy", estrelas: 5, downloads: 278, gratuito: false, destaque: true, cor: "from-vms-primaria/30 to-purple-600/5" },
];

export default function TemplatesPage() {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [showFiltros, setShowFiltros] = useState(false);
  const [plano, setPlano] = useState("gratuito");

  useEffect(() => {
    async function loadPlano() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("usuarios").select("plano").eq("id", user.id).single();
        if (data?.plano) setPlano(data.plano);
      }
    }
    loadPlano();
  }, []);

  const isPlanoPago = plano !== "gratuito";

  const templatesFiltrados = templates.filter((t) => {
    const matchCategoria = categoriaAtiva === "Todos" || t.categoria === categoriaAtiva;
    const matchBusca = !busca || t.nome.toLowerCase().includes(busca.toLowerCase()) || t.descricao.toLowerCase().includes(busca.toLowerCase()) || t.tags.some((tag) => tag.toLowerCase().includes(busca.toLowerCase()));
    return matchCategoria && matchBusca;
  });

  const destaques = templatesFiltrados.filter((t) => t.destaque);
  const normais = templatesFiltrados.filter((t) => !t.destaque);

  return (
    <DashboardLayout title="Templates">
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-medium text-vms-texto">Marketplace de Templates</h2>
          <p className="text-sm text-vms-muted">Componentes prontos para usar — hero, header, footer, CTA e muito mais</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-vms-muted" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar templates, tags, categorias..."
              className="w-full rounded-[10px] border border-vms-borda bg-vms-card py-2.5 pl-9 pr-4 text-sm text-vms-texto placeholder-vms-ghost outline-none focus:border-vms-primaria transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className="sm:hidden inline-flex items-center gap-2 rounded-[10px] border border-vms-borda bg-vms-card px-4 py-2.5 text-sm text-vms-muted hover:text-vms-texto transition-colors"
          >
            <Filter size={14} />
            Filtros
          </button>
        </div>

        <div className={`${showFiltros ? "flex" : "hidden"} sm:flex gap-2 flex-wrap`}>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                categoriaAtiva === cat
                  ? "bg-vms-primaria text-black"
                  : "bg-vms-card border border-vms-borda text-vms-muted hover:text-vms-texto hover:border-vms-primaria/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {destaques.length > 0 && categoriaAtiva === "Todos" && !busca && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-vms-primaria" />
              <span className="text-sm font-medium text-vms-texto">Destaques</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {destaques.map((template) => (
                <TemplateCard key={template.id} template={template} destaque isPlanoPago={isPlanoPago} />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Grid3X3 size={14} className="text-vms-muted" />
            <span className="text-sm font-medium text-vms-texto">
              {categoriaAtiva === "Todos" && !busca ? "Todos os templates" : `${templatesFiltrados.length} resultado${templatesFiltrados.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {templatesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center glass-card-premium rounded-[14px] py-16">
              <Search size={40} className="mb-3 text-vms-muted opacity-40" />
              <p className="text-sm text-vms-muted">Nenhum template encontrado</p>
              <button
                onClick={() => { setBusca(""); setCategoriaAtiva("Todos"); }}
                className="mt-3 text-sm font-medium text-vms-primaria hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(categoriaAtiva === "Todos" && !busca ? normais : templatesFiltrados).map((template) => (
                <TemplateCard key={template.id} template={template} isPlanoPago={isPlanoPago} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function TemplateCard({ template, destaque = false, isPlanoPago = false }: { template: Template; destaque?: boolean; isPlanoPago?: boolean }) {
  const bloqueado = !template.gratuito && !isPlanoPago;
  return (
    <div
      className={`group glass-card-premium rounded-[14px] overflow-hidden transition-all hover:border-vms-primaria/30 ${destaque ? "ring-1 ring-vms-primaria/20" : ""} ${bloqueado ? "opacity-70" : ""}`}
    >
      <div
        className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${template.cor}`}
      >
        {destaque && (
          <span className="absolute top-2 left-2 rounded-full bg-vms-primaria px-2 py-0.5 text-[9px] font-bold text-black uppercase tracking-wider">
            Destaque
          </span>
        )}
        {!template.gratuito && (
          <span className="absolute top-2 right-2 rounded-full bg-vms-purple-bg px-2 py-0.5 text-[9px] font-bold text-vms-purple-light uppercase tracking-wider">
            PRO
          </span>
        )}
        <span className="text-vms-texto/30 text-xs font-medium tracking-wider uppercase">{template.categoria}</span>
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/50">
          <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button className="inline-flex items-center gap-1.5 rounded-[8px] bg-vms-primaria px-3 py-1.5 text-xs font-medium text-black hover:brightness-110 transition-all">
              <Eye size={13} />
              Preview
            </button>
            {bloqueado ? (
              <button className="inline-flex items-center gap-1.5 rounded-[8px] bg-white/10 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white cursor-not-allowed">
                <Lock size={13} />
                PRO
              </button>
            ) : (
              <button className="inline-flex items-center gap-1.5 rounded-[8px] bg-white/10 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-all">
                <Sparkles size={13} />
                Usar
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="text-sm font-medium text-vms-texto truncate">{template.nome}</h3>
        <p className="text-xs text-vms-muted mt-0.5 line-clamp-2">{template.descricao}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-vms-dark-2 px-2 py-0.5 text-[9px] text-vms-muted">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-vms-borda">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-[11px] text-vms-muted">{template.estrelas}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download size={11} className="text-vms-ghost" />
              <span className="text-[11px] text-vms-muted">{template.downloads}</span>
            </div>
          </div>
          <span className={`text-[10px] font-semibold ${template.gratuito ? "text-vms-sucesso" : "text-vms-purple-light"}`}>
            {template.gratuito ? "Grátis" : "PRO"}
          </span>
        </div>
      </div>
    </div>
  );
}
