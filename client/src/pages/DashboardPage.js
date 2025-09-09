import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApiClient } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [todayRecords, setTodayRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRecords() {
      try {
        const apiClient = createApiClient(token);
        const res = await apiClient.get('/records');
        const all = res.data;
        const todayIso = new Date().toISOString().split('T')[0];
        const today = all.filter((r) => r.data_hora_utc.startsWith(todayIso));
        // Ordena ascendente
        today.sort((a,b) => new Date(a.data_hora_utc) - new Date(b.data_hora_utc));
        setTodayRecords(today);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, []);

  // calcula próxima ação sugerida
  const sequence = ['ENTRADA','INT_SAIDA','INT_RETORNO','SAIDA'];
  let nextAction = 'ENTRADA';
  let lastRecord = null;
  if (todayRecords.length > 0) {
    lastRecord = todayRecords[todayRecords.length - 1];
    const lastIndex = sequence.indexOf(lastRecord.tipo);
    nextAction = sequence[lastIndex + 1] || 'ENTRADA';
  }

  return (
    <div>
      <h3 className="mb-4">Olá, {user?.email}</h3>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="row g-3">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card shadow-sm p-3">
              <h5>Status do dia</h5>
              <p>
                Próxima ação sugerida:{' '}
                <span className="badge bg-secondary">{nextAction}</span>
              </p>
              {lastRecord && (
                <p>
                  Último registro: {new Date(lastRecord.data_hora_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({lastRecord.tipo})
                </p>
              )}
              <button className="btn btn-primary" onClick={() => navigate('/clock')}>
                Bater ponto agora
              </button>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <div
              className="card shadow-sm p-3 text-center"
              onClick={() => navigate('/clock')}
              style={{ cursor: 'pointer' }}
            >
              <div className="fs-1 mb-2">🕒</div>
              <h6>Bater Ponto</h6>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <div
              className="card shadow-sm p-3 text-center"
              onClick={() => navigate('/history')}
              style={{ cursor: 'pointer' }}
            >
              <div className="fs-1 mb-2">📅</div>
              <h6>Histórico</h6>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <div
              className="card shadow-sm p-3 text-center"
              onClick={() => navigate('/adjustment')}
              style={{ cursor: 'pointer' }}
            >
              <div className="fs-1 mb-2">✏️</div>
              <h6>Solicitar Ajuste</h6>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}