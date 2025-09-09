import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createApiClient } from '../utils/api';

/**
 * Página de redefinição de senha.
 * Permite que o usuário informe seu e‑mail corporativo para solicitar
 * o envio de instruções de recuperação de senha. A chamada ao backend
 * utiliza o endpoint POST /auth/reset, que apenas retorna uma
 * confirmação sem de fato enviar e‑mails neste projeto de exemplo.
 */
function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const api = createApiClient();
      await api.post('/auth/reset', { email });
      setMessage('Se existir conta para este e‑mail, enviaremos instruções.');
      setEmail('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erro ao solicitar redefinição.');
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card shadow-sm" style={{ width: '400px' }}>
        <div className="card-body">
          <h3 className="text-center mb-3">Ponto Certo</h3>
          <h4 className="text-center mb-4">Redefinir senha</h4>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">E‑mail corporativo</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Enviar link
            </button>
          </form>
          <div className="text-center mt-3">
            <Link to="/login">Voltar ao login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;