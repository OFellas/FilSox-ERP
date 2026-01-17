import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Search, Plus, Trash2, Edit, Package, FileText } from "lucide-react";

export default function Estoque() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  
  // Estados para Novo/Editar Produto
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [abaAtiva, setAbaAtiva] = useState("GERAL");
  
  // Formulário
  const [form, setForm] = useState({
      nome: "", marca: "", modelo: "", 
      preco_custo: "", preco_venda: "", 
      quantidade: "", estoque_minimo: "", 
      codigo_barras: "", fornecedor: "", localizacao: "",
      ncm: "", cfop: "5102", unidade_comercial: "UN", cst_csosn: "102", origem: "0"
  });

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setLoading(true);
    try {
        const dados = await api.listarProdutos();
        setProdutos(dados);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
      if (confirm("Tem certeza que deseja apagar este produto?")) {
          try {
              await api.apagarProduto(id);
              setProdutos(produtos.filter(p => p.id !== id));
          } catch (error) { alert("Erro ao apagar produto."); }
      }
  }

  function handleEdit(produto: any) {
      setEditando(produto);
      setForm({
          nome: produto.nome, marca: produto.marca, modelo: produto.modelo,
          preco_custo: String(produto.preco_custo), preco_venda: String(produto.preco_venda),
          quantidade: String(produto.quantidade), estoque_minimo: String(produto.estoque_minimo),
          codigo_barras: produto.codigo_barras || "", fornecedor: produto.fornecedor || "",
          localizacao: produto.localizacao || "",
          ncm: produto.ncm || "", cfop: produto.cfop || "5102",
          unidade_comercial: produto.unidade_comercial || "UN", cst_csosn: produto.cst_csosn || "102", origem: produto.origem || "0"
      });
      setAbaAtiva("GERAL");
      setModalOpen(true);
  }

  function handleNovo() {
      setEditando(null);
      setForm({
          nome: "", marca: "", modelo: "", preco_custo: "", preco_venda: "", 
          quantidade: "", estoque_minimo: "5", codigo_barras: "", fornecedor: "", localizacao: "",
          ncm: "", cfop: "5102", unidade_comercial: "UN", cst_csosn: "102", origem: "0"
      });
      setAbaAtiva("GERAL");
      setModalOpen(true);
  }

  async function handleSalvar() {
      try {
          const payload = {
              ...form,
              preco_custo: Number(form.preco_custo),
              preco_venda: Number(form.preco_venda),
              quantidade: Number(form.quantidade),
              estoque_minimo: Number(form.estoque_minimo)
          };
          if (editando) await api.atualizarProduto(editando.id, payload);
          else await api.criarProduto(payload);
          setModalOpen(false);
          carregar();
      } catch (error) { alert("Erro ao salvar produto"); }
  }

  const totalCusto = produtos.reduce((acc, p) => acc + (p.preco_custo * p.quantidade), 0);
  const totalVenda = produtos.reduce((acc, p) => acc + (p.preco_venda * p.quantidade), 0);
  const itensRuptura = produtos.filter(p => p.quantidade <= p.estoque_minimo).length;

  const listaFiltrada = produtos.filter(p => 
      p.nome.toLowerCase().includes(busca.toLowerCase()) || 
      (p.codigo_barras && p.codigo_barras.includes(busca))
  );

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">Carregando estoque...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20 animate-fade-in dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">📦 Gestão de Estoque</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Controle eficiente para maximizar seu fluxo de caixa.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => window.history.back()} className="px-4 py-2 border rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">Voltar</button>
            <button onClick={handleNovo} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 flex items-center gap-2 shadow"><Plus size={18} /> Novo Produto</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500 shadow-sm"><p className="text-xs font-bold text-gray-500 uppercase">Custo de Estoque</p><p className="text-2xl font-bold text-blue-600 dark:text-blue-400">R$ {totalCusto.toLocaleString()}</p></div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-green-500 shadow-sm"><p className="text-xs font-bold text-gray-500 uppercase">Potencial de Venda</p><p className="text-2xl font-bold text-green-600 dark:text-green-400">R$ {totalVenda.toLocaleString()}</p></div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-red-500 shadow-sm"><p className="text-xs font-bold text-gray-500 uppercase">Risco de Ruptura</p><p className="text-2xl font-bold text-red-600 dark:text-red-400">{itensRuptura} Itens</p></div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-purple-500 shadow-sm"><p className="text-xs font-bold text-gray-500 uppercase">Total de Itens</p><p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{produtos.length}</p></div>
      </div>

      <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por Nome, Marca ou bipar Código de Barras..." className="w-full pl-10 p-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 text-xs uppercase">
                  <tr><th className="p-4">Info / Código</th><th className="p-4">Marca</th><th className="p-4">Custo</th><th className="p-4">Venda</th><th className="p-4 text-center">Estoque</th><th className="p-4 text-right">Ações</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                  {listaFiltrada.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="p-4"><div className="font-bold text-gray-800 dark:text-white">{p.nome}</div><div className="text-xs text-gray-400 flex items-center gap-1"><Package size={10} /> {p.codigo_barras || "S/ Código"}</div></td>
                          <td className="p-4">{p.marca}</td>
                          <td className="p-4 text-gray-500">R$ {p.preco_custo.toFixed(2)}</td>
                          <td className="p-4 font-bold text-green-600 dark:text-green-400">R$ {p.preco_venda.toFixed(2)}</td>
                          <td className="p-4 text-center"><span className={`px-3 py-1 rounded font-bold ${p.quantidade <= p.estoque_minimo ? 'bg-red-100 text-red-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'}`}>{p.quantidade}</span></td>
                          <td className="p-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded dark:hover:bg-blue-900/20"><Edit size={18} /></button><button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900/20"><Trash2 size={18} /></button></div></td>
                      </tr>
                  ))}
              </tbody>
          </table>
          {listaFiltrada.length === 0 && <div className="p-10 text-center text-gray-500">Nenhum produto encontrado.</div>}
      </div>

      {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl border dark:border-gray-700">
                  <h2 className="text-xl font-bold mb-4 dark:text-white">{editando ? "Editar Produto" : "Novo Produto"}</h2>
                  <div className="flex border-b dark:border-gray-600 mb-4">
                      <button onClick={() => setAbaAtiva("GERAL")} className={`px-4 py-2 text-sm font-bold border-b-2 transition ${abaAtiva === "GERAL" ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Dados Gerais</button>
                      <button onClick={() => setAbaAtiva("FISCAL")} className={`px-4 py-2 text-sm font-bold border-b-2 transition flex items-center gap-2 ${abaAtiva === "FISCAL" ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}><FileText size={14}/> Fiscal (NFe)</button>
                  </div>
                  {abaAtiva === "GERAL" && (
                      <div className="grid grid-cols-2 gap-4 animate-fade-in">
                          <input className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Nome do Produto" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} autoFocus />
                          <input className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Código de Barras" value={form.codigo_barras} onChange={e => setForm({...form, codigo_barras: e.target.value})} />
                          <input className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Marca" value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} />
                          <input className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Modelo" value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} />
                          <div className="col-span-2 grid grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-700/30 p-3 rounded border dark:border-gray-600">
                              <div><label className="text-xs font-bold text-gray-500">Custo (R$)</label><input className="w-full border p-1 rounded dark:bg-gray-700 dark:text-white" value={form.preco_custo} onChange={e => setForm({...form, preco_custo: e.target.value})} /></div>
                              <div><label className="text-xs font-bold text-gray-500">Venda (R$)</label><input className="w-full border p-1 rounded dark:bg-gray-700 dark:text-white font-bold text-green-600" value={form.preco_venda} onChange={e => setForm({...form, preco_venda: e.target.value})} /></div>
                              <div><label className="text-xs font-bold text-gray-500">Qtd Atual</label><input className="w-full border p-1 rounded dark:bg-gray-700 dark:text-white" type="number" value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} /></div>
                              <div><label className="text-xs font-bold text-gray-500">Estoque Mín.</label><input className="w-full border p-1 rounded dark:bg-gray-700 dark:text-white" type="number" value={form.estoque_minimo} onChange={e => setForm({...form, estoque_minimo: e.target.value})} /></div>
                          </div>
                          <input className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Fornecedor" value={form.fornecedor} onChange={e => setForm({...form, fornecedor: e.target.value})} />
                          <input className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Localização (Prateleira/Gaveta)" value={form.localizacao} onChange={e => setForm({...form, localizacao: e.target.value})} />
                      </div>
                  )}
                  {abaAtiva === "FISCAL" && (
                      <div className="grid grid-cols-2 gap-4 animate-fade-in">
                          <div className="col-span-2 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-xs text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800 mb-2">Dados necessários para emissão de Nota Fiscal (NFC-e / NF-e). Consulte seu contador.</div>
                          <div><label className="text-xs font-bold text-gray-500">NCM (Obrigatório)</label><input className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Ex: 8517.12.31" value={form.ncm} onChange={e => setForm({...form, ncm: e.target.value})} /></div>
                          <div><label className="text-xs font-bold text-gray-500">CSOSN / CST</label><select className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.cst_csosn} onChange={e => setForm({...form, cst_csosn: e.target.value})}><option value="102">102 - Simples Nacional (Sem crédito)</option><option value="101">101 - Simples Nacional (Com crédito)</option><option value="500">500 - ICMS pago anteriormente</option><option value="00">00 - Tributada integralmente</option></select></div>
                          <div><label className="text-xs font-bold text-gray-500">CFOP (Venda)</label><input className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.cfop} onChange={e => setForm({...form, cfop: e.target.value})} /></div>
                          <div><label className="text-xs font-bold text-gray-500">Unidade Comercial</label><input className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="UN, KG, CX" value={form.unidade_comercial} onChange={e => setForm({...form, unidade_comercial: e.target.value})} /></div>
                          <div className="col-span-2"><label className="text-xs font-bold text-gray-500">Origem da Mercadoria</label><select className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.origem} onChange={e => setForm({...form, origem: e.target.value})}><option value="0">0 - Nacional</option><option value="1">1 - Importação direta</option><option value="2">2 - Estrangeira (Adq. no mercado interno)</option></select></div>
                      </div>
                  )}
                  <div className="flex justify-end gap-2 mt-6">
                      <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Cancelar</button>
                      <button onClick={handleSalvar} className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Salvar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}