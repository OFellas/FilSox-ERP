import type { OS } from "../types/OS";

const STORAGE_KEY = "os_list";

// CARREGA DADOS DO ARMAZENAMENTO LOCAL (FALLBACK/LEGACY)
export function loadOS(): OS[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// SALVA DADOS NO ARMAZENAMENTO LOCAL
export function saveOS(list: OS[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}