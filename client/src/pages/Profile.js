import React, { useEffect, useState } from 'react';
import { createApiClient } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

function ProfilePage() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const api = createApiClient(token);
        const res = await api.get('/profile');
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProfile();
  }, [token]);

  async function handleChangePassword(e) {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'danger', text: 'A nova senha e a confirmação não coincidem' });
      return;
    }
    try {
      const api = createApiClient(token);
      await api.post('/profile/change-password', { currentPassword, newPassword });
      setMessage({ type: 'success', text: 'Senha alterada com sucesso' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
      // enforce logout maybe? Not necessary
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Erro ao alterar senha' });
    }
  }

  if (!profile) return <p>Carregando...</p>;

  const { collaborator } = profile;

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h3>Perfil</h3>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <div className="card mb-3">
        <div className="card-body">
          <p><strong>Nome:</strong> {collaborator?.nome || '-'}</p>
          <p><strong>E-mail corporativo:</strong> {collaborator?.email_corporativo || '-'}</p>
          <p><strong>Matrícula:</strong> {collaborator?.matricula || '-'}</p>
          <p><strong>Cargo:</strong> {collaborator?.cargo || '-'}</p>
          <p><strong>Setor:</strong> {collaborator?.setor || '-'}</p>
          <p><strong>Unidade padrão:</strong> {collaborator?.unidade_padrao_id || '-'}</p>
        </div>
      </div>
      <button className="btn btn-secondary" onClick={() => setShowChangePassword(!showChangePassword)}>
        {showChangePassword ? 'Cancelar' : 'Alterar senha'}
      </button>
      {showChangePassword && (
        <form onSubmit={handleChangePassword} className="mt-3">
          <div className="mb-3">
            <label className="form-label">Senha atual</label>
            <input type="password" className="form-control" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Nova senha</label>
            <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirmar nova senha</label>
            <input type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">Salvar</button>
        </form>
      )}
    </div>
  );
}

export default ProfilePage;