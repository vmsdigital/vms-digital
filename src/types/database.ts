export interface Usuario {
  id: string;
  nome: string;
  email: string;
  whatsapp: string | null;
  plano: "gratuito" | "starter" | "pro" | "agency" | "admin";
  afiliado_id: string | null;
  cargo: "admin" | "criador";
  criado_em: string;
}

export interface Site {
  id: string;
  criador_id: string;
  nome_site: string;
  nicho: string;
  slug: string | null;
  dados_json: Record<string, unknown> | null;
  template_id: string | null;
  publicado: boolean;
  criado_em: string;
}

export interface Cliente {
  id: string;
  criador_id: string;
  site_id: string;
  nome: string;
  email: string | null;
  whatsapp: string;
  plano_tipo: "mensal" | "semestral" | "anual" | null;
  valor_mensal: number | null;
  status: "trial" | "ativo" | "inadimplente" | "cancelado";
  vencimento: string | null;
  criado_em: string;
}

export interface Proposta {
  id: string;
  criador_id: string;
  site_id: string | null;
  nome_prospect: string;
  whatsapp: string | null;
  status: "gerado" | "enviado" | "negociando" | "fechado" | "perdido";
  valor_proposto: number | null;
  criado_em: string;
}

export interface Template {
  id: string;
  nicho: string;
  nome: string;
  html_base: string | null;
  publico: boolean;
  criado_por: string | null;
  criado_em: string;
}

export interface Prospeccao {
  id: string;
  criador_id: string;
  segmento: string;
  cidade: string;
  raio_km: number;
  resultados: ProspeccaoResultado[] | null;
  criado_em: string;
}

export interface ProspeccaoResultado {
  google_place_id: string;
  nome: string;
  endereco: string | null;
  telefone: string | null;
  avaliacao: number | null;
  total_avaliacoes: number | null;
  tem_site: boolean;
  site_url: string | null;
  fonte?: "google" | "openstreetmap";
}
