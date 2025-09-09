import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Header from '../components/Header';

export default function PendingAdjustmentsPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchPending() {
    try {
      const res = await api.get('/adjustments/pending');
      setPending(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao buscar pendências');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPending();
  }, []);

  async function handleDecision(id, status) {
    try {
      await api.post(`/adjustments/${id}/decide`, { status, comentario: '' });
      // remove da lista
      setPending(pending.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao processar decisão');
    }
  }

  return (
    <div>
      <Header />
      <div className="container">
        <h3 className="mb-3">Pendências de Ajuste</h3>
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
                  <th>Colaborador</th>
                  <th>Tipo</th>
                  <th>Data/Hora</th>
                  <th>Motivo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nome_colaborador}</td>
                    <td>{p.novo_tipo}</td>
                    <td>{new Date(p.nova_data_hora_utc).toLocaleString()}</td>
                    <td>{p.motivo}</td>
                    <td>
                      <button className="btn btn-success btn-sm me-1" onClick={() => handleDecision(p.id, 'APROVADO')}>Aprovar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDecision(p.id, 'REJEITADO')}>Rejeitar</button>
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