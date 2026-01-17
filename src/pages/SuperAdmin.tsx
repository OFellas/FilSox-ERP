import { useEffect, useState } from "react";
import { ALL_MODULES } from "../config/modules";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { 
    Server, LogOut, Plus, Users, ArrowLeft, 
    CheckCircle2, XCircle, ShieldCheck 
} from "lucide-react";

export default function SuperAdmin() {
  const { role, signOut } = useAuth();
  const navigate = useNavigate();
  const [lojas, setLojas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Form Nova Loja
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  useEffect(() => {
      if (role !== "SUPER_ADMIN") {
          navigate("/");
      }
  }, [role, navigate]);

  useEffect(() => {
    carregarLojas();
  }, []);

  async function carregarLojas() {
    setLoading(true);
    try {
        const dados = await api.listarLojas();
        
        // Garante que modulos_ativos seja um array
        const dadosFormatados = dados.map((loja: any) => {
            let mods = [];
            try {
                mods = typeof loja.modulos_ativos === 'string' 
                    ? JSON.parse(loja.modulos_ativos) 
                    : loja.modulos_ativos;
            } catch (e) { mods = []; }
            return { ...loja, modulos_ativos: Array.isArray(mods) ? mods : [] };
        });

        setLojas(dadosFormatados);
    } catch (error) {
        // Ignora erro silencioso ou loga
    } finally {
        setLoading(false);
    }
  }

  async function handleCriarLoja() {
      if (!nome) return alert("Nome é obrigatório");
      await api.criarLoja({ nome, email, telefone });
      setModalOpen(false);
      setNome(""); setEmail(""); setTelefone("");
      carregarLojas();
  }

  async function toggleModulo(lojaId: number, modulosAtuais: string[], moduloKey: string) {
      let novosModulos;
      
      if (modulosAtuais.includes(moduloKey)) {
          novosModulos = modulosAtuais.filter(m => m !== moduloKey);
      } else {
          novosModulos = [...modulosAtuais, moduloKey];
      }

      // Optimistic UI Update
      setLojas(prev => prev.map(l => l.id === lojaId ? { ...l, modulos_ativos: novosModulos } : l));

      try {
          await api.atualizarLoja(lojaId, { modulos: novosModulos });
      } catch (error) {
          alert("Erro ao salvar alteração");
          carregarLojas(); 
      }
  }

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Carregando painel mestre...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
        <div className="max-w-7xl mx-auto">
            
            {/* === HEADER === */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-gray-800 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 flex items-center gap-2">
                        Painel Mestre (SaaS)
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Gerenciamento de Clientes e Licenças</p>
                </div>
                
                <div className="flex gap-3">
                    {/* BOTÃO VOLTAR QUE ESTAVA FALTANDO */}
                    <button 
                        onClick={() => navigate("/")} 
                        className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition"
                    >
                        <ArrowLeft size={16} /> Voltar ao Dashboard
                    </button>

                    <button 
                        onClick={() => setModalOpen(true)} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-900/20"
                    >
                        <Plus size={16} /> Nova Loja
                    </button>
                    
                    <button 
                        onClick={() => { signOut(); navigate("/login"); }} 
                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-900/50 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition"
                    >
                        <LogOut size={16} /> Sair
                    </button>
                </div>
            </div>

            {/* === LISTA DE LOJAS === */}
            <div className="space-y-6">
                {lojas.map((loja) => (
                    <div key={loja.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all shadow-xl">
                        
                        {/* Cabeçalho do Card da Loja */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    {loja.nome_loja || "Loja Sem Nome"} 
                                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-600 font-mono">ID: {loja.id}</span>
                                </h2>
                                <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                                    {loja.email || "Sem e-mail"} <span className="text-gray-600">•</span> {loja.telefone || "Sem telefone"}
                                </p>
                            </div>
                            <div>
                                <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Ativo
                                </span>
                            </div>
                        </div>

                        {/* Área de Módulos (Estilo Card Roxo) */}
                        <div className="bg-gray-900/80 rounded-lg p-5 border border-gray-800">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">Módulos Contratados</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {Object.values(ALL_MODULES).map((mod: any) => {
                                    const isAtivo = loja.modulos_ativos.includes(mod.id);
                                    
                                    return (
                                        <button
                                            key={mod.id}
                                            onClick={() => toggleModulo(loja.id, loja.modulos_ativos, mod.id)}
                                            className={`
                                                relative overflow-hidden group flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 text-left
                                                ${isAtivo 
                                                    ? 'bg-purple-500/10 border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                                                    : 'bg-gray-800/50 border-gray-700 text-gray-500 opacity-60 hover:opacity-100 hover:border-gray-600'}
                                            `}
                                        >
                                            {/* Ícone */}
                                            <div className={`
                                                p-2 rounded-lg transition-colors
                                                ${isAtivo ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-400 group-hover:bg-gray-600'}
                                            `}>
                                                <mod.icon size={20} />
                                            </div>

                                            {/* Texto */}
                                            <div>
                                                <span className={`block text-sm font-bold ${isAtivo ? 'text-white' : 'text-gray-400'}`}>
                                                    {mod.label}
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isAtivo ? 'text-purple-300' : 'text-gray-600'}`}>
                                                    {isAtivo ? "LIBERADO" : "BLOQUEADO"}
                                                </span>
                                            </div>

                                            {/* Indicador de Status (Canto) */}
                                            <div className="absolute top-2 right-2">
                                                {isAtivo 
                                                    ? <CheckCircle2 size={14} className="text-purple-400" /> 
                                                    : <XCircle size={14} className="text-gray-600" />
                                                }
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                ))}

                {lojas.length === 0 && (
                    <div className="text-center py-20 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                        <Server size={48} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400 text-lg">Nenhuma loja cadastrada ainda.</p>
                        <button onClick={() => setModalOpen(true)} className="text-indigo-400 hover:text-indigo-300 font-bold mt-2">
                            Criar a primeira loja
                        </button>
                    </div>
                )}
            </div>

            {/* === MODAL NOVA LOJA === */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                            <div className="p-2 bg-indigo-600 rounded-lg"><Users size={20} /></div>
                            Novo Cliente SaaS
                        </h2>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome da Loja</label>
                                <input className="w-full bg-gray-900 border border-gray-600 p-3 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" placeholder="Ex: Tech Solutions" value={nome} onChange={e => setNome(e.target.value)} autoFocus />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">E-mail Admin</label>
                                <input className="w-full bg-gray-900 border border-gray-600 p-3 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" placeholder="admin@loja.com" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Telefone</label>
                                <input className="w-full bg-gray-900 border border-gray-600 p-3 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" placeholder="(00) 00000-0000" value={telefone} onChange={e => setTelefone(e.target.value)} />
                            </div>
                            
                            <div className="bg-indigo-900/30 p-4 rounded-lg text-xs text-indigo-200 border border-indigo-500/30 flex gap-3">
                                <ShieldCheck size={32} className="text-indigo-400 shrink-0" />
                                <div>
                                    <p className="font-bold text-indigo-100 mb-1">Credenciais Automáticas</p>
                                    <p>Um usuário <strong>admin</strong> será criado automaticamente para esta loja com a senha padrão: <strong>admin123</strong></p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-700">
                            <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg font-bold transition">Cancelar</button>
                            <button onClick={handleCriarLoja} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-900/50 transition">Criar Loja</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
}