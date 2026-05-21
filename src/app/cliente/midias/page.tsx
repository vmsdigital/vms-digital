"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Image,
  Upload,
  Trash2,
  Check,
  X,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Site } from "@/types/database";

interface MidiaItem {
  id: string;
  url: string;
  nome: string;
  tipo: string;
  criado_em: string;
}

export default function ClienteMidiasPage() {
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [midias, setMidias] = useState<MidiaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedMidia, setSelectedMidia] = useState<MidiaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/cliente/login");
        return;
      }

      const { data: clienteData } = await supabase
        .from("clientes")
        .select("site_id")
        .eq("email", user.email)
        .single();

      if (clienteData) {
        const { data: siteData } = await supabase
          .from("sites")
          .select("*")
          .eq("id", clienteData.site_id)
          .single();

        if (siteData) {
          setSite(siteData as Site);
          const dados = siteData.dados_json ?? {};
          const listaMidias = (dados.midias as MidiaItem[]) || [];
          setMidias(listaMidias);
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [router]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !site) return;

    setUploading(true);
    const supabase = createClient();
    const novasMidias: MidiaItem[] = [...midias];

    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${site.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("site-midias")
        .upload(fileName, file);

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("site-midias")
          .getPublicUrl(fileName);

        novasMidias.push({
          id: Math.random().toString(36).slice(2),
          url: urlData.publicUrl,
          nome: file.name,
          tipo: file.type,
          criado_em: new Date().toISOString(),
        });
      }
    }

    await supabase
      .from("sites")
      .update({
        dados_json: {
          ...(site.dados_json ?? {}),
          midias: novasMidias,
        },
      })
      .eq("id", site.id);

    setMidias(novasMidias);
    setSite({
      ...site,
      dados_json: { ...(site.dados_json ?? {}), midias: novasMidias },
    });
    setUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(midiaId: string) {
    if (!site) return;
    setDeleting(midiaId);

    const novasMidias = midias.filter((m) => m.id !== midiaId);

    const supabase = createClient();
    await supabase
      .from("sites")
      .update({
        dados_json: {
          ...(site.dados_json ?? {}),
          midias: novasMidias,
        },
      })
      .eq("id", site.id);

    setMidias(novasMidias);
    setSite({
      ...site,
      dados_json: { ...(site.dados_json ?? {}), midias: novasMidias },
    });
    setDeleting(null);
    setSelectedMidia(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-vms-primaria border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-vms-texto">
            Mídias do Site
          </h2>
          <p className="text-sm text-vms-muted">
            Faça upload de imagens para usar no seu site
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-[10px] bg-vms-primaria px-4 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:brightness-110">
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {midias.length === 0 ? (
        <div className="glass-card-premium rounded-[14px] p-12 text-center">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 text-vms-muted opacity-40" />
          <p className="text-vms-texto-2">Nenhuma imagem enviada ainda</p>
          <p className="mt-1 text-sm text-vms-muted">
            Clique em Upload para adicionar imagens ao seu site
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {midias.map((midia) => (
            <div
              key={midia.id}
              className="group relative overflow-hidden rounded-[10px] border border-vms-borda bg-vms-dark-2/50 transition-all hover:border-vms-primaria/30"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={midia.url}
                  alt={midia.nome}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>

              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => setSelectedMidia(midia)}
                  className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-vms-primaria/20 text-vms-primaria transition-colors hover:bg-vms-primaria/30"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(midia.id)}
                  disabled={deleting === midia.id}
                  className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-vms-red-bg text-vms-red-light transition-colors hover:bg-vms-red-light/20"
                >
                  {deleting === midia.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="p-2">
                <p className="truncate text-xs text-vms-muted">{midia.nome}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMidia && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
          onClick={() => setSelectedMidia(null)}
        >
          <div
            className="relative max-h-[80vh] max-w-[80vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMidia(null)}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-vms-dark-2 text-vms-texto transition-colors hover:bg-vms-red-bg hover:text-vms-red-light z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={selectedMidia.url}
              alt={selectedMidia.nome}
              className="max-h-[80vh] rounded-[10px] object-contain"
            />
            <div className="mt-3 flex items-center justify-between rounded-[10px] bg-vms-card p-3">
              <p className="text-sm text-vms-texto-2">{selectedMidia.nome}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedMidia.url);
                }}
                className="rounded-[8px] bg-vms-primaria/10 px-3 py-1 text-xs text-vms-primaria transition-colors hover:bg-vms-primaria/20"
              >
                Copiar URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
