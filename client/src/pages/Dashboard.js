import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { createApiClient } from '../utils/api';

function DashboardPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDaily() {
      try {
        const api = createApiClient(token);
        const res = await api.get('/records/daily');
        setDaily(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDaily();
  }, [token]);

  // Calcula próxima marcação sugerida com base no último registro de hoje
  let suggested = 'ENTRADA';
  let lastRecordStr = 'Nenhum registro hoje';
  if (daily.length > 0) {
    // a lista está ordenada desc, portanto o primeiro item é o dia mais recente
    const today = daily[0];
    // definir lastRecord do dia; precisamos de getRecords? para obter last; mas summary tem primeira_entrada e ultima_saida
    if (today.primeira_entrada && today.ultima_saida) {
      // se há primeira_entrada e ultima_saida então fechou? então espera-se nova Entrada no próximo dia
      suggested = 'ENTRADA';
      lastRecordStr = new Date(today.ultima_saida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (SAÍDA)';
    } else {
      // há apenas entrada ou intervalo; sugerir conforme contagem de registros do dia
      // contagem aproximada: geofence_fora + sequencia_alerta? melhor chamar /records to contar
    }
  }

  return (
    <div>
      <h2>Olá, {user?.email}</h2>
      <p className="text-muted">Bem-vindo ao sistema Ponto Certo</p>
      <div className="row">
        <div className="col-md-6 col-lg-4 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5>Status do dia</h5>
              {loading ? (
                <p>Carregando...</p>
              ) : (
                <>
                  <p className="mb-1">Próxima ação sugerida:</p>
                  <h5><span className="badge bg-primary">{suggested}</span></h5>
                  <p className="mb-0">Último registro: {lastRecordStr}</p>
                </>
              )}
              <button className="btn btn-primary mt-3" onClick={() => navigate('/clock')}>
                Bater ponto agora
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4 mb-3">
          <div className="card h-100" onClick={() => navigate('/history')} style={{ cursor: 'pointer' }}>
            <div className="card-body d-flex flex-column justify-content-center text-center">
              <h5>Histórico</h5>
              <p>Consulte suas marcações anteriores</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4 mb-3">
          <div className="card h-100" onClick={() => navigate('/adjustment')} style={{ cursor: 'pointer' }}>
            <div className="card-body d-flex flex-column justify-content-center text-center">
              <h5>Solicitar ajuste</h5>
              <p>Esqueceu de bater? Solicite correção</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4 mb-3">
          <div className="card h-100" onClick={() => navigate('/requests')} style={{ cursor: 'pointer' }}>
            <div className="card-body d-flex flex-column justify-content-center text-center">
              <h5>Minhas solicitações</h5>
              <p>Acompanhe status de ajustes</p>
            </div>
          </div>
        </div>
        {user && ['GESTOR','RH','MASTER'].includes(user.role) && (
          <div className="col-md-6 col-lg-4 mb-3">
            <div className="card h-100" onClick={() => navigate('/users')} style={{ cursor: 'pointer' }}>
              <div className="card-body d-flex flex-column justify-content-center text-center">
                <h5>Usuários</h5>
                <p>Gerencie colaboradores</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;