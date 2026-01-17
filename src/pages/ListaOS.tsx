import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { OS } from "../types/OS";

// --- HELPERS ---
function diasDesde(data: string) {
  if (!data) return 0;
  return Math.floor((Date.now() - new Date(data).getTime()) / (1000 * 60 * 60 * 24));
}

function formatarData(data: string) {
    if(!data) return "-";
    return new Date(data).toLocaleDateString('pt-BR');
}

// --- SUB-COMPONENTES VISUAIS ---

// 1. Modal de Enviar para Garantia
const ModalGarantia = ({ isOpen, onClose, onConfirm }: any) => {
    const [rma, setRma] = useState("");
    const [rastreio, setRastreio] = useState("");
    const [nfe, setNfe] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96">
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4 border-b pb-2">Enviar para Garantia</h2>
                
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Empresa / RMA *</label>
                <input className="w-full border p-2 rounded mb-3 dark:bg-gray-700 dark:text-white" value={rma} onChange={e => setRma(e.target.value)} autoFocus />

                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Código de Rastreio</label>
                <input className="w-full border p-2 rounded mb-3 dark:bg-gray-700 dark:text-white" value={rastreio} onChange={e => setRastreio(e.target.value)} />

                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">NF-e (Opcional)</label>
                <input className="w-full border p-2 rounded mb-4 dark:bg-gray-700 dark:text-white" value={nfe} onChange={e => setNfe(e.target.value)} />

                <div className="flex gap-2">
                    <button onClick={() => onConfirm(rma, rastreio, nfe)} className="flex-1 bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700">Confirmar</button>
                    <button onClick={onClose} className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Cancelar</button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
interface ListaOSProps {
    titulo: string;
    filtro: "em-andamento" | "perto-de-vencer" | "atrasadas" | "garantia" | "aguardando-retirada" | "concluidas";
}

export default function ListaOS({ titulo, filtro }: ListaOSProps) {
  const navigate = useNavigate();
  const [lista, setLista] = useState<OS[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  // Estados para o Modal de Garantia
  const [modalOpen, setModalOpen] = useState(false);
  const [osParaGarantia, setOsParaGarantia] = useState<OS | null>(null);

  useEffect(() => {
    carregar();
  }, [filtro]);

  async function carregar() {
    setLoading(true);
    try {
      const dados = await api.listar();
      
      const filtrados = dados.filter((os: OS) => {
          const dias = diasDesde(os.dataAbertura);
          const isConcluida = os.status === "CONCLUIDA";
          // Normaliza status de garantia se estiver null
          const garantiaStatus = os.garantiaStatus || "NAO";

          switch (filtro) {
              case "em-andamento": 
                  // CORREÇÃO: Não mostrar se estiver aguardando retirada
                  return !isConcluida && garantiaStatus === "NAO" && os.status !== "AGUARDANDO RETIRADA"; 
              case "perto-de-vencer": 
                  return !isConcluida && dias >= 25 && dias < 30;
              case "atrasadas": 
                  return !isConcluida && dias >= 30;
              case "garantia": 
                  return ["EM_GARANTIA", "GARANTIA", "AGUARDANDO_RETORNO"].includes(garantiaStatus);
              case "aguardando-retirada": 
                  // CORREÇÃO PRINCIPAL: Aceita status manual OU retorno de garantia
                  return garantiaStatus === "AGUARDANDO_RETIRADA" || os.status === "AGUARDANDO RETIRADA";
              case "concluidas": 
                  return isConcluida;
              default: 
                  return true;
          }
      });
      setLista(filtrados);
    } catch (error) {
      console.error("Erro", error);
    } finally {
      setLoading(false);
    }
  }

  // AÇÕES
  async function handleEnviarGarantia(rma: string, rastreio: string, nfe: string) {
      if (!osParaGarantia) return;
      
      // Adiciona info de RMA nas observações para não perder
      const novaInfo = `${osParaGarantia.informacoes || ""} \n[RMA: ${rma} | Rastreio: ${rastreio} | NF: ${nfe}]`;

      await api.atualizar(osParaGarantia.id, { 
          garantiaStatus: "EM_GARANTIA",
          informacoes: novaInfo 
      });
      
      setModalOpen(false);
      carregar(); // Recarrega a lista
  }

  async function handleMarcarChegada(id: number) {
      if(!confirm("O equipamento chegou da garantia e está pronto para retirada?")) return;
      await api.atualizar(id, { garantiaStatus: "AGUARDANDO_RETIRADA" });
      carregar();
  }

  async function handleEntregar(id: number) {
      if(!confirm("Entregar ao cliente e finalizar OS?")) return;
      await api.atualizar(id, { 
          status: "CONCLUIDA", 
          garantiaStatus: "NAO", // Sai do fluxo de garantia
          dataConclusao: new Date().toISOString()
      });
      carregar();
  }

  async function handleConcluirDireto(id: number) {
      if(!confirm("Concluir esta OS?")) return;
      await api.atualizar(id, { status: "CONCLUIDA", dataConclusao: new Date().toISOString() });
      carregar();
  }

  async function handleApagar(numero: string) {
      if(!confirm("Tem certeza que deseja apagar?")) return;
      await api.apagar(numero);
      carregar();
  }

  // Filtro de Busca visual
  const listaExibida = lista.filter(os => 
      os.cliente.toLowerCase().includes(busca.toLowerCase()) || 
      os.numero.includes(busca) ||
      os.equipamento.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in pb-24 dark:text-white">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
            {filtro === 'atrasadas' && '🚨'} 
            {filtro === 'perto-de-vencer' && '⚠️'} 
            {filtro === 'concluidas' && '✅'} 
            {filtro === 'garantia' && '🛠️'} 
            {filtro === 'aguardando-retirada' && '📦'} 
            {filtro === 'em-andamento' && '📋'} 
            {titulo}
        </h1>
        <button onClick={() => navigate("/")} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded font-bold hover:bg-gray-300">Voltar ao Início</button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="mb-6">
          <input 
            placeholder="🔍 Pesquisar..." 
            className="w-full p-3 rounded border shadow-sm dark:bg-gray-800 dark:border-gray-700"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
      </div>

      {loading ? <p className="text-center">Carregando...</p> : listaExibida.length === 0 ? <p className="text-center text-gray-500">Nenhum registro.</p> : (
          <div className="space-y-4">
              
              {/* === LAYOUT 1: TABELA (SÓ PARA CONCLUÍDAS) === */}
              {filtro === "concluidas" ? (
                  <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
                      <table className="w-full text-left">
                          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-xs">
                              <tr>
                                  <th className="p-4">OS</th>
                                  <th className="p-4">Cliente</th>
                                  <th className="p-4">Equipamento</th>
                                  <th className="p-4 text-right">Data</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                              {listaExibida.map(os => (
                                  <tr key={os.id} onClick={() => navigate(`/os/${os.numero}`)} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                      <td className="p-4 font-bold">#{os.numero}</td>
                                      <td className="p-4">{os.cliente}</td>
                                      <td className="p-4 text-gray-500">{os.equipamento}</td>
                                      <td className="p-4 text-right">{formatarData(os.dataConclusao || os.dataAbertura)}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              ) : (
                  // === LAYOUT DE CARDS PARA O RESTO ===
                  <div className="grid grid-cols-1 gap-4">
                      {listaExibida.map(os => (
                          <div key={os.id} className={`bg-white dark:bg-gray-800 p-5 rounded-lg shadow border-l-4 ${
                              filtro === 'atrasadas' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                              filtro === 'perto-de-vencer' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                              filtro === 'em-andamento' ? 'border-blue-500' :
                              'border-gray-300'
                          }`}>
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h3 className="text-lg font-bold">OS {os.numero} — {os.cliente}</h3>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">{os.equipamento} • {os.cidade}</p>
                                      
                                      {/* Tags Especiais */}
                                      {(filtro === 'atrasadas' || filtro === 'perto-de-vencer') && (
                                          <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold ${
                                              filtro === 'atrasadas' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                                          }`}>
                                              {diasDesde(os.dataAbertura)} DIAS
                                          </span>
                                      )}

                                      {filtro === 'garantia' && (
                                          <div className="mt-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded inline-block">
                                              STATUS: EM GARANTIA
                                          </div>
                                      )}
                                  </div>
                                  <button onClick={() => navigate(`/os/${os.numero}`)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Abrir</button>
                              </div>

                              {/* --- BOTÕES ESPECÍFICOS POR TELA --- */}
                              
                              {/* 1. EM ANDAMENTO (Botões Coloridos: Garantia, Concluir, Apagar) */}
                              {filtro === "em-andamento" && (
                                  <div className="mt-4 flex gap-2 border-t pt-4 dark:border-gray-700">
                                      <button 
                                        onClick={() => { setOsParaGarantia(os); setModalOpen(true); }} 
                                        className="flex-1 border border-purple-300 text-purple-700 hover:bg-purple-50 py-2 rounded font-bold transition dark:text-purple-300 dark:hover:bg-purple-900/30"
                                      >
                                          Garantia
                                      </button>
                                      <button 
                                        onClick={() => handleConcluirDireto(os.id)} 
                                        className="flex-1 border border-green-300 text-green-700 hover:bg-green-50 py-2 rounded font-bold transition dark:text-green-300 dark:hover:bg-green-900/30"
                                      >
                                          Concluir
                                      </button>
                                      <button 
                                        onClick={() => handleApagar(os.numero)} 
                                        className="flex-1 border border-red-300 text-red-700 hover:bg-red-50 py-2 rounded font-bold transition dark:text-red-300 dark:hover:bg-red-900/30"
                                      >
                                          Apagar
                                      </button>
                                  </div>
                              )}

                              {/* 2. EQUIPAMENTOS EM GARANTIA (Botão Verde Grande) */}
                              {filtro === "garantia" && (
                                  <div className="mt-4">
                                      <button 
                                        onClick={() => handleMarcarChegada(os.id)} 
                                        className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                                      >
                                          📦 Marcar Chegada (Disponível p/ Retirada)
                                      </button>
                                  </div>
                              )}

                              {/* 3. AGUARDANDO RETIRADA (Botão Verde Entregar) */}
                              {filtro === "aguardando-retirada" && (
                                  <div className="mt-4">
                                      <button 
                                        onClick={() => handleEntregar(os.id)} 
                                        className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                                      >
                                          ✅ Entregar ao Cliente e Concluir
                                      </button>
                                  </div>
                              )}

                              {/* 4. ATRASADAS / PERTO DE VENCER (Botão Detalhes Vermelho/Amarelo) */}
                              {(filtro === 'atrasadas' || filtro === 'perto-de-vencer') && (
                                  <div className="mt-3">
                                      <button onClick={() => navigate(`/os/${os.numero}`)} className="border border-gray-300 px-3 py-1 rounded text-sm text-gray-600 hover:bg-gray-100">
                                          Ver Detalhes
                                      </button>
                                  </div>
                              )}

                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {/* Modal de Garantia */}
      <ModalGarantia 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onConfirm={handleEnviarGarantia} 
      />

      <div className="fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-900 p-4 border-t text-center">
          <button onClick={() => navigate("/")} className="bg-blue-600 text-white px-6 py-2 rounded font-bold shadow">
              ⬅ Voltar ao Início
          </button>
      </div>
    </div>
  );
}