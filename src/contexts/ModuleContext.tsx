import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

interface ModuleContextData {
  modulos: string[];
  hasModule: (moduleId: string) => boolean;
  carregarModulos: () => Promise<void>;
  loading: boolean;
}

const ModuleContext = createContext<ModuleContextData>({} as ModuleContextData);

function isOnLoginRoute() {
  // Funciona com BrowserRouter e HashRouter
  const path = window.location.pathname || "";
  const hash = window.location.hash || "";
  return path === "/login" || hash.includes("/login");
}

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const [modulos, setModulos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarModulos() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setModulos([]);      // sem login = sem módulos carregados
      setLoading(false);   // importante pra não travar
      return;
    }

    try {
      const config = await api.getConfig();

      let lista: string[] = [];

      if (typeof config?.modulos_ativos === "string") {
        lista = JSON.parse(config.modulos_ativos || "[]");
      } else if (Array.isArray(config?.modulos_ativos)) {
        lista = config.modulos_ativos;
      }

      setModulos(lista);
    } catch (error) {
      console.error("Erro ao carregar módulos:", error);
      setModulos([]); // melhor do que liberar OS/ESTOQUE no erro
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Não tenta carregar módulos na tela de login
    if (isOnLoginRoute()) {
      setLoading(false);
      return;
    }

    carregarModulos();
  }, []);

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
