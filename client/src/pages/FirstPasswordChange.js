import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { createApiClient } from '../utils/api';

/**
 * Página de alteração obrigatória de senha no primeiro acesso. Exige que o
 * usuário esteja logado e com a flag mustResetPassword = true. Permite
 * definir uma nova senha sem solicitar a senha atual. Após a mudança,
 * atualiza o usuário no contexto de autenticação e redireciona para
 * a página inicial.
 */
export default function FirstPasswordChange() {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Se não estiver logado ou não precisar redefinir senha, redireciona
  if (!user || !user.mustResetPassword) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!newPassword || !confirmPassword) {
      setError('Informe a nova senha e a confirmação');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    try {
      const api = createApiClient(token);
      // envia apenas a nova senha; o backend interpretará a troca obrigatória
      await api.post('/profile/change-password', { newPassword });
      // Atualiza o usuário localmente, removendo a flag
      const updatedUser = { ...user, mustResetPassword: false };
      login({ user: updatedUser, token });
      setSuccess('Senha alterada com sucesso');
      // Redireciona para página inicial após alguns segundos
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao definir senha');
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card shadow-sm" style={{ width: '400px' }}>
        <div className="card-body">
          <h3 className="text-center mb-3">Ponto Certo</h3>
          <h4 className="text-center mb-4">Definir nova senha</h4>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nova senha</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirmar senha</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Salvar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}