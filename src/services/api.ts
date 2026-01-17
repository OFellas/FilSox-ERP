import axios from "axios";

// URL da sua API (Cloudflare Worker)
const API_URL = "https://api-filsox.adailtonfelipedeoliveira.workers.dev";

export const api = {
  // === AUTENTICAÇÃO ===
  login: async (user: string, pass: string) => {
    const res = await axios.post(`${API_URL}/login`, { user, pass });
    return res.data;
  },

  // === SISTEMA & CONFIG ===
  getSystemInfo: async () => {
    try {
      const res = await axios.get(`${API_URL}/info`);
      return res.data;
    } catch { return null; }
  },
  getConfig: async () => {
    const res = await axios.get(`${API_URL}/config`);
    return res.data;
  },
  salvarConfig: async (config: any) => {
    await axios.post(`${API_URL}/config`, config);
  },

  // === ORDENS DE SERVIÇO (OS) ===
  listar: async () => {
    const res = await axios.get(`${API_URL}/os`);
    return res.data;
  },
  criar: async (dados: any) => {
    const res = await axios.post(`${API_URL}/os`, dados);
    return res.data;
  },
  buscarPorNumero: async (numero: string) => {
    const res = await axios.get(`${API_URL}/os/${numero}`);
    return res.data;
  },
  atualizar: async (id: number, dados: any) => {
    await axios.put(`${API_URL}/os/${id}`, dados);
  },
  apagar: async (numero: string) => {
    await axios.delete(`${API_URL}/os/${numero}`);
  },

  // === PRODUTOS (ESTOQUE) ===
  listarProdutos: async () => {
    const res = await axios.get(`${API_URL}/produtos`);
    return res.data;
  },
  criarProduto: async (dados: any) => {
    await axios.post(`${API_URL}/produtos`, dados);
  },
  atualizarProduto: async (id: number, dados: any) => {
    await axios.put(`${API_URL}/produtos/${id}`, dados);
  },
  apagarProduto: async (id: number) => {
    await axios.delete(`${API_URL}/produtos/${id}`);
  },

  // === FINANCEIRO ===
  listarFinanceiro: async () => {
    const res = await axios.get(`${API_URL}/financeiro`);
    return res.data;
  },
  criarMovimentacao: async (dados: any) => {
    await axios.post(`${API_URL}/financeiro`, dados);
  },
  apagarMovimentacao: async (id: number) => {
    await axios.delete(`${API_URL}/financeiro/${id}`);
  },
  atualizarStatusMovimentacao: async (id: number, status: string) => {
    await axios.put(`${API_URL}/financeiro/${id}`, { status });
  },

  // === CLIENTES (CRM) ===
  listarClientes: async () => {
    const res = await axios.get(`${API_URL}/clientes`);
    return res.data;
  },
  buscarClienteCompleto: async (id: number) => {
    const res = await axios.get(`${API_URL}/clientes/${id}`);
    return res.data;
  },
  criarCliente: async (dados: any) => {
    await axios.post(`${API_URL}/clientes`, dados);
  },
  atualizarCliente: async (id: number, dados: any) => {
    await axios.put(`${API_URL}/clientes/${id}`, dados);
  },
  apagarCliente: async (id: number) => {
    await axios.delete(`${API_URL}/clientes/${id}`);
  },

  // === VENDAS (PDV) ===
  listarVendas: async () => {
    const res = await axios.get(`${API_URL}/vendas`);
    return res.data;
  },
  criarVenda: async (dados: any) => {
    const res = await axios.post(`${API_URL}/vendas`, dados);
    return res.data;
  },

// === GERENCIAMENTO DE USUÁRIOS ===
  listarUsuarios: async () => {
    const res = await axios.get(`${API_URL}/usuarios`);
    return res.data;
  },
  criarUsuario: async (dados: any) => {
    await axios.post(`${API_URL}/usuarios`, dados);
  },
  atualizarUsuario: async (id: number, dados: any) => {
    await axios.put(`${API_URL}/usuarios/${id}`, dados);
  },
  apagarUsuario: async (id: number) => {
    await axios.delete(`${API_URL}/usuarios/${id}`);
  },

  // === SUPER ADMIN ===
  listarLojas: async () => {
    const res = await axios.get(`${API_URL}/admin/lojas`);
    return res.data;
  },
  criarLoja: async (dados: any) => {
    await axios.post(`${API_URL}/admin/lojas`, dados);
  },
  atualizarLoja: async (id: number, dados: any) => {
    await axios.put(`${API_URL}/admin/lojas/${id}`, dados);
  },
};