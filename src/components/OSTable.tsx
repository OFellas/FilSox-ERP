import type { OS } from "../types/OS";
import { useNavigate } from "react-router-dom";

type Props = {
  osList: OS[];
};

export default function OSTable({ osList }: Props) {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-4">Ordens de Serviço</h2>

      {/* RENDERIZA CADA ITEM DA LISTA */}
      {osList.map((os) => (
        <div key={os.id} className="border p-3 rounded mb-2 text-sm">
          <div><strong>OS:</strong> {os.numero}</div>
          <div><strong>Cliente:</strong> {os.cliente}</div>
          <div><strong>Status:</strong> {os.status}</div>

          {/* BOTÃO PARA NAVEGAR PARA EDIÇÃO */}
          <button
            onClick={() => navigate(`/editar-os/${os.id}`)}
            className="mt-2 border px-2 py-1 rounded"
          >
            Editar
          </button>
        </div>
      ))}
    </div>
  );
}