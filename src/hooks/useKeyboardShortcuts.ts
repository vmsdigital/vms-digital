"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

interface ShortcutAction {
  key: string;
  label: string;
  action: () => void;
  requiresInput?: boolean;
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { showToast } = useToast();

  const shortcuts: ShortcutAction[] = [
    {
      key: "n",
      label: "Criar novo site",
      action: () => {
        showToast("Abrindo criação de site...", "info");
        router.push("/sites/novo");
      },
    },
    {
      key: "g",
      label: "Ir para Prospecção",
      action: () => {
        showToast("Navegando para Prospecção", "info");
        router.push("/prospeccao");
      },
    },
    {
      key: "s",
      label: "Ir para Sites",
      action: () => {
        showToast("Navegando para Meus Sites", "info");
        router.push("/sites");
      },
    },
    {
      key: "?",
      label: "Atalhos de teclado",
      action: () => {
        showToast("N: Novo site · G: Prospecção · S: Sites · Ctrl+K: Busca", "info");
      },
    },
  ];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (isInput) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "k") return;

      const shortcut = shortcuts.find((s) => s.key === e.key);
      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
