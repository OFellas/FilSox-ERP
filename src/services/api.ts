import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api-filsox.adailtonfelipedeoliveira.workers.dev";

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("filsox_role");
      localStorage.removeItem("filsox_user");
      window.location.href = "/#/login"; // HashRouter
    }
    return Promise.reject(error);
  }
);

export const api = {
  // === AUTENTICAÇÃO ===
  login: async (login: string, senha: string) => {
    // Worker aceita user/pass ou login/senha — vou mandar os dois pra não ter erro
    const res = await apiClient.post("/login", { login, senha, user: login, pass: senha });
    if (res.data?.success && res.data?.token) {
      localStorage.setItem("authToken", res.data.token);
    }
    return res.data;
  },

  // === SISTEMA & CONFIG ===
  getSystemInfo: async () => {
    try {
      const res = await apiClient.get("/info");
      return res.data;
    } catch {
      return null;
    }
  },

  getConfig: async () => {
    const res = await apiClient.get("/config");
    return res.data;
  },

  salvarConfig: async (config: any) => {
    await apiClient.post("/config", config);
  },

  // === ORDENS DE SERVIÇO (OS) ===
  listar: async () => {
    const res = await apiClient.get("/os");
    return res.data;
  },

  criar: async (dados: any) => {
    const res = await apiClient.post("/os", dados);
    return res.data;
  },

  buscarPorNumero: async (numero: string) => {
    const res = await apiClient.get(`/os/${numero}`);
    return res.data;
  },

  atualizar: async (id: number, dados: any) => {
    await apiClient.put(`/os/${id}`, dados);
  },

  apagar: async (numero: string) => {
    await apiClient.delete(`/os/${numero}`);
  },

  // === PRODUTOS (ESTOQUE) ===
  listarProdutos: async () => {
    const res = await apiClient.get("/produtos");
    return res.data;
  },

  criarProduto: async (dados: any) => {
    await apiClient.post("/produtos", dados);
  },

  atualizarProduto: async (id: number, dados: any) => {
    await apiClient.put(`/produtos/${id}`, dados);
  },

  apagarProduto: async (id: number) => {
    await apiClient.delete(`/produtos/${id}`);
  },

  // === FINANCEIRO ===
  listarFinanceiro: async () => {
    const res = await apiClient.get("/financeiro");
    return res.data;
  },

  criarMovimentacao: async (dados: any) => {
    await apiClient.post("/financeiro", dados);
  },

  apagarMovimentacao: async (id: number) => {
    await apiClient.delete(`/financeiro/${id}`);
  },

  atualizarStatusMovimentacao: async (id: number, status: string) => {
    await apiClient.put(`/financeiro/${id}`, { status });
  },

  // === CLIENTES (CRM) ===
  listarClientes: async () => {
    const res = await apiClient.get("/clientes");
    return res.data;
  },

  buscarClienteCompleto: async (id: number) => {
    const res = await apiClient.get(`/clientes/${id}`);
    return res.data;
  },

  criarCliente: async (dados: any) => {
    await apiClient.post("/clientes", dados);
  },

  atualizarCliente: async (id: number, dados: any) => {
    await apiClient.put(`/clientes/${id}`, dados);
  },

  apagarCliente: async (id: number) => {
    await apiClient.delete(`/clientes/${id}`);
  },

  // === VENDAS (PDV) ===
  listarVendas: async () => {
    const res = await apiClient.get("/vendas");
    return res.data;
  },

  criarVenda: async (dados: any) => {
    const res = await apiClient.post("/vendas", dados);
    return res.data;
  },

  // === GERENCIAMENTO DE USUÁRIOS ===
  listarUsuarios: async () => {
    const res = await apiClient.get("/usuarios");
    return res.data;
  },

  criarUsuario: async (dados: any) => {
    await apiClient.post("/usuarios", dados);
  },

  atualizarUsuario: async (id: number, dados: any) => {
    await apiClient.put(`/usuarios/${id}`, dados);
  },

  apagarUsuario: async (id: number) => {
    await apiClient.delete(`/usuarios/${id}`);
  },

  // === SUPER ADMIN ===
  listarLojas: async () => {
    const res = await apiClient.get("/admin/lojas");
    return res.data;
  },

  criarLoja: async (dados: any) => {
    const res = await apiClient.post("/admin/lojas", dados);
    return res.data; // deve vir {id, admin_login, admin_senha}
  },

  atualizarLoja: async (id: number, dados: any) => {
    await apiClient.put(`/admin/lojas/${id}`, dados); // modulos, nome_loja, etc
  },

  atualizarCredenciaisLoja: async (id: number, dados: { login?: string; senha?: string }) => {
    await apiClient.put(`/admin/lojas/${id}/credenciais`, dados);
  },

  apagarLoja: async (id: number) => {
    await apiClient.delete(`/admin/lojas/${id}`);
  },
};
