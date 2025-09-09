import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

/**
 * Componente de navegação lateral. Exibe links para páginas
 * principais do sistema. Utiliza react-router para navegação.
 */
export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  function handleLogout() {
    logout();
    navigate('/login');
  }
  return (
    <div className="d-flex flex-column bg-light vh-100 p-3" style={{ width: '220px' }}>
      <h4 className="mb-4">Ponto Certo</h4>
      <nav className="nav nav-pills flex-column">
        <Link className="nav-link" to="/dashboard">Início</Link>
        <Link className="nav-link" to="/clock-in">Bater ponto</Link>
        <Link className="nav-link" to="/history">Histórico</Link>
        <Link className="nav-link" to="/adjustments">Ajustes</Link>
        <Link className="nav-link" to="/adjustments">Minhas solicitações</Link>
        <Link className="nav-link" to="/profile">Perfil</Link>
        <Link className="nav-link" to="/notifications">Notificações</Link>
        <Link className="nav-link" to="/support">Suporte</Link>
        <button className="nav-link mt-auto text-start btn btn-link" onClick={handleLogout}>Sair</button>
      </nav>
      {user && (
        <div className="mt-3 small">Logado como {user.email}</div>
      )}
    </div>
  );
}