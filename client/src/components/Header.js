import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../utils/AuthContext';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/dashboard">
          Ponto Certo
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Início</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/clock">Bater Ponto</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/history">Histórico</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/adjustments">Ajustes</Link>
            </li>
            {['GESTOR','RH','MASTER'].includes(user.role) && (
              <li className="nav-item">
                <Link className="nav-link" to="/users">Usuários</Link>
              </li>
            )}
            {['GESTOR','RH','MASTER'].includes(user.role) && (
              <li className="nav-item">
                <Link className="nav-link" to="/adjustments/pending">Pendências</Link>
              </li>
            )}
          </ul>
          <span className="navbar-text me-3">
            {user.email}
          </span>
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Sair</button>
        </div>
      </div>
    </nav>
  );
}