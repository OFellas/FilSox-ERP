import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../services/api";

interface AuthContextData {
  user: { login: string; nome: string } | null;
  role: "ADMIN" | "VENDEDOR" | "SUPER_ADMIN" | null;
  signIn: (user: string, pass: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ login: string; nome: string } | null>(null);
  const [role, setRole] = useState<"ADMIN" | "VENDEDOR" | null>(null);
  // Começa carregando false, pois não temos sessão persistente real ainda
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    // Tenta recuperar login salvo no localStorage (opcional para manter logado ao fechar)
    const storedRole = localStorage.getItem("filsox_role");
    const storedUser = localStorage.getItem("filsox_user");
    
    if (storedRole && storedUser) {
        setRole(storedRole as "ADMIN" | "VENDEDOR");
        setUser(JSON.parse(storedUser));
    }
  }, []);

  async function signIn(login: string, pass: string) {
    setLoading(true);
    try {
      // Usa a função login simulada do seu api.ts
      const response = await api.login(login, pass);
      
      if (response.success) {
        const fakeUser = { login, nome: login.toUpperCase() };
        setUser(fakeUser);
        setRole(response.role as "ADMIN" | "VENDEDOR");
        
        // Salva no armazenamento local do navegador/electron
        localStorage.setItem("filsox_role", response.role);
        localStorage.setItem("filsox_user", JSON.stringify(fakeUser));
      }
    } catch (error) {
      alert("Erro ao logar: " + error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    setUser(null);
    setRole(null);
    localStorage.removeItem("filsox_role");
    localStorage.removeItem("filsox_user");
  }

  return (
    <AuthContext.Provider value={{ user, role, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}