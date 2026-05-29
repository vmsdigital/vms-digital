"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
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
      <div className="flex h-screen items-center justify-center bg-vms-fundo overflow-hidden relative">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${15 + Math.random() * 70}%`,
              width: 3,
              height: 3,
              background: "#DFFE00",
              boxShadow: "0 0 10px 2px rgba(223,254,0,0.4), 0 0 24px 6px rgba(223,254,0,0.15)",
            }}
            animate={{
              scale: [0, 1.2, 2, 0],
              opacity: [0, 0.7, 0.35, 0],
              x: [
                0,
                (Math.random() - 0.5) * 150,
                (Math.random() - 0.5) * 250,
                (Math.random() - 0.5) * 350,
              ],
              y: [
                0,
                (Math.random() - 0.5) * 150,
                (Math.random() - 0.5) * 250,
                (Math.random() - 0.5) * 350,
              ],
            }}
            transition={{
              duration: 1.8 + Math.random(),
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
        <motion.div
          initial={{ scale: 0.4, opacity: 0, filter: "blur(16px)" }}
          animate={{
            scale: [0.4, 1.03, 1],
            opacity: [0, 1, 1],
            filter: ["blur(16px)", "blur(0px)", "blur(0px)"],
          }}
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <Image src="/logo-animacao.svg" alt="Startzy" width={100} height={47} priority />
        </motion.div>
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
