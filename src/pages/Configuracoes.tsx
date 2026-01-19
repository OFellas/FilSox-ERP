import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Configuracoes() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Estados do Formulário
  const [nomeLoja, setNomeLoja] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [termos, setTermos] = useState("");
  const [cidadePadrao, setCidadePadrao] = useState("");

  // NOVO: modelos de impressão OS
  const [modeloOsGeral, setModeloOsGeral] = useState("");
  const [modeloOsCelular, setModeloOsCelular] = useState("");
  const [usarModeloUnicoOs, setUsarModeloUnicoOs] = useState(false);

  // Estado "Invisível" para manter os módulos sem alterar
  const [modulosAtivos, setModulosAtivos] = useState<string[]>([]);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);
    try {
      const dados = await api.getConfig();
      if (dados) {
        setNomeLoja(dados.nome_loja || "");
        setEndereco(dados.endereco || "");
        setTelefone(dados.telefone || "");
        setEmail(dados.email || "");
        setLogoUrl(dados.logo_url || "");
        setTermos(dados.termos_garantia || "");
        setCidadePadrao(dados.cidade_padrao || "");

        // NOVO
        setModeloOsGeral(dados.modelo_os_geral || "");
        setModeloOsCelular(dados.modelo_os_celular || "");
        setUsarModeloUnicoOs(!!dados.usar_modelo_unico_os);

        // Carrega os módulos apenas para re-enviar ao salvar (preservar o plano)
        if (dados.modulos_ativos) {
          try {
            const mods =
              typeof dados.modulos_ativos === "string"
                ? JSON.parse(dados.modulos_ativos)
                : dados.modulos_ativos;
            setModulosAtivos(Array.isArray(mods) ? mods : []);
          } catch {
            setModulosAtivos([]);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const handleLogoUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  function importarModelo(file: File, alvo: "GERAL" | "CELULAR") {
    const reader = new FileReader();
    reader.onload = () => {
      const conteudo = String(reader.result || "");
      if (alvo === "GERAL") {
        setModeloOsGeral(conteudo);
        if (usarModeloUnicoOs) setModeloOsCelular(conteudo);
      } else {
        setModeloOsCelular(conteudo);
      }
    };
    reader.readAsText(file, "utf-8");
  }

  async function handleSalvar() {
    setSalvando(true);

    await api.salvarConfig({
      nome_loja: nomeLoja,
      endereco,
      telefone,
      email,
      logo_url: logoUrl,
      termos_garantia: termos,
      cidade_padrao: cidadePadrao,

      // NOVO: modelos
      modelo_os_geral: modeloOsGeral,
      modelo_os_celular: usarModeloUnicoOs ? modeloOsGeral : modeloOsCelular,
      usar_modelo_unico_os: usarModeloUnicoOs ? 1 : 0,

      // Envia de volta o que já estava lá, para não quebrar o plano definido pelo Super Admin
      modulos_ativos: JSON.stringify(modulosAtivos),
    });

    setSalvando(false);
    alert("Dados da loja atualizados com sucesso!");
    window.location.reload();
  }

  if (loading)
    return <div className="p-10 text-center dark:text-white">Carregando...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto pb-20 dark:text-white">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        ⚙️ Configurações da Loja
      </h1>

      <div className="space-y-6">
        {/* === BLOCO 1: IDENTIDADE DA LOJA === */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow border dark:border-gray-700">
          <h2 className="font-bold text-lg mb-4 border-b pb-2">
            Dados da Empresa
          </h2>

          <label className="block text-sm font-bold text-gray-500 mb-1">
            Nome Fantasia
          </label>
          <input
            className="w-full border p-2 rounded mb-3 dark:bg-gray-700 dark:border-gray-600"
            value={nomeLoja}
            onChange={(e) => setNomeLoja(e.target.value)}
          />

          <label className="block text-sm font-bold text-gray-500 mb-1">
            Cidade Padrão
          </label>
          <input
            className="w-full border p-2 rounded mb-3 dark:bg-gray-700 dark:border-gray-600"
            value={cidadePadrao}
            onChange={(e) => setCidadePadrao(e.target.value)}
            placeholder="Ex: São Paulo - SP"
          />

          <label className="block text-sm font-bold text-gray-500 mb-1">
            Endereço Completo
          </label>
          <textarea
            className="w-full border p-2 rounded mb-3 dark:bg-gray-700 dark:border-gray-600"
            rows={2}
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                className="w-full border p-2 rounded mb-3 dark:bg-gray-700 dark:border-gray-600"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-1">
                Email
              </label>
              <input
                className="w-full border p-2 rounded mb-3 dark:bg-gray-700 dark:border-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* === BLOCO 2: PERSONALIZAÇÃO (LOGO E TERMOS) === */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow border dark:border-gray-700">
          <h2 className="font-bold text-lg mb-4 border-b pb-2">
            Personalização
          </h2>

          <label className="block text-sm font-bold text-gray-500 mb-1">
            Logo da Loja
          </label>
          <div className="flex items-center gap-4 mb-4">
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-16 w-16 object-contain border rounded"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="text-sm"
            />
          </div>

          <label className="block text-sm font-bold text-gray-500 mb-1">
            Termos de Garantia (Rodapé da OS)
          </label>
          <textarea
            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 text-xs"
            rows={4}
            value={termos}
            onChange={(e) => setTermos(e.target.value)}
            placeholder="Texto que sai impresso no rodapé da via do cliente..."
          />
        </div>

        {/* === BLOCO 3: MODELOS DE OS === */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow border dark:border-gray-700">
          <h2 className="font-bold text-lg mb-4 border-b pb-2">
            Modelos de OS (Impressão)
          </h2>

          <label className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 mb-4">
            <input
              type="checkbox"
              checked={usarModeloUnicoOs}
              onChange={(e) => {
                const usar = e.target.checked;
                setUsarModeloUnicoOs(usar);
                if (usar) setModeloOsCelular(modeloOsGeral);
              }}
            />
            Usar um único modelo para OS Geral e OS Celular
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-1">
                Modelo OS Geral (importar .txt/.html)
              </label>
              <input
                type="file"
                accept=".txt,.html"
                className="text-sm mb-2"
                onChange={(e: any) => {
                  const file = e.target.files?.[0];
                  if (file) importarModelo(file, "GERAL");
                }}
              />
              <textarea
                className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 text-xs"
                rows={6}
                value={modeloOsGeral}
                onChange={(e) => {
                  setModeloOsGeral(e.target.value);
                  if (usarModeloUnicoOs) setModeloOsCelular(e.target.value);
                }}
                placeholder="Cole ou importe o modelo geral aqui..."
              />
            </div>

            <div className={usarModeloUnicoOs ? "opacity-60 pointer-events-none" : ""}>
              <label className="block text-sm font-bold text-gray-500 mb-1">
                Modelo OS Celular (importar .txt/.html)
              </label>
              <input
                type="file"
                accept=".txt,.html"
                className="text-sm mb-2"
                disabled={usarModeloUnicoOs}
                onChange={(e: any) => {
                  const file = e.target.files?.[0];
                  if (file) importarModelo(file, "CELULAR");
                }}
              />
              <textarea
                className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 text-xs"
                rows={6}
                value={usarModeloUnicoOs ? modeloOsGeral : modeloOsCelular}
                onChange={(e) => setModeloOsCelular(e.target.value)}
                placeholder="Cole ou importe o modelo celular aqui..."
                disabled={usarModeloUnicoOs}
              />
              {usarModeloUnicoOs && (
                <p className="text-[11px] text-gray-400 mt-1">
                  O modelo do celular será o mesmo do modelo geral.
                </p>
              )}
            </div>
          </div>

          <p className="text-[11px] text-gray-400 mt-3">
            Dica: por enquanto isso salva os modelos. O próximo passo (se você quiser) é usar esse texto
            como template real na impressão (com variáveis tipo {"{{cliente}}"} etc.).
          </p>
        </div>

        {/* NOTA SOBRE MÓDULOS */}
        <div className="text-center text-xs text-gray-400 mt-4">
          <p>
            Os módulos ativos do seu sistema (Estoque, OS, etc.) são gerenciados
            pelo administrador do sistema.
          </p>
          <p>Para alterações no seu plano, entre em contato com o suporte.</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 border-t flex justify-end gap-4 shadow-lg z-50">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 border rounded hover:bg-gray-100 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
        >
          Cancelar
        </button>
        <button
          onClick={handleSalvar}
          disabled={salvando}
          className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {salvando ? "Salvando..." : "💾 Salvar Configurações"}
        </button>
      </div>
    </div>
  );
}
