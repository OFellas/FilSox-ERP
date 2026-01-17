import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { OS } from "../types/OS";
import { api } from "../services/api";

export default function EnviarGarantia() {
  const { numero } = useParams<{ numero: string }>();
  const navigate = useNavigate();
  const [os, setOS] = useState<OS | null>(null);
  const [loading, setLoading] = useState(true); // Loading
  
  // ESTADOS DO FORMULÁRIO DE GARANTIA
  const [empresaRMA, setEmpresaRMA] = useState("");
  const [nfNumero, setNfNumero] = useState("");
  const [rastreio, setRastreio] = useState("");

  // CARREGA DADOS DA OS AO INICIAR
  useEffect(() => {
    if (numero) carregarOS(numero);
  }, [numero]);

  async function carregarOS(num: string) {
    setLoading(true);
    const dados = await api.buscarPorNumero(num);
    
    if (dados) {
        setOS(dados);
        setEmpresaRMA(dados.empresaRMA || "");
        setNfNumero(dados.nfNumero || "");
        setRastreio(dados.rastreio || "");
        setLoading(false);
    } else {
        alert("Erro: OS não encontrada ou número inválido.");
        navigate("/");
    }
  }

  // ENVIA OS DADOS A API E REDIRECIONA
  async function enviarParaGarantia() {
    if (!empresaRMA.trim() || !os) {
      alert("Informe a empresa / RMA");
      return;
    }

    await api.atualizar(os.id, {
        garantiaStatus: "EM_GARANTIA",
        empresaRMA,
        nfNumero,
        rastreio
    });

    navigate("/garantia", { replace: true });
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Carregando dados da OS...</div>;
  if (!os) return null;

  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded-lg shadow-lg border space-y-6">
      <h1 className="text-xl font-bold text-purple-700 border-b pb-2">Enviar para Garantia</h1>
      <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
        <p><b>OS:</b> {os.numero}</p>
        <p><b>Cliente:</b> {os.cliente}</p>
        <p><b>Equipamento:</b> {os.equipamento}</p>
      </div>

      <div className="space-y-4">
        <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">EMPRESA / RMA *</label>
            <input className="border p-3 w-full rounded focus:ring-2 focus:ring-purple-500 outline-none" value={empresaRMA} onChange={e => setEmpresaRMA(e.target.value)} />
        </div>
        <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">CÓDIGO DE RASTREIO / LOTE</label>
            <input className="border p-3 w-full rounded focus:ring-2 focus:ring-purple-500 outline-none" value={rastreio} onChange={e => setRastreio(e.target.value)} />
        </div>
        <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">NF-E (Opcional)</label>
            <input className="border p-3 w-full rounded focus:ring-2 focus:ring-purple-500 outline-none" value={nfNumero} onChange={e => setNfNumero(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={enviarParaGarantia} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-bold shadow">Confirmar</button>
        <button onClick={() => navigate("/")} className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 border">Cancelar</button>
      </div>
    </div>
  );
}