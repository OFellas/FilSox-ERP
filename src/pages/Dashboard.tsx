import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OS } from "../types/OS";
import { api } from "../services/api"; 
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useModules } from "../contexts/ModuleContext";
import { ALL_MODULES } from "../config/modules";
import { 
    ShieldCheck, ShoppingCart, Users, AlertTriangle, DollarSign, Package, 
    Wrench, Clock, CheckCircle, AlertCircle, Home, LogOut, Moon, Sun, Settings,
    Activity, Server
} from "lucide-react";

function diasDesde(data: string) {
  if (!data) return 0;
  return Math.floor((Date.now() - new Date(data).getTime()) / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { role, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { hasModule, carregarModulos } = useModules();
  
  const [lista, setLista] = useState<OS[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [financas, setFinancas] = useState({ entradas: 0, saidas: 0, saldo: 0 });
  const [infoSistema, setInfoSistema] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [contagemLojas, setContagemLojas] = useState(0);

  useEffect(() => {
      carregarModulos();
  }, []); 

  // EFEITO PARA CARREGAR DADOS DO DASHBOARD
  useEffect(() => {
    async function carregar() {
      if (role === 'SUPER_ADMIN') {
          try {
              const lojas = await api.listarLojas();
              setContagemLojas(lojas.length);
          } catch(e) {}
      } else {
          const dadosOS = await api.listar();
          setLista(dadosOS);
          
          try {
              const dadosProd = await api.listarProdutos();
              setProdutos(dadosProd);
          } catch (e) { console.log("Sem produtos"); }

          try {
              const dadosFin = await api.listarFinanceiro(); 
              const resumo = dadosFin.reduce((acc: any, mov: any) => {
                  if (mov.tipo === 'RECEITA') {
                      acc.entradas += mov.valor;
                      acc.saldo += mov.valor;
                  } else {
                      acc.saidas += mov.valor;
                      acc.saldo -= mov.valor;
                  }
                  return acc;
              }, { entradas: 0, saidas: 0, saldo: 0 });
              setFinancas(resumo);
          } catch (e) { console.log("Erro financeiro ou módulo inativo"); }
      }

      const info = await api.getSystemInfo();
      if (info) setInfoSistema(info);

      const cfg = await api.getConfig();
      if(cfg) setConfig(cfg);
    }
    carregar();
  }, [role]); 

  // --- CÁLCULOS OS ---
  const emAndamento = useMemo(() => lista.filter(os => os.status !== "CONCLUIDA" && os.status !== "AGUARDANDO RETIRADA").length, [lista]);
  const concluidas = useMemo(() => lista.filter(os => os.status === "CONCLUIDA").length, [lista]);
  const atrasadas = useMemo(() => lista.filter(os => { if (os.status === "CONCLUIDA") return false; return diasDesde(os.dataAbertura) >= 30; }).length, [lista]);
  const aguardandoRetirada = useMemo(() => lista.filter(os => os.garantiaStatus === "AGUARDANDO_RETIRADA" || os.status === "AGUARDANDO RETIRADA").length, [lista]);

  // --- CÁLCULOS ESTOQUE ---
  const metricasEstoque = useMemo(() => {
      const baixoEstoque = produtos.filter(p => p.quantidade <= p.estoque_minimo).length;
      const valorTotal = produtos.reduce((acc, p) => acc + (p.preco_custo * p.quantidade), 0);
      return { baixoEstoque, valorTotal };
  }, [produtos]);

  const vendasHoje = useMemo(() => {
      const hoje = new Date().toISOString().slice(0, 10); 
      return lista.filter(os => os.status === "CONCLUIDA" && os.dataConclusao?.startsWith(hoje)).length;
  }, [lista]);

  function handleLogout() {
      signOut();
      navigate("/login");
  }

  const MenuItem = ({ icon: Icon, label, rota, active = false }: any) => (
      <button 
        onClick={() => rota && navigate(rota)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
      >
          <Icon size={20} />
          <span className="font-medium text-sm">{label}</span>
      </button>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden transition-colors font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col justify-between z-20 shadow-xl relative">
          <div>
              <div onClick={() => role === 'ADMIN' && navigate("/configuracoes")} className={`p-6 border-b dark:border-gray-700 flex flex-col items-center group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50`}>
                  <div className="relative">
                      {role === 'SUPER_ADMIN' ? (
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-3xl text-white shadow-lg border-2 border-purple-400">👑</div>
                      ) : config?.logo_url ? (
                          <img src={config.logo_url} alt="Logo" className="w-20 h-20 rounded-full object-contain bg-gray-100 border-2 border-gray-200 dark:border-gray-600" />
                      ) : (
                          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-3xl border-2 border-blue-200 dark:border-blue-800">🏪</div>
                      )}
                      <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"><Settings size={14} /></div>
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white mt-3 text-center leading-tight">{role === 'SUPER_ADMIN' ? 'Super Admin' : (config?.nome_loja || "Minha Loja")}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{role === 'SUPER_ADMIN' ? 'SaaS Master' : (role === 'ADMIN' ? 'Administrador' : 'Vendedor')}</p>
              </div>

              <nav className="p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 pl-2 tracking-wider">Atalhos</p>
                  
                  {role === 'SUPER_ADMIN' ? (
                      <MenuItem icon={Users} label="Gestão de Lojas" rota="/super-admin" active />
                  ) : (
                      <>
                          <MenuItem icon={Home} label="Visão Geral" active />
                          <MenuItem icon={ShoppingCart} label="PDV (Venda Rápida)" rota="/pdv" />
                          
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 mt-6 pl-2 tracking-wider">Gestão</p>
                          {hasModule("OS") && <MenuItem icon={Wrench} label={ALL_MODULES.OS.label} rota={ALL_MODULES.OS.rota} />}
                          {hasModule("ESTOQUE") && <MenuItem icon={Package} label={ALL_MODULES.ESTOQUE.label} rota={ALL_MODULES.ESTOQUE.rota} />}
                          {hasModule("FINANCEIRO") && <MenuItem icon={DollarSign} label={ALL_MODULES.FINANCEIRO.label} rota={ALL_MODULES.FINANCEIRO.rota} />}
                          <MenuItem icon={Users} label="Clientes (CRM)" rota="/clientes" />
                          
                          {role === 'ADMIN' && (
                              <>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 mt-6 pl-2 tracking-wider">Sistema</p>
                                <MenuItem icon={Settings} label="Configurações da Loja" rota="/configuracoes" />
                              </>
                          )}
                      </>
                  )}
              </nav>
          </div>

          <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button onClick={toggleTheme} className="w-full flex items-center justify-center gap-2 py-2 mb-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded text-xs font-bold text-gray-700 dark:text-white hover:bg-gray-50 transition">
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-xs font-bold transition">
                  <LogOut size={16} /> Sair do Sistema
              </button>
              <div className="mt-4 pt-4 border-t dark:border-gray-700 text-[9px] text-center text-gray-400">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                      <span className={`w-2 h-2 rounded-full ${infoSistema ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span> {infoSistema ? "Online" : "Offline"}
                  </div>
                  <p className="mt-2 opacity-50 font-mono">Versão 1.8.0</p>
              </div>
          </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-8 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
          <div className="max-w-7xl mx-auto h-full content-start">
              
              {role === 'SUPER_ADMIN' ? (
                  /* === DASHBOARD SAAS === */
                  <div className="space-y-8 animate-fade-in">
                      <div>
                          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">Painel SaaS <span className="text-2xl">🚀</span></h1>
                          <p className="text-gray-500 dark:text-gray-400 mt-1">Visão geral do seu negócio de software.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-purple-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                              <div className="relative z-10">
                                  <p className="text-purple-200 font-bold text-xs uppercase mb-1">Total de Clientes</p>
                                  <p className="text-5xl font-extrabold">{contagemLojas}</p>
                                  <div className="mt-4 inline-block bg-purple-700/50 px-3 py-1 rounded text-xs flex items-center gap-1"><Server size={12}/> Lojas Ativas</div>
                              </div>
                              <Users className="absolute -bottom-4 -right-4 text-purple-500 opacity-50" size={100} />
                          </div>

                          <div className="bg-emerald-500 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                              <div className="relative z-10">
                                  <p className="text-emerald-100 font-bold text-xs uppercase mb-1">Receita Mensal Estimada (MRR)</p>
                                  <p className="text-5xl font-extrabold">R$ {(contagemLojas * 97).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                  <p className="text-emerald-100 text-xs mt-2 opacity-80">Baseado em R$ 97/mês</p>
                              </div>
                              <DollarSign className="absolute -bottom-4 -right-4 text-emerald-400 opacity-50" size={100} />
                          </div>

                          <div className="bg-gray-800 text-white p-6 rounded-2xl shadow-lg border border-gray-700 relative overflow-hidden">
                              <div className="flex items-center gap-2 mb-2"><Activity className="text-green-400" size={18} /><span className="font-bold text-xs uppercase tracking-wider text-gray-400">Status do Sistema</span></div>
                              <p className="text-3xl font-bold text-green-400">Operacional</p>
                              <div className="mt-4 space-y-1 text-xs text-gray-400"><p>Cloudflare Worker: <span className="text-green-400">Online</span></p><p>Banco D1: <span className="text-green-400">Online</span></p></div>
                          </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-gray-800 dark:text-white">Acesso Rápido</h3>
                              <button onClick={() => navigate("/super-admin")} className="text-blue-500 text-xs hover:underline">Ver todas as lojas →</button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <button onClick={() => navigate("/super-admin")} className="py-4 px-6 bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold rounded-xl transition text-center">Gerenciar Clientes</button>
                              <button className="py-4 px-6 bg-gray-100 dark:bg-gray-700/50 border dark:border-gray-600 text-gray-400 dark:text-gray-500 font-bold rounded-xl cursor-not-allowed text-center">Ver Logs de Erro (Em breve)</button>
                          </div>
                      </div>
                  </div>
              ) : (
                  /* === DASHBOARD LOJA (CLIENTE) === */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                      <div className="col-span-1 lg:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white flex justify-between items-center relative overflow-hidden">
                          <div className="relative z-10"><h2 className="text-2xl font-bold mb-1">Acesso Rápido</h2><p className="text-blue-100 text-sm">O que você deseja fazer agora?</p><div className="flex gap-3 mt-4"><button onClick={() => navigate("/pdv")} className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold shadow hover:bg-blue-50 transition flex items-center gap-2"><ShoppingCart size={18} /> Abrir PDV</button><button onClick={() => navigate("/clientes")} className="bg-blue-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition flex items-center gap-2 border border-blue-500"><Users size={18} /> Clientes</button><button onClick={() => navigate("/admin/logs")} className="bg-red-500/20 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-500/30 transition flex items-center gap-2 border border-red-500/50 ml-auto"><AlertTriangle size={18} /> Logs</button></div></div>
                          <ShoppingCart className="absolute right-10 -bottom-10 text-white opacity-10" size={150} />
                      </div>

                      {hasModule("OS") && (
                          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 flex flex-col relative overflow-hidden">
                              <div className="flex justify-between items-start mb-6"><h2 className="text-lg font-bold text-gray-700 dark:text-white flex items-center gap-2"><Wrench /> Gestão de OS</h2></div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div onClick={() => navigate("/em-andamento")} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 cursor-pointer hover:shadow-md transition"><div className="flex justify-between items-center mb-1"><p className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">Em Andamento</p><Clock size={16} className="text-blue-400"/></div><p className="text-4xl font-extrabold text-gray-800 dark:text-white">{emAndamento}</p></div>
                                  <div onClick={() => navigate("/aguardando-retirada")} className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800 cursor-pointer hover:shadow-md transition"><div className="flex justify-between items-center mb-1"><p className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase">Retirada</p><CheckCircle size={16} className="text-emerald-400"/></div><p className="text-4xl font-extrabold text-gray-800 dark:text-white">{aguardandoRetirada}</p></div>
                                  <div onClick={() => navigate("/concluidas")} className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800 cursor-pointer hover:shadow-md transition"><p className="text-green-600 dark:text-green-400 font-bold text-xs uppercase mb-1">Concluídas</p><p className="text-4xl font-extrabold text-gray-800 dark:text-white">{concluidas}</p></div>
                                  <div onClick={() => navigate("/atrasadas")} className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800 cursor-pointer hover:shadow-md transition"><div className="flex justify-between items-center mb-1"><p className="text-red-600 dark:text-red-400 font-bold text-xs uppercase">Atrasadas</p><AlertCircle size={16} className="text-red-400"/></div><p className="text-4xl font-extrabold text-gray-800 dark:text-white">{atrasadas}</p></div>
                              </div>
                          </div>
                      )}

                      {hasModule("ESTOQUE") && (
                          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 flex flex-col">
                              <h2 className="text-lg font-bold text-gray-700 dark:text-white mb-6 flex items-center gap-2"><Package /> Estoque Rápido</h2>
                              <div className="flex-1 flex flex-col justify-between">
                                  <div className="grid grid-cols-3 gap-2 mb-6">
                                      <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30 text-center"><p className="text-red-600 dark:text-red-400 font-bold text-[10px] uppercase mb-1">Baixo Estoque</p><p className="text-2xl font-bold text-gray-800 dark:text-white">{metricasEstoque.baixoEstoque}</p></div>
                                      <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30 text-center"><p className="text-green-600 dark:text-green-400 font-bold text-[10px] uppercase mb-1">Giro Hoje</p><p className="text-2xl font-bold text-gray-800 dark:text-white">{vendasHoje}</p></div>
                                      <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-center"><p className="text-gray-500 dark:text-gray-400 font-bold text-[10px] uppercase mb-1">Valor Parado</p><p className="text-lg font-bold text-gray-800 dark:text-white truncate">R$ {metricasEstoque.valorTotal.toLocaleString('pt-BR', { notation: "compact" })}</p></div>
                                  </div>
                                  <button onClick={() => navigate("/estoque")} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition shadow-md shadow-blue-500/20">Gerenciar Estoque Completo</button>
                              </div>
                          </div>
                      )}

                      {hasModule("FINANCEIRO") && (
                          <div onClick={() => navigate("/financeiro")} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 flex flex-col justify-between cursor-pointer hover:shadow-md transition group">
                              <div className="flex justify-between items-start"><h2 className="text-lg font-bold text-gray-700 dark:text-white flex items-center gap-2"><DollarSign /> Financeiro</h2><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold dark:bg-blue-900/30 dark:text-blue-300 group-hover:bg-blue-200 transition">VER MAIS</span></div>
                              <div className="flex flex-col gap-4 mt-4">
                                  <div className="text-center py-2 border-b dark:border-gray-700"><p className="text-xs font-bold text-gray-400 uppercase">Saldo Atual</p><p className={`text-3xl font-extrabold ${financas.saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>R$ {financas.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30 text-center"><p className="text-green-600 dark:text-green-400 font-bold text-[10px] uppercase">Entradas</p><p className="text-lg font-bold text-gray-800 dark:text-white">R$ {financas.entradas.toLocaleString('pt-BR', { notation: "compact" })}</p></div>
                                      <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30 text-center"><p className="text-red-600 dark:text-red-400 font-bold text-[10px] uppercase">Saídas</p><p className="text-lg font-bold text-gray-800 dark:text-white">R$ {financas.saidas.toLocaleString('pt-BR', { notation: "compact" })}</p></div>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              )}
          </div>
      </main>
    </div>
  );
}