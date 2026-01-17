import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import type { JSX } from "react";
import ErrorLogs from "./pages/ErrorLogs";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NovaOS from "./pages/NovaOS";
import DetalheOS from "./pages/DetalheOS";
import Configuracoes from "./pages/Configuracoes";
import ListaOS from "./pages/ListaOS";
import Estoque from "./pages/Estoque";
import SuperAdmin from "./pages/SuperAdmin";
import Financeiro from "./pages/Financeiro";
import Clientes from "./pages/Clientes";
import DetalheCliente from "./pages/DetalheCliente";
import PDV from "./pages/PDV";
import GerenciarUsuarios from "./pages/GerenciarUsuarios";

function PrivateRoute({ children, roles }: { children: JSX.Element, roles?: string[] }) {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center h-screen dark:bg-gray-900 dark:text-white">Carregando...</div>;
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && role && !roles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default function App() {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Routes>
        <Route path="/super-admin" element={<PrivateRoute roles={["SUPER_ADMIN"]}><SuperAdmin /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/os/:numero" element={<PrivateRoute><DetalheOS /></PrivateRoute>} />

        <Route path="/em-andamento" element={<PrivateRoute><ListaOS titulo="Em Andamento" filtro="em-andamento" /></PrivateRoute>} />
        <Route path="/perto-de-vencer" element={<PrivateRoute><ListaOS titulo="Perto de Vencer" filtro="perto-de-vencer" /></PrivateRoute>} />
        <Route path="/atrasadas" element={<PrivateRoute><ListaOS titulo="Atrasadas" filtro="atrasadas" /></PrivateRoute>} />
        <Route path="/garantia" element={<PrivateRoute><ListaOS titulo="Garantia (RMA)" filtro="garantia" /></PrivateRoute>} />
        <Route path="/aguardando-retirada" element={<PrivateRoute><ListaOS titulo="Aguardando Retirada" filtro="aguardando-retirada" /></PrivateRoute>} />
        <Route path="/concluidas" element={<PrivateRoute><ListaOS titulo="Concluídas" filtro="concluidas" /></PrivateRoute>} />
        <Route path="/admin/logs" element={<PrivateRoute roles={["SUPER_ADMIN"]}><ErrorLogs /></PrivateRoute>} />
        <Route path="/nova-os" element={<PrivateRoute><NovaOS /></PrivateRoute>} />
        <Route path="/estoque" element={<PrivateRoute roles={["ADMIN"]}><Estoque /></PrivateRoute>} />
        <Route path="/configuracoes" element={<PrivateRoute roles={["ADMIN"]}><Configuracoes /></PrivateRoute>} />
        <Route path="/financeiro" element={<PrivateRoute><Financeiro /></PrivateRoute>} />
        <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
        <Route path="/clientes/:id" element={<PrivateRoute><DetalheCliente /></PrivateRoute>} />
        <Route path="/pdv" element={<PrivateRoute><PDV /></PrivateRoute>} />
        <Route path="/gerenciar-usuarios" element={<PrivateRoute roles={["ADMIN"]}><GerenciarUsuarios /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}