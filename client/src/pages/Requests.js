import React, { useEffect, useState } from 'react';
import { createApiClient } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

function RequestsPage() {
  const { token } = useAuth();
  const [ajustes, setAjustes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAjustes() {
      try {
        const api = createApiClient(token);
        const res = await api.get('/adjustments');
        setAjustes(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAjustes();
  }, [token]);

  function formatDateTime(dt) {
    const d = new Date(dt);
    return d.toLocaleString();
  }

  return (
    <div>
      <h3>Minhas solicitações de ajuste</h3>
      {loading ? (
        <p>Carregando...</p>
      ) : ajustes.length === 0 ? (
        <p>Nenhuma solicitação registrada.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Data/Hora pedida</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Decisor</th>
                <th>Comentário</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ajustes.map((aj) => (
                <tr key={aj.id}>
                  <td>{aj.id}</td>
                  <td>{formatDateTime(aj.nova_data_hora_utc)}</td>
                  <td>{aj.novo_tipo.replace('_', ' ')}</td>
                  <td>
                    <span className={`badge ${aj.status === 'APROVADO' ? 'bg-success' : aj.status === 'REJEITADO' ? 'bg-danger' : 'bg-warning text-dark'}`}>{aj.status}</span>
                  </td>
                  <td>{aj.analista_id || '-'}</td>
                  <td>{aj.comentario_decisao || '-'}</td>
                  <td>
                    {/* Para versão básica, apenas exibimos detalhes */}
                    {/* Poderíamos adicionar navegação para uma página de detalhes no futuro */}
                    <span className="text-primary" style={{ cursor:'pointer' }} onClick={() => alert(`Motivo: ${aj.motivo}\nComentário: ${aj.comentario_decisao || '—'}`)}>Ver</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RequestsPage;