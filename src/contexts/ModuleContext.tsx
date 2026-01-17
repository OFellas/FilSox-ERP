import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

interface ModuleContextData {
  modulos: string[];
  hasModule: (moduleId: string) => boolean;
  carregarModulos: () => Promise<void>;
  loading: boolean;
}

const ModuleContext = createContext<ModuleContextData>({} as ModuleContextData);

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const [modulos, setModulos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Função que vai no servidor buscar as permissões atualizadas
  async function carregarModulos() {
    try {
      const config = await api.getConfig();
      let lista = [];
      
      // Tenta ler o JSON que vem do banco
      if (typeof config.modulos_ativos === 'string') {
        lista = JSON.parse(config.modulos_ativos);
      } else if (Array.isArray(config.modulos_ativos)) {
        lista = config.modulos_ativos;
      }
      
      setModulos(lista);
    } catch (error) {
      console.error("Erro ao carregar módulos:", error);
      // Fallback básico se der erro
      setModulos(["OS", "ESTOQUE"]); 
    } finally {
      setLoading(false);
    }
  }

  // Carrega na primeira vez que abre o app
  useEffect(() => {
    carregarModulos();
  }, []);

  function hasModule(moduleId: string) {
    // Super Admin tem acesso a tudo, sempre
    // (Opcional: se quiser testar a visão do usuário, remova essa linha)
    // if (localStorage.getItem("@Auth:role") === "SUPER_ADMIN") return true;

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