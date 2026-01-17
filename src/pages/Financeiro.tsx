import { useEffect, useState, useMemo } from "react";
import { api } from "../services/api";
import { ArrowUpCircle, ArrowDownCircle, ArrowLeft, CreditCard, AlertCircle, CheckCircle2, Clock, Wallet, Trash2, Repeat, } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Financeiro() {
  const navigate = useNavigate();
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filtroPeriodo, setFiltroPeriodo] = useState("MES");

  const [tipo, setTipo] = useState("RECEITA");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("Vendas");
  const [dataMov, setDataMov] = useState(new Date().toISOString().slice(0, 10));
  const [formaPagamento, setFormaPagamento] = useState("Dinheiro");
  const [status, setStatus] = useState("PAGO");
  
  const [isRecorrente, setIsRecorrente] = useState(false);
  const [frequencia, setFrequencia] = useState("MENSAL");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
        const dados = await api.listarFinanceiro();
        setMovimentacoes(dados);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function handleSalvar() {
      if (!descricao || !valor) return alert("Preencha os campos");

      await api.criarMovimentacao({
          tipo, descricao,
          valor: parseFloat(valor.replace(",", ".")), 
          categoria,
          data_movimentacao: dataMov,
          data_vencimento: dataMov,
          status,
          forma_pagamento: formaPagamento,
          recorrente: isRecorrente,
          frequencia: isRecorrente ? frequencia : null
      });
      
      setModalOpen(false);
      limparForm();
      carregar();
  }

  async function handleApagar(id: number) {
      if(confirm("Apagar registro permanentemente?")) {
          await api.apagarMovimentacao(id);
          carregar();
      }
  }

  async function handleBaixar(id: number) {
      if(confirm("Confirmar baixa (pagamento/recebimento)?")) {
          await api.atualizarStatusMovimentacao(id, "PAGO");
          carregar();
      }
  }

  function limparForm() {
      setDescricao(""); setValor(""); setCategoria("Vendas");
      setDataMov(new Date().toISOString().slice(0, 10));
      setStatus("PAGO");
      setIsRecorrente(false);
  }

  const dadosFiltrados = useMemo(() => {
      const hoje = new Date().toISOString().slice(0, 10);
      const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const primeiroDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

      return movimentacoes.filter(mov => {
          const data = mov.data_vencimento || mov.data_movimentacao;
          if (filtroPeriodo === 'HOJE') return data === hoje;
          if (filtroPeriodo === 'SEMANA') return data >= seteDiasAtras;
          if (filtroPeriodo === 'MES') return data >= primeiroDiaMes;
          return true;
      });
  }, [movimentacoes, filtroPeriodo]);

  const kpis = useMemo(() => {
      const hoje = new Date().toISOString().slice(0, 10);
      let entradas = 0, saidas = 0, saldo = 0;
      let aPagarHoje = 0, aReceberHoje = 0, atrasadas = 0, projetado = 0;

      movimentacoes.forEach(mov => {
          const valor = mov.valor || 0;
          const dataRef = mov.data_vencimento || mov.data_movimentacao;
          const isPago = mov.status === 'PAGO';

          if (isPago) {
              if (mov.tipo === 'RECEITA') { entradas += valor; saldo += valor; }
              else { saidas += valor; saldo -= valor; }
          }

          if (!isPago) {
              if (dataRef < hoje) atrasadas += valor;
              if (dataRef === hoje) {
                  if (mov.tipo === 'RECEITA') aReceberHoje += valor;
                  else aPagarHoje += valor;
              }
              if (mov.tipo === 'RECEITA') projetado += valor;
              else projetado -= valor;
          }
      });
      return { entradas, saidas, saldo, aPagarHoje, aReceberHoje, atrasadas, projetado: saldo + projetado };
  }, [movimentacoes]);

  const percentualEntrada = (kpis.entradas / ((kpis.entradas + kpis.saidas) || 1)) * 100;

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">Carregando financeiro...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20 animate-fade-in dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="p-2 border rounded-full hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition"><ArrowLeft size={20} /></button>
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">💰 Fluxo de Caixa</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Controle financeiro profissional.</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => { setTipo("DESPESA"); setCategoria("Contas"); setModalOpen(true); }} className="bg-red-100 text-red-700 px-4 py-2 rounded font-bold hover:bg-red-200 flex items-center gap-2 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 transition"><ArrowDownCircle size={18} /> Despesa</button>
            <button onClick={() => { setTipo("RECEITA"); setCategoria("Vendas"); setModalOpen(true); }} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 flex items-center gap-2 shadow transition"><ArrowUpCircle size={18} /> Receita</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 flex items-center justify-between"><div><p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase">A Pagar Hoje</p><p className="text-xl font-bold text-gray-800 dark:text-white">R$ {kpis.aPagarHoje.toLocaleString()}</p></div><Clock className="text-orange-400" /></div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center justify-between"><div><p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">A Receber Hoje</p><p className="text-xl font-bold text-gray-800 dark:text-white">R$ {kpis.aReceberHoje.toLocaleString()}</p></div><Wallet className="text-blue-400" /></div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 flex items-center justify-between"><div><p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Atrasadas</p><p className="text-xl font-bold text-gray-800 dark:text-white">R$ {kpis.atrasadas.toLocaleString()}</p></div><AlertCircle className="text-red-400" /></div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between"><div><p className="text-xs font-bold text-gray-500 uppercase">Saldo Projetado</p><p className="text-xl font-bold text-gray-800 dark:text-white">R$ {kpis.projetado.toLocaleString()}</p></div><div className="text-xs text-gray-400">Previsão</div></div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-bold dark:text-white">Balanço do Mês (Realizado)</h2>
              <span className={`text-2xl font-extrabold ${kpis.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {kpis.saldo.toLocaleString()}</span>
          </div>
          <div className="flex h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
              <div style={{ width: `${percentualEntrada}%` }} className="bg-green-500 h-full transition-all duration-500"></div>
              <div style={{ width: `${100 - percentualEntrada}%` }} className="bg-red-500 h-full transition-all duration-500"></div>
          </div>
          <div className="flex justify-between text-xs font-bold">
              <span className="text-green-600">Entradas: R$ {kpis.entradas.toLocaleString()}</span>
              <span className="text-red-600">Saídas: R$ {kpis.saidas.toLocaleString()}</span>
          </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700 flex flex-col md:flex-row justify-between items-center bg-gray-50 dark:bg-gray-900/50 gap-4">
              <div className="flex gap-2">
                  {['HOJE', 'SEMANA', 'MES', 'TODOS'].map(f => (
                      <button key={f} onClick={() => setFiltroPeriodo(f)} className={`px-3 py-1 rounded text-xs font-bold border transition ${filtroPeriodo === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-300 dark:border-gray-600'}`}>
                          {f === 'MES' ? 'Mês Atual' : f === 'SEMANA' ? '7 Dias' : f === 'HOJE' ? 'Hoje' : 'Todos'}
                      </button>
                  ))}
              </div>
              <div className="text-xs text-gray-400 font-mono">{dadosFiltrados.length} lançamentos</div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-100 dark:bg-gray-900/30 text-gray-500 text-xs uppercase"><tr><th className="p-4">Status</th><th className="p-4">Vencimento</th><th className="p-4">Descrição</th><th className="p-4">Forma Pag.</th><th className="p-4 text-right">Valor</th><th className="p-4 text-center">Ações</th></tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                    {dadosFiltrados.length === 0 ? (<tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhum lançamento neste período.</td></tr>) : (dadosFiltrados.map((mov) => {
                            const isPago = mov.status === 'PAGO';
                            const isAtrasado = !isPago && (mov.data_vencimento || mov.data_movimentacao) < new Date().toISOString().slice(0, 10);
                            return (
                                <tr key={mov.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                    <td className="p-4">{isPago ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold border border-green-200">PAGO</span> : isAtrasado ? <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold border border-red-200 animate-pulse">ATRASADO</span> : <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[10px] font-bold border border-yellow-200">PENDENTE</span>}</td>
                                    <td className="p-4 text-gray-500 font-mono text-xs">{new Date(mov.data_vencimento || mov.data_movimentacao).toLocaleDateString('pt-BR')}</td>
                                    <td className="p-4"><div className="font-bold dark:text-gray-200 flex items-center gap-2">{mov.descricao}{mov.recorrente === 1 && <span title="Recorrente" className="text-blue-500"><Repeat size={12}/></span>}</div><div className="text-[10px] text-gray-400">{mov.categoria} • {mov.origem || 'MANUAL'}</div></td>
                                    <td className="p-4 text-gray-500 text-xs flex items-center gap-1"><CreditCard size={12} /> {mov.forma_pagamento || "Dinheiro"}</td>
                                    <td className={`p-4 text-right font-bold ${mov.tipo === 'RECEITA' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{mov.tipo === 'DESPESA' ? '- ' : '+ '} R$ {mov.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="p-4 text-center flex justify-center gap-2">{!isPago && <button onClick={() => handleBaixar(mov.id)} title="Dar Baixa" className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 border border-green-200"><CheckCircle2 size={16} /></button>}<button onClick={() => handleApagar(mov.id)} title="Excluir" className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"><Trash2 size={16} /></button></td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
          </div>
      </div>

      {modalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in p-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border dark:border-gray-700">
                  <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>{tipo === 'RECEITA' ? <ArrowUpCircle /> : <ArrowDownCircle />} {tipo === 'RECEITA' ? 'Nova Receita' : 'Nova Despesa'}</h2>
                  <div className="space-y-4">
                      <div><label className="block text-xs font-bold text-gray-500 mb-1">Descrição</label><input className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Ex: Aluguel Loja, Venda Balcão..." value={descricao} onChange={e => setDescricao(e.target.value)} autoFocus /></div>
                      <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-gray-500 mb-1">Valor (R$)</label><input className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold" placeholder="0,00" type="number" value={valor} onChange={e => setValor(e.target.value)} /></div><div><label className="block text-xs font-bold text-gray-500 mb-1">Vencimento</label><input type="date" className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={dataMov} onChange={e => setDataMov(e.target.value)} /></div></div>
                      <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-gray-500 mb-1">Categoria</label><select className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" value={categoria} onChange={e => setCategoria(e.target.value)}>{tipo === 'RECEITA' ? (<> <option value="Vendas">Vendas</option><option value="Serviços">Serviços</option><option value="Outros">Outros</option> </>) : (<> <option value="Contas">Contas (Fixo)</option><option value="Fornecedores">Fornecedores</option><option value="Peças">Peças</option><option value="Aluguel">Aluguel</option><option value="Pessoal">Pessoal / Retirada</option> </>)}</select></div><div><label className="block text-xs font-bold text-gray-500 mb-1">Forma Pag.</label><select className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)}><option value="Dinheiro">Dinheiro</option><option value="PIX">PIX</option><option value="Cartão Crédito">Cartão Crédito</option><option value="Cartão Débito">Cartão Débito</option><option value="Boleto">Boleto</option></select></div></div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded border dark:border-gray-600 flex items-center justify-between"><div className="flex items-center gap-2"><Repeat size={16} className="text-blue-500" /><span className="text-sm font-bold text-gray-700 dark:text-gray-200">É uma conta fixa?</span></div><input type="checkbox" className="w-5 h-5 accent-blue-600 cursor-pointer" checked={isRecorrente} onChange={e => setIsRecorrente(e.target.checked)} /></div>
                      {isRecorrente && (<div className="animate-fade-in"><label className="block text-xs font-bold text-gray-500 mb-1">Frequência</label><select className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={frequencia} onChange={e => setFrequencia(e.target.value)}><option value="MENSAL">Mensal (Todo dia {dataMov.slice(-2)})</option><option value="SEMANAL">Semanal</option><option value="ANUAL">Anual</option></select></div>)}
                      <div><label className="block text-xs font-bold text-gray-500 mb-1">Situação</label><div className="flex gap-2"><button onClick={() => setStatus("PAGO")} className={`flex-1 py-2 rounded text-sm font-bold border ${status === 'PAGO' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>✅ Pago / Recebido</button><button onClick={() => setStatus("PENDENTE")} className={`flex-1 py-2 rounded text-sm font-bold border ${status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>⏳ Pendente / Agendado</button></div></div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6 pt-4 border-t dark:border-gray-700"><button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded dark:hover:bg-gray-700">Cancelar</button><button onClick={handleSalvar} className={`px-6 py-2 text-sm font-bold text-white rounded shadow hover:opacity-90 ${tipo === 'RECEITA' ? 'bg-green-600' : 'bg-red-600'}`}>Salvar</button></div>
              </div>
          </div>
      )}
    </div>
  );
}