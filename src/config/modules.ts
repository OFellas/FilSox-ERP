import { Wrench, Package, DollarSign, Users } from "lucide-react";

export interface ModuleDef {
  id: string;
  label: string;
  icon: any;
  rota: string;
}

export const ALL_MODULES: Record<string, ModuleDef> = {
  OS: { 
      id: "OS", 
      label: "Ordens de Serviço", 
      icon: Wrench, 
      rota: "/nova-os" 
  },
  ESTOQUE: { 
      id: "ESTOQUE", 
      label: "Controle de Estoque", 
      icon: Package, 
      rota: "/estoque" 
  },
  FINANCEIRO: { 
      id: "FINANCEIRO", 
      label: "Financeiro", 
      icon: DollarSign, 
      rota: "/financeiro" 
  },
  CLIENTES: { 
      id: "CLIENTES", 
      label: "Gestão de Clientes", 
      icon: Users, 
      rota: "/clientes" 
  }
};

export function isModuleActive(moduleId: string, activeList: string[] | string) {
    if (!activeList) return false;
    let list = activeList;
    if (typeof activeList === 'string') {
        try { list = JSON.parse(activeList); } catch { return false; }
    }
    return Array.isArray(list) && list.includes(moduleId);
}