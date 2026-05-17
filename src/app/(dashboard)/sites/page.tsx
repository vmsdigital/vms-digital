"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, ExternalLink, Pencil } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/client";
import { NICHOS } from "@/lib/constants";
import type { Site } from "@/types/database";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const nichoOptions = [
  { value: "", label: "Todos os nichos" },
  ...NICHOS.map((n) => ({ value: n.value, label: n.label })),
];

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [nichoFilter, setNichoFilter] = useState("");

  useEffect(() => {
    async function fetchSites() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("sites")
        .select("*")
        .eq("criador_id", user?.id ?? "")
        .order("criado_em", { ascending: false });

      setSites(data ?? []);
      setLoading(false);
    }

    fetchSites();
  }, []);

  const filteredSites = sites.filter((site) => {
    const matchesSearch = site.nome_site
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesNicho = !nichoFilter || site.nicho === nichoFilter;
    return matchesSearch && matchesNicho;
  });

  return (
    <DashboardLayout title="Meus Sites">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-vms-texto text-xl font-semibold">Meus Sites</h1>
          <Link href="/sites/novo">
            <Button>
              <Plus size={16} className="mr-1.5" />
              Criar Site
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar site..."
              icon={<Search size={14} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-56">
            <Select
              options={nichoOptions}
              value={nichoFilter}
              onChange={(e) => setNichoFilter(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-vms-primaria border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full bg-vms-dark-2 flex items-center justify-center">
              <Search size={24} className="text-vms-muted" />
            </div>
            <div className="text-center">
              <p className="text-vms-texto text-sm font-medium">
                {sites.length === 0
                  ? "Nenhum site criado ainda"
                  : "Nenhum site encontrado"}
              </p>
              <p className="text-vms-muted text-xs mt-1">
                {sites.length === 0
                  ? "Crie seu primeiro site e comece a gerar receita."
                  : "Tente ajustar os filtros de busca."}
              </p>
            </div>
            {sites.length === 0 && (
              <Link href="/sites/novo">
                <Button>
                  <Plus size={16} className="mr-1.5" />
                  Criar Site
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSites.map((site) => (
              <Link
                key={site.id}
                href={`/sites/${site.id}`}
                className="glass-card rounded-2xl p-4 hover:border-vms-primaria/30 transition-all group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg glass flex items-center justify-center text-vms-dark-5 text-xs font-bold shrink-0">
                    {getInitials(site.nome_site)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-vms-texto text-sm font-medium truncate group-hover:text-vms-primaria transition-colors">
                      {site.nome_site}
                    </h3>
                    <p className="text-vms-muted text-xs truncate">
                      {NICHOS.find((n) => n.value === site.nicho)?.label ??
                        site.nicho}
                    </p>
                  </div>
                  <StatusBadge
                    status={site.publicado ? "ativo" : "trial"}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-vms-dark-5">
                  <span>{formatDate(site.criado_em)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-vms-muted hover:text-vms-primaria transition-colors">
                      <Pencil size={14} />
                    </span>
                    <span className="text-vms-muted hover:text-vms-primaria transition-colors">
                      <ExternalLink size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
