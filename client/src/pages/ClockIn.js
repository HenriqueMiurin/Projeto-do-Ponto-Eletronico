import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { useAuth } from '../utils/AuthContext';

export default function ClockInPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayRecords, setTodayRecords] = useState([]);
  const [selectedType, setSelectedType] = useState('ENTRADA');
  const [suggestion, setSuggestion] = useState('ENTRADA');
  const [observacao, setObservacao] = useState('');
  const [geoStatus, setGeoStatus] = useState('INDEFINIDO');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [message, setMessage] = useState(null);
  const validTypes = ['ENTRADA','INT_SAIDA','INT_RETORNO','SAIDA'];

  useEffect(() => {
    async function loadRecords() {
      const res = await api.get('/records');
      const todayIso = new Date().toISOString().split('T')[0];
      const records = res.data.filter(r => r.data_hora_utc.startsWith(todayIso));
      records.sort((a,b) => new Date(a.data_hora_utc) - new Date(b.data_hora_utc));
      setTodayRecords(records);
      const nextType = validTypes[records.length] || 'FINALIZADO';
      setSuggestion(nextType);
      setSelectedType(nextType);
    }
    if (user) {
      loadRecords();
    }
  }, [user]);

  // tenta obter localização do navegador
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        (err) => {
          console.warn(err);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const handleConfirm = async () => {
    try {
      const res = await api.post('/records', {
        tipo: selectedType,
        latitude,
        longitude,
        observacao: observacao || null
      });
      setMessage(res.data.message + ' (' + selectedType + ')');
      setObservacao('');
      // recarrega registros para atualizar sugestão
      const rec = await api.get('/records');
      const todayIso = new Date().toISOString().split('T')[0];
      const records = rec.data.filter(r => r.data_hora_utc.startsWith(todayIso));
      records.sort((a,b) => new Date(a.data_hora_utc) - new Date(b.data_hora_utc));
      setTodayRecords(records);
      const nextType = validTypes[records.length] || 'FINALIZADO';
      setSuggestion(nextType);
      setSelectedType(nextType);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Falha ao registrar ponto');
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <h4 className="mb-3">Bater ponto</h4>
        <div className="card p-4">
          <h5>Localização</h5>
          <p>Status geofence: {latitude !== null && longitude !== null ? 'capturada' : 'indefinido'}</p>
          <h5 className="mt-3">Próxima marcação</h5>
          <p>Sugerida: <strong>{suggestion}</strong></p>
          <div className="btn-group mb-3" role="group">
            {validTypes.map(type => {
              let label = type;
              if (type === 'INT_SAIDA') label = 'INT SAÍDA';
              if (type === 'INT_RETORNO') label = 'INT RETORNO';
              return (
                <button
                  key={type}
                  type="button"
                  className={`btn btn-outline-primary ${selectedType === type ? 'active' : ''}`}
                  disabled={suggestion === 'FINALIZADO'}
                  onClick={() => setSelectedType(type)}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="mb-3">
            <label className="form-label">Observação (opcional)</label>
            <input type="text" className="form-control" value={observacao} onChange={e => setObservacao(e.target.value)} disabled={suggestion === 'FINALIZADO'} />
          </div>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={suggestion === 'FINALIZADO'}>
            Confirmar batida
          </button>
          {message && <div className="alert alert-success mt-3">{message}</div>}
        </div>
      </div>
    </div>
  );
}