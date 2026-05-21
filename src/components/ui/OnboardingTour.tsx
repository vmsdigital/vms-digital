"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "[data-tour='sidebar']",
    title: "Menu de navegação",
    description: "Use o menu lateral para navegar entre todas as seções da plataforma: Dashboard, Sites, Clientes, Financeiro e mais.",
    position: "right",
  },
  {
    target: "[data-tour='create-site']",
    title: "Criar seu primeiro site",
    description: "Clique aqui para criar um site profissional com IA. Basta preencher as informações do negócio e a IA gera tudo automaticamente!",
    position: "bottom",
  },
  {
    target: "[data-tour='plan-card']",
    title: "Seu plano",
    description: "Aqui você acompanha o uso do seu plano: quantos sites criou, prospecções realizadas e edições IA disponíveis.",
    position: "top",
  },
  {
    target: "[data-tour='metrics']",
    title: "Métricas em tempo real",
    description: "Acompanhe a receita mensal, sites ativos e crescimento do seu negócio nestes cards de métricas.",
    position: "bottom",
  },
  {
    target: "[data-tour='support']",
    title: "Precisa de ajuda?",
    description: "Acesse o Suporte para ver perguntas frequentes ou falar conosco pelo WhatsApp. Estamos sempre disponíveis!",
    position: "right",
  },
];

export function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem("vms_tour_seen");
    if (!seen) {
      const timer = setTimeout(() => setActive(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateHighlight = useCallback(() => {
    if (!active) return;
    const currentStep = TOUR_STEPS[step];
    if (!currentStep) return;

    const el = document.querySelector(currentStep.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setHighlightRect(rect);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setHighlightRect(null);
    }
  }, [active, step]);

  useEffect(() => {
    updateHighlight();
    window.addEventListener("resize", updateHighlight);
    window.addEventListener("scroll", updateHighlight, true);
    return () => {
      window.removeEventListener("resize", updateHighlight);
      window.removeEventListener("scroll", updateHighlight, true);
    };
  }, [updateHighlight]);

  function handleClose() {
    localStorage.setItem("vms_tour_seen", "true");
    setActive(false);
  }

  function handleNext() {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  }

  function handlePrev() {
    if (step > 0) setStep(step - 1);
  }

  if (!active) return null;

  const currentStep = TOUR_STEPS[step];

  const tooltipStyle: React.CSSProperties = (() => {
    if (!highlightRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const gap = 16;
    switch (currentStep.position) {
      case "bottom":
        return {
          top: highlightRect.bottom + gap,
          left: highlightRect.left + highlightRect.width / 2,
          transform: "translateX(-50%)",
        };
      case "top":
        return {
          bottom: window.innerHeight - highlightRect.top + gap,
          left: highlightRect.left + highlightRect.width / 2,
          transform: "translateX(-50%)",
        };
      case "right":
        return {
          top: highlightRect.top + highlightRect.height / 2,
          left: highlightRect.right + gap,
          transform: "translateY(-50%)",
        };
      case "left":
        return {
          top: highlightRect.top + highlightRect.height / 2,
          right: window.innerWidth - highlightRect.left + gap,
          transform: "translateY(-50%)",
        };
    }
  })();

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/60 pointer-events-none">
        {highlightRect && (
          <div
            className="absolute border-2 border-vms-primaria rounded-[8px] pointer-events-auto"
            style={{
              top: highlightRect.top - 4,
              left: highlightRect.left - 4,
              width: highlightRect.width + 8,
              height: highlightRect.height + 8,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
            }}
          />
        )}
      </div>

      <div
        className="fixed z-[85] w-[320px] pointer-events-auto"
        style={tooltipStyle}
      >
        <div className="glass-card-premium rounded-[14px] p-5 border-vms-primaria/20">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded-[8px] bg-vms-primaria/10 flex items-center justify-center">
              <Sparkles size={16} className="text-vms-primaria" />
            </div>
            <button
              onClick={handleClose}
              className="text-vms-muted hover:text-vms-texto cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <h3 className="text-vms-texto text-sm font-semibold mb-1">
            {currentStep.title}
          </h3>
          <p className="text-vms-texto-2 text-xs leading-relaxed mb-4">
            {currentStep.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {TOUR_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all ${
                    idx === step ? "w-4 bg-vms-primaria" : "w-1 bg-vms-dark-3"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-[8px] text-vms-muted hover:text-vms-texto hover:bg-vms-dark-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 rounded-[8px] bg-vms-primaria px-3 py-1.5 text-xs font-semibold text-black hover:brightness-110 transition-all cursor-pointer"
              >
                {step < TOUR_STEPS.length - 1 ? "Próximo" : "Concluir"}
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
