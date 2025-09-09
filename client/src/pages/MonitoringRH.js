import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { createApiClient } from '../utils/api';

function MonitoringRH() {
  const { token, user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !['RH','MASTER'].includes(user.role)) return;
    async function fetch() {
      setLoading(true);
      try {
        const api = createApiClient(token);
        const today = new Date().toISOString().slice(0, 10);
        const res = await api.get('/hr/summary', { params: { start: today, end: today } });
        setSummary(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [token, user]);

  if (!user || !['RH','MASTER'].includes(user.role)) {
    return <p>Você não tem permissão para acessar esta página.</p>;
  }

  // calcula métricas
  const totalColabs = summary.length;
  const naoBatidas = summary.filter((s) => s.total_batidas === 0).length;
  const atrasos = summary.filter((s) => s.sequencia_alerta_qtd > 0).length;
  const geofenceFora = summary.filter((s) => s.geofence_fora_qtd > 0).length;
  const batidas = totalColabs - naoBatidas;

  return (
    <div>
      <h3>Monitoramento de batidas</h3>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <>
          <div className="row text-center mb-3">
            <div className="col">
              <h5>Previstas</h5>
              <p className="fs-4">{totalColabs}</p>
            </div>
            <div className="col">
              <h5>Batidas</h5>
              <p className="fs-4">{batidas}</p>
            </div>
            <div className="col">
              <h5>Não batidas</h5>
              <p className="fs-4">{naoBatidas}</p>
            </div>
            <div className="col">
              <h5>Sequência alerta</h5>
              <p className="fs-4">{atrasos}</p>
            </div>
            <div className="col">
              <h5>Fora de geofence</h5>
              <p className="fs-4">{geofenceFora}</p>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Matrícula</th>
                  <th>Setor</th>
                  <th>Previsto</th>
                  <th>Último registro</th>
                  <th>Tipo</th>
                  <th>Alerta sequencia</th>
                  <th>Geofence fora</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((s, idx) => {
                  const lastType = s.ultima_saida ? 'SAIDA' : (s.primeira_entrada ? 'ENTRADA' : '');
                  return (
                    <tr key={idx}
                      className={s.geofence_fora_qtd > 0 ? 'table-danger' : s.sequencia_alerta_qtd > 0 ? 'table-warning' : ''}
                    >
                      <td>{s.nome}</td>
                      <td>{s.matricula || '-'}</td>
                      <td>{s.setor || '-'}</td>
                      <td>{s.dia}</td>
                      <td>{s.ultima_saida ? new Date(s.ultima_saida).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '-'}</td>
                      <td>{lastType || '-'}</td>
                      <td>{s.sequencia_alerta_qtd}</td>
                      <td>{s.geofence_fora_qtd}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default MonitoringRH;