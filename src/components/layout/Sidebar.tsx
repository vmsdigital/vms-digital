"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  CirclePlus,
  Search,
  Send,
  Users,
  TrendingUp,
  LayoutGrid,
  DollarSign,
  Settings,
  HelpCircle,
  LogOut,
  Zap,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: { text: string; variant: "green" | "red" | "purple" | "blue" } | { text: string; variant: "new" };
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

type BadgeVariant = "green" | "red" | "purple" | "blue" | "new";

const badgeStyles: Record<BadgeVariant, string> = {
  green: "bg-vms-primaria-20 text-vms-primaria",
  red: "bg-vms-red-bg text-vms-red-light",
  purple: "bg-vms-purple-bg text-vms-purple-light",
  blue: "bg-vms-blue-bg text-vms-blue-light",
  new: "bg-vms-primaria-20 text-vms-primaria",
};

const menuSections: MenuSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Meus Sites", href: "/sites", icon: Globe, badge: { text: "12", variant: "green" } },
      { label: "Criar Site", href: "/sites/novo", icon: CirclePlus, badge: { text: "novo", variant: "new" } },
    ],
  },
  {
    title: "Vendas",
    items: [
      { label: "Prospecção", href: "/prospeccao", icon: Search, badge: { text: "hot", variant: "red" } },
      { label: "Propostas", href: "/propostas", icon: Send, badge: { text: "3", variant: "green" } },
      { label: "Clientes", href: "/clientes", icon: Users },
    ],
  },
  {
    title: "Plataforma",
    items: [
      { label: "Afiliados", href: "/afiliados", icon: TrendingUp, badge: { text: "pro", variant: "purple" } },
      { label: "Templates", href: "/templates", icon: LayoutGrid },
      { label: "Financeiro", href: "/financeiro", icon: DollarSign },
    ],
  },
  {
    items: [
      { label: "Configurações", href: "/configuracoes", icon: Settings },
      { label: "Suporte", href: "/suporte", icon: HelpCircle },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 flex h-screen w-[220px] flex-col
          border-r border-vms-glass-border glass
          transition-transform duration-200 ease-in-out
          lg:relative lg:z-auto lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-[54px] items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-1">
            <span className="text-xl font-bold text-vms-primaria">VMS</span>
            <span className="text-xl font-bold text-vms-dark-5">DIGITAL</span>
          </Link>
          <button
            onClick={onClose}
            className="text-vms-muted hover:text-vms-texto lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx}>
              {section.title && (
                <>
                  {sIdx > 0 && <div className="my-2 border-t border-vms-borda" />}
                  <span className="mb-1 mt-3 block px-3 text-[11px] font-semibold tracking-wider text-vms-muted uppercase">
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
                    className={`
                      group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                      transition-colors duration-150
                      ${
                        isActive
                          ? "bg-vms-primaria-20 text-vms-primaria"
                          : "text-vms-texto-2 hover:bg-vms-primaria-hover hover:text-vms-texto-2"
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "text-vms-primaria"
                          : "text-vms-muted group-hover:text-vms-texto-2"
                      }
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${badgeStyles[item.badge.variant]}`}
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

        <div className="border-t border-vms-borda p-4">
          <div className="rounded-xl glass-card p-3">
            <div className="mb-2 flex items-center gap-2">
              <Zap size={14} className="text-vms-primaria" />
              <span className="text-xs font-semibold text-vms-texto">Plano Starter</span>
            </div>
            <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-vms-dark-3">
              <div
                className="h-full rounded-full bg-vms-primaria"
                style={{ width: "65%" }}
              />
            </div>
            <span className="text-[11px] text-vms-muted">7 de 10 sites usados</span>
          </div>

          <button className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-vms-red-light transition-colors hover:bg-vms-red-bg">
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
