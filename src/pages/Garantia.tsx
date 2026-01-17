import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OS } from "../types/OS";
import { api } from "../services/api";
import Modal from "../components/Modal";

export default function Garantia() {
  const navigate = useNavigate();
  // ESTADO: filtro para garantia
  const [lista, setLista] = useState<OS[]>([]);
  // Loading spinner
  const [loading, setLoading] = useState(true); 
  
  //Controle de abertura e qual OS será manipulada
  const [modalOpen, setModalOpen] = useState(false);
  const [osParaRetorno, setOsParaRetorno] = useState<OS | null>(null);

  //Carrega a lista assim que a tela abre
  useEffect(() => {
    carregar();
  }, []);

  // FUNÇÃO: Busca todas as OS e filtra apenas as que estão em processo de Garantia
  async function carregar() {
    setLoading(true);
    try {
      const dados = await api.listar();
      const filtrados = dados.filter((os: OS) =>
        os.garantiaStatus === "GARANTIA" ||
        os.garantiaStatus === "EM_GARANTIA" ||
        os.garantiaStatus === "AGUARDANDO_RETORNO"
      );
      setLista(filtrados);
    } catch (error) {
      console.error("Erro ao carregar garantias", error);
    } finally {
      setLoading(false);
    }
  }

  // confirmçação de retorno da garantia
  function solicitarRetorno(os: OS) {
    setOsParaRetorno(os);
    setModalOpen(true);
  }

  //Atualiza no banco para "AGUARDANDO_RETIRADA"
  async function confirmarRetorno() {
    if (!osParaRetorno) return;
    await api.atualizar(osParaRetorno.id, { 
      garantiaStatus: "AGUARDANDO_RETIRADA" 
    });
    setModalOpen(false);
 //remover redirecionador na versão final
    navigate("/aguardando-retirada");
  }

  // RENDERIZAÇÃO: Tela de Carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-bold text-gray-500 animate-pulse">Carregando Garantias...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl space-y-6 mx-auto animate-fade-in">
      {/* CABEÇALHO DA PÁGINA */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-purple-700">🛠️ Equipamentos em Garantia</h1>
        <p className="text-gray-500 text-sm">Gerencie remessas e itens em RMA</p>
      </div>

      {/* LISTA VAZIA */}
      {lista.length === 0 && (
        <div className="text-gray-500 py-12 text-center border-2 border-dashed rounded bg-gray-50">
          <p>Nenhuma OS em processo de garantia.</p>
        </div>
      )}

      {/* LISTA DE CARDS */}
      <div className="space-y-4">
        {lista.map(os => (
          <div key={os.id} className="border p-5 rounded-lg bg-white shadow-sm hover:shadow-md transition">
            
            {/* LINHA 1: Dados principais e Badge */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-lg text-gray-800">OS {os.numero} — {os.cliente}</p>
                <p className="text-sm text-gray-500">{os.equipamento}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded font-bold bg-purple-100 text-purple-800">
                 EM GARANTIA
              </span>
            </div>

            {/* LINHA 2: Detalhes de RMA (Empresa, NF, Rastreio) */}
            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded mb-3 grid grid-cols-2 gap-2">
              <p><b>🏢 RMA:</b> {os.empresaRMA || "—"}</p>
              <p><b>📄 NF-e:</b> {os.nfNumero || "—"}</p>
              {os.rastreio && (
                <p className="col-span-2 text-purple-700 border-t border-gray-200 pt-2 mt-1">
                  <b>🚚 Rastreio/Lote:</b> {os.rastreio}
                </p>
              )}
            </div>

            {/* BOTÃO DE AÇÃO */}
            <button onClick={() => solicitarRetorno(os)} className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold flex justify-center items-center gap-2">
              📦 Marcar Chegada (Disponível p/ Retirada)
            </button>
          </div>
        ))}
      </div>

      {/* RODAPÉ: Botão Voltar */}
      <div className="pt-4">
        <button className="w-full bg-gray-200 py-3 rounded font-bold text-gray-700 hover:bg-gray-300 transition" onClick={() => navigate("/")}>
          ⬅️ Voltar ao Início
        </button>
      </div>

      {/* MODAL DE CONFIRMAÇÃO */}
      <Modal isOpen={modalOpen} title="Marcar Chegada" message="Confirmar que o equipamento chegou da garantia?" confirmText="Confirmar" onConfirm={confirmarRetorno} onCancel={() => setModalOpen(false)} />
    </div>
  );
}