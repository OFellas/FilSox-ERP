import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OS } from "../types/OS";
import { api } from "../services/api";
import Modal from "../components/Modal";

export default function AguardandoRetirada() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<OS[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [osParaConcluir, setOsParaConcluir] = useState<OS | null>(null);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const dados = await api.listar();
    setLista(dados.filter((os: OS) => os.garantiaStatus === "AGUARDANDO_RETIRADA"));
  }

  function solicitarConclusao(os: OS) {
    setOsParaConcluir(os);
    setModalOpen(true);
  }

  async function confirmarConclusao() {
    if (!osParaConcluir) return;
    await api.atualizar(osParaConcluir.id, { 
      status: "CONCLUIDA", 
      garantiaStatus: "NAO", 
      dataConclusao: new Date().toISOString() 
    });
    setModalOpen(false);
    carregar();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-orange-600">📦 Aguardando Retirada</h1>
      </div>

      {lista.length === 0 && (
        <div className="text-gray-500 py-12 text-center border-2 border-dashed rounded bg-gray-50">
          <p>Nenhum equipamento aguardando retirada.</p>
        </div>
      )}

      <div className="space-y-4">
        {lista.map(os => (
          <div key={os.id} className="border p-5 rounded-lg bg-white shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg text-gray-800">OS {os.numero} — {os.cliente}</p>
                <p className="text-sm text-gray-500">{os.equipamento}</p>
              </div>
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold">PRONTO</span>
            </div>
            <button className="w-full mt-4 bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 transition" onClick={() => solicitarConclusao(os)}>
               ✅ Entregar ao Cliente e Concluir
            </button>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <button className="w-full bg-gray-200 py-3 rounded font-bold text-gray-700 hover:bg-gray-300 transition" onClick={() => navigate("/")}>
          ⬅️ Voltar ao Início
        </button>
      </div>

      <Modal isOpen={modalOpen} title="Entregar" message="Confirmar entrega ao cliente?" confirmText="Entregar e Concluir" onConfirm={confirmarConclusao} onCancel={() => setModalOpen(false)} />
    </div>
  );
}