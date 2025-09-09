import React, { useEffect, useState } from 'react';
import { createApiClient } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const api = createApiClient(token);
        const res = await api.get('/users');
        setUsers(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [token]);

  async function handleUnlock(userId) {
    setMessage(null);
    try {
      const api = createApiClient(token);
      const res = await api.patch(`/users/${userId}/unlock`);
      // Atualiza a lista localmente
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, locked_until: null, failed_attempts: 0, is_active: 1 } : u)));
      setMessage({ type: 'success', text: res.data.message });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Erro ao desbloquear usuário' });
    }
  }

  return (
    <div>
      <h3>Usuários</h3>
      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Role</th>
                <th>Ativo</th>
                <th>Bloqueado até</th>
                <th>Falhas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const locked = u.locked_until && new Date(u.locked_until) > new Date();
                return (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nome_completo || '-'}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.is_active ? 'Sim' : 'Não'}</td>
                    <td>{u.locked_until ? new Date(u.locked_until).toLocaleString() : '-'}</td>
                    <td>{u.failed_attempts}</td>
                    <td>
                      {locked && (
                        <button className="btn btn-sm btn-warning" onClick={() => handleUnlock(u.id)}>
                          Desbloquear
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UsersPage;