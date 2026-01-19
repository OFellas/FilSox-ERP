import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OS } from "../types/OS";
import { api } from "../services/api";
import { useModules } from "../contexts/ModuleContext";
import Modal from "../components/Modal";
import {
  Plus,
  Search,
  Trash2,
  CheckCircle,
  Eye,
  Pencil,
  Wrench,
  AlertCircle,
  Clock,
  ClipboardCheck,
  PackageCheck,
} from "lucide-react";

function diasDesde(data: string) {
  if (!data) return 0;
  return Math.floor((Date.now() - new Date(data).getTime()) / (1000 * 60 * 60 * 24));
}

function BadgeIcon({
  icon: Icon,
  ringClass,
  iconClass,
}: {
  icon: any;
  ringClass: string;
  iconClass: string;
}) {
  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${ringClass}`}>
      <Icon size={22} className={iconClass} />
    </div>
  );
}

function StatCard({
  title,
  value,
  onClick,
  icon,
  ringClass,
  iconClass,
}: {
  title: string;
  value: number;
  onClick: () => void;
  icon: any;
  ringClass: string;
  iconClass: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-5
                 hover:shadow-md hover:border-gray-300 transition flex items-center justify-between"
    >
      <div>
        <p className="text-[11px] font-extrabold tracking-widest text-gray-500 uppercase">
          {title}
        </p>
        <p className="mt-2 text-4xl font-extrabold text-gray-900">{value}</p>
      </div>

      <BadgeIcon icon={icon} ringClass={ringClass} iconClass={iconClass} />
    </button>
  );
}

function OSDashboard() {
  const navigate = useNavigate();
  const { hasModule } = useModules();

  const [lista, setLista] = useState<OS[]>([]);
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState("");

  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [osParaApagar, setOsParaApagar] = useState<OS | null>(null);

  useEffect(() => {
    if (!hasModule("OS")) {
      navigate("/");
      return;
    }
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregar() {
    setLoading(true);
    try {
      const dados = await api.listar();
      setLista(dados || []);
    } catch {
      setLista([]);
    } finally {
      setLoading(false);
    }
  }

  // ===== métricas =====
  // Em andamento = tudo que NÃO é concluída
const emAndamento = useMemo(() => {
  return lista.filter((os) => os.status !== "CONCLUIDA").length;
}, [lista]);

// Perto de vencer = faltando 5 dias para completar 30 (25..29 dias) e NÃO concluída
const pertoDeVencer = useMemo(() => {
  return lista.filter((os) => {
    if (os.status === "CONCLUIDA") return false;

    const dias = diasDesde(os.dataAbertura);
    return dias >= 25 && dias <= 29;
  }).length;
}, [lista]);

  const atrasadas = useMemo(
    () =>
      lista.filter((os) => {
        if (os.status === "CONCLUIDA") return false;
        return diasDesde(os.dataAbertura) >= 30;
      }).length,
    [lista]
  );

  const emGarantia = useMemo(() => {
    // Mantém compatível com sua tela /garantia
    return lista.filter((os: any) => os.garantiaStatus === "GARANTIA" || os.garantiaStatus === "RMA").length;
  }, [lista]);

  const aguardandoRetirada = useMemo(
    () => lista.filter((os) => os.garantiaStatus === "AGUARDANDO_RETIRADA" || os.status === "AGUARDANDO RETIRADA").length,
    [lista]
  );

  const concluidas = useMemo(() => lista.filter((os) => os.status === "CONCLUIDA").length, [lista]);

  // ===== busca =====
  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return lista;

    return lista.filter((os) => {
      const numero = String(os.numero ?? "").toLowerCase();
      const cliente = String(os.cliente ?? "").toLowerCase();
      const equipamento = String(os.equipamento ?? "").toLowerCase();
      return numero.includes(q) || cliente.includes(q) || equipamento.includes(q);
    });
  }, [lista, busca]);

  function abrirConfirmApagar(os: OS) {
    setOsParaApagar(os);
    setModalDeleteOpen(true);
  }

  async function confirmarApagar() {
    if (!osParaApagar) return;
    try {
      await api.apagar(String(osParaApagar.numero));
      setModalDeleteOpen(false);
      setOsParaApagar(null);
      carregar();
    } catch {
      alert("Não foi possível apagar a OS.");
    }
  }

  async function concluirOS(os: OS) {
    try {
      await api.atualizar(os.id as any, { status: "CONCLUIDA" });
      carregar();
    } catch {
      alert("Não foi possível concluir a OS.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white flex items-center justify-center">
        Carregando OS...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* topo */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
              <Wrench className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">Ordens de Serviço</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Visão geral + gerenciamento das OS.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/nova-os")}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow"
            >
              <Plus size={18} /> Nova OS
            </button>
          </div>
        </div>

        {/* ===== cards (layout igual o print) ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard
            title="EM ANDAMENTO"
            value={emAndamento}
            onClick={() => navigate("/em-andamento")}
            icon={Wrench}
            ringClass="bg-blue-50"
            iconClass="text-blue-600"
          />

          <StatCard
            title="PERTO DE VENCER"
            value={pertoDeVencer}
            onClick={() => navigate("/perto-de-vencer")}
            icon={Clock}
            ringClass="bg-yellow-50"
            iconClass="text-yellow-600"
          />

          <StatCard
            title="ATRASADAS"
            value={atrasadas}
            onClick={() => navigate("/atrasadas")}
            icon={AlertCircle}
            ringClass="bg-red-50"
            iconClass="text-red-600"
          />

          <StatCard
            title="EM GARANTIA (RMA)"
            value={emGarantia}
            onClick={() => navigate("/garantia")}
            icon={PackageCheck}
            ringClass="bg-purple-50"
            iconClass="text-purple-600"
          />

          <StatCard
            title="AGUARDANDO RETIRADA"
            value={aguardandoRetirada}
            onClick={() => navigate("/aguardando-retirada")}
            icon={ClipboardCheck}
            ringClass="bg-orange-50"
            iconClass="text-orange-600"
          />

          <StatCard
            title="TOTAL CONCLUÍDAS"
            value={concluidas}
            onClick={() => navigate("/concluidas")}
            icon={CheckCircle}
            ringClass="bg-green-50"
            iconClass="text-green-600"
          />
        </div>

        {/* busca */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-3 w-full">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 border dark:border-gray-700">
              <Search size={18} className="text-gray-500" />
            </div>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por número, cliente ou equipamento..."
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>

          <button
            onClick={carregar}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-900 transition"
          >
            Recarregar
          </button>
        </div>

        {/* lista */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-bold">OS recentes</h2>
            <p className="text-xs text-gray-500">{filtradas.length} itens</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-500">
                <tr>
                  <th className="text-left px-6 py-3 font-bold">Número</th>
                  <th className="text-left px-6 py-3 font-bold">Cliente</th>
                  <th className="text-left px-6 py-3 font-bold">Equipamento</th>
                  <th className="text-left px-6 py-3 font-bold">Status</th>
                  <th className="text-right px-6 py-3 font-bold">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filtradas.map((os) => (
                  <tr key={os.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-6 py-4 font-bold">{os.numero}</td>
                    <td className="px-6 py-4">{os.cliente}</td>
                    <td className="px-6 py-4">{os.equipamento}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 dark:bg-gray-900 border dark:border-gray-700">
                        {os.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/os/${encodeURIComponent(String(os.numero))}`)}
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition flex items-center gap-2"
                        >
                          <Eye size={16} /> Ver
                        </button>

                        <button
                          onClick={() => navigate(`/editar-os/${os.id}`)}
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition flex items-center gap-2"
                        >
                          <Pencil size={16} /> Editar
                        </button>

                        {os.status !== "CONCLUIDA" && (
                          <button
                            onClick={() => concluirOS(os)}
                            className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold transition flex items-center gap-2"
                          >
                            <CheckCircle size={16} /> Concluir
                          </button>
                        )}

                        <button
                          onClick={() => abrirConfirmApagar(os)}
                          className="px-3 py-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 font-bold transition flex items-center gap-2"
                        >
                          <Trash2 size={16} /> Apagar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtradas.length === 0 && (
                  <tr>
                    <td className="px-6 py-10 text-center text-gray-500" colSpan={5}>
                      Nenhuma OS encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Modal
          isOpen={modalDeleteOpen}
          title="Apagar OS"
          message={`Tem certeza que deseja apagar a OS ${osParaApagar?.numero}? Essa ação não pode ser desfeita.`}
          onConfirm={confirmarApagar}
          onCancel={() => setModalDeleteOpen(false)}
          confirmText="Apagar"
          cancelText="Cancelar"
          isDestructive
        />
      </div>
    </div>
  );
}

export default OSDashboard;
