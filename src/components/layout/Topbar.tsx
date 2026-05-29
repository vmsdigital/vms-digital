"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  Search,
  UserPlus,
  FileCheck,
  CreditCard,
  Globe,
  RefreshCw,
  Trash2,
  Settings,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CommandPalette from "@/components/ui/CommandPalette";
import type { Notificacao, Usuario } from "@/types/database";

interface TopbarProps {
  title: string;
  onMenuToggle: () => void;
}

const tipoIcons: Record<string, React.ReactNode> = {
  cliente_novo: <UserPlus size={14} />,
  proposta: <FileCheck size={14} />,
  pagamento: <CreditCard size={14} />,
  site_publicado: <Globe size={14} />,
  atualizacao: <RefreshCw size={14} />,
  sistema: <Bell size={14} />,
};

export default function Topbar({ title, onMenuToggle }: TopbarProps) {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [notifRes, usuarioRes] = await Promise.all([
      supabase
        .from("notificacoes")
        .select("*")
        .eq("usuario_id", user.id)
        .order("criado_em", { ascending: false })
        .limit(20),
      supabase.from("usuarios").select("*").eq("id", user.id).single(),
    ]);

    if (notifRes.data) setNotifications(notifRes.data as Notificacao[]);
    if (usuarioRes.data) setUsuario(usuarioRes.data as Usuario);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("notificacoes-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notificacoes" },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.lida).length;
  const isAdminUser = usuario?.cargo === "admin";

  async function handleMarkAllRead() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("usuario_id", user.id)
      .eq("lida", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
  }

  async function handleMarkRead(id: string) {
    const supabase = createClient();
    await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  }

  async function handleDeleteNotif(id: string) {
    const supabase = createClient();
    await supabase.from("notificacoes").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  async function handleClearAll() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("notificacoes").delete().eq("usuario_id", user.id);
    setNotifications([]);
  }

  function formatTimeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  const userInitials = usuario?.nome
    ? usuario.nome.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
    : "VM";

  return (
    <header className="flex h-[64px] shrink-0 items-center border-b border-vms-borda bg-vms-sidebar/80 backdrop-blur-xl px-[22px] relative z-20">
      <button
        onClick={onMenuToggle}
        className="mr-3 text-vms-ghost hover:text-vms-texto lg:hidden transition-colors"
      >
        <Menu size={20} />
      </button>

      <h1 className="mr-4 text-[15px] font-semibold text-vms-texto truncate tracking-[-0.2px]">
        {title}
      </h1>

      <div className="mx-auto hidden max-w-md flex-1 sm:block">
        <div className="relative group cursor-pointer" onClick={() => setCmdOpen(true)}>
          <Search
            size={14}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-vms-ghost group-focus-within:text-vms-primaria transition-colors pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar site ou cliente..."
            readOnly
            className="w-full rounded-[10px] border border-vms-borda bg-vms-card/60 py-[7px] pr-16 pl-9 text-[13px] text-vms-texto placeholder-vms-ghost outline-none transition-all focus:border-vms-primaria-border focus:bg-vms-card focus:shadow-[0_0_0_1px_rgba(200,241,53,0.08)] pointer-events-none"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-vms-ghost border border-vms-borda rounded-[4px] px-1.5 py-0.5 font-mono pointer-events-none">⌘K</span>
        </div>
      </div>

      <div className="ml-4 flex items-center gap-3">
        <button
          onClick={() => setCmdOpen(true)}
          className="text-vms-ghost hover:text-vms-texto transition-colors p-1 sm:hidden"
        >
          <Search size={17} />
        </button>
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-vms-ghost transition-colors hover:text-vms-texto p-1"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-vms-erro text-[9px] font-bold text-white" style={{ animation: "pulse-dot 2s ease-in-out infinite" }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-[calc(100vw-3rem)] sm:w-[400px] rounded-[14px] border border-vms-borda bg-vms-card p-0 shadow-2xl max-h-[480px] overflow-y-auto z-50 animate-fade-in">
              <div className="flex items-center justify-between border-b border-vms-borda px-4 py-3 sticky top-0 bg-vms-card z-10">
                <span className="text-[13px] font-semibold text-vms-texto">
                  Notificações
                </span>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-[10px] text-vms-red-light hover:text-vms-erro transition-colors"
                    >
                      Limpar
                    </button>
                  )}
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-vms-primaria hover:text-vms-primaria-bright transition-colors"
                    >
                      Marcar lidas
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-vms-primaria border-t-transparent" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-vms-muted">
                  <Bell size={20} className="mb-2 opacity-30" />
                  <p className="text-[13px]">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-vms-borda">
                  {(() => {
                    const categories: Record<string, { label: string; color: string; items: Notificacao[] }> = {};
                    const categoryOrder = ["cliente_novo", "proposta", "pagamento", "site_publicado", "atualizacao", "sistema"];
                    const categoryLabels: Record<string, { label: string; color: string }> = {
                      cliente_novo: { label: "Clientes", color: "text-blue-400" },
                      proposta: { label: "Propostas", color: "text-green-400" },
                      pagamento: { label: "Pagamentos", color: "text-yellow-400" },
                      site_publicado: { label: "Sites", color: "text-vms-primaria" },
                      atualizacao: { label: "Atualizações", color: "text-purple-400" },
                      sistema: { label: "Sistema", color: "text-vms-ghost" },
                    };

                    for (const n of notifications) {
                      const cat = n.tipo || "sistema";
                      if (!categories[cat]) {
                        categories[cat] = {
                          label: categoryLabels[cat]?.label || "Outros",
                          color: categoryLabels[cat]?.color || "text-vms-ghost",
                          items: [],
                        };
                      }
                      categories[cat].items.push(n);
                    }

                    const sortedCategories = Object.entries(categories).sort(
                      ([a], [b]) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
                    );

                    const unreadFirst = (a: Notificacao, b: Notificacao) => {
                      if (!a.lida && b.lida) return -1;
                      if (a.lida && !b.lida) return 1;
                      return 0;
                    };

                    return sortedCategories.map(([catKey, cat]) => (
                      <div key={catKey}>
                        <div className="px-4 py-2 bg-vms-dark-3/50 sticky top-[49px] z-[5]">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider ${cat.color}`}>
                            {cat.label} ({cat.items.length})
                          </span>
                        </div>
                        {cat.items.sort(unreadFirst).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (!n.lida) handleMarkRead(n.id);
                            }}
                            className={`flex w-full items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03] text-left relative group cursor-pointer ${
                              !n.lida ? "bg-vms-primaria-dim" : ""
                            }`}
                          >
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-vms-primaria-20 text-vms-primaria">
                              {tipoIcons[n.tipo] || <Bell size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] text-vms-texto leading-snug font-medium">
                                {n.titulo}
                              </p>
                              <p className="text-[11px] text-vms-texto-2 leading-relaxed mt-0.5">
                                {n.mensagem}
                              </p>
                              <span className="text-[10px] text-vms-ghost mt-1 block font-mono">
                                {formatTimeAgo(n.criado_em)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {!n.lida && (
                                <span className="mt-1.5 h-[5px] w-[5px] rounded-full bg-vms-primaria" style={{ boxShadow: "0 0 4px #C8F135" }} />
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteNotif(n.id); }}
                                className="p-1 rounded text-vms-dark-5 hover:text-vms-red-light opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            onDoubleClick={() => {
              if (isAdminUser) {
                router.push("/admin");
                setProfileOpen(false);
              }
            }}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-vms-primaria text-[11px] font-extrabold text-vms-fundo transition-all hover:shadow-[0_0_12px_rgba(200,241,53,0.3)] hover:scale-105 cursor-pointer relative"
          >
            {userInitials}
            <span className="absolute bottom-[1px] right-[1px] w-[7px] h-[7px] rounded-full bg-vms-sucesso border-[1.5px] border-vms-sidebar" style={{ animation: "pulse-dot 2.5s ease-in-out infinite" }} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-[220px] rounded-[14px] border border-vms-borda bg-vms-card shadow-2xl z-50 animate-fade-in overflow-hidden">
              <div className="px-4 py-3 border-b border-vms-borda">
                <div className="text-[13px] font-semibold text-vms-texto">{usuario?.nome || "Usuário"}</div>
                <div className="text-[11px] text-vms-ghost mt-0.5">{usuario?.email}</div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    router.push("/configuracoes");
                    setProfileOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] text-vms-texto-2 hover:bg-white/[0.03] transition-colors"
                >
                  <Settings size={15} className="text-vms-ghost" />
                  Configurações
                </button>

                {isAdminUser && (
                  <button
                    onClick={() => {
                      router.push("/admin");
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] text-vms-texto-2 hover:bg-white/[0.03] transition-colors"
                  >
                    <Shield size={15} className="text-vms-primaria" />
                    Painel Admin
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </header>
  );
}
