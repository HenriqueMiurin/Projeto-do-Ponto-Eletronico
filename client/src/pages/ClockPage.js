import React, { useState, useEffect } from 'react';
import { createApiClient } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

export default function ClockPage() {
  const { token } = useAuth();
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [geoStatus, setGeoStatus] = useState('INDEFINIDO');
  const [tipo, setTipo] = useState('ENTRADA');
  const [observacao, setObservacao] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Pede a localização do usuário se possível
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          setLatitude(lat);
          setLongitude(lon);
          // calcula status localmente comparando com o geofence definido no backend
          const latRef = parseFloat(process.env.REACT_APP_GEOFENCE_LAT || '-23.55052');
          const lonRef = parseFloat(process.env.REACT_APP_GEOFENCE_LON || '-46.633308');
          const raio = parseFloat(process.env.REACT_APP_GEOFENCE_RADIUS || '150');
          const R = 6371000;
          const toRad = (d) => d * Math.PI / 180;
          const dLat = toRad(lat - latRef);
          const dLon = toRad(lon - lonRef);
          const a = Math.sin(dLat/2)**2 + Math.cos(toRad(latRef))*Math.cos(toRad(lat)) * Math.sin(dLon/2)**2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const dist = R * c;
          setGeoStatus(dist <= raio ? 'DENTRO' : 'FORA');
        },
        (err) => {
          console.warn(err);
          setGeoStatus('INDEFINIDO');
        }
      );
    }
  }, []);

  const handleRegister = async () => {
    setError(null);
    setMessage(null);
    try {
      const apiClient = createApiClient(token);
      const res = await apiClient.post('/records', {
        tipo,
        latitude,
        longitude,
        observacao
      });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao registrar ponto');
    }
  };

  return (
    <div>
      <div className="container" style={{ maxWidth: '600px' }}>
        <h3 className="mb-4">Bater Ponto</h3>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <h5>Localização</h5>
          <p>Status geofence: {geoStatus}</p>
        </div>
        <div className="mb-3">
          <h5>Tipo de marcação</h5>
          <div className="btn-group" role="group">
            {['ENTRADA','INT_SAIDA','INT_RETORNO','SAIDA'].map((t) => (
              <button
                key={t}
                type="button"
                className={`btn btn-outline-primary ${tipo === t ? 'active' : ''}`}
                onClick={() => setTipo(t)}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="observacao" className="form-label">Observação (opcional)</label>
          <textarea
            id="observacao"
            className="form-control"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={handleRegister}>Confirmar batida</button>
      </div>
    </div>
  );
}