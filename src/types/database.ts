export interface Usuario {
  id: string;
  nome: string;
  email: string;
  whatsapp: string | null;
  plano: "gratuito" | "starter" | "pro" | "admin";
  afiliado_id: string | null;
  cargo: "admin" | "criador";
  asaas_customer_id: string | null;
  asaas_subscription_id: string | null;
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
  favorito?: boolean;
  dominio_personalizado?: string | null;
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
  asaas_customer_id: string | null;
  asaas_subscription_id: string | null;
  criado_em: string;
}

export interface Proposta {
  id: string;
  criador_id: string;
  site_id: string | null;
  cliente_id: string | null;
  nome_prospect: string | null;
  whatsapp: string | null;
  status: "gerado" | "enviado" | "negociando" | "fechado" | "perdido";
  valor_proposto: number | null;
  notas: string | null;
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
  redes_sociais: string[] | null;
  lat?: number | null;
  lon?: number | null;
}

export interface Notificacao {
  id: string;
  usuario_id: string;
  tipo: "cliente_novo" | "proposta" | "pagamento" | "site_publicado" | "atualizacao" | "sistema";
  titulo: string;
  mensagem: string;
  lida: boolean;
  criado_em: string;
}

export interface Transacao {
  id: string;
  criador_id: string;
  cliente_id: string | null;
  site_id: string | null;
  tipo: "receita" | "despesa" | "mensalidade" | "reembolso" | "comissao" | "assinatura";
  valor: number;
  status: "pago" | "pendente" | "atrasado";
  descricao: string | null;
  vencimento: string | null;
  pago_em: string | null;
  criado_em: string;
  clientes?: { nome: string } | null;
  sites?: { nome_site: string } | null;
}

export interface Carteira {
  id: string;
  criador_id: string;
  saldo: number;
  total_entradas: number;
  total_saidas: number;
  mensalidades_mes: number;
  atualizado_em: string;
}

export interface Afiliado {
  id: string;
  usuario_id: string;
  codigo_indicacao: string;
  comissao_percentual: number;
  status: "ativo" | "inativo" | "pendente";
  total_indicados: number;
  total_comissoes: number;
  criado_em: string;
}

export interface Indicacao {
  id: string;
  afiliado_id: string;
  indicado_id: string;
  comissao: number;
  status: "pendente" | "pago";
  criado_em: string;
  indicados?: { nome: string; email: string; plano: string } | null;
}

export interface AgenteTarefa {
  id: string;
  criador_id: string;
  segmento: string;
  cidade: string;
  raio_km: number;
  quantidade: number;
  status: "pendente" | "agendado" | "prospectando" | "gerando" | "concluido" | "erro" | "parcial" | "cancelado";
  filtro: "sem_site" | "todos" | "com_site";
  tema_padrao: "claro" | "escuro";
  cor_primaria: string;
  cor_secundaria: string;
  horario_limite: string;
  avaliacao_minima: number;
  agendado_para: string | null;
  resultados: ProspeccaoResultado[] | null;
  sites_criados: { site_id: string; nome: string; slug: string }[] | null;
  sites_erro: { nome: string; erro: string }[] | null;
  total_prospectados: number;
  total_sites_criados: number;
  total_erros: number;
  log: string[] | null;
  iniciado_em: string | null;
  concluido_em: string | null;
  criado_em: string;
}

export interface PagamentoAsaas {
  id: string;
  criador_id: string;
  cliente_id: string;
  asaas_payment_id: string | null;
  asaas_customer_id: string | null;
  tipo: "boleto" | "pix" | "cartao";
  valor: number;
  status: "pending" | "received" | "overdue" | "cancelled";
  link_pagamento: string | null;
  vencimento: string;
  pago_em: string | null;
  criado_em: string;
}
