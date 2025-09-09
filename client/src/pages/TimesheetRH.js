import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { createApiClient } from '../utils/api';

function TimesheetRH() {
  const { token, user } = useAuth();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (['RH','MASTER'].includes(user?.role)) {
      fetchSummary();
    }
  }, [user]);

  async function fetchSummary() {
    setLoading(true);
    try {
      const api = createApiClient(token);
      const params = {};
      if (start) params.start = start;
      if (end) params.end = end;
      const res = await api.get('/hr/summary', { params });
      setSummary(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(t) {
    if (!t) return '-';
    const d = new Date(t);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (!user || !['RH','MASTER'].includes(user.role)) {
    return <p>Você não tem permissão para acessar esta página.</p>;
  }

  return (
    <div>
      <h3>Folha de Ponto — RH</h3>
      <div className="row mb-3">
        <div className="col-md-3">
          <label className="form-label">Data início</label>
          <input type="date" className="form-control" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Data fim</label>
          <input type="date" className="form-control" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div className="col-md-3 align-self-end">
          <button className="btn btn-primary" onClick={fetchSummary}>Aplicar</button>
        </div>
      </div>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Matrícula</th>
                <th>Setor</th>
                <th>Data</th>
                <th>Primeira</th>
                <th>Última</th>
                <th>Horas trabalhadas (min)</th>
                <th>Geofence fora</th>
                <th>Sequência alerta</th>
                <th>Status folha</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.nome}</td>
                  <td>{row.matricula || '-'}</td>
                  <td>{row.setor || '-'}</td>
                  <td>{row.dia || '-'}</td>
                  <td>{formatTime(row.primeira_entrada)}</td>
                  <td>{formatTime(row.ultima_saida)}</td>
                  <td>{row.horas_trabalhadas_min}</td>
                  <td>{row.geofence_fora_qtd}</td>
                  <td>{row.sequencia_alerta_qtd}</td>
                  <td>{row.ultima_saida ? 'Fechada' : 'Em aberto'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TimesheetRH;