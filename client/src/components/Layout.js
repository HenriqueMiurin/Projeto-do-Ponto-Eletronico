import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav
        className="d-flex flex-column bg-light border-end"
        style={{ width: '220px' }}
      >
        <div className="p-3 fw-bold">Ponto Certo</div>
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <NavLink to="/" className="nav-link" end>
              Início
            </NavLink>
          </li>
          <li>
            <NavLink to="/clock" className="nav-link">
              Bater ponto
            </NavLink>
          </li>
          <li>
            <NavLink to="/history" className="nav-link">
              Histórico
            </NavLink>
          </li>
          <li>
            <NavLink to="/adjustment" className="nav-link">
              Solicitar ajuste
            </NavLink>
          </li>
          <li>
            <NavLink to="/requests" className="nav-link">
              Minhas solicitações
            </NavLink>
          </li>
          {/* Navegação adicional para RH/Master */}
          {user && ['RH', 'MASTER'].includes(user.role) && (
            <>
              <li>
                <NavLink to="/monitor" className="nav-link">
                  Monitoramento
                </NavLink>
              </li>
              <li>
                <NavLink to="/timesheet" className="nav-link">
                  Folha de ponto
                </NavLink>
              </li>
              <li>
                <NavLink to="/events" className="nav-link">
                  Lançar eventos
                </NavLink>
              </li>
              <li>
                <NavLink to="/register-collab" className="nav-link">
                  Cadastro de colaborador
                </NavLink>
              </li>
              <li>
                <NavLink to="/approvals" className="nav-link">
                  Aprovar ajustes
                </NavLink>
              </li>
            </>
          )}
          {/* Usuários pode ser acessado por gestor, RH e master */}
          {user && ['GESTOR','RH','MASTER'].includes(user.role) && (
            <li>
              <NavLink to="/users" className="nav-link">
                Usuários
              </NavLink>
            </li>
          )}
          {/* Links comuns para todos */}
          <li>
            <NavLink to="/profile" className="nav-link">
              Perfil
            </NavLink>
          </li>
          <li>
            <NavLink to="/support" className="nav-link">
              Suporte
            </NavLink>
          </li>
          <li className="mt-auto">
            <button onClick={handleLogout} className="btn btn-link nav-link text-start">
              Sair
            </button>
          </li>
        </ul>
      </nav>
      {/* Main content */}
      <div className="flex-grow-1 p-4">
        {children}
      </div>
    </div>
  );
}

export default Layout;