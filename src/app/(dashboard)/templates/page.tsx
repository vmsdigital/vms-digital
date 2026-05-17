"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import { NICHOS } from "@/lib/constants";
import type { Template } from "@/types/database";
import { LayoutGrid, Search, Eye } from "lucide-react";

const nichoIcons: Record<string, string> = {
  provedor: "🌐",
  advocacia: "⚖️",
  academia: "💪",
  clinica: "🏥",
  restaurante: "🍽️",
  salao: "💇",
  loja: "🛒",
  imobiliaria: "🏠",
  autopecas: "🔧",
  petshop: "🐾",
  construcao: "🏗️",
  outro: "📋",
};

const nichoColors: Record<string, string> = {
  provedor: "from-blue-600 to-cyan-500",
  advocacia: "from-amber-600 to-yellow-500",
  academia: "from-red-600 to-orange-500",
  clinica: "from-teal-600 to-green-500",
  restaurante: "from-orange-600 to-amber-500",
  salao: "from-pink-600 to-rose-500",
  loja: "from-purple-600 to-violet-500",
  imobiliaria: "from-emerald-600 to-teal-500",
  autopecas: "from-gray-600 to-slate-500",
  petshop: "from-green-600 to-lime-500",
  construcao: "from-yellow-600 to-amber-500",
  outro: "from-gray-600 to-gray-500",
};

const templatesMock: Template[] = [
  { id: "1", nicho: "restaurante", nome: "Bistrô Elegante", html_base: null, publico: true, criado_por: null, criado_em: "2026-01-10" },
  { id: "2", nicho: "restaurante", nome: "Delivery Express", html_base: null, publico: true, criado_por: null, criado_em: "2026-01-15" },
  { id: "3", nicho: "clinica", nome: "Clínica Saúde+", html_base: null, publico: true, criado_por: null, criado_em: "2026-02-01" },
  { id: "4", nicho: "clinica", nome: "Consultório Moderno", html_base: null, publico: true, criado_por: null, criado_em: "2026-02-10" },
  { id: "5", nicho: "advocacia", nome: "Advocacia Premium", html_base: null, publico: true, criado_por: null, criado_em: "2026-02-20" },
  { id: "6", nicho: "academia", nome: "Fit Power", html_base: null, publico: true, criado_por: null, criado_em: "2026-03-01" },
  { id: "7", nicho: "salao", nome: "Beleza Pura", html_base: null, publico: true, criado_por: null, criado_em: "2026-03-05" },
  { id: "8", nicho: "provedor", nome: "ISP Connect", html_base: null, publico: true, criado_por: null, criado_em: "2026-03-10" },
  { id: "9", nicho: "imobiliaria", nome: "Homes Imóveis", html_base: null, publico: true, criado_por: null, criado_em: "2026-03-15" },
  { id: "10", nicho: "petshop", nome: "Pet Amigo", html_base: null, publico: true, criado_por: null, criado_em: "2026-04-01" },
  { id: "11", nicho: "loja", nome: "Shop Online", html_base: null, publico: true, criado_por: null, criado_em: "2026-04-10" },
  { id: "12", nicho: "autopecas", nome: "Auto Veloz", html_base: null, publico: true, criado_por: null, criado_em: "2026-04-15" },
];

export default function TemplatesPage() {
  const [nichoFiltro, setNichoFiltro] = useState("todos");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      const supabase = createClient();
      const { data } = await supabase
        .from("templates")
        .select("*")
        .eq("publico", true);
      if (data && data.length > 0) {
        setTemplates(data as Template[]);
      } else {
        setTemplates(templatesMock);
      }
      setLoading(false);
    }
    loadTemplates();
  }, []);

  const templatesFiltrados =
    nichoFiltro === "todos"
      ? templates
      : templates.filter((t) => t.nicho === nichoFiltro);

  const nichoLabel = (value: string) =>
    NICHOS.find((n) => n.value === value)?.label ?? value;

  return (
    <DashboardLayout title="Templates">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-medium text-vms-texto">Biblioteca de Templates</h2>
            <p className="text-sm text-vms-muted">Escolha um template para criar seu site rapidamente</p>
          </div>
          <div className="relative">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-vms-muted" />
            <select
              value={nichoFiltro}
              onChange={(e) => setNichoFiltro(e.target.value)}
              className="appearance-none rounded-lg border border-vms-borda bg-vms-card py-2 pl-9 pr-8 text-sm text-vms-texto outline-none focus:border-vms-primaria transition-colors cursor-pointer"
            >
              <option value="todos">Todos os nichos</option>
              {NICHOS.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse glass-card rounded-2xl p-4">
                <div className="mb-3 h-36 rounded-lg bg-vms-dark-2" />
                <div className="mb-2 h-4 w-2/3 rounded bg-vms-dark-2" />
                <div className="h-3 w-1/2 rounded bg-vms-dark-2" />
              </div>
            ))}
          </div>
        ) : templatesFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center glass-card rounded-2xl py-16">
            <LayoutGrid size={40} className="mb-3 text-vms-muted opacity-40" />
            <p className="text-sm text-vms-muted">Nenhum template encontrado para este nicho</p>
            <button
              onClick={() => setNichoFiltro("todos")}
              className="mt-3 text-sm font-medium text-vms-primaria hover:underline"
            >
              Ver todos os templates
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templatesFiltrados.map((template) => (
              <div
                key={template.id}
                className="group glass-card rounded-2xl overflow-hidden transition-all hover:border-vms-primaria/30"
              >
                <div
                  className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${
                    nichoColors[template.nicho] ?? "from-gray-600 to-gray-500"
                  }`}
                >
                  <span className="text-4xl">{nichoIcons[template.nicho] ?? "📋"}</span>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                    <button className="opacity-0 transition-opacity group-hover:opacity-100 inline-flex items-center gap-1.5 rounded-lg bg-vms-primaria px-3 py-1.5 text-xs font-medium text-black">
                      <Eye size={14} />
                      Visualizar
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="mb-1 text-sm font-medium text-vms-texto">{template.nome}</h3>
                  <p className="mb-3 text-xs text-vms-muted">{nichoLabel(template.nicho)}</p>
                  <button className="w-full rounded-lg bg-vms-primaria py-2 text-sm font-medium text-black hover:brightness-110 transition-all">
                    Usar Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
