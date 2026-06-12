"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Globe,
  CirclePlus,
  Send,
  Users,
  TrendingUp,
  DollarSign,
  HelpCircle,
  Settings,
  BarChart3,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  category: string;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const COMMANDS: CommandItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={16} />,
    category: "Navegação",
    keywords: ["dashboard", "painel", "inicio", "home"],
  },
  {
    id: "sites",
    label: "Meus Sites",
    href: "/sites",
    icon: <Globe size={16} />,
    category: "Navegação",
    keywords: ["sites", "meus sites", "websites", "dominios"],
  },
  {
    id: "criar-site",
    label: "Criar Site",
    href: "/sites/novo",
    icon: <CirclePlus size={16} />,
    category: "Navegação",
    keywords: ["criar", "novo site", "adicionar", "criar site"],
  },
  {
    id: "prospeccao",
    label: "Prospecção",
    href: "/prospeccao",
    icon: <Search size={16} />,
    category: "Vendas",
    keywords: ["prospeccao", "prospectar", "leads", "buscar clientes"],
  },
  {
    id: "propostas",
    label: "Propostas",
    href: "/propostas",
    icon: <Send size={16} />,
    category: "Vendas",
    keywords: ["propostas", "enviar", "oferta", "contrato"],
  },
  {
    id: "clientes",
    label: "Clientes",
    href: "/clientes",
    icon: <Users size={16} />,
    category: "Vendas",
    keywords: ["clientes", "usuarios", "pessoas"],
  },
  {
    id: "afiliados",
    label: "Afiliados",
    href: "/afiliados",
    icon: <TrendingUp size={16} />,
    category: "Plataforma",
    keywords: ["afiliados", "parceiros", "indicacao", "comissao"],
  },
  {
    id: "financeiro",
    label: "Financeiro",
    href: "/financeiro",
    icon: <DollarSign size={16} />,
    category: "Plataforma",
    keywords: ["financeiro", "dinheiro", "pagamento", "receita", "faturamento"],
  },
  {
    id: "relatorios",
    label: "Relatórios",
    href: "/relatorios",
    icon: <BarChart3 size={16} />,
    category: "Plataforma",
    keywords: ["relatorios", "dados", "estatisticas", "metricas", "graficos"],
  },
  {
    id: "suporte",
    label: "Suporte",
    href: "/suporte",
    icon: <HelpCircle size={16} />,
    category: "Ajuda",
    keywords: ["suporte", "ajuda", "duvida", "problema", "ticket"],
  },
  {
    id: "configuracoes",
    label: "Configurações",
    href: "/configuracoes",
    icon: <Settings size={16} />,
    category: "Ajuda",
    keywords: ["configuracoes", "ajustes", "preferencias", "conta"],
  },
];

const CATEGORY_ORDER = ["Navegação", "Vendas", "Plataforma", "Ajuda"];

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;

  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  const exactIndex = lowerText.indexOf(lowerQuery);
  if (exactIndex !== -1) {
    return (
      <>
        {text.slice(0, exactIndex)}
        <mark className="bg-vms-primaria/25 text-vms-primaria rounded-[2px] px-[1px]">
          {text.slice(exactIndex, exactIndex + query.length)}
        </mark>
        {text.slice(exactIndex + query.length)}
      </>
    );
  }

  let qi = 0;
  const chars: { char: string; matched: boolean }[] = [];
  for (let ti = 0; ti < text.length; ti++) {
    const isMatch = qi < lowerQuery.length && lowerText[ti] === lowerQuery[qi];
    if (isMatch) qi++;
    chars.push({ char: text[ti], matched: isMatch });
  }

  const parts: React.ReactNode[] = [];
  let current = "";
  let isMatched = false;

  for (const { char, matched } of chars) {
    if (matched === isMatched) {
      current += char;
    } else {
      if (current) {
        parts.push(
          isMatched ? (
            <mark
              key={parts.length}
              className="bg-vms-primaria/25 text-vms-primaria rounded-[2px] px-[1px]"
            >
              {current}
            </mark>
          ) : (
            current
          )
        );
      }
      current = char;
      isMatched = matched;
    }
  }
  if (current) {
    parts.push(
      isMatched ? (
        <mark
          key={parts.length}
          className="bg-vms-primaria/25 text-vms-primaria rounded-[2px] px-[1px]"
        >
          {current}
        </mark>
      ) : (
        current
      )
    );
  }

  return <>{parts}</>;
}

