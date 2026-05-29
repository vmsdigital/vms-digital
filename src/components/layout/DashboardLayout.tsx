"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "@/components/ui/CommandPalette";
import FloatingParticles from "@/components/ui/FloatingParticles";
import StartzyChat from "@/components/ui/StartzyChat";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { createClient } from "@/lib/supabase/client";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

function DashboardInner({
  children,
  title = "Dashboard",
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const router = useRouter();

  useKeyboardShortcuts();

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
      } else {
        setAuthed(true);
      }
    }
    check();
  }, [router]);

  if (!authed) {
    return (
      <div className="flex h-screen items-center justify-center bg-vms-fundo">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-4 h-4 rounded-full bg-vms-primaria animate-ping opacity-75" />
            </span>
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-4 h-4 rounded-full bg-vms-primaria animate-spin [animation-duration:2s]" />
            </span>
          </div>
          <span className="text-vms-ghost text-[11px] tracking-[3px] uppercase font-medium">Carregando</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-vms-fundo relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-vms-primaria/[0.025] blur-[140px]" style={{ animation: "glow-breathe 8s ease-in-out infinite" }} />
        <div className="absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-vms-blue/[0.03] blur-[120px]" style={{ animation: "glow-breathe 10s ease-in-out infinite 2s" }} />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-vms-primaria/[0.015] blur-[100px]" style={{ animation: "glow-breathe 12s ease-in-out infinite 4s" }} />
      </div>

      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />

      <FloatingParticles />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        <Topbar
          title={title}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 animate-fade-in">
          {children}
        </main>
      </div>

      <CommandPalette />
      <StartzyChat />
    </div>
  );
}

export default function DashboardLayout(props: DashboardLayoutProps) {
  return <DashboardInner {...props} />;
}
