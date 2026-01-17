import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OS } from "../types/OS";
import { api } from "../services/api"; // <--- API
import { useAuth } from "../contexts/AuthContext";

export default function OSAndamento() {
  const navigate = useNavigate();
  const { role } = useAuth();
  
  // ESTADOS
  const [lista, setLista] = useState<OS[]>([]);
  const [busca, setBusca] = useState("");

  // EFEITO: Carrega OS do Banco ao iniciar
  useEffect(() => {
    carregar();
  }, []);

  // FUNÇÃO: Busca dados e filtra apenas o que NÃO está concluído
  async function carregar() {
    const dados = await api.listar();
    const emAndamento = dados.filter((os: OS) => os.status !== "CONCLUIDA");
    setLista(emAndamento);
  }

  // AÇÃO: Marca a OS como Concluída no banco
  async function concluirOS(os: OS) {
    if(!confirm("Concluir esta OS?")) return;
    await api.atualizar(os.id, { 
      status: "CONCLUIDA", 
      dataConclusao: new Date().toISOString() 
    });
    carregar(); // Recarrega lista para atualizar a tela
  }

  // AÇÃO: Remove a OS do banco de dados
  async function apagarOS(numero: string) {
    if (!confirm("Deseja apagar esta OS?")) return;
    await api.apagar(numero);
    carregar();
  }

  // LÓGICA DE FILTRO DE PESQUISA (Busca em tempo real)
  const listaFiltrada = lista.filter(os => {
    const termo = busca.toLowerCase();
    return (
      os.cliente.toLowerCase().includes(termo) ||
      os.equipamento.toLowerCase().includes(termo) ||
      os.numero.toLowerCase().includes(termo) ||
      (os.cidade && os.cidade.toLowerCase().includes(termo))
    );
  });

  return (
    <div className="max-w-3xl mx-auto min-h-screen flex flex-col">
      {/* CABEÇALHO */}
      <div className="p-6 pb-2 border-b bg-gray-50">
        <h1 className="text-2xl font-bold text-blue-700">📋 OS em Andamento</h1>
      </div>

      {/* BARRA DE PESQUISA FIXA NO TOPO */}
      <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm px-6 py-4 shadow-sm">
        <input 
          type="text"
          placeholder="🔍 Pesquisar..."
          className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* LISTA DE CARDS */}
      <div className="flex-1 p-6 pt-2 space-y-4">
        {listaFiltrada.map(os => (
          <div key={os.id} className="border p-5 rounded-lg bg-white shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-lg text-gray-800">OS {os.numero} — {os.cliente}</p>
                <p className="text-sm text-gray-500">{os.equipamento} {os.cidade && `• ${os.cidade}`}</p>
              </div>
              <button onClick={() => navigate(`/os/${os.numero}`)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                Abrir
              </button>
            </div>
            
            {/* BOTÕES DE AÇÃO (SÓ APARECEM SE FOR ADMIN) */}
            {role === "ADMIN" && (
                <div className="flex gap-2 pt-4 mt-2 border-t">
                    <button onClick={() => navigate(`/garantia/${os.numero}`)} className="flex-1 bg-purple-50 text-purple-700 px-3 py-2 rounded text-sm font-bold border border-purple-200">
                        Garantia
                    </button>
                    <button onClick={() => concluirOS(os)} className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded text-sm font-bold border border-green-200">
                        Concluir
                    </button>
                    <button onClick={() => apagarOS(os.numero)} className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm font-bold border border-red-200">
                        Apagar
                    </button>
                </div>
            )}
          </div>
        ))}
      </div>

      {/* RODAPÉ FIXO COM BOTÃO VOLTAR */}
      <div className="sticky bottom-0 z-20 bg-gray-50/95 backdrop-blur-sm p-6 border-t mt-auto">
        <button className="w-full bg-gray-200 py-3 rounded font-bold text-gray-700" onClick={() => navigate("/")}>
          ⬅️ Voltar ao Início
        </button>
      </div>
    </div>
  );
}