import React, { useEffect, useState } from 'react';
import { createApiClient } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

const sequenceOrder = ['ENTRADA', 'INT_SAIDA', 'INT_RETORNO', 'SAIDA'];

function ClockPage() {
  const { token } = useAuth();
  const [recordsToday, setRecordsToday] = useState([]);
  const [suggested, setSuggested] = useState('ENTRADA');
  const [selected, setSelected] = useState('ENTRADA');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [geoStatus, setGeoStatus] = useState('INDEFINIDO');
  const [observacao, setObservacao] = useState('');
  const [message, setMessage] = useState(null);

  // compute geofence (client side) optional: using env variables
  const latRef = parseFloat(process.env.REACT_APP_GEOFENCE_LAT || '-23.55052');
  const lonRef = parseFloat(process.env.REACT_APP_GEOFENCE_LON || '-46.633308');
  const radius = parseFloat(process.env.REACT_APP_GEOFENCE_RADIUS || '150');

  function haversine(lat1, lon1, lat2, lon2) {
    function toRad(deg) { return deg * Math.PI / 180; }
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Load existing records to suggest next type
  useEffect(() => {
    async function fetchRecords() {
      try {
        const api = createApiClient(token);
        const res = await api.get('/records');
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayRecords = (res.data || []).filter(r => r.data_hora_utc.startsWith(todayStr));
        setRecordsToday(todayRecords);
        // determine suggestion
        if (todayRecords.length === 0) {
          setSuggested('ENTRADA');
          setSelected('ENTRADA');
        } else if (todayRecords.length === 1) {
          setSuggested('INT_SAIDA');
          setSelected('INT_SAIDA');
        } else if (todayRecords.length === 2) {
          setSuggested('INT_RETORNO');
          setSelected('INT_RETORNO');
        } else if (todayRecords.length === 3) {
          setSuggested('SAIDA');
          setSelected('SAIDA');
        } else {
          setSuggested('---');
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchRecords();
  }, [token]);

  // Get geolocation of user
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setLatitude(lat);
          setLongitude(lon);
          const dist = haversine(lat, lon, latRef, lonRef);
          setGeoStatus(dist <= radius ? 'DENTRO' : 'FORA');
        },
        (err) => {
          console.warn('Erro ao obter localização', err);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [latRef, lonRef, radius]);

  async function handleConfirm(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const api = createApiClient(token);
      const res = await api.post('/records', {
        tipo: selected,
        latitude,
        longitude,
        observacao
      });
      setMessage({ type: 'success', text: res.data.message });
      setObservacao('');
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Erro ao registrar ponto' });
    }
  }

  return (
    <div className="container-fluid" style={{ maxWidth: '600px' }}>
      <h3>Bater ponto</h3>
      <div className="mb-3">
        <h5>Localização</h5>
        {latitude && longitude ? (
          <>
            <p className="mb-1">Latitude: {latitude.toFixed(5)}, Longitude: {longitude.toFixed(5)}</p>
            <p className="mb-1">Status geofence: {geoStatus === 'DENTRO' ? (
              <span className="text-success">Dentro</span>
            ) : (
              <span className="text-danger">Fora</span>
            )}</p>
          </>
        ) : (
          <p>Obtendo localização...</p>
        )}
      </div>
      <div className="mb-3">
        <h5>Próxima marcação</h5>
        <p className="mb-1">Sugerida: {suggested}</p>
        <div className="btn-group" role="group" aria-label="Tipos de marcação">
          {sequenceOrder.map((type) => (
            <button
              key={type}
              type="button"
              className={`btn btn-outline-primary ${selected === type ? 'active' : ''}`}
              disabled={recordsToday.length >= 4}
              onClick={() => setSelected(type)}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      <form onSubmit={handleConfirm}>
        <div className="mb-3">
          <label className="form-label">Observação (opcional)</label>
          <input
            type="text"
            className="form-control"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={recordsToday.length >= 4}>
          Confirmar batida
        </button>
      </form>
      {message && (
        <div className={`alert alert-${message.type} mt-3`}>
          {message.text}
        </div>
      )}
      {recordsToday.length >= 4 && (
        <div className="alert alert-warning mt-3">Você já atingiu o limite de 4 marcações hoje.</div>
      )}
    </div>
  );
}

export default ClockPage;