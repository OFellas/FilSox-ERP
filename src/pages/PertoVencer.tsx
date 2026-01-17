import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OS } from "../types/OS";
import { api } from "../services/api"; // <--- Usando a API

// FUNÇÃO HELPER: Calcula dias passados desde a abertura
function diasDesde(data: string) {
  if (!data) return 0;
  return Math.floor((Date.now() - new Date(data).getTime()) / (1000 * 60 * 60 * 24));
}

export default function PertoVencer() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<OS[]>([]);

  // EFEITO: Carrega e aplica a regra de negócio (25 a 30 dias)
  useEffect(() => {
    async function carregar() {
      const dados = await api.listar();
      setLista(dados.filter((os: OS) => {
          if (os.status === "CONCLUIDA") return false;
          
          const dias = diasDesde(os.dataAbertura);
          // REGRA: Entre 25 e 29 dias (Perto de estourar os 30)
          return dias >= 25 && dias < 30; 
      }));
    }
    carregar();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* CABEÇALHO AMARELO/LARANJA */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-yellow-600">⚠️ Perto de Vencer</h1>
        <p className="text-gray-500 text-sm">Ordens de serviço abertas há quase 30 dias</p>
      </div>

      {/* MENSAGEM VAZIA */}
      {lista.length === 0 && (
        <div className="text-gray-500 py-12 text-center border-2 border-dashed rounded bg-gray-50">
          <p>Nenhuma OS perto do prazo limite. 👍</p>
        </div>
      )}

      {/* LISTA DE CARDS COM ALERTA */}
      <div className="space-y-4">
        {lista.map(os => {
            const dias = diasDesde(os.dataAbertura);
            const diasRestantes = 30 - dias;

            return (
                <div key={os.id} className="border border-yellow-200 bg-yellow-50 p-5 rounded-lg shadow-sm hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-lg text-gray-800">OS {os.numero} — {os.cliente}</p>
                            <p className="text-sm text-gray-600">{os.equipamento}</p>
                        </div>
                        
                        {/* BADGE DE CONTAGEM REGRESSIVA */}
                        <div className="text-right">
                           <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded font-bold">
                             FALTAM {diasRestantes} DIAS
                           </span>
                           <p className="text-xs text-yellow-700 mt-1 font-semibold">
                             ({dias} dias aberta)
                           </p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/os/${os.numero}`)} 
                        className="mt-4 text-sm bg-white border border-yellow-300 text-yellow-700 px-4 py-2 rounded hover:bg-yellow-100 font-bold w-full sm:w-auto"
                      >
                        Ver Detalhes
                      </button>
                </div>
            );
        })}
      </div>

       <div className="pt-4">
        <button className="w-full bg-gray-200 py-3 rounded font-bold text-gray-700 hover:bg-gray-300 transition" onClick={() => navigate("/")}>
          ⬅️ Voltar ao Início
        </button>
      </div>
    </div>
  );
}