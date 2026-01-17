import type { OS } from "../types/OS";

// CÁLCULO DE DIAS RESTANTES PARA UM PRAZO ESPECÍFICO
export function diasParaPrazo(os: OS): number | null {
  if (!os.prazo) return null;

  const agora = new Date();
  const prazo = new Date(os.prazo);

  const diff =
    (prazo.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24);

  return Math.ceil(diff);
}

// RETORNA STATUS TEXTUAL DO PRAZO
export function statusPrazo(os: OS): "ok" | "perto" | "atrasada" {
  const dias = diasParaPrazo(os);
  if (dias === null) return "ok";

  if (dias < 0) return "atrasada";
  if (dias <= 6) return "perto";
  return "ok";
}