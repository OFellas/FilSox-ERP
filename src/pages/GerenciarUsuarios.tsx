import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function GerenciarUsuarios() {
  const navigate = useNavigate();
  // Lista de usuários carregados do banco
  const [usuarios, setUsuarios] = useState<any[]>([]);
  // Guarda o ID do usuário que está sendo editado no momento
  const [editando, setEditando] = useState<number | null>(null);
  
  // Dados do formulário de edição
  const [form, setForm] = useState({ nome: "", login: "", senha: "" });

  // Carrega usuários ao abrir a tela
  useEffect(() => {
    carregar();
  }, []);

  // FUNÇÃO: Busca usuários na API
  async function carregar() {
    const dados = await api.listarUsuarios();
    setUsuarios(dados);
  }

  // AÇÃO: Preenche o formulário com os dados do usuário clicado e ativa modo edição
  function iniciarEdicao(user: any) {
    setEditando(user.id);
    setForm({ nome: user.nome, login: user.login, senha: user.senha });
  }

  // AÇÃO: Envia os dados editados para a API
  async function salvarEdicao(id: number) {
    if (!form.login || !form.senha) return alert("Preencha login e senha");
    
    await api.atualizarUsuario(id, { nome: form.nome, login: form.login, senha: form.senha });
    setEditando(null); // Sai do modo edição
    carregar(); // Recarrega a lista
    alert("Usuário atualizado com sucesso!");
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">🔐 Gerenciar Acessos</h1>
           <p className="text-gray-500">Edite login e senha da equipe</p>
        </div>
        <button onClick={() => navigate("/")} className="bg-gray-200 px-4 py-2 rounded font-bold text-gray-700 hover:bg-gray-300">
            Voltar
        </button>
      </div>

      {/* LISTA DE USUÁRIOS */}
      <div className="grid gap-4">
        {usuarios.map(u => (
          <div key={u.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* LÓGICA CONDICIONAL: SE ESTIVER EDITANDO ESSE ID, MOSTRA INPUTS */}
            {editando === u.id ? (
              // --- MODO EDIÇÃO ---
              <div className="w-full flex flex-col md:flex-row gap-4 items-end">
                 <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase">Nome</label>
                    <input className="w-full border p-2 rounded" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
                 </div>
                 <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase">Login (Usuário)</label>
                    <input className="w-full border p-2 rounded" value={form.login} onChange={e => setForm({...form, login: e.target.value})} />
                 </div>
                 <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase">Nova Senha</label>
                    <input className="w-full border p-2 rounded" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} />
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => salvarEdicao(u.id)} className="bg-green-600 text-white px-4 py-2 rounded font-bold">Salvar</button>
                    <button onClick={() => setEditando(null)} className="bg-red-500 text-white px-4 py-2 rounded font-bold">Cancelar</button>
                 </div>
              </div>
            ) : (
              // --- MODO VISUALIZAÇÃO ---
              <>
                <div>
                   <h3 className="font-bold text-lg text-gray-800">{u.nome}</h3>
                   <div className="flex gap-4 text-sm text-gray-500 mt-1">
                      <span>Login: <b>{u.login}</b></span>
                      <span>Permissão: <b className="bg-blue-50 text-blue-700 px-2 rounded text-xs">{u.role}</b></span>
                   </div>
                </div>
                <button 
                  onClick={() => iniciarEdicao(u)}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded font-bold hover:bg-blue-200 transition"
                >
                  ✏️ Editar Senha
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}