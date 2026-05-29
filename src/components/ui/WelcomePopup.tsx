"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Globe, Rocket, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const STEPS = [
  {
    icon: <Sparkles size={24} />,
    title: "Bem-vindo à Startzy!",
    description:
      "Crie sites profissionais em segundos com inteligência artificial. Venda, alugue ou gerencie sites para seus clientes.",
  },
  {
    icon: <Globe size={24} />,
    title: "Crie seu primeiro site",
    description:
      "Vá em 'Criar Site', preencha as informações do negócio e a IA gera um site completo, responsivo e otimizado para você.",
  },
  {
    icon: <Rocket size={24} />,
    title: "Venda e lucre",
    description:
      "Adicione clientes, configure planos de mensalidade e receba pagamentos automáticos via PIX, boleto ou cartão.",
  },
  {
    icon: <MessageCircle size={24} />,
    title: "Suporte sempre disponível",
    description:
      "Precisa de ajuda? Acesse a aba 'Suporte' ou chame no WhatsApp (11) 99751-3044. Estamos aqui para você!",
  },
];

export function WelcomePopup() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    async function check() {
      const seen = localStorage.getItem("vms_welcome_seen");
      if (seen) return;

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setShow(true);
    }
    check();
  }, []);

  function handleClose() {
    localStorage.setItem("vms_welcome_seen", "true");
    setShow(false);
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  }

  if (!show) return null;

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-card-premium rounded-[14px] w-full max-w-md p-6 relative animate-in">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-vms-muted hover:text-vms-texto cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center gap-5 pt-2">
          <div className="w-14 h-14 rounded-[14px] bg-vms-primaria/10 flex items-center justify-center text-vms-primaria">
            {current.icon}
          </div>

          <div>
            <h3 className="text-vms-texto text-lg font-semibold">
              {current.title}
            </h3>
            <p className="text-vms-texto-2 text-sm mt-2 leading-relaxed">
              {current.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === step
                    ? "w-6 bg-vms-primaria"
                    : idx < step
                      ? "w-1.5 bg-vms-primaria/40"
                      : "w-1.5 bg-vms-dark-3"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3 w-full">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 rounded-[10px] bg-vms-dark-2 px-4 py-2.5 text-sm font-medium text-vms-texto-2 transition-colors hover:bg-vms-dark-3 cursor-pointer"
              >
                Voltar
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 rounded-[10px] bg-vms-primaria px-4 py-2.5 text-sm font-semibold text-black transition-all hover:brightness-110 hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] cursor-pointer"
            >
              {step < STEPS.length - 1 ? "Próximo" : "Começar!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
