import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Search, Plus, Users, MapPin, Phone, Edit, Trash2, User, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const [form, setForm] = useState({
      nome: "", documento: "", telefone: "", email: "", 
      cep: "", endereco: "", cidade: "", tipo: "PF", tags: "", observacoes: ""
  });

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
        const dados = await api.listarClientes();
        setClientes(dados);
    } catch (e) { console.error(e); }
  }

  async function handleBuscarCep(ev: any) {
      const cep = ev.target.value.replace(/\D/g, ''); 
      setForm({ ...form, cep: ev.target.value });

      if (cep.length === 8) {
          setBuscandoCep(true);
          try {
              const res = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
              if (!res.data.erro) {
                  setForm(prev => ({
                      ...prev,
                      endereco: `${res.data.logradouro}, ${res.data.bairro}`,
                      cidade: `${res.data.localidade} - ${res.data.uf}`
                  }));
              } else {
                  alert("CEP não encontrado!");
              }
          } catch (error) { console.error("Erro ao buscar CEP"); } finally { setBuscandoCep(false); }
      }
  }

  function handleNovo() {
      setEditando(null);
      setForm({ nome: "", documento: "", telefone: "", email: "", cep: "", endereco: "", cidade: "", tipo: "PF", tags: "", observacoes: "" });
      setModalOpen(true);
  }

  function handleEdit(cliente: any) {
      setEditando(cliente);
      setForm(cliente);
      setModalOpen(true);
  }

  async function handleSalvar() {
      try {
          if (editando) { await api.atualizarCliente(editando.id, form); } else { await api.criarCliente(form); }
          setModalOpen(false);
          carregar();
      } catch (error) { alert("Erro ao salvar cliente."); }
  }

  async function handleApagar(id: number) {
      if(confirm("Tem certeza que deseja excluir este cliente?")) {
          await api.apagarCliente(id);
          carregar();
      }
  }

  const listaFiltrada = clientes.filter(c => 
      c.nome.toLowerCase().includes(busca.toLowerCase()) || 
      c.documento?.includes(busca) ||
      c.telefone?.includes(busca)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20 animate-fade-in dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><Users /> Gestão de Clientes</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">CRM: Centralize o relacionamento com seus clientes.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => navigate("/")} className="px-4 py-2 border rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">Voltar</button>
            <button onClick={handleNovo} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 flex items-center gap-2 shadow"><Plus size={18} /> Novo Cliente</button>
        </div>
      </div>

      <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por Nome, CPF/CNPJ ou Telefone..." className="w-full pl-10 p-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listaFiltrada.map(c => (
              <div key={c.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border dark:border-gray-700 hover:shadow-md transition relative group">
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white ${c.tipo === 'PJ' ? 'bg-purple-500' : 'bg-blue-500'}`}>{c.nome.charAt(0).toUpperCase()}</div>
                          <div><h3 className="font-bold text-gray-800 dark:text-white leading-tight">{c.nome}</h3><p className="text-xs text-gray-500">{c.documento || "Sem documento"}</p></div>
                      </div>
                      <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-bold uppercase text-gray-500">{c.tipo}</span>
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300 mt-4 mb-4">
                      <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {c.telefone || "---"}</div>
                      <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /> {c.cidade || "---"}</div>
                  </div>
                  {c.tags && (
                      <div className="flex gap-1 flex-wrap mb-4">{c.tags.split(",").map((tag: string, i: number) => (<span key={i} className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">{tag.trim()}</span>))}</div>
                  )}
                  <div className="flex gap-2 border-t dark:border-gray-700 pt-3">
                      <button onClick={() => navigate(`/clientes/${c.id}`)} className="flex-1 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-200 text-xs font-bold rounded hover:bg-gray-100 dark:hover:bg-gray-600">Ver Histórico</button>
                      <button onClick={() => handleEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded dark:hover:bg-blue-900/30"><Edit size={16} /></button>
                      <button onClick={() => handleApagar(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900/30"><Trash2 size={16} /></button>
                  </div>
              </div>
          ))}
      </div>

      {modalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-2xl border dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2"><User /> {editando ? "Editar Cliente" : "Novo Cliente"}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Nome Completo *</label><input className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} autoFocus /></div>
                      <div><label className="text-xs font-bold text-gray-500 uppercase">Tipo Pessoa</label><select className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}><option value="PF">Pessoa Física</option><option value="PJ">Pessoa Jurídica</option></select></div>
                      <div><label className="text-xs font-bold text-gray-500 uppercase">CPF / CNPJ</label><input className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.documento} onChange={e => setForm({...form, documento: e.target.value})} /></div>
                      <div><label className="text-xs font-bold text-gray-500 uppercase">Telefone / WhatsApp</label><input className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} /></div>
                      <div><label className="text-xs font-bold text-gray-500 uppercase">Email</label><input className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                      <div className="md:col-span-2 border-t dark:border-gray-700 pt-2 mt-2"><p className="text-xs font-bold text-gray-400 mb-2">ENDEREÇO (Busca Automática)</p></div>
                      <div><label className="text-xs font-bold text-gray-500 uppercase">CEP (Somente Números)</label><div className="relative"><input className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.cep} onChange={handleBuscarCep} placeholder="00000000" maxLength={9} />{buscandoCep && <Loader2 className="absolute right-2 top-3 animate-spin text-blue-500" size={16} />}</div></div>
                      <div><label className="text-xs font-bold text-gray-500 uppercase">Cidade</label><input className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.cidade} onChange={e => setForm({...form, cidade: e.target.value})} /></div>
                      <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Endereço Completo</label><input className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} /></div>
                      <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Tags</label><input className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Ex: VIP, Atrasado, Indicação" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} /></div>
                      <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Observações</label><textarea className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={2} value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} /></div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6 pt-4 border-t dark:border-gray-700">
                      <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Cancelar</button>
                      <button onClick={handleSalvar} className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Salvar Cliente</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}