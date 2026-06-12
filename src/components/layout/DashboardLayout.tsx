"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
        <Image src="/logo-animacao.svg" alt="Startzy" width={100} height={47} priority className="animate-fade-in" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-vms-fundo relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-vms-primaria/[0.02] blur-[140px]" />
        <div className="absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-vms-blue/[0.02] blur-[120px]" />
      </div>

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
