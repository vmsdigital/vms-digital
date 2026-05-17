"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ExternalLink,
  Trash2,
  Globe,
  Eye,
  Palette,
  FileText,
  Settings2,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/client";
import { NICHOS } from "@/lib/constants";
import type { Site } from "@/types/database";

type Tab = "geral" | "conteudo" | "aparencia";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function SiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("geral");
  const [saving, setSaving] = useState(false);

  const [editNome, setEditNome] = useState("");
  const [editNicho, setEditNicho] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editConteudo, setEditConteudo] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    async function fetchSite() {
      const supabase = createClient();
      const { data } = await supabase
        .from("sites")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setSite(data);
        setEditNome(data.nome_site);
        setEditNicho(data.nicho);
        setEditSlug(data.slug ?? "");
        if (data.dados_json) {
          const flat: Record<string, string> = {};
          Object.entries(data.dados_json).forEach(([key, val]) => {
            if (typeof val === "string") flat[key] = val;
          });
          setEditConteudo(flat);
        }
      }
      setLoading(false);
    }

    fetchSite();
  }, [id]);

  async function handleTogglePublish() {
    if (!site) return;
    setSaving(true);

    const supabase = createClient();
    const { data } = await supabase
      .from("sites")
      .update({ publicado: !site.publicado })
      .eq("id", site.id)
      .select()
      .single();

    if (data) setSite(data);
    setSaving(false);
  }

  async function handleSaveGeral() {
    if (!site) return;
    setSaving(true);

    const supabase = createClient();
    const { data } = await supabase
      .from("sites")
      .update({
        nome_site: editNome,
        nicho: editNicho,
        slug: editSlug,
      })
      .eq("id", site.id)
      .select()
      .single();

    if (data) setSite(data);
    setSaving(false);
  }

  async function handleSaveConteudo() {
    if (!site) return;
    setSaving(true);

    const supabase = createClient();
    const { data } = await supabase
      .from("sites")
      .update({
        dados_json: { ...(site.dados_json ?? {}), ...editConteudo },
      })
      .eq("id", site.id)
      .select()
      .single();

    if (data) setSite(data);
    setSaving(false);
  }

  async function handleDelete() {
    if (!site) return;

    const supabase = createClient();
    await supabase.from("sites").delete().eq("id", site.id);
    router.push("/sites");
  }

  if (loading) {
    return (
      <DashboardLayout title="Carregando...">
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-vms-primaria border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!site) {
    return (
      <DashboardLayout title="Não encontrado">
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-vms-muted text-sm">Site não encontrado.</p>
          <Button variant="secondary" onClick={() => router.push("/sites")}>
            Voltar para Sites
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "geral", label: "Geral", icon: <Settings2 size={14} /> },
    { key: "conteudo", label: "Conteúdo", icon: <FileText size={14} /> },
    { key: "aparencia", label: "Aparência", icon: <Palette size={14} /> },
  ];

  return (
    <DashboardLayout title={site.nome_site}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg glass flex items-center justify-center text-vms-dark-5 text-xs font-bold">
              {site.nome_site
                .split(" ")
                .map((w) => w[0])
                .filter(Boolean)
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <h1 className="text-vms-texto text-lg font-semibold">
                {site.nome_site}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={site.publicado ? "ativo" : "trial"} />
                <span className="text-vms-dark-5 text-xs">
                  Criado em {formatDate(site.criado_em)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleTogglePublish}
              disabled={saving}
            >
              <Globe size={14} className="mr-1.5" />
              {site.publicado ? "Despublicar" : "Publicar"}
            </Button>
            <Button variant="secondary" size="sm">
              <Eye size={14} className="mr-1.5" />
              Visualizar
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 size={14} className="mr-1.5" />
              Excluir
            </Button>
          </div>
        </div>

        <div className="flex gap-1 border-b border-vms-borda">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer ${
                activeTab === tab.key
                  ? "border-vms-primaria text-vms-primaria"
                  : "border-transparent text-vms-muted hover:text-vms-texto-2"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-6">
          {activeTab === "geral" && (
            <div className="flex flex-col gap-4 max-w-lg">
              <h2 className="text-vms-texto text-sm font-medium mb-2">
                Informações gerais
              </h2>
              <Input
                label="Nome do site"
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
              />
              <Input
                label="Nicho"
                value={
                  NICHOS.find((n) => n.value === editNicho)?.label ?? editNicho
                }
                disabled
              />
              <Input
                label="Slug / URL"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
              />
              <div className="flex items-center justify-between py-3 border-t border-vms-borda">
                <div>
                  <span className="text-vms-texto-2 text-sm font-medium">
                    Status de publicação
                  </span>
                  <p className="text-vms-dark-5 text-xs mt-0.5">
                    {site.publicado
                      ? "Este site está publicado e acessível ao público."
                      : "Este site está em modo rascunho."}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={site.publicado ? "secondary" : "primary"}
                  onClick={handleTogglePublish}
                  disabled={saving}
                >
                  {site.publicado ? "Despublicar" : "Publicar"}
                </Button>
              </div>
              <Button onClick={handleSaveGeral} disabled={saving}>
                Salvar alterações
              </Button>
            </div>
          )}

          {activeTab === "conteudo" && (
            <div className="flex flex-col gap-4 max-w-lg">
              <h2 className="text-vms-texto text-sm font-medium mb-2">
                Conteúdo do site
              </h2>
              {Object.keys(editConteudo).length === 0 ? (
                <p className="text-vms-muted text-sm py-4">
                  Nenhum conteúdo editável disponível.
                </p>
              ) : (
                Object.entries(editConteudo).map(([key, value]) => (
                  <Input
                    key={key}
                    label={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    value={value}
                    onChange={(e) =>
                      setEditConteudo((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  />
                ))
              )}
              <Button onClick={handleSaveConteudo} disabled={saving}>
                Salvar conteúdo
              </Button>
            </div>
          )}

          {activeTab === "aparencia" && (
            <div className="flex flex-col gap-4 max-w-lg">
              <h2 className="text-vms-texto text-sm font-medium mb-2">
                Aparência
              </h2>
              <div>
                <label className="text-vms-texto-2 text-xs font-medium">
                  Cor primária
                </label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-10 h-10 rounded-lg bg-vms-primaria border border-vms-borda" />
                  <Input value="#AAFF00" disabled className="max-w-[140px]" />
                </div>
                <p className="text-vms-dark-5 text-xs mt-1">
                  Seletor de cores em breve
                </p>
              </div>
              <div>
                <label className="text-vms-texto-2 text-xs font-medium">
                  Template
                </label>
                <div className="mt-1 bg-vms-dark-1 border border-vms-borda rounded-lg px-3 py-2 text-sm text-vms-texto-2">
                  {site.template_id ?? "Template padrão"}
                </div>
              </div>
              <div>
                <label className="text-vms-texto-2 text-xs font-medium">
                  Cores preferidas
                </label>
                <div className="mt-1 bg-vms-dark-1 border border-vms-borda rounded-lg px-3 py-2 text-sm text-vms-texto-2">
                  {(site.dados_json as Record<string, unknown>)
                    ?.cores_preferidas as string || "Não definido"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
