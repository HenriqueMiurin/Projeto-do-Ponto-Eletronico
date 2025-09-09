import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { createApiClient } from '../utils/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const api = createApiClient();
      const response = await api.post('/auth/login', { email, senha });
      login(response.data);
      // Se o usuário precisa redefinir a senha, encaminha para a tela de nova senha
      if (response.data.user.mustResetPassword) {
        navigate('/first-change-password');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erro ao entrar');
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card shadow-sm" style={{ width: '400px' }}>
        <div className="card-body">
          <h3 className="text-center mb-3">Ponto Certo</h3>
          <h4 className="text-center mb-4">Entrar</h4>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">E-mail corporativo</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Senha</label>
              <input
                type="password"
                className="form-control"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
            <div className="mb-3 form-check">
              <input type="checkbox" className="form-check-input" id="lembrar" disabled />
              <label className="form-check-label" htmlFor="lembrar">
                Lembrar-me
              </label>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Entrar
            </button>
          </form>
          <div className="text-center mt-3">
            {/* Link para página de redefinição de senha */}
            <Link to="/reset">Esqueci minha senha</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;