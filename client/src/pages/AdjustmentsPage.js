import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Header from '../components/Header';

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get('/adjustments');
        setAdjustments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <Header />
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Ajustes</h3>
          <Link to="/adjustments/new" className="btn btn-primary">Novo ajuste</Link>
        </div>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Novo tipo</th>
                  <th>Nova data/hora</th>
                  <th>Motivo</th>
                  <th>Status</th>
                  <th>Comentário</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map((aj) => (
                  <tr key={aj.id}>
                    <td>{aj.id}</td>
                    <td>{aj.novo_tipo}</td>
                    <td>{new Date(aj.nova_data_hora_utc).toLocaleString()}</td>
                    <td>{aj.motivo}</td>
                    <td>{aj.status}</td>
                    <td>{aj.comentario_decisao || '-'}</td>
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