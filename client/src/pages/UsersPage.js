import React, { useEffect, useState } from 'react';
import { createApiClient } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

export default function UsersPage() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const client = createApiClient(token);
        const res = await client.get('/users');
        setUsers(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao obter usuários');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (!user || !['GESTOR','RH','MASTER'].includes(user.role)) {
    return <p>Você não tem permissão para acessar esta página.</p>;
  }
  return (
    <div>
      <h3 className="mb-3">Usuários</h3>
      {loading ? (
        <p>Carregando...</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Role</th>
                <th>Ativo</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nome_completo || '-'}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.is_active ? 'Sim' : 'Não'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}