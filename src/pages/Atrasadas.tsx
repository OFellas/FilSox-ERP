import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OS } from "../types/OS";
import { api } from "../services/api";

function diasDesde(data: string) {
  if (!data) return 0;
  return Math.floor((Date.now() - new Date(data).getTime()) / (1000 * 60 * 60 * 24));
}

export default function Atrasadas() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<OS[]>([]);

  useEffect(() => {
    async function carregar() {
      const dados = await api.listar();
      setLista(dados.filter((os: OS) => {
          if (os.status === "CONCLUIDA") return false;
          return diasDesde(os.dataAbertura) >= 30;
      }));
    }
    carregar();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-red-600">🚨 OS Atrasadas</h1>
      </div>
      
      {lista.length === 0 && <p className="text-gray-500 text-center py-10">Nenhuma OS atrasada.</p>}
      
      <div className="space-y-4">
        {lista.map(os => (
            <div key={os.id} className="border border-red-200 bg-red-50 p-5 rounded-lg shadow-sm">
                 <div className="flex justify-between">
                    <div>
                        <p className="font-bold text-lg">OS {os.numero} — {os.cliente}</p>
                        <p className="text-sm">{os.equipamento}</p>
                    </div>
                    <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded font-bold h-fit">
                        {diasDesde(os.dataAbertura)} DIAS
                    </span>
                 </div>
                 <button onClick={() => navigate(`/os/${os.numero}`)} className="mt-3 text-sm bg-white border border-red-300 text-red-700 px-3 py-1 rounded">
                    Ver Detalhes
                 </button>
            </div>
        ))}
      </div>
       <div className="pt-4">
        <button className="w-full bg-gray-200 py-3 rounded font-bold text-gray-700 hover:bg-gray-300 transition" onClick={() => navigate("/")}>
          ⬅️ Voltar ao Início
        </button>
      </div>
    </div>
  );
}