import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { OS } from "../types/OS";
import Modal from "../components/Modal";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface ConfigLoja {
  nome_loja: string;
  endereco: string;
  telefone: string;
  email: string;
  logo_url: string;
  termos_garantia: string;

  modelo_os_geral?: string;
  modelo_os_celular?: string;
  usar_modelo_unico_os?: boolean | number;
}

// Função auxiliar para tratar valores (Ex: "R$ 1.200,50" -> 1200.50)
function limparValor(valor: string) {
  if (!valor) return 0;
  const limpo = valor
    .toString()
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  return parseFloat(limpo) || 0;
}

function formatarData(data: string) {
  if (!data) return "—";
  return new Date(data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ===============================
// IMPRESSÃO CELULAR - MODELO FORMULÁRIO (tipo imagem 2)
// ===============================
const CaixaTopo = ({ children }: { children: React.ReactNode }) => (
  <div className="border-2 border-black rounded-2xl p-3 h-[85px] flex items-center justify-center">
    {children}
  </div>
);

const CampoForm = ({
  label,
  value,
  className = "",
  valueClassName = "",
}: {
  label: string;
  value?: string;
  className?: string;
  valueClassName?: string;
}) => (
  <div className={`border border-black ${className}`}>
    <div className="text-[9px] font-bold uppercase px-2 pt-1 leading-none">
      {label}
    </div>
    <div
      className={`px-2 pb-1 pt-1 leading-tight font-semibold ${valueClassName}`}
    >
      {value && value.toString().trim().length ? value : " "}
    </div>
  </div>
);

const TextoPequeno = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[8px] leading-tight">{children}</div>
);

function dataBR(dataIso?: string) {
  if (!dataIso) return "";
  const d = new Date(dataIso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR");
}
function horaBR(dataIso?: string) {
  if (!dataIso) return "";
  const d = new Date(dataIso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// desenho simples “frente/verso” igual formulário
const DanosCelularForm = () => (
  <div className="flex items-center justify-center gap-6 pt-2">
    <div className="flex flex-col items-center">
      <TextoPequeno>
        <b>FRENTE</b>
      </TextoPequeno>
      <div className="mt-1 border border-black rounded-md w-[210px] h-[85px] relative">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 border border-black rounded" />
        <div className="absolute top-2 left-6 w-2 h-2 border border-black rounded-full" />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 border border-black rounded-full" />
      </div>
    </div>

    <div className="flex flex-col items-center">
      <TextoPequeno>
        <b>VERSO</b>
      </TextoPequeno>
      <div className="mt-1 border border-black rounded-md w-[210px] h-[85px] relative">
        <div className="absolute top-3 left-3 w-8 h-5 border border-black rounded-sm" />
        <div className="absolute top-3 left-[58px] w-2 h-2 border border-black rounded-full" />
      </div>
    </div>
  </div>
);

const BlocoSenhaDispositivoForm = () => (
  <div className="border border-black h-full flex flex-col">
    <div className="border-b border-black px-2 py-1 text-[9px] font-bold uppercase">
      Senha Dispositivo
    </div>
    <div className="flex-1 px-2 py-2">
      <div className="border-b border-black h-6 mb-2" />
      <div className="grid grid-cols-3 gap-2 justify-items-center w-fit ml-auto">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="w-3 h-3 border border-black rounded-full" />
        ))}
      </div>
    </div>
  </div>
);

const ViaImpressaoCelularFormulario = ({
  os,
  tipo,
  config,
}: {
  os: OS;
  tipo: "CLIENTE" | "LOJA";
  config: ConfigLoja | null;
}) => {
  const clienteNome = os.cliente || "";
  const cpf = os.documento || "";
  const rg = (os as any).rg_ie || ""; // se não existir no banco, fica vazio
  const tel = os.telefone || "";
  const email = (os as any).email || ""; // se não existir no banco, fica vazio

  const modelo = os.equipamento || "";
  const marca = os.marca || "";
  const serial = os.serial || "";

  const acessorios = os.acessorios || "";
  const obs = os.informacoes || "";
  const defeito = os.problema || "";

  return (
    <div className="w-full text-black bg-white">
      {/* TOPO: 3 blocos arredondados */}
      <div className="grid grid-cols-12 gap-4 mb-3">
        <div className="col-span-3">
          <CaixaTopo>
            {config?.logo_url ? (
              <img
                src={config.logo_url}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="text-center font-bold text-[14px] uppercase">
                IMAGEM LOGO DA LOJA
              </div>
            )}
          </CaixaTopo>
        </div>

        <div className="col-span-6">
          <CaixaTopo>
            <div className="text-center">
              <div className="font-black text-[16px] uppercase leading-none">
                {config?.nome_loja || "NOME DA LOJA"}
              </div>
              <div className="text-[12px] mt-1">
                {config?.endereco || "Endereço da loja"}
              </div>
              <div className="text-[12px]">
                {config?.telefone || "telefone da loja"}
              </div>
            </div>
          </CaixaTopo>
        </div>

        <div className="col-span-3">
          <CaixaTopo>
            <div className="text-center w-full">
              <div className="font-bold text-[14px]">Número da OS</div>
              <div className="font-black text-[26px] leading-none mt-1">
                {os.numero}
              </div>
              <div className="text-[10px] mt-1">
                Cod de barras do número da OS
              </div>
            </div>
          </CaixaTopo>
        </div>
      </div>

      {/* GRID DE CAMPOS */}
      <div className="border border-black">
        {/* linha 1 */}
        <div className="grid grid-cols-12">
          <div className="col-span-2">
            <CampoForm
              label="Data Entrega"
              value={`${dataBR(os.dataAbertura)}\n${horaBR(os.dataAbertura)}`}
              valueClassName="whitespace-pre-line text-[12px]"
            />
          </div>
          <div className="col-span-2">
            <CampoForm
              label="Previsão Saída"
              value=""
              valueClassName="whitespace-pre-line text-[12px]"
            />
          </div>
          <div className="col-span-6">
            <CampoForm
              label="Cliente"
              value={`"${clienteNome || " "}"`}
              valueClassName="text-[18px] font-black uppercase"
            />
          </div>
          <div className="col-span-2">
            <CampoForm
              label="Número da Ordem de Serviço"
              value={os.numero?.toString()}
              valueClassName="text-[14px] font-bold"
            />
          </div>
        </div>

        {/* linha 2 */}
        <div className="grid grid-cols-12">
          <div className="col-span-4">
            <CampoForm
              label="CPF/CNPJ"
              value={cpf}
              valueClassName="text-[18px]"
            />
          </div>
          <div className="col-span-3">
            <CampoForm
              label="RG/IE"
              value={rg}
              valueClassName="text-[18px]"
            />
          </div>
          <div className="col-span-3">
            <CampoForm label="Telefone" value={tel} valueClassName="text-[18px]" />
          </div>
          <div className="col-span-2">
            <CampoForm
              label="E-mail"
              value={email}
              valueClassName="text-[10px]"
            />
          </div>
        </div>

        {/* linha 3 */}
        <div className="grid grid-cols-12">
          <div className="col-span-5">
            <CampoForm label="Modelo" value={modelo} />
          </div>
          <div className="col-span-3">
            <CampoForm label="Marca" value={marca} />
          </div>
          <div className="col-span-4">
            <CampoForm label="Serial Number" value={serial} />
          </div>
        </div>

        {/* linha 4 */}
        <div className="grid grid-cols-12">
          <div className="col-span-6">
            <CampoForm
              label="Acessórios"
              value={acessorios}
              className="h-[70px]"
              valueClassName="text-[12px]"
            />
          </div>
          <div className="col-span-6">
            <CampoForm
              label="Detalhes/Observações"
              value={obs}
              className="h-[70px]"
              valueClassName="text-[12px]"
            />
          </div>
        </div>

        {/* linha 5 */}
        <div className="grid grid-cols-12">
          <div className="col-span-8">
            <CampoForm
              label="Problema Relatado"
              value={defeito}
              className="h-[70px]"
              valueClassName="text-[12px]"
            />
          </div>

          <div className="col-span-4 h-[70px]">
            {tipo === "LOJA" ? (
              <BlocoSenhaDispositivoForm />
            ) : (
              <div className="border border-black h-full flex items-center justify-center text-[10px] font-bold">
                VIA CLIENTE
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DANOS */}
      <div className="mt-3">
        <div className="text-center text-[10px] font-bold uppercase">
          Marque os danos existentes no smartphone ou tablet
        </div>
        <DanosCelularForm />
        <div className="text-right font-black text-[16px] mt-1">
          VIA {tipo}
        </div>
      </div>

      {/* TERMOS / ASSINATURAS */}
      <div className="mt-3 text-[9px] leading-tight">
        <div className="border-t border-black pt-2">
          <p className="text-justify">
            {config?.termos_garantia ||
              "O serviço realizado possui garantia legal de 90 (noventa) dias, válida exclusivamente para a peça substituída e a mão de obra executada, conforme o reparo efetuado. A garantia não cobre defeitos causados por mau uso, quedas, impactos, contato com líquidos, oxidação, nem danos ocorridos após a entrega. A garantia será automaticamente cancelada em caso de violação dos selos ou intervenção por terceiros."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-6">
          <div className="border-t border-black pt-2 text-center font-bold">
            ASSINATURA CLIENTE
          </div>
          <div className="border-t border-black pt-2 text-center font-bold">
            ASSINATURA LOJA
          </div>
        </div>

        <div className="text-right font-black text-[16px] mt-4">
          VIA {tipo === "CLIENTE" ? "CLIENTE" : "LOJA"}
        </div>
      </div>
    </div>
  );
};

// ===============================
// MODELO ANTIGO (SEU) - mantido só pra VIA GERAL continuar igual
// ===============================

const CabecalhoOS = ({
  os,
  tipo,
  config,
}: {
  os: OS;
  tipo: string;
  config: ConfigLoja | null;
}) => (
  <div className="flex justify-between items-start border-b-2 border-black pb-1 mb-1 h-[12%] text-black">
    <div className="w-[30%] flex flex-col justify-center pr-2 border-r border-gray-200">
      {config?.logo_url ? (
        <img
          src={config.logo_url}
          alt="Logo"
          className="h-10 object-contain object-left mb-1"
        />
      ) : (
        <h1 className="font-black text-sm uppercase leading-none mb-1">
          {config?.nome_loja || "NOME DA LOJA"}
        </h1>
      )}
      <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest">
        Assistência Técnica
      </span>
    </div>
    <div className="w-[40%] flex flex-col justify-center items-center text-center px-2">
      <p className="font-bold text-[10px] uppercase text-gray-800 leading-tight mb-0.5">
        {config?.nome_loja || "Sua Loja"}
      </p>
      <p className="text-[8px] text-gray-600 leading-none">{config?.endereco}</p>
      <p className="text-[8px] text-gray-600 leading-none mt-0.5">
        {config?.telefone}
      </p>
    </div>
    <div className="w-[30%] text-right flex flex-col justify-center pl-2 border-l border-gray-200">
      <span className="text-[8px] font-bold text-gray-400 uppercase">
        Número da OS
      </span>
      <h2 className="font-black text-xl leading-none my-0.5">{os.numero}</h2>
      <div className="flex justify-end gap-1 items-center">
        <span className="bg-black text-white px-1.5 py-0.5 rounded text-[7px] font-bold uppercase">
          Via {tipo}
        </span>
        <p className="font-mono text-[8px]">{formatarData(os.dataAbertura)}</p>
      </div>
    </div>
  </div>
);

// === VIA GERAL (mantida igual) ===
const ViaImpressaoGeral = ({
  os,
  tipo,
  config,
}: {
  os: OS;
  tipo: "CLIENTE" | "LOJA";
  config: ConfigLoja | null;
}) => (
  <div className="h-[48%] border-b-2 border-dashed border-gray-400 pb-2 mb-2 flex flex-col justify-between text-xs font-sans text-black bg-white">
    <CabecalhoOS os={os} tipo={tipo} config={config} />
    <div className="border border-black p-1 mb-1 bg-gray-50">
      <div className="grid grid-cols-4 gap-2 text-[9px]">
        <div className="col-span-2">
          <span className="font-bold block text-gray-500 uppercase leading-none">
            Cliente:
          </span>
          <span className="text-sm font-bold uppercase leading-none">
            {os.cliente}
          </span>
        </div>
        <div>
          <span className="font-bold block text-gray-500 uppercase leading-none">
            CPF/CNPJ:
          </span>
          <span className="leading-none">
            {os.documento || "___________________"}
          </span>
        </div>
        <div>
          <span className="font-bold block text-gray-500 uppercase leading-none">
            Telefone:
          </span>
          <span className="leading-none">{os.telefone}</span>
        </div>
      </div>
      <div className="mt-0.5 text-[9px] border-t border-gray-200 pt-0.5">
        <span className="font-bold text-gray-500 uppercase">
          Endereço/Cidade:
        </span>{" "}
        {os.cidade}
      </div>
    </div>

    <div className="border border-black mb-1 flex-1 min-h-[80px]">
      <div className="bg-gray-200 px-1 py-0.5 border-b border-black font-bold text-[8px] uppercase">
        Detalhes do Equipamento / Acessórios
      </div>
      <div className="p-1 text-[10px] font-mono leading-tight whitespace-pre-wrap h-full">
        {os.equipamento ? (
          <>
            {os.equipamento}
            <br />
            <span className="italic text-[8px] text-gray-500 mt-1 block">
              Acessórios: {os.acessorios}
            </span>
          </>
        ) : null}
      </div>
    </div>

    <div className="border border-black mb-1 min-h-[40px]">
      <div className="bg-gray-200 px-1 py-0.5 border-b border-black font-bold text-[8px] uppercase">
        Descrição do Problema
      </div>
      <div className="p-1 text-[10px] font-medium leading-tight">
        {os.problema}
      </div>
    </div>

    <div className="flex border border-black h-24 mb-1">
      <div className="w-3/4 border-r border-black flex flex-col">
        <div className="bg-gray-200 px-1 py-0.5 border-b border-black font-bold text-[8px] uppercase">
          Laudo Técnico / Solução
        </div>
        <div className="p-1 flex-1 relative">
          {os.solucao ? <p className="text-[9px]">{os.solucao}</p> : null}
        </div>
      </div>
      <div className="w-1/4 flex flex-col">
        <div className="bg-gray-800 text-white px-1 py-0.5 border-b border-black font-bold text-[8px] text-center uppercase">
          Valores
        </div>
        <div className="flex-1 p-1 flex flex-col justify-end gap-1.5 text-[8px]">
          <div className="flex justify-between items-end">
            <span className="text-gray-500">Serviços</span>
            <div className="border-b border-black w-8"></div>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-gray-500">Peças</span>
            <div className="border-b border-black w-8"></div>
          </div>
          <div className="flex justify-between items-end font-bold mt-1 pt-1 border-t border-black">
            <span className="uppercase">Total</span>
            <div className="border-b border-black w-10"></div>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-auto pt-1">
      <div className="border border-gray-300 p-1 mb-1 text-[6px] text-justify text-gray-500 leading-tight">
        {config?.termos_garantia || "Garantia de 90 dias conforme lei vigente."}
      </div>
      <div className="flex justify-between gap-4 px-4 text-center">
        <div className="flex-1 border-t border-black pt-0.5">
          <p className="font-bold text-[8px] uppercase">Assinatura Cliente</p>
        </div>
        <div className="flex-1 border-t border-black pt-0.5">
          <p className="font-bold text-[8px] uppercase">Assinatura Loja</p>
        </div>
      </div>
      <div className="text-[6px] text-gray-400 text-center mt-0.5">
        Gerado por FilSox ERP
      </div>
    </div>
  </div>
);

// ===============================
// TELA PRINCIPAL
// ===============================
export default function DetalheOS() {
  const { numero } = useParams<{ numero: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [os, setOS] = useState<OS | null>(null);
  const [config, setConfig] = useState<ConfigLoja | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalConcluirOpen, setModalConcluirOpen] = useState(false);
  const [modalApagarOpen, setModalApagarOpen] = useState(false);

  // Edição
  const [editValor, setEditValor] = useState("");
  const [editSolucao, setEditSolucao] = useState("");
  // Forma de pagamento para o financeiro
  const [formaPagamento, setFormaPagamento] = useState("Dinheiro");

  useEffect(() => {
    if (numero) carregarDados(numero);
  }, [numero]);

  async function carregarDados(num: string) {
    setLoading(true);
    try {
      const [osData, configData] = await Promise.all([
        api.buscarPorNumero(num),
        api.getConfig(),
      ]);
      if (!osData) {
        alert("Não encontrado");
        navigate("/");
        return;
      }
      setOS(osData);
      setConfig(configData);
      setEditValor(osData.valor || "");
      setEditSolucao(osData.solucao || "");
    } catch {
    } finally {
      setLoading(false);
    }
  }

  // === FUNÇÃO DE CONCLUIR E LANÇAR NO FINANCEIRO ===
  async function handleConcluir() {
    if (!os) return;

    const valorNumerico = limparValor(editValor);

    try {
      // 1. Atualiza a OS para CONCLUIDA
      await api.atualizar(os.id, {
        status: "CONCLUIDA",
        garantiaStatus: "NAO",
        solucao: editSolucao,
        valor: editValor,
        dataConclusao: new Date().toISOString(),
      });

      // 2. Lança no Financeiro (Se tiver valor > 0)
      if (valorNumerico > 0) {
        await api.criarMovimentacao({
          tipo: "RECEITA",
          descricao: `Serviço OS #${os.numero} - ${os.cliente}`,
          categoria: "Serviços",
          valor: valorNumerico,
          data_movimentacao: new Date().toISOString().slice(0, 10),
          status: "PAGO",
          forma_pagamento: formaPagamento,
          origem: "OS",
          origem_id: os.numero,
        });
        alert(
          `OS Concluída e R$ ${valorNumerico.toFixed(2)} lançado no caixa!`
        );
      } else {
        alert("OS Concluída (Valor zerado, nada lançado no caixa).");
      }

      setModalConcluirOpen(false);
      navigate("/");
    } catch (error) {
      alert("Erro ao concluir OS. Verifique o console.");
      console.error(error);
    }
  }

  async function handleEnviarGarantia() {
    if (!os) return;
    await api.atualizar(os.id, { garantiaStatus: "EM_GARANTIA" });
    alert("Enviado para garantia!");
    navigate("/");
  }

  async function handleApagar() {
    if (!os) return;
    await api.apagar(os.numero);
    setModalApagarOpen(false);
    navigate("/");
  }

  if (loading)
    return <div className="p-10 text-center dark:text-white">Carregando...</div>;
  if (!os) return null;

  // ✅ NOVO: decide qual layout usar com base na config da loja
  const usarModeloUnico = !!(config as any)?.usar_modelo_unico_os;
  const temModeloCelular =
    ((config as any)?.modelo_os_celular || "").trim().length > 0;
  const temModeloGeral =
    ((config as any)?.modelo_os_geral || "").trim().length > 0;

  const usarLayoutCelular =
    os.tipo === "CELULAR" &&
    (temModeloCelular || (usarModeloUnico && temModeloGeral));

  return (
    <div className="animate-fade-in">
      {/* WRAPPER VISUAL (TELA DO SISTEMA) */}
      <div className="p-6 max-w-5xl mx-auto space-y-6 dark:text-white print:hidden">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow border dark:border-gray-700 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              OS #{os.numero}{" "}
              <span className="text-sm font-normal text-gray-500">
                ({os.tipo})
              </span>
            </h1>
            <div
              className={`px-3 py-1 rounded font-bold text-xs uppercase ${
                os.status === "CONCLUIDA"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {os.status.replace("_", " ")}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded border dark:border-gray-600">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase mb-2">
                Cliente
              </h3>
              <p className="font-bold text-lg dark:text-white">{os.cliente}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {os.telefone}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {os.cidade}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded border dark:border-gray-600">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase mb-2">
                Equipamento
              </h3>
              <p className="font-bold text-lg dark:text-white">
                {os.equipamento}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                <span className="font-bold">Defeito:</span> {os.problema}
              </p>
            </div>
          </div>

          {/* ÁREA DE EDIÇÃO DO TÉCNICO */}
          <div className="mt-6 border-t dark:border-gray-700 pt-4">
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                Laudo Técnico
              </label>
              <textarea
                className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
                value={editSolucao}
                onChange={(e) => setEditSolucao(e.target.value)}
                placeholder="Escreva a solução..."
                disabled={os.status === "CONCLUIDA"}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                  Valor Final (R$)
                </label>
                <input
                  className="w-full border p-2 rounded mt-1 font-bold text-green-700 dark:text-green-400 dark:bg-gray-700 dark:border-gray-600"
                  value={editValor}
                  onChange={(e) => setEditValor(e.target.value)}
                  placeholder="0,00"
                  disabled={os.status === "CONCLUIDA"}
                />
              </div>

              {os.status !== "CONCLUIDA" && (
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Forma de Pagamento
                  </label>
                  <select
                    className="w-full border p-2 rounded mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                  >
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="PIX">PIX</option>
                    <option value="Cartão Crédito">Cartão Crédito</option>
                    <option value="Cartão Débito">Cartão Débito</option>
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Será lançado no financeiro ao concluir.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3 flex-wrap">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 border rounded hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              Voltar
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-black dark:bg-gray-600 flex items-center gap-2"
            >
              🖨️ Imprimir
            </button>
            <div className="flex-1"></div>

            {role === "ADMIN" && (
              <>
                {os.status !== "CONCLUIDA" ? (
                  <>
                    <button
                      onClick={handleEnviarGarantia}
                      className="px-4 py-2 bg-purple-100 text-purple-700 font-bold rounded hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
                    >
                      Enviar Garantia
                    </button>
                    <button
                      onClick={async () => {
                        await api.atualizar(os.id, {
                          solucao: editSolucao,
                          valor: editValor,
                        });
                        alert("Salvo (Sem concluir)!");
                      }}
                      className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded hover:bg-blue-200"
                    >
                      Salvar Rascunho
                    </button>

                    <button
                      onClick={() => setModalConcluirOpen(true)}
                      className="px-6 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 shadow-lg transform hover:scale-105 transition"
                    >
                      Concluir OS
                    </button>
                  </>
                ) : (
                  <span className="px-4 py-2 bg-gray-100 text-gray-500 font-bold rounded border cursor-not-allowed">
                    Concluída em{" "}
                    {new Date(os.dataConclusao || "").toLocaleDateString()}
                  </span>
                )}

                <button
                  onClick={() => setModalApagarOpen(true)}
                  className="px-4 py-2 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  Apagar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ÁREA DE IMPRESSÃO */}
      <div
        id="area-impressao"
        className="hidden print:block w-full bg-white text-black p-4"
      >
        {usarLayoutCelular ? (
          <>
            <ViaImpressaoCelularFormulario os={os} tipo="CLIENTE" config={config} />
            <div className="border-t border-dashed border-gray-300 my-2 text-center text-[8px]">
              --- Corte Aqui ---
            </div>
            <ViaImpressaoCelularFormulario os={os} tipo="LOJA" config={config} />
          </>
        ) : (
          <>
            <ViaImpressaoGeral os={os} tipo="CLIENTE" config={config} />
            <div className="border-t border-dashed border-gray-300 my-1 text-center text-[6px]">
              --- Corte Aqui ---
            </div>
            <ViaImpressaoGeral os={os} tipo="LOJA" config={config} />
          </>
        )}
      </div>

      {/* MODAIS */}
      <Modal
        isOpen={modalConcluirOpen}
        title="Finalizar Serviço"
        message={`Deseja concluir a OS #${os.numero}?\n\nValor: R$ ${editValor}\nPagamento: ${formaPagamento}\n\nIsso irá lançar o valor automaticamente no caixa.`}
        onConfirm={handleConcluir}
        onCancel={() => setModalConcluirOpen(false)}
      />
      <Modal
        isOpen={modalApagarOpen}
        title="Apagar"
        message="Apagar OS?"
        isDestructive
        onConfirm={handleApagar}
        onCancel={() => setModalApagarOpen(false)}
      />
    </div>
  );
}
