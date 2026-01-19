import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://api-filsox.adailtonfelipedeoliveira.workers.dev";

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
      window.location.href = "/#/login";
    }
    return Promise.reject(error);
  }
);

// util simples: evita quebrar quando o backend devolve string/undefined
const toNumber = (v: any, fallback = 0) => {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const api = {
  // === AUTENTICAÇÃO ===
  login: async (user: string, pass: string) => {
    const res = await apiClient.post("/login", { user, pass });

    if (res.data?.success && res.data?.token) {
      localStorage.setItem("authToken", res.data.token);
      window.dispatchEvent(new Event("authTokenChanged"));
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

  // OBS: teu worker pode não ter PUT/POST /config.
  // Esse método fica "pronto" pra quando você implementar.
  salvarConfig: async (config: any) => {
    try {
      await apiClient.put("/config", config);
    } catch {
      await apiClient.post("/config", config);
    }
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

  // compat: seu worker aceita /os/:value e tenta id ou numero
  buscarPorNumero: async (numero: string) => {
    const res = await apiClient.get(`/os/${encodeURIComponent(numero)}`);
    return res.data;
  },

  // se você quiser usar o endpoint sem ambiguidade:
  buscarPorNumeroSeguro: async (numero: string) => {
    const res = await apiClient.get(`/os-numero/${encodeURIComponent(numero)}`);
    return res.data;
  },

  atualizar: async (id: number, dados: any) => {
    await apiClient.put(`/os/${id}`, dados);
  },

  // apagar por id (e tenta fallback)
  apagar: async (idOuNumero: string | number) => {
    const value = String(idOuNumero);

    // tenta como está
    try {
      const res = await apiClient.delete(`/os/${encodeURIComponent(value)}`);
      return res.data;
    } catch (e) {
      // fallback: se seu backend tiver rota alternativa futuramente
      const res2 = await apiClient.delete(`/os-numero/${encodeURIComponent(value)}`);
      return res2.data;
    }
  },

  // === PRODUTOS (ESTOQUE) ===
  listarProdutos: async () => {
    const res = await apiClient.get("/produtos");
    return res.data;
  },

  criarProduto: async (dados: any) => {
    const res = await apiClient.post("/produtos", dados);
    return res.data;
  },

  atualizarProduto: async (id: number, dados: any) => {
    const res = await apiClient.put(`/produtos/${id}`, dados);
    return res.data;
  },

  apagarProduto: async (id: number) => {
    const res = await apiClient.delete(`/produtos/${id}`);
    return res.data;
  },

  // === FINANCEIRO ===
  listarFinanceiro: async () => {
    const res = await apiClient.get("/financeiro");
    return res.data;
  },

  criarMovimentacao: async (dados: any) => {
    const res = await apiClient.post("/financeiro", dados);
    return res.data;
  },

  apagarMovimentacao: async (id: number) => {
    const res = await apiClient.delete(`/financeiro/${id}`);
    return res.data;
  },

  atualizarStatusMovimentacao: async (id: number, status: string) => {
    const res = await apiClient.put(`/financeiro/${id}`, { status });
    return res.data;
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
    const res = await apiClient.post("/clientes", dados);
    return res.data;
  },

  atualizarCliente: async (id: number, dados: any) => {
    const res = await apiClient.put(`/clientes/${id}`, dados);
    return res.data;
  },

  apagarCliente: async (id: number) => {
    const res = await apiClient.delete(`/clientes/${id}`);
    return res.data;
  },

  // === VENDAS (PDV) ===
  listarVendas: async () => {
    const res = await apiClient.get("/vendas");
    return res.data;
  },

  criarVenda: async (dados: any) => {
    const res = await apiClient.post("/vendas", dados);

    // normalização opcional (não atrapalha, só ajuda)
    // (se preferir, pode remover esse bloco)
    const d = res.data ?? {};
    if (d && typeof d === "object") {
      return {
        ...d,
        id: d.id ?? d.vendaId ?? d.venda_id ?? null,
        subtotal: toNumber(d.subtotal, d.subTotal ?? 0),
        desconto: toNumber(d.desconto, d.discount ?? 0),
        total: toNumber(d.total, d.valor_total ?? 0),
        valor_recebido: toNumber(d.valor_recebido, d.recebido ?? 0),
        troco: toNumber(d.troco, d.troco_calc ?? 0),
      };
    }

    return d;
  },

  // === GERENCIAMENTO DE USUÁRIOS ===
  listarUsuarios: async () => {
    const res = await apiClient.get("/usuarios");
    return res.data;
  },

  criarUsuario: async (dados: any) => {
    const res = await apiClient.post("/usuarios", dados);
    return res.data;
  },

  atualizarUsuario: async (id: number, dados: any) => {
    const res = await apiClient.put(`/usuarios/${id}`, dados);
    return res.data;
  },

  apagarUsuario: async (id: number) => {
    const res = await apiClient.delete(`/usuarios/${id}`);
    return res.data;
  },

  // === SUPER ADMIN ===
  listarLojas: async () => {
    const res = await apiClient.get("/admin/lojas");
    return res.data;
  },

  criarLoja: async (dados: any) => {
    const res = await apiClient.post("/admin/lojas", dados);
    return res.data;
  },

  atualizarLoja: async (id: number, dados: any) => {
    const res = await apiClient.put(`/admin/lojas/${id}`, dados);
    return res.data;
  },

  atualizarCredenciaisLoja: async (
    id: number,
    dados: { login?: string; senha?: string }
  ) => {
    const res = await apiClient.put(`/admin/lojas/${id}/credenciais`, dados);
    return res.data;
  },

  apagarLoja: async (id: number) => {
    const res = await apiClient.delete(`/admin/lojas/${id}`);
    return res.data;
  },
};
