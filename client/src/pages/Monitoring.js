import React, { useEffect, useState } from 'react';
import { createApiClient } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

function MonitoringPage() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const api = createApiClient(token);
        const today = new Date().toISOString().slice(0, 10);
        const res = await api.get('/hr/summary', { params: { start: today, end: today } });
        setData(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  function classify(row) {
    // determina atraso comparando primeira entrada com 08:00
    const expected = new Date(`${row.dia}T08:00:00`);
    let status = 'Pontual';
    let atraso = 0;
    if (row.primeira_entrada) {
      const first = new Date(row.primeira_entrada);
      atraso = (first - expected) / 60000;
      if (atraso > 5) status = 'Atrasado';
    } else {
      status = 'Não bateu';
    }
    if (row.geofence_fora_qtd > 0) {
      status = 'Fora';
    }
    return { status, atraso: atraso > 0 ? Math.round(atraso) : 0 };
  }

  return (
    <div>
      <h3>Monitoramento de batidas</h3>
      {loading ? <p>Carregando...</p> : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Matrícula</th>
                <th>Setor</th>
                <th>Previsto</th>
                <th>Último registro</th>
                <th>Tipo</th>
                <th>Atraso (min)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => {
                const info = classify(row);
                const ultimoTipo = row.total_batidas === 0 ? '-' : 'OK';
                return (
                  <tr key={idx}>
                    <td>{row.nome}</td>
                    <td>{row.matricula}</td>
                    <td>{row.setor}</td>
                    <td>08:00</td>
                    <td>{row.primeira_entrada ? new Date(row.primeira_entrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td>{row.total_batidas === 0 ? '-' : 'ENTRADA'}</td>
                    <td>{info.atraso}</td>
                    <td>{info.status}</td>
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

export default MonitoringPage;