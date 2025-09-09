import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createApiClient } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

function HistoryPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const api = createApiClient(token);
        const res = await api.get('/records/daily');
        setSummary(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [token]);

  function formatTime(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function calcIntervalMin(entry, exit) {
    if (!entry || !exit) return '-';
    const start = new Date(entry);
    const end = new Date(exit);
    const diff = (end - start) / 60000; // milissegundos para minutos
    return Math.max(diff, 0);
  }

  return (
    <div>
      <h3>Meu histórico</h3>
      {loading ? (
        <p>Carregando...</p>
      ) : summary.length === 0 ? (
        <p>Nenhum registro encontrado.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Data</th>
                <th>Primeira</th>
                <th>Última</th>
                <th>Intervalo (min)</th>
                <th>Geofence fora</th>
                <th>Sequência alerta</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((row) => (
                <tr key={row.dia}>
                  <td>{row.dia}</td>
                  <td>{formatTime(row.primeira_entrada)}</td>
                  <td>{formatTime(row.ultima_saida)}</td>
                  <td>{calcIntervalMin(row.primeira_entrada, row.ultima_saida)}</td>
                  <td>{row.geofence_fora_qtd}</td>
                  <td>{row.sequencia_alerta_qtd}</td>
                  <td>
                    <Link to={`/summary/${row.dia}`}>Ver detalhes</Link>
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

export default HistoryPage;