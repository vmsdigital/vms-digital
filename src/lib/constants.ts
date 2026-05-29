export const PLANOS = {
  gratuito: {
    nome: "Gratuito",
    preco: 0,
    sites: 2,
    prospeccoes: 1,
    edicoes_ia: 5,
    afiliados: false,
  },
  starter: {
    nome: "Starter",
    preco: 47,
    sites: 10,
    prospeccoes: 20,
    edicoes_ia: 20,
    afiliados: false,
  },
  pro: {
    nome: "Pro",
    preco: 97,
    sites: 50,
    prospeccoes: 100,
    edicoes_ia: Infinity,
    afiliados: true,
  },
  agency: {
    nome: "Agency",
    preco: 197,
    sites: Infinity,
    prospeccoes: Infinity,
    edicoes_ia: Infinity,
    afiliados: true,
  },
  admin: {
    nome: "Admin",
    preco: 0,
    sites: Infinity,
    prospeccoes: Infinity,
    edicoes_ia: Infinity,
    afiliados: true,
  },
} as const;

export type PlanoKey = keyof typeof PLANOS;

export const PRECOS_SITE = {
  mensal: { preco: 197, label: "Mensal", descricao: "Sem compromisso, cancela quando quiser" },
  semestral: { preco: 147, label: "Semestral", descricao: "Economiza R$ 300 no período" },
  anual: { preco: 97, label: "Anual", descricao: "Menos de R$ 3,50/dia" },
} as const;

export const NICHOS = [
  { value: "provedor", label: "Provedor de Internet" },
  { value: "advocacia", label: "Advocacia" },
  { value: "academia", label: "Academia" },
  { value: "clinica", label: "Clínica Médica" },
  { value: "dentista", label: "Dentista" },
  { value: "restaurante", label: "Restaurante" },
  { value: "salao", label: "Salão de Beleza" },
  { value: "barbearia", label: "Barbearia" },
  { value: "estetica", label: "Estética" },
  { value: "loja", label: "Loja / E-commerce" },
  { value: "imobiliaria", label: "Imobiliária" },
  { value: "autopecas", label: "Auto Peças" },
  { value: "mecanico", label: "Mecânica" },
  { value: "petshop", label: "Pet Shop" },
  { value: "construcao", label: "Construção Civil" },
  { value: "farmacia", label: "Farmácia" },
  { value: "supermercado", label: "Supermercado" },
  { value: "hotel", label: "Hotel / Pousada" },
  { value: "escola", label: "Escola / Curso" },
  { value: "contabilidade", label: "Contabilidade" },
  { value: "fisioterapia", label: "Fisioterapia" },
  { value: "psicologo", label: "Psicólogo" },
  { value: "veterinario", label: "Veterinário" },
  { value: "arquitetura", label: "Arquitetura" },
  { value: "engenharia", label: "Engenharia" },
  { value: "consultoria", label: "Consultoria" },
  { value: "marketing", label: "Marketing / Agência" },
  { value: "fotografia", label: "Fotografia" },
  { value: "cafe", label: "Cafeteria" },
  { value: "pizzaria", label: "Pizzaria" },
  { value: "optica", label: "Ótica" },
  { value: "eletronicos", label: "Eletrônicos" },
  { value: "moveis", label: "Móveis" },
  { value: "seguro", label: "Seguro" },
  { value: "outro", label: "Outro" },
] as const;

export const STATUS_CLIENTE = {
  trial: { label: "Trial", color: "blue" as const },
  ativo: { label: "Ativo", color: "green" as const },
  inadimplente: { label: "Inadimp.", color: "red" as const },
  cancelado: { label: "Cancelado", color: "gray" as const },
} as const;

export const STATUS_PROPOSTA = {
  gerado: { label: "Gerado", color: "gray" as const },
  enviado: { label: "Enviado", color: "blue" as const },
  negociando: { label: "Negociando", color: "yellow" as const },
  fechado: { label: "Fechado", color: "green" as const },
  perdido: { label: "Perdido", color: "red" as const },
} as const;
