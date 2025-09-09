import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { useAuth } from '../utils/AuthContext';

export default function PendingAdjustmentsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPendings() {
      try {
        const res = await api.get('/adjustments/pending');
        setItems(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao listar pendentes');
      } finally {
        setLoading(false);
      }
    }
    fetchPendings();
  }, []);

  async function decide(id, status) {
    try {
      await api.post(`/adjustments/${id}/decide`, { status, comentario: '' });
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao salvar decisão');
    }
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <h4 className="mb-3">Aprovar solicitações de ajuste</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div>Carregando...</div>
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
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.nome_colaborador}</td>
                    <td>{item.novo_tipo}</td>
                    <td>{new Date(item.nova_data_hora_utc).toLocaleString()}</td>
                    <td>{item.motivo}</td>
                    <td>
                      <button className="btn btn-success btn-sm me-1" onClick={() => decide(item.id, 'APROVADO')}>Aprovar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => decide(item.id, 'REJEITADO')}>Rejeitar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}