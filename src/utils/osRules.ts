import type { OS } from "../types/OS";

// CÁLCULO DE DIAS PASSADOS
export function diasDesde(data: string) {
  return Math.floor(
    (Date.now() - new Date(data).getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

// REGRA: É ATRASADA SE PASSAR DE 30 DIAS
export function isAtrasada(os: OS) {
  if (os.status === "CONCLUIDA") return false;
  return diasDesde(os.dataAbertura) > 30;
}

// REGRA: É PERTO DE VENCER SE ESTIVER ENTRE 25 E 30 DIAS
export function isPertoDeVencer(os: OS) {
  if (os.status === "CONCLUIDA") return false;

  const dias = diasDesde(os.dataAbertura);
  return dias >= 25 && dias <= 30;
}