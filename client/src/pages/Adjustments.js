import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';

export default function AdjustmentsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdjustments() {
      try {
        const res = await api.get('/adjustments');
        setItems(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdjustments();
  }, []);

  function formatDateTime(utcString) {
    if (!utcString) return '-';
    const date = new Date(utcString);
    return date.toLocaleString();
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <h4 className="mb-3">Minhas solicitações de ajuste</h4>
        <button className="btn btn-primary mb-3" onClick={() => navigate('/adjustments/new')}>Nova solicitação</button>
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Novo tipo</th>
                  <th>Nova data/hora</th>
                  <th>Motivo</th>
                  <th>Status</th>
                  <th>Comentário gestor</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.novo_tipo}</td>
                    <td>{formatDateTime(item.nova_data_hora_utc)}</td>
                    <td>{item.motivo}</td>
                    <td>{item.status}</td>
                    <td>{item.comentario_decisao || '-'}</td>
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