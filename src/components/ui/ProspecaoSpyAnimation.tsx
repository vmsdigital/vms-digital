"use client";

import { useState, useEffect } from "react";
import { Binoculars, Users, MessageCircle, Target, Eye } from "lucide-react";

const SPY_MESSAGES = [
  { icon: Binoculars, text: "Escaneando a região" },
  { icon: Eye, text: "Identificando negócios" },
  { icon: Users, text: "Analisando concorrência" },
  { icon: MessageCircle, text: "Mapeando oportunidades" },
  { icon: Target, text: "Filtrando os melhores leads" },
];

export function ProspecaoSpyAnimation({ isSearching }: { isSearching: boolean }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isSearching) {
      setMsgIndex(0);
      setDots("");
      return;
    }

    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % SPY_MESSAGES.length);
    }, 2500);

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    return () => {
      clearInterval(msgInterval);
      clearInterval(dotsInterval);
    };
  }, [isSearching]);

  if (!isSearching) return null;

  const CurrentIcon = SPY_MESSAGES[msgIndex].icon;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80">
      <div className="text-center max-w-sm px-6">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border border-vms-primaria/20" />
          <div className="absolute inset-4 rounded-full border border-vms-primaria/15" />
          <div className="absolute inset-8 rounded-full border border-vms-primaria/10" />

          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, transparent 0%, rgba(170,255,0,0.3) 15%, transparent 30%)",
              animation: "radarSweep 2s linear infinite",
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-vms-primaria/20 flex items-center justify-center border-2 border-vms-primaria/40">
              <CurrentIcon size={28} className="text-vms-primaria" />
            </div>
          </div>

          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-vms-primaria"
              style={{
                top: `${20 + Math.sin((Date.now() / 1000 + i) * 2) * 30}%`,
                left: `${50 + Math.cos((Date.now() / 1000 + i) * 2) * 30}%`,
                animation: `pulse 1.5s ease-in-out infinite ${i * 0.3}s`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>

        <h2 className="text-xl font-bold text-white mb-2">
          Prospecção Ativa
        </h2>
        <p className="text-vms-primaria text-sm font-medium mb-4">
          {SPY_MESSAGES[msgIndex].text}{dots}
        </p>

        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-vms-primaria rounded-full"
            style={{ animation: "progressBar 8s ease-in-out infinite" }}
          />
        </div>

        <div className="flex items-center justify-center gap-3 mt-6">
          {["Agente 1", "Agente 2", "Agente 3"].map((agente, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full bg-vms-primaria/20 flex items-center justify-center border border-vms-primaria/30"
                style={{ animation: `bounce 1s ease-in-out infinite ${i * 0.2}s` }}
              >
                <Users size={14} className="text-vms-primaria" />
              </div>
              <span className="text-[10px] text-white/40">{agente}</span>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes radarSweep {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes progressBar {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}</style>
      </div>
    </div>
  );
}
