import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../utils/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, senha);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao autenticar');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow p-4" style={{ minWidth: '360px' }}>
        <div className="mb-4 text-center">
          <h2>Ponto Certo</h2>
          <h4 className="mt-3">Entrar</h4>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">E-mail corporativo</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="senha" className="form-label">Senha</label>
            <input
              type="password"
              className="form-control"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            {/* espaço para lembrar-me e esqueci minha senha */}
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="lembrar" disabled />
              <label className="form-check-label" htmlFor="lembrar">
                Lembrar-me
              </label>
            </div>
            <a href="#" style={{ fontSize: '0.9rem' }}>Esqueci minha senha</a>
          </div>
          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary">Entrar</button>
          </div>
        </form>
      </div>
    </div>
  );
}