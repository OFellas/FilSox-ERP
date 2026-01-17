import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { ArrowLeft, User, Phone, MapPin, FileText, DollarSign } from "lucide-react";

export default function DetalheCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const dados = await api.buscarClienteCompleto(Number(id));
        setCliente(dados);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    }
    load();
  }, [id]);

  if (loading) return <div className="p-10 text-center dark:text-white">Carregando perfil...</div>;
  if (!cliente) return <div className="p-10 text-center text-red-500">Cliente não encontrado.</div>;

  const totalGasto = cliente.historico_financeiro?.filter((f:any) => f.tipo === 'RECEITA').reduce((acc: number, cur: any) => acc + cur.valor, 0) || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20 animate-fade-in dark:text-white">
      <div className="mb-8">
        <button onClick={() => navigate("/clientes")} className="mb-4 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition"><ArrowLeft size={18} /> Voltar para Lista</button>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400">{cliente.nome.charAt(0).toUpperCase()}</div>
                <div><h1 className="text-2xl font-bold">{cliente.nome}</h1><div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1"><span className="flex items-center gap-1"><User size={14}/> {cliente.tipo} - {cliente.documento}</span><span className="flex items-center gap-1"><Phone size={14}/> {cliente.telefone}</span><span className="flex items-center gap-1"><MapPin size={14}/> {cliente.cidade}</span></div></div>
            </div>
            <div className="text-right bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg border border-green-100 dark:border-green-900/50"><p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Total Gasto na Loja</p><p className="text-2xl font-extrabold text-green-700 dark:text-green-300">R$ {totalGasto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><FileText /> Histórico de Serviços (OS)</h2>
              {cliente.historico_os && cliente.historico_os.length > 0 ? (
                  <div className="space-y-3">{cliente.historico_os.map((os: any) => (<div key={os.id} onClick={() => navigate(`/os/${os.numero}`)} className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 hover:shadow-md cursor-pointer transition"><div className="flex justify-between items-start mb-2"><span className="font-bold text-blue-600">OS #{os.numero}</span><span className="text-xs text-gray-500">{new Date(os.dataAbertura).toLocaleDateString()}</span></div><p className="font-medium text-sm mb-1">{os.equipamento}</p><p className="text-xs text-gray-500 line-clamp-2">{os.problema}</p><div className="mt-2 flex justify-between items-center"><span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${os.status === 'CONCLUIDA' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{os.status.replace("_", " ")}</span>{os.valor && <span className="font-bold text-sm">R$ {os.valor}</span>}</div></div>))}</div>
              ) : (<div className="p-6 bg-gray-50 dark:bg-gray-800 rounded border border-dashed dark:border-gray-700 text-center text-gray-500 text-sm">Nenhuma OS encontrada para este cliente.</div>)}
          </div>

          <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><DollarSign /> Histórico Financeiro</h2>
              {cliente.historico_financeiro && cliente.historico_financeiro.length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
                      <table className="w-full text-sm text-left"><thead className="bg-gray-100 dark:bg-gray-700 text-xs uppercase text-gray-500"><tr><th className="p-3">Data</th><th className="p-3">Descrição</th><th className="p-3 text-right">Valor</th></tr></thead><tbody className="divide-y dark:divide-gray-700">{cliente.historico_financeiro.map((fin: any) => (<tr key={fin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50"><td className="p-3 text-gray-500 text-xs">{new Date(fin.data_movimentacao).toLocaleDateString()}</td><td className="p-3"><div className="font-medium">{fin.descricao}</div><div className="text-[10px] text-gray-400">{fin.categoria} • {fin.forma_pagamento}</div></td><td className={`p-3 text-right font-bold ${fin.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>{fin.tipo === 'RECEITA' ? '+' : '-'} R$ {fin.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td></tr>))}</tbody></table>
                  </div>
              ) : (<div className="p-6 bg-gray-50 dark:bg-gray-800 rounded border border-dashed dark:border-gray-700 text-center text-gray-500 text-sm">Nenhum registro financeiro encontrado.</div>)}
          </div>
      </div>
    </div>
  );
}