export default function CommandPalette({ isOpen: isOpenProp, onClose: onCloseProp }: CommandPaletteProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [keyboardActiveIndex, setKeyboardActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isOpen = isOpenProp ?? internalOpen;

  const close = useCallback(() => {
    if (onCloseProp) {
      onCloseProp();
    } else {
      setInternalOpen(false);
    }
    setQuery("");
    setKeyboardActiveIndex(0);
  }, [onCloseProp]);

  const open = useCallback(() => {
    if (isOpenProp === undefined) {
      setInternalOpen(true);
    }
  }, [isOpenProp]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          close();
        } else {
          open();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close, open]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = query
    ? COMMANDS.filter(
        (cmd) =>
          fuzzyMatch(query, cmd.label) ||
          cmd.keywords.some((kw) => fuzzyMatch(query, kw))
      )
    : COMMANDS;

  const grouped = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      const items = filtered.filter((cmd) => cmd.category === cat);
      if (items.length > 0) acc.push({ category: cat, items });
      return acc;
    },
    [] as { category: string; items: CommandItem[] }[]
  );

  const flatItems = grouped.flatMap((g) => g.items);

  const activeIndex = Math.min(keyboardActiveIndex, Math.max(flatItems.length - 1, 0));

  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(
        `[data-command-index="${activeIndex}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  function handleSelect(item: CommandItem) {
    router.push(item.href);
    close();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setKeyboardActiveIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setKeyboardActiveIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flatItems[activeIndex];
      if (item) handleSelect(item);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  if (!isOpen) return null;

  let globalIndex = -1;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-[5vh] sm:pt-[15vh]">
      <div
        className="absolute inset-0 bg-black/60 animate-fade-in"
        onClick={close}
      />

      <div
        className="relative w-full max-w-[560px] mx-2 sm:mx-4 glass-card-premium rounded-[16px] border border-vms-borda shadow-2xl shadow-black/40 overflow-hidden animate-scale-in"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 px-4 border-b border-vms-borda">
          <Search size={16} className="text-vms-ghost shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setKeyboardActiveIndex(0); }}
            placeholder="Buscar comando ou página..."
            className="flex-1 bg-transparent py-3.5 text-[14px] text-vms-texto placeholder-vms-ghost outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-[6px] border border-vms-borda bg-vms-dark-2 px-1.5 py-0.5 text-[10px] font-mono text-vms-muted">
            ESC
          </kbd>
        </div>

        <div
          ref={listRef}
          className="max-h-[340px] overflow-y-auto py-2"
        >
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-vms-muted">
              <Search size={24} className="mb-2 opacity-30" />
              <p className="text-[13px]">Nenhum resultado encontrado</p>
              <p className="text-[11px] text-vms-ghost mt-1">
                Tente buscar por outro termo
              </p>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.category}>
                <div className="px-4 py-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.8px] text-vms-muted">
                    {group.category}
                  </span>
                </div>
                {group.items.map((item) => {
                  globalIndex++;
                  const idx = globalIndex;
                  const isActive = idx === activeIndex;

                  return (
                    <button
                      key={item.id}
                      data-command-index={idx}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setKeyboardActiveIndex(idx)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 min-h-[44px] text-left transition-colors cursor-pointer ${
                        isActive
                          ? "bg-vms-primaria/10 text-vms-texto"
                          : "text-vms-texto-2 hover:bg-white/[0.03]"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] ${
                          isActive
                            ? "bg-vms-primaria/20 text-vms-primaria"
                            : "bg-vms-dark-2 text-vms-ghost"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1 text-[13px] font-medium">
                        {highlightMatch(item.label, query)}
                      </span>
                      <kbd
                        className={`hidden sm:inline-flex items-center rounded-[5px] border px-1.5 py-0.5 text-[10px] font-mono ${
                          isActive
                            ? "border-vms-primaria/20 text-vms-primaria/60 bg-vms-primaria/5"
                            : "border-vms-borda text-vms-muted bg-vms-dark-2"
                        }`}
                      >
                        ↵
                      </kbd>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-vms-borda px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-[10px] text-vms-muted">
            <kbd className="inline-flex items-center rounded-[5px] border border-vms-borda bg-vms-dark-2 px-1.5 py-0.5 font-mono">
              ↑↓
            </kbd>
            <span>navegar</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-vms-muted">
            <kbd className="inline-flex items-center rounded-[5px] border border-vms-borda bg-vms-dark-2 px-1.5 py-0.5 font-mono">
              ↵
            </kbd>
            <span>selecionar</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-vms-muted">
            <kbd className="inline-flex items-center rounded-[5px] border border-vms-borda bg-vms-dark-2 px-1.5 py-0.5 font-mono">
              ESC
            </kbd>
            <span>fechar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
