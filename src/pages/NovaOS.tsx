import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { User, Smartphone, Monitor, Camera, Save, X, Search } from "lucide-react";

export default function NovaOS() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [tipo, setTipo] = useState("CELULAR");
  const [isAutoNumero, setIsAutoNumero] = useState(true);
  const [numeroManual, setNumeroManual] = useState("");

  const [clienteBusca, setClienteBusca] = useState("");
  const [sugestoesClientes, setSugestoesClientes] = useState<any[]>([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const [cliente, setCliente] = useState("");
  const [documento, setDocumento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  
  const [equipamento, setEquipamento] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [serial, setSerial] = useState("");
  const [operadora, setOperadora] = useState("");
  const [acessorios, setAcessorios] = useState("");
  
  const [problema, setProblema] = useState("");
  const [informacoes, setInformacoes] = useState("");
  const [valor, setValor] = useState("");
  
  // @ts-ignore
  const [tecnico, setTecnico] = useState(user?.nome || user?.login || "Técnico");
  const [dataAbertura, setDataAbertura] = useState(new Date().toISOString().slice(0, 16));
  const [foto, setFoto] = useState("");

  const [todosClientes, setTodosClientes] = useState<any[]>([]);
  useEffect(() => {
      api.listarClientes().then(setTodosClientes).catch(() => {});
  }, []);

  useEffect(() => {
      if (clienteBusca.length > 1) {
          const filtrados = todosClientes.filter(c => c.nome.toLowerCase().includes(clienteBusca.toLowerCase()));
          setSugestoesClientes(filtrados.slice(0, 5));
          setMostrarSugestoes(true);
      } else {
          setMostrarSugestoes(false);
      }
      setCliente(clienteBusca);
  }, [clienteBusca, todosClientes]);

  function selecionarCliente(c: any) {
      setCliente(c.nome);
      setClienteBusca(c.nome);
      setDocumento(c.documento || "");
      setTelefone(c.telefone || "");
      setCidade(c.cidade || "");
      setMostrarSugestoes(false);
  }

  const handleFoto = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  async function handleSalvar() {
    if (!cliente || !problema) { alert("Preencha campos obrigatórios (*)"); return; }
    if (!isAutoNumero && !numeroManual) { alert("Informe o número da OS."); return; }

    setLoading(true);
    try {
        const nomeEquipamento = tipo === "CELULAR" ? `${marca} ${modelo}` : equipamento;
        const numeroFinal = isAutoNumero ? Date.now().toString().slice(-6) : numeroManual;

        await api.criar({
            numero: numeroFinal,
            cliente, telefone, cidade, documento,
            equipamento: nomeEquipamento,
            marca, operadora, serial, acessorios,
            problema, informacoes,
            tecnico, status: "ABERTA", garantiaStatus: "NAO",
            tipo, valor, foto, dataAbertura: new Date(dataAbertura).toISOString()
        });
        alert("OS Criada com Sucesso!");
        navigate("/");
    } catch (error) { alert("Erro ao criar OS."); } finally { setLoading(false); }
  }

  const inputClass = "w-full border p-2.5 rounded-lg text-sm bg-gray-50 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors";
  const labelClass = "block mb-1 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide";
  const sectionTitleClass = "text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4 border-b dark:border-gray-700 pb-2";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-7xl mx-auto p-4 md:p-8 pb-40 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Nova Ordem de Serviço</h1>
          <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border dark:border-gray-700 shadow-sm">
              <button type="button" onClick={() => setTipo("CELULAR")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${tipo === "CELULAR" ? "bg-blue-600 text-white shadow" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}><Smartphone size={16} /> Celular/Tablet</button>
              <button type="button" onClick={() => setTipo("GERAL")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${tipo === "GERAL" ? "bg-blue-600 text-white shadow" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}><Monitor size={16} /> Geral / Variados</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 h-fit relative">
              <h2 className={sectionTitleClass}><User size={20} className="text-blue-500" /> Dados Principais</h2>
              <div className="space-y-4">
                  <div>
                      <label className={labelClass}>Número OS</label>
                      <div className="flex gap-2">
                          <input disabled={isAutoNumero} value={isAutoNumero ? "AUTOMÁTICO" : numeroManual} onChange={e => setNumeroManual(e.target.value)} placeholder="Digite o Nº" className={`${inputClass} ${isAutoNumero ? 'bg-gray-200 dark:bg-gray-600 opacity-70 cursor-not-allowed font-mono' : 'font-bold text-blue-600 dark:bg-gray-700 dark:text-white'}`} />
                          <button type="button" onClick={() => setIsAutoNumero(!isAutoNumero)} className={`flex items-center gap-1 px-3 rounded text-xs font-bold border transition-all ${isAutoNumero ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-300'}`}>{isAutoNumero ? "✓ Auto" : "✎ Manual"}</button>
                      </div>
                  </div>
                  <div className="relative">
                      <label className={labelClass}>Cliente *</label>
                      <div className="relative">
                          <input className={inputClass} value={clienteBusca} onChange={e => setClienteBusca(e.target.value)} placeholder="Pesquise o Cliente..." autoFocus onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)} />
                          {clienteBusca.length > 0 && <div className="absolute right-3 top-3 text-gray-400"><Search size={16} /></div>}
                      </div>
                      {mostrarSugestoes && sugestoesClientes.length > 0 && (
                          <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-b-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                              {sugestoesClientes.map((c) => (
                                  <div key={c.id} onClick={() => selecionarCliente(c)} className="p-3 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer border-b dark:border-gray-600 last:border-0">
                                      <p className="font-bold text-sm text-gray-800 dark:text-white">{c.nome}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-300">{c.documento || "Sem Doc"} • {c.telefone || "Sem Tel"}</p>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelClass}>CPF / CNPJ</label><input className={inputClass} value={documento} onChange={e => setDocumento(e.target.value)} placeholder="000.000.000-00" /></div>
                      <div><label className={labelClass}>Telefone / WhatsApp</label><input className={inputClass} value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000" /></div>
                  </div>
                  <div><label className={labelClass}>Cidade</label><input className={inputClass} value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Cidade do Cliente" /></div>
                  {tipo === "CELULAR" ? (
                      <><div className="grid grid-cols-2 gap-4"><div><label className={labelClass}>Marca</label><input className={inputClass} value={marca} onChange={e => setMarca(e.target.value)} placeholder="Ex: Samsung" /></div><div><label className={labelClass}>Modelo *</label><input className={inputClass} value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Ex: S22 Ultra" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className={labelClass}>IMEI / Serial</label><input className={inputClass} value={serial} onChange={e => setSerial(e.target.value)} /></div><div><label className={labelClass}>Operadora</label><input className={inputClass} value={operadora} onChange={e => setOperadora(e.target.value)} /></div></div></>
                  ) : (
                      <div><label className={labelClass}>Equipamento / Modelo *</label><input className={inputClass} value={equipamento} onChange={e => setEquipamento(e.target.value)} placeholder="Ex: Notebook Dell Inspiron..." /></div>
                  )}
                  <div><label className={labelClass}>Acessórios Deixados</label><input className={inputClass} value={acessorios} onChange={e => setAcessorios(e.target.value)} placeholder="Ex: Capa, carregador, controle..." /></div>
              </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 h-fit">
              <h2 className={sectionTitleClass}><Monitor size={20} className="text-purple-500" /> Estado e Serviço</h2>
              <div className="space-y-4">
                  <div><label className={labelClass}>Problema Relatado *</label><textarea rows={3} className={inputClass} value={problema} onChange={e => setProblema(e.target.value)} placeholder="Descreva o defeito informado pelo cliente..." /></div>
                  <div><label className={labelClass}>Detalhes / Observações</label><textarea rows={2} className={inputClass} value={informacoes} onChange={e => setInformacoes(e.target.value)} placeholder="Ex: Riscos na carcaça, parafuso faltando..." /></div>
                  <div><label className={labelClass}>Orçamento Prévio (Opcional)</label><div className="relative"><span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400 font-bold">R$</span><input className={`${inputClass} pl-10`} value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" /></div></div>
                  <div><label className={labelClass}>Foto do Equipamento</label><div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${foto ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{foto ? (<div className="relative"><img src={foto} alt="Preview" className="h-32 mx-auto rounded object-contain" /><button type="button" onClick={() => setFoto("")} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"><X size={14} /></button></div>) : (<label className="cursor-pointer flex flex-col items-center gap-2"><Camera className="text-gray-400" size={32} /><span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Clique para adicionar foto</span><span className="text-[10px] text-gray-400">Máximo 2MB</span><input type="file" accept="image/*" className="hidden" onChange={handleFoto} /></label>)}</div></div>
                  <div className="grid grid-cols-2 gap-4 pt-2"><div><label className={labelClass}>Técnico Responsável</label><input className={inputClass} value={tecnico} onChange={e => setTecnico(e.target.value)} /></div><div><label className={labelClass}>Data de Abertura</label><input type="datetime-local" className={inputClass} value={dataAbertura} onChange={e => setDataAbertura(e.target.value)} /></div></div>
              </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 shadow-lg z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
              <button type="button" onClick={() => navigate("/")} className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancelar</button>
              <button onClick={handleSalvar} disabled={loading} className="px-8 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg hover:shadow-xl transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? "Salvando..." : <><Save size={20} /> Criar Ordem de Serviço</>}</button>
          </div>
      </div>
    </div>
  );
}