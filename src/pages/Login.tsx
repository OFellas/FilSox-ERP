import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  // ESTADOS DO FORMULÁRIO DE LOGIN
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  
  // HOOKS DE AUTENTICAÇÃO E NAVEGAÇÃO
  // MUDANÇA 1: Usamos 'signIn' que é o nome correto no AuthContext novo
  const { signIn } = useAuth(); 
  const navigate = useNavigate();

  // FUNÇÃO DE SUBMISSÃO DO LOGIN
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      // MUDANÇA 2: O novo signIn joga um erro se falhar, então usamos try/catch
      await signIn(usuario, senha);
      navigate("/"); // Se passar daqui, o login deu certo
    } catch (err) {
      // Se cair aqui, a senha ou usuário estavam errados
      setErro("Usuário ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center overflow-hidden relative animate-fade-in">
      
      {/* Fundo gradiente Login*/}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 z-0"></div>

      {/* DESIGN GEOMÉTRICO LOGIN*/}
      <div className="relative w-[500px] h-[550px] z-10 drop-shadow-2xl filter">
        
        {/* Botão Entrar */}
        <div 
          onClick={handleLogin}
          className="absolute bottom-10 right-0 w-[300px] h-[300px] bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] cursor-pointer group transition-all duration-300 hover:brightness-110"
          style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
        >
            {/* CONTAINER DO ÍCONE E TEXTO (ANIMAÇÃO INTERNA) */}
            <div className="absolute bottom-12 right-12 text-center transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                
                {/* Ícone de Cadeado */}
                <div className="mb-2 flex justify-center text-cyan-400 group-hover:text-white transition-colors duration-300 drop-shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </div>
                
                {/* Texto ENTRAR */}
                <span className="text-white font-bold tracking-widest text-sm group-hover:text-cyan-300 transition-colors duration-300 drop-shadow-md">
                    {loading ? "..." : "ENTRAR"}
                </span>
            </div>
            <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* --- TRIÂNGULO BRANCO (Parte superior / Formulário) --- */}
        <div 
            className="absolute top-0 left-0 w-full h-[500px] bg-white flex flex-col justify-center px-12 py-10 shadow-lg"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 60%, 0% 100%)" }}
        >

            <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-4 right-12 w-20 h-[2px] bg-cyan-400 opacity-30 rotate-45"></div>

            {/* Título */}
            <div className="mb-10 mt-[-40px]">
                <h1 className="text-3xl font-extrabold text-[#0f172a] leading-tight">
                    Acessar <br/> Sistema
                </h1>
                <div className="w-12 h-1 bg-cyan-500 mt-4"></div>
            </div>

            {/* Formulário de Inputs */}
            <form onSubmit={handleLogin} className="space-y-6 w-3/4">
                <div className="relative group">
                    <input 
                        type="text" 
                        placeholder="LOGIN..." 
                        className="w-full border-b border-gray-300 py-2 text-sm text-gray-600 focus:outline-none focus:border-cyan-500 bg-transparent placeholder-gray-400 uppercase tracking-wide transition-colors"
                        value={usuario}
                        onChange={e => { setUsuario(e.target.value); setErro(""); }}
                    />
                </div>

                <div className="relative group">
                    <input 
                        type="password" 
                        placeholder="PASSWORD..." 
                        className="w-full border-b border-gray-300 py-2 text-sm text-gray-600 focus:outline-none focus:border-cyan-500 bg-transparent placeholder-gray-400 uppercase tracking-wide transition-colors"
                        value={senha}
                        onChange={e => { setSenha(e.target.value); setErro(""); }}
                    />
                </div>

                {/* Mensagem de Erro */}
                {erro && (
                    <div className="text-xs text-red-500 font-bold animate-pulse">
                        {erro}
                    </div>
                )}
                
                <div className="pt-2">
                    <a href="#" className="text-[10px] text-gray-400 hover:text-cyan-600 uppercase tracking-wider font-bold transition-colors">
                        Esqueceu a senha?
                    </a>
                </div>
            </form>
            
             <div className="absolute bottom-10 left-6 w-4 h-4 border-b-2 border-l-2 border-cyan-400/50"></div>
        </div>

        <div className="absolute top-[300px] left-[300px] w-20 h-20 bg-black blur-2xl opacity-20 -z-10"></div>

      </div>
      
      {/* Atualizei o nome para FilSox ERP para bater com a nova marca */}
      <div className="absolute bottom-4 text-gray-400 text-xs font-mono opacity-50">
        FILSOX ERP v1.3.0 • FILSOX LABS
      </div>

    </div>
  );
}