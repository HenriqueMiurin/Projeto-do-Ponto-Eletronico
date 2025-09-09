import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { createApiClient } from '../utils/api';

/**
 * Página para o RH ou Master aprovar ou rejeitar solicitações de ajuste de ponto.
 * Lista as solicitações pendentes retornadas do endpoint /adjustments/pending e
 * permite aprovar ou rejeitar cada uma. Acesso restrito a roles RH e MASTER.
 */
export default function Approvals() {
  const { user, token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function fetchPendings() {
      setError(null);
      setLoading(true);
      try {
        const api = createApiClient(token);
        const res = await api.get('/adjustments/pending');
        setItems(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao listar pendentes');
      } finally {
        setLoading(false);
      }
    }
    if (user && ['RH', 'MASTER'].includes(user.role)) {
      fetchPendings();
    }
  }, [user, token]);

  async function decide(id, status) {
    setMessage(null);
    try {
      const api = createApiClient(token);
      await api.post(`/adjustments/${id}/decide`, { status, comentario: '' });
      // remove item localmente
      setItems((prev) => prev.filter((i) => i.id !== id));
      setMessage({ type: 'success', text: `Solicitação ${id} ${status === 'APROVADO' ? 'aprovada' : 'rejeitada'}` });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Erro ao processar decisão' });
    }
  }

  // Redireciona se usuário não tem permissão
  if (user && !['RH', 'MASTER'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h3>Aprovar solicitações de ajuste</h3>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Colaborador</th>
                <th>Novo tipo</th>
                <th>Nova data/hora</th>
                <th>Motivo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.nome_colaborador}</td>
                  <td>{item.novo_tipo}</td>
                  <td>{new Date(item.nova_data_hora_utc).toLocaleString()}</td>
                  <td>{item.motivo}</td>
                  <td>
                    <button
                      className="btn btn-success btn-sm me-1"
                      onClick={() => decide(item.id, 'APROVADO')}
                    >
                      Aprovar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => decide(item.id, 'REJEITADO')}
                    >
                      Rejeitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p>Nenhuma solicitação pendente.</p>}
        </div>
      )}
    </div>
  );
}