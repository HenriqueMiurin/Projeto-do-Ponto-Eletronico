import React, { useEffect, useState } from 'react';
import { createApiClient } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

function FolhaPontoPage() {
  const { token } = useAuth();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchSummary() {
    setLoading(true);
    try {
      const api = createApiClient(token);
      const params = {};
      if (start && end) {
        params.start = start;
        params.end = end;
      }
      const res = await api.get('/hr/summary', { params });
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderTable() {
    if (data.length === 0) return <p>Nenhum registro encontrado.</p>;
    return (
      <table className="table table-striped">
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
            <th>Seq. alerta</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td>{row.nome}</td>
              <td>{row.matricula}</td>
              <td>{row.setor}</td>
              <td>{row.dia || '-'}</td>
              <td>{row.primeira_entrada ? new Date(row.primeira_entrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
              <td>{row.ultima_saida ? new Date(row.ultima_saida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
              <td>{row.horas_trabalhadas_min}</td>
              <td>{row.geofence_fora_qtd}</td>
              <td>{row.sequencia_alerta_qtd}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div>
      <h3>Folha de Ponto – RH</h3>
      <div className="row mb-3">
        <div className="col-md-3">
          <label className="form-label">Data início</label>
          <input type="date" className="form-control" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Data fim</label>
          <input type="date" className="form-control" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <button className="btn btn-primary" onClick={fetchSummary}>Aplicar</button>
        </div>
      </div>
      {loading ? <p>Carregando...</p> : renderTable()}
    </div>
  );
}

export default FolhaPontoPage;