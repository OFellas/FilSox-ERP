import { useEffect, useState, useMemo, useRef } from "react";
import { api } from "../services/api";
import {
  ShoppingCart,
  Trash2,
  Search,
  CheckCircle,
  Package,
  CreditCard,
  Banknote,
  QrCode,
  ArrowLeft,
  Printer,
  RefreshCcw,
  Percent,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const num = (v: any, fallback = 0) => {
  const n =
    typeof v === "string"
      ? Number(v.replace(",", "."))
      : typeof v === "number"
        ? v
        : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// === COMPONENTE: CUPOM TÉRMICO (80mm) ===
const CupomTermico = ({ venda, loja, itens }: any) => {
  if (!venda) return null;

  return (
    <div
      id="cupom-fiscal"
      className="hidden print:block w-[80mm] font-mono text-[10px] leading-tight text-black bg-white p-2"
    >
      <div className="text-center mb-2 border-b border-black pb-2">
        <h2 className="font-bold text-sm uppercase">
          {loja?.nome_loja || "MINHA LOJA"}
        </h2>
        <p>{loja?.endereco || ""}</p>
        <p>Tel: {loja?.telefone || ""}</p>
      </div>

      <div className="mb-2">
        <p>VENDA: #{String(venda.id ?? "").padStart(6, "0")}</p>
        <p>DATA: {new Date().toLocaleString()}</p>
        <p>CLIENTE: {venda.cliente_nome || "Consumidor Final"}</p>
      </div>

      <table className="w-full text-left mb-2 border-b border-black pb-2">
        <thead>
          <tr>
            <th className="w-8">QTD</th>
            <th>ITEM</th>
            <th className="text-right">VL</th>
          </tr>
        </thead>
        <tbody>
          {(itens || []).map((item: any, i: number) => (
            <tr key={i}>
              <td>{num(item.quantidade, 1)}x</td>
              <td className="truncate max-w-[120px]">{item.nome}</td>
              <td className="text-right">
                {(num(item.preco_venda, num(item.valor, 0)) || 0).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between font-bold text-xs mt-1">
        <span>TOTAL BRUTO:</span>
        <span>R$ {(num(venda.subtotal, 0) || 0).toFixed(2)}</span>
      </div>

      {num(venda.desconto, 0) > 0 && (
        <div className="flex justify-between text-xs">
          <span>DESCONTO:</span>
          <span>- R$ {(num(venda.desconto, 0) || 0).toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between font-black text-sm mt-1 border-t border-black pt-1">
        <span>TOTAL A PAGAR:</span>
        <span>R$ {(num(venda.total_final, num(venda.total, 0)) || 0).toFixed(2)}</span>
      </div>

      <div className="mt-2 pt-2 border-t border-dashed border-black text-center">
        <p>Pagamento: {venda.forma_pagamento || "-"}</p>
        {num(venda.troco, 0) > 0 && (
          <p>Troco: R$ {(num(venda.troco, 0) || 0).toFixed(2)}</p>
        )}
        <p className="mt-2 text-[8px]">Obrigado pela preferência!</p>
        <p className="text-[8px]">FilSox ERP - Documento Não Fiscal</p>
      </div>
    </div>
  );
};

export default function PDV() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);

  // Carrinho e Venda
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);
  const [formaPagamento, setFormaPagamento] = useState("Dinheiro");
  const [desconto, setDesconto] = useState(""); // Valor em R$
  const [valorRecebido, setValorRecebido] = useState("");

  // Estados de Interface
  const [buscaProd, setBuscaProd] = useState("");
  const [buscaCli, setBuscaCli] = useState("");
  const [showClientes, setShowClientes] = useState(false);
  const [vendaConcluida, setVendaConcluida] = useState<any>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function carregar() {
      const [p, c, cfg] = await Promise.all([
        api.listarProdutos(),
        api.listarClientes(),
        api.getConfig(),
      ]);
      setProdutos(p || []);
      setClientes(c || []);
      setConfig(cfg || null);
    }
    carregar();
  }, []);

  // === LÓGICA DO CARRINHO ===
  function adicionarProduto(p: any) {
    if (num(p.quantidade, 0) <= 0) return alert("Produto sem estoque!");

    const existente = carrinho.find((item) => item.id === p.id);
    if (existente) {
      if (existente.quantidade + 1 > num(p.quantidade, 0))
        return alert("Estoque insuficiente!");
      setCarrinho(
        carrinho.map((item) =>
          item.id === p.id ? { ...item, quantidade: item.quantidade + 1 } : item
        )
      );
    } else {
      setCarrinho([...carrinho, { ...p, quantidade: 1 }]);
    }
    setBuscaProd("");
    searchInputRef.current?.focus();
  }

  function removerProduto(id: number) {
    setCarrinho(carrinho.filter((item) => item.id !== id));
  }

  // === CÁLCULOS ===
  const subtotal = carrinho.reduce(
    (acc, item) => acc + num(item.preco_venda, 0) * num(item.quantidade, 1),
    0
  );
  const valorDesconto = num(desconto, 0);
  const totalFinal = Math.max(0, subtotal - valorDesconto);
  const recebidoNum = num(valorRecebido, 0);
  const troco = recebidoNum - totalFinal;

  // === FINALIZAR ===
  async function finalizarVenda() {
    if (carrinho.length === 0) return alert("Carrinho vazio!");
    if (formaPagamento === "Dinheiro" && troco < 0)
      return alert("Valor recebido insuficiente!");

    try {
      const vendaData = {
  cliente_id: clienteSelecionado?.id || null,
  cliente_nome: clienteSelecionado?.nome || "Consumidor Final",
  subtotal,                          // <<< manda
  desconto: valorDesconto,           // <<< manda
  total: totalFinal,                 // <<< manda (ou total_final)
  forma_pagamento: formaPagamento,
  valor_recebido: formaPagamento === "Dinheiro" ? (parseFloat(valorRecebido.replace(",", ".")) || 0) : 0,
  troco: formaPagamento === "Dinheiro" ? Math.max(0, troco) : 0,
  itens: carrinho.map(i => ({
    produto_id: i.id,
    quantidade: i.quantidade,
    nome: i.nome,
    preco_venda: i.preco_venda,
  })),
      };

      const res = await api.criarVenda(vendaData);

      // monta venda local SEM depender do backend
      setVendaConcluida({
        id: res?.id ?? res?.vendaId ?? res?.venda_id ?? null,
        financeiro_id: res?.financeiro_id ?? res?.financeiroId ?? null,

        cliente_nome: vendaData.cliente_nome,
        forma_pagamento: vendaData.forma_pagamento,

        subtotal: num(res?.subtotal, subtotal),
        desconto: num(res?.desconto, valorDesconto),
        total_final: num(res?.total_final, num(res?.total, totalFinal)),
        total: num(res?.total, totalFinal),

        valor_recebido: num(res?.valor_recebido, vendaData.valor_recebido),
        troco: num(res?.troco, vendaData.troco),

        itens: carrinho.map((i) => ({
          ...i,
          preco_venda: num(i.preco_venda, 0),
          quantidade: num(i.quantidade, 1),
        })),
      });

      setCarrinho([]);
      setClienteSelecionado(null);
      setDesconto("");
      setValorRecebido("");

      api.listarProdutos().then((p) => setProdutos(p || []));
    } catch (error) {
      alert("Erro ao finalizar venda.");
      console.error(error);
    }
  }

  const produtosFiltrados = useMemo(() => {
    if (!buscaProd) return [];
    const q = buscaProd.toLowerCase();
    return (produtos || []).filter(
      (p) =>
        String(p.nome || "").toLowerCase().includes(q) ||
        String(p.codigo_barras || "").includes(buscaProd)
    );
  }, [buscaProd, produtos]);

  // Sucesso / Impressão
  if (vendaConcluida) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border dark:border-gray-700">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
            <CheckCircle size={48} />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Venda Realizada!
          </h2>

          <p className="text-gray-500 mb-6">
            Total:{" "}
            <span className="font-bold text-gray-800 dark:text-white">
              R$ {(num(vendaConcluida.total_final, 0) || 0).toFixed(2)}
            </span>
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => window.print()}
              className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition text-blue-700 dark:text-blue-300 font-bold gap-2"
            >
              <Printer size={24} /> Imprimir Cupom
            </button>

            <button
              onClick={() => setVendaConcluida(null)}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 transition text-gray-700 dark:text-gray-300 font-bold gap-2"
            >
              <RefreshCcw size={24} /> Nova Venda
            </button>
          </div>
        </div>

        <CupomTermico venda={vendaConcluida} loja={config} itens={vendaConcluida.itens} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden font-sans transition-colors">
      {/* === ESQUERDA: PRODUTOS === */}
      <div className="flex-1 flex flex-col p-4 md:p-6 gap-6 relative">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition font-bold"
          >
            <ArrowLeft size={20} /> Voltar ao Painel
          </button>

          <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-full shadow-sm text-xs font-bold text-gray-500 border dark:border-gray-700">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>{" "}
            Caixa Aberto
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
            <ShoppingCart className="text-blue-600" /> PDV{" "}
            <span className="text-gray-300 text-lg font-normal">
              Frente de Caixa
            </span>
          </h1>

          <div className="relative group">
            <Search
              className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-500 transition"
              size={24}
            />
            <input
              ref={searchInputRef}
              className="w-full pl-14 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xl shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white"
              placeholder="Bipar código de barras ou digitar nome..."
              value={buscaProd}
              onChange={(e) => setBuscaProd(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {produtosFiltrados.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {produtosFiltrados.map((p) => (
                <button
                  key={p.id}
                  onClick={() => adicionarProduto(p)}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-500 hover:shadow-md transition text-left flex flex-col h-full group"
                >
                  <div className="flex justify-between items-start w-full mb-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        num(p.quantidade, 0) > 5
                          ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {num(p.quantidade, 0)} un
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      R$ {(num(p.preco_venda, 0) || 0).toFixed(2)}
                    </span>
                  </div>

                  <p className="font-bold text-gray-800 dark:text-white leading-tight mb-1 group-hover:text-blue-600 line-clamp-2">
                    {p.nome}
                  </p>
                  <p className="text-xs text-gray-400 mt-auto">
                    {p.marca} • {p.codigo_barras || "S/ Cod"}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-700">
              <Package size={64} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Aguardando busca...</p>
              <p className="text-sm">Digite o nome ou bipe o produto</p>
            </div>
          )}
        </div>
      </div>

      {/* === DIREITA: CHECKOUT === */}
      <div className="w-[400px] bg-white dark:bg-gray-800 border-l dark:border-gray-700 flex flex-col shadow-2xl z-20">
        {/* CLIENTE */}
        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          {clienteSelecionado ? (
            <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-200 font-bold text-xs">
                  {String(clienteSelecionado.nome || "").charAt(0)}
                </div>
                <div className="leading-tight">
                  <p className="font-bold text-blue-900 dark:text-blue-200 text-sm">
                    {clienteSelecionado.nome}
                  </p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400">
                    Cliente Identificado
                  </p>
                </div>
              </div>
              <button
                onClick={() => setClienteSelecionado(null)}
                className="text-xs text-red-500 hover:underline font-bold"
              >
                Remover
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                className="w-full pl-9 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Identificar Cliente (Opcional)..."
                value={buscaCli}
                onChange={(e) => {
                  setBuscaCli(e.target.value);
                  setShowClientes(true);
                }}
                onBlur={() => setTimeout(() => setShowClientes(false), 200)}
              />

              {showClientes && buscaCli.length > 0 && (
                <div className="absolute w-full bg-white dark:bg-gray-700 shadow-xl border dark:border-gray-600 rounded-b-lg mt-1 max-h-48 overflow-y-auto z-30">
                  {(clientes || [])
                    .filter((c) =>
                      String(c.nome || "")
                        .toLowerCase()
                        .includes(buscaCli.toLowerCase())
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setClienteSelecionado(c);
                          setBuscaCli("");
                        }}
                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm dark:text-white border-b dark:border-gray-600 last:border-0"
                      >
                        <p className="font-bold">{c.nome}</p>
                        <p className="text-xs text-gray-500">{c.documento}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* LISTA DE ITENS */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50 dark:bg-gray-900/20">
          {carrinho.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-white dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300">
                  {num(item.quantidade, 1)}x
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800 dark:text-white line-clamp-1">
                    {item.nome}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Unit: R$ {(num(item.preco_venda, 0) || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-800 dark:text-white">
                  R$ {(num(item.quantidade, 1) * num(item.preco_venda, 0)).toFixed(2)}
                </span>
                <button
                  onClick={() => removerProduto(item.id)}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {carrinho.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
              <ShoppingCart size={48} className="mb-2" />
              <p className="text-sm">Carrinho vazio</p>
            </div>
          )}
        </div>

        {/* PAGAMENTO */}
        <div className="p-5 bg-white dark:bg-gray-800 border-t-2 border-gray-100 dark:border-gray-700 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>R$ {(subtotal || 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-sm text-red-500">
              <span className="flex items-center gap-1">
                <Percent size={12} /> Desconto (R$)
              </span>
              <input
                className="w-20 text-right border-b border-red-200 focus:border-red-500 outline-none bg-transparent font-bold"
                placeholder="0,00"
                value={desconto}
                onChange={(e) => setDesconto(e.target.value)}
              />
            </div>

            <div className="flex justify-between text-2xl font-black text-gray-800 dark:text-white pt-2 border-t dark:border-gray-700">
              <span>Total</span>
              <span>R$ {(totalFinal || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setFormaPagamento("Dinheiro")}
              className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 transition ${
                formaPagamento === "Dinheiro"
                  ? "bg-green-100 text-green-700 border-green-300"
                  : "bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
              }`}
            >
              <Banknote size={14} /> Dinheiro
            </button>

            <button
              onClick={() => setFormaPagamento("PIX")}
              className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 transition ${
                formaPagamento === "PIX"
                  ? "bg-purple-100 text-purple-700 border-purple-300"
                  : "bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
              }`}
            >
              <QrCode size={14} /> PIX
            </button>

            <button
              onClick={() => setFormaPagamento("Cartão Crédito")}
              className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 transition ${
                formaPagamento.includes("Crédito")
                  ? "bg-blue-100 text-blue-700 border-blue-300"
                  : "bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
              }`}
            >
              <CreditCard size={14} /> Crédito
            </button>

            <button
              onClick={() => setFormaPagamento("Cartão Débito")}
              className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 transition ${
                formaPagamento.includes("Débito")
                  ? "bg-blue-100 text-blue-700 border-blue-300"
                  : "bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
              }`}
            >
              <CreditCard size={14} /> Débito
            </button>
          </div>

          {formaPagamento === "Dinheiro" && (
            <div className="flex items-center gap-2 mb-4 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase w-24">
                Valor Recebido:
              </span>
              <input
                className="flex-1 bg-transparent border-b border-yellow-300 focus:border-yellow-600 outline-none font-bold text-gray-800 dark:text-white"
                placeholder="R$ 0,00"
                value={valorRecebido}
                onChange={(e) => setValorRecebido(e.target.value)}
              />
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase">Troco</p>
                <p className={`font-bold ${troco < 0 ? "text-red-500" : "text-green-600"}`}>
                  R$ {(troco || 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={finalizarVenda}
            disabled={carrinho.length === 0}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2 transition transform active:scale-95"
          >
            <CheckCircle size={20} /> FINALIZAR VENDA (F2)
          </button>
        </div>
      </div>
    </div>
  );
}
