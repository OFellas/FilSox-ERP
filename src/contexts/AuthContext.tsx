import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../services/api";

type Role = "ADMIN" | "VENDEDOR" | "SUPER_ADMIN";

interface AuthContextData {
  user: { login: string; nome: string } | null;
  role: Role | null;
  signIn: (user: string, pass: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ login: string; nome: string } | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("filsox_role");
    const storedUser = localStorage.getItem("filsox_user");
    const token = localStorage.getItem("authToken");

    if (token && storedRole && storedUser) {
      setRole(storedRole as Role);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  async function signIn(login: string, pass: string) {
    setLoading(true);
    try {
      const response = await api.login(login, pass);

      if (!response?.success) {
        throw new Error(response?.error || "Falha no login");
      }

      const roleResp = response.role as Role;
      const nomeResp = (response.nome || login).toString();

      const newUser = { login, nome: nomeResp };
      setUser(newUser);
      setRole(roleResp);

      localStorage.setItem("filsox_role", roleResp);
      localStorage.setItem("filsox_user", JSON.stringify(newUser));
      // authToken já é salvo no api.ts
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    setUser(null);
    setRole(null);
    localStorage.removeItem("filsox_role");
    localStorage.removeItem("filsox_user");
    localStorage.removeItem("authToken");
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