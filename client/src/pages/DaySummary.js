import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createApiClient } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

function DaySummaryPage() {
  const { token } = useAuth();
  const { date } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecords() {
      try {
        const api = createApiClient(token);
        const res = await api.get('/records');
        const list = (res.data || []).filter(r => r.data_hora_utc.startsWith(date));
        setRecords(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, [token, date]);

  function formatTime(dt) {
    return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Compute total worked and lunch etc.
  let totalWorked = 0;
  let lunch = 0;
  let atraso = 0;
  if (records.length >= 2) {
    const entrada = new Date(records[0].data_hora_utc);
    const saida = new Date(records[records.length - 1].data_hora_utc);
    totalWorked = (saida - entrada) / 60000; // minutes
    if (records.length === 4) {
      const out = new Date(records[1].data_hora_utc);
      const ret = new Date(records[2].data_hora_utc);
      lunch = (ret - out) / 60000;
    }
    // expected start 08:00; adjust for date
    const expected = new Date(`${date}T08:00:00`);
    atraso = (entrada - expected) / 60000;
    if (atraso < 0) atraso = 0;
  }

  return (
    <div>
      <button className="btn btn-link mb-3" onClick={() => navigate('/history')}>&lt; Voltar ao histórico</button>
      <h4>Resumo do dia {date}</h4>
      {loading ? <p>Carregando...</p> : (
        <>
          <div className="card mb-3">
            <div className="card-body">
              <h5>Resumo do dia</h5>
              <p>Total trabalhado: {Math.floor(totalWorked/60).toString().padStart(2, '0')}:{(totalWorked%60).toString().padStart(2, '0')}</p>
              <p>Almoço: {Math.floor(lunch/60).toString().padStart(2, '0')}:{(lunch%60).toString().padStart(2, '0')}</p>
              <p>Atraso: {(Math.floor(atraso/60)).toString().padStart(2, '0')}:{(atraso%60).toString().padStart(2, '0')} (vs. jornada)</p>
            </div>
          </div>
          <div className="card mb-3">
            <div className="card-body">
              <h5>Linha do tempo</h5>
              {records.map((r, idx) => (
                <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                  <span>{formatTime(r.data_hora_utc)}</span>
                  <span>{r.tipo.replace('_', ' ')}</span>
                  <span>{r.validacao_geofence === 'FORA' ? (
                    <span className="badge bg-warning text-dark">Fora</span>
                  ) : r.validacao_geofence === 'DENTRO' ? (
                    <span className="badge bg-success">Dentro</span>
                  ) : (
                    <span className="badge bg-secondary">Indef.</span>
                  )}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate(`/adjustment?date=${date}`)}>Solicitar ajuste para este dia</button>
        </>
      )}
    </div>
  );
}

export default DaySummaryPage;