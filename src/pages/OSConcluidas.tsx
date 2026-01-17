import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OS } from "../types/OS";
import { api } from "../services/api"; // <--- API

export default function OSConcluidas() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<OS[]>([]);

  // EFEITO: Busca todas as OS e filtra apenas as CONCLUÍDAS
  useEffect(() => {
    async function carregar() {
      const dados = await api.listar();
      setLista(dados.filter((os: OS) => os.status === "CONCLUIDA"));
    }
    carregar();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* CABEÇALHO */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-green-700">✅ OS Concluídas</h1>
      </div>

      {/* MENSAGEM DE LISTA VAZIA */}
      {lista.length === 0 && (
        <div className="text-gray-500 py-12 text-center border-2 border-dashed rounded bg-gray-50">
          <p>Nenhuma OS concluída.</p>
        </div>
      )}

      {/* TABELA DE RESULTADOS */}
      {lista.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden border">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-3">OS</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Equipamento</th>
                <th className="p-3 text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {lista.map(os => (
                <tr key={os.id} className="hover:bg-green-50 cursor-pointer transition" onClick={() => navigate(`/os/${os.numero}`)}>
                  <td className="p-3 font-bold text-gray-700">{os.numero}</td>
                  <td className="p-3">{os.cliente}</td>
                  <td className="p-3 text-gray-500">{os.equipamento}</td>
                  <td className="p-3 text-right text-gray-500">
                    {os.dataConclusao ? new Date(os.dataConclusao).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* BOTÃO VOLTAR */}
      <div className="pt-4">
        <button className="w-full bg-gray-200 py-3 rounded font-bold text-gray-700 hover:bg-gray-300 transition" onClick={() => navigate("/")}>
          ⬅️ Voltar ao Início
        </button>
      </div>
    </div>
  );
}