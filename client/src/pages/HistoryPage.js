import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Header from '../components/Header';

export default function HistoryPage() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await api.get('/records/daily');
        setSummary(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  return (
    <div>
      <Header />
      <div className="container">
        <h3 className="mb-4">Meu histórico</h3>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Primeira entrada</th>
                  <th>Última saída</th>
                  <th>Geofence fora</th>
                  <th>Alertas sequência</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row) => (
                  <tr key={row.dia}>
                    <td>{row.dia}</td>
                    <td>{row.primeira_entrada ? new Date(row.primeira_entrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td>{row.ultima_saida ? new Date(row.ultima_saida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td>{row.geofence_fora_qtd}</td>
                    <td>{row.sequencia_alerta_qtd}</td>
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