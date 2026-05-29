"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Globe,
  Pencil,
  CreditCard,
  Link2,
  LogOut,
  Menu,
  X,
  Image as ImageIcon,
  User,
  Settings,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Cliente, Site } from "@/types/database";

interface ClienteLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { label: "Visão Geral", href: "/cliente/dashboard", icon: LayoutDashboard },
  { label: "Editar Site", href: "/cliente/site", icon: Pencil },
  { label: "Mídias", href: "/cliente/midias", icon: ImageIcon },
  { label: "Pagamentos", href: "/cliente/pagamentos", icon: CreditCard },
  { label: "Domínio", href: "/cliente/dominio", icon: Link2 },
  { label: "Meu Perfil", href: "/cliente/perfil", icon: User },
];

export default function ClienteLayout({ children }: ClienteLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/cliente/login");
        return;
      }

      const { data: clienteData } = await supabase
        .from("clientes")
        .select("*")
        .eq("email", user.email)
        .single();

      if (clienteData) {
        setCliente(clienteData as Cliente);
        const { data: siteData } = await supabase
          .from("sites")
          .select("*")
          .eq("id", clienteData.site_id)
          .single();
        if (siteData) setSite(siteData as Site);
      }

      setLoading(false);
    }
    fetchUser();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/cliente/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-vms-fundo">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-vms-primaria border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-vms-fundo relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-vms-primaria/[0.03] blur-[120px]" />
        <div className="absolute top-1/2 -right-32 h-80 w-80 rounded-full bg-vms-blue/[0.04] blur-[100px]" />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 flex h-screen w-[220px] flex-col
          border-r border-vms-glass-border glass
          transition-transform duration-200 ease-in-out
          lg:relative lg:z-auto lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-[54px] items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-startzy.svg"
              alt="Startzy"
              width={80}
              height={24}
              className="shrink-0"
            />
            <span className="text-sm text-vms-muted">Cliente</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-vms-muted hover:text-vms-texto lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {site && (
          <div className="mx-3 mb-2 rounded-[10px] bg-vms-primaria/5 border border-vms-primaria/10 p-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-vms-primaria" />
              <span className="text-sm font-medium text-vms-texto truncate">
                {site.nome_site}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-vms-muted">
              {site.slug || "seusite.startzy.com.br"}
            </p>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={`
                  group flex w-full items-center gap-3 rounded-[8px] px-3 py-2 text-sm font-medium
                  transition-colors duration-150 mb-0.5
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
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-vms-borda p-4">
          {cliente && (
            <div className="mb-3 rounded-[10px] glass-card-premium p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vms-primaria/10 text-xs font-bold text-vms-primaria">
                  {cliente.nome.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-vms-texto">
                    {cliente.nome}
                  </p>
                  <p className="truncate text-[11px] text-vms-muted">
                    {cliente.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-sm font-medium text-vms-red-light transition-colors hover:bg-vms-red-bg"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        <header className="flex h-[54px] shrink-0 items-center border-b border-vms-borda bg-vms-sidebar/80 backdrop-blur-md px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="mr-3 text-vms-muted hover:text-vms-texto lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-vms-primaria" />
            <h1 className="text-base font-semibold text-vms-texto">
              {menuItems.find((i) => i.href === pathname)?.label || "Painel"}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {site && (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  site.publicado
                    ? "bg-green-500/10 text-green-400"
                    : "bg-vms-purple-bg text-vms-purple-light"
                }`}
              >
                {site.publicado ? "Publicado" : "Rascunho"}
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
