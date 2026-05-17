import { PLANOS, type PlanoKey } from "./constants";

export function isAdmin(cargo: string): boolean {
  return cargo === "admin";
}

export function getLimitePlano(plano: PlanoKey) {
  return PLANOS[plano];
}

export function podeCriarSite(plano: PlanoKey, sitesAtuais: number, cargo?: string): boolean {
  if (cargo && isAdmin(cargo)) return true;
  return sitesAtuais < PLANOS[plano].sites;
}

export function podeProcurar(plano: PlanoKey, prospeccoesMesAtual: number): boolean {
  return prospeccoesMesAtual < PLANOS[plano].prospeccoes;
}

export function podeEditarIA(plano: PlanoKey, edicoesMesAtual: number): boolean {
  return edicoesMesAtual < PLANOS[plano].edicoes_ia;
}

export function podeUsarAfiliados(plano: PlanoKey): boolean {
  return PLANOS[plano].afiliados;
}

export function getUsoPercentual(uso: number, limite: number): number {
  if (limite === Infinity) return 0;
  return Math.min(Math.round((uso / limite) * 100), 100);
}
