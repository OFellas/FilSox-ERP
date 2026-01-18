import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

interface ModuleContextData {
  modulos: string[];
  hasModule: (moduleId: string) => boolean;
  carregarModulos: () => Promise<void>;
  loading: boolean;
}

const ModuleContext = createContext<ModuleContextData>({} as ModuleContextData);

function isOnLoginRoute() {
  const path = window.location.pathname || "";
  const hash = window.location.hash || "";
  return path === "/login" || hash.includes("/login");
}

function normalizeModulos(modulos_ativos: any): string[] {
  if (!modulos_ativos) return [];

  if (Array.isArray(modulos_ativos)) {
    return modulos_ativos.map(String).map(s => s.trim()).filter(Boolean);
  }

  if (typeof modulos_ativos === "string") {
    const raw = modulos_ativos.trim();
    if (!raw) return [];

    // tenta JSON primeiro
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(String).map(s => s.trim()).filter(Boolean);
      }
    } catch {}

    // fallback: "OS,ESTOQUE,FINANCEIRO"
    return raw.split(",").map(s => s.trim()).filter(Boolean);
  }

  return [];
}

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const [modulos, setModulos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarModulos = useCallback(async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setModulos([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const config = await api.getConfig();
      const lista = normalizeModulos(config?.modulos_ativos);
      setModulos(lista);
    } catch (error) {
      console.error("Erro ao carregar módulos:", error);
      setModulos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOnLoginRoute()) {
      setLoading(false);
      return;
    }

    // carrega ao iniciar
    carregarModulos();

    // quando o login salvar o token, a gente recarrega aqui
    const onAuthChanged = () => carregarModulos();

    // também recarrega se trocar rota via hash (pra garantir)
    const onHashChange = () => {
      if (!isOnLoginRoute()) carregarModulos();
    };

    window.addEventListener("authTokenChanged", onAuthChanged as EventListener);
    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("authTokenChanged", onAuthChanged as EventListener);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [carregarModulos]);

  function hasModule(moduleId: string) {
    return modulos.includes(moduleId);
  }

  return (
    <ModuleContext.Provider value={{ modulos, hasModule, carregarModulos, loading }}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModules() {
  return useContext(ModuleContext);
}
