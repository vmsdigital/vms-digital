"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  CirclePlus,
  Search,
  Send,
  Users,
  TrendingUp,
  DollarSign,
  HelpCircle,
  LogOut,
  Zap,
  X,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PLANOS, type PlanoKey } from "@/lib/constants";
import { getUsoPercentual } from "@/lib/plan-limits";
import type { Usuario } from "@/types/database";

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: { text: string; variant: "green" | "red" | "purple" | "blue" } | { text: string; variant: "new" };
  dataTour?: string;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

type BadgeVariant = "green" | "red" | "purple" | "blue" | "new";

const badgeStyles: Record<BadgeVariant, string> = {
  green: "bg-vms-primaria text-vms-fundo font-bold",
  red: "bg-vms-red-bg text-vms-red-light",
  purple: "bg-vms-purple-bg text-vms-purple-light",
  blue: "bg-vms-blue-bg text-vms-blue-light",
  new: "bg-vms-primaria-dim text-vms-primaria border border-vms-primaria-border",
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [sitesCount, setSitesCount] = useState(0);
  const [propostasPendentes, setPropostasPendentes] = useState(0);
  const [clientesCount, setClientesCount] = useState(0);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [usuarioRes, sitesRes, propostasRes, clientesRes] = await Promise.all([
      supabase.from("usuarios").select("*").eq("id", user.id).single(),
      supabase.from("sites").select("id", { count: "exact", head: true }).eq("criador_id", user.id),
      supabase.from("propostas").select("id", { count: "exact", head: true }).eq("criador_id", user.id).in("status", ["gerado", "enviado", "negociando"]),
      supabase.from("clientes").select("id", { count: "exact", head: true }).eq("criador_id", user.id),
    ]);

    if (usuarioRes.data) setUsuario(usuarioRes.data as Usuario);
    setSitesCount(sitesRes.count ?? 0);
    setPropostasPendentes(propostasRes.count ?? 0);
    setClientesCount(clientesRes.count ?? 0);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("sidebar-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "sites" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "propostas" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "clientes" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const plano = (usuario?.plano ?? "gratuito") as PlanoKey;
  const planoInfo = PLANOS[plano];

  const limiteSites = planoInfo.sites;
  const sitesLabel = limiteSites === Infinity ? `${sitesCount}/∞` : `${sitesCount}/${limiteSites}`;
  const sitesPct = getUsoPercentual(sitesCount, limiteSites as number);

  const menuSections: MenuSection[] = [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Meus Sites", href: "/sites", icon: Globe, badge: { text: String(sitesCount), variant: "green" } },
        { label: "Criar Site", href: "/sites/novo", icon: CirclePlus, badge: { text: "NOVO", variant: "new" }, dataTour: "create-site" },
      ],
    },
    {
      title: "Vendas",
      items: [
        { label: "Prospecção", href: "/prospeccao", icon: Search },
        { label: "Propostas", href: "/propostas", icon: Send, badge: propostasPendentes > 0 ? { text: String(propostasPendentes), variant: "green" } : undefined },
        { label: "Clientes", href: "/clientes", icon: Users, badge: clientesCount > 0 ? { text: String(clientesCount), variant: "blue" } : undefined },
      ],
    },
    {
      title: "Plataforma",
      items: [
        { label: "Afiliados", href: "/afiliados", icon: TrendingUp, badge: planoInfo.afiliados ? { text: "PRO", variant: "purple" } : undefined },
        { label: "Financeiro", href: "/financeiro", icon: DollarSign },
        { label: "Relatórios", href: "/relatorios", icon: BarChart3 },
      ],
    },
    {
      items: [
        { label: "Suporte", href: "/suporte", icon: HelpCircle, dataTour: "support" },
      ],
    },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        data-tour="sidebar"
        className={`
          fixed top-0 left-0 z-50 flex h-screen w-[228px] flex-col
          border-r border-vms-glass-border bg-vms-sidebar
          transition-transform duration-200 ease-in-out
          sidebar-lime-line relative
          lg:relative lg:z-auto lg:translate-x-0
          animate-slide-right
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-[64px] items-center justify-between px-[22px] border-b border-vms-borda">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo-vms.svg"
              alt="Startzy"
              width={120}
              height={36}
              className="shrink-0 transition-transform duration-300 hover:scale-105"
              priority
            />
          </Link>
          <button
            onClick={onClose}
            className="text-vms-ghost hover:text-vms-texto lg:hidden transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-[18px] scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {menuSections.map((section, sIdx) => (
            <div key={sIdx}>
              {section.title && (
                <>
                  {sIdx > 0 && <div className="my-2 border-t border-vms-borda" />}
                  <span className="mb-1 mt-3 block px-[22px] py-[7px] text-[9px] font-medium tracking-[3.5px] uppercase text-vms-ghost">
                    {section.title}
                  </span>
                </>
              )}
              {!section.title && sIdx > 0 && (
                <div className="my-2 border-t border-vms-borda" />
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    data-tour={item.dataTour}
                    prefetch={false}
                    className={`
                      group flex items-center gap-[10px] py-[9px] px-[22px] text-[13px] font-medium
                      transition-all duration-150 relative
                      ${
                        isActive
                          ? "text-vms-texto bg-vms-primaria-dim nav-active-indicator"
                          : "text-vms-muted hover:text-vms-texto hover:bg-white/[0.03] hover:pl-[26px]"
                      }
                    `}
                  >
                    <Icon
                      size={16}
                      className={
                        isActive
                          ? "text-vms-primaria shrink-0"
                          : "text-vms-ghost group-hover:text-vms-texto shrink-0"
                      }
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`rounded-[20px] px-[7px] py-[2px] text-[9px] font-bold tracking-[0.3px] ${badgeStyles[item.badge.variant]}`}
                      >
                        {item.badge.text}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="px-[22px] py-4 border-t border-vms-borda">
          <div className="bg-vms-primaria-dim border border-vms-primaria-border rounded-[10px] p-[14px] mb-[10px] plan-chip-flash">
            <div className="text-[9.5px] tracking-[2.5px] uppercase text-vms-primaria font-semibold mb-2 flex items-center gap-[6px]">
              <Zap size={10} />
              Plano {planoInfo.nome}
            </div>
            <div className="h-[2px] bg-vms-primaria-dim rounded-[2px] mb-[6px] overflow-hidden">
              <div
                className="h-full rounded-[2px] bg-vms-primaria transition-all duration-300"
                style={{ width: `${sitesPct}%`, boxShadow: "0 0 6px #C8F135" }}
              />
            </div>
            <span className="text-[11px] text-vms-ghost font-mono">{sitesLabel} sites</span>
          </div>

          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-[8px] py-[9px] px-[22px] text-[13px] font-medium text-red-400/45 hover:text-red-400/85 hover:bg-red-400/[0.04] hover:pl-[26px] transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
