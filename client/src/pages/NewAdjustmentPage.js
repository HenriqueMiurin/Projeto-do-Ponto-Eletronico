import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Header from '../components/Header';

export default function NewAdjustmentPage() {
  const [novoTipo, setNovoTipo] = useState('ENTRADA');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [records, setRecords] = useState([]);
  const [pontoId, setPontoId] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRecords() {
      try {
        const res = await api.get('/records');
        const todayIso = new Date().toISOString().split('T')[0];
        setRecords(res.data.filter((r) => r.data_hora_utc.startsWith(todayIso)));
      } catch (err) {
        console.error(err);
      }
    }
    fetchRecords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      // combina data e hora no formato ISO local (YYYY-MM-DDTHH:mm)
      const isoLocal = `${data}T${hora}`;
      await api.post('/adjustments', {
        pontoId: pontoId || null,
        novoTipo,
        novaDataHora: isoLocal,
        motivo
      });
      setMessage('Solicitação enviada com sucesso');
      setTimeout(() => navigate('/adjustments'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar solicitação');
    }
  };

  return (
    <div>
      <Header />
      <div className="container" style={{ maxWidth: '600px' }}>
        <h3 className="mb-3">Solicitar Ajuste</h3>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Tipo</label>
            <select className="form-select" value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)}>
              {['ENTRADA','INT_SAIDA','INT_RETORNO','SAIDA'].map((t) => (
                <option key={t} value={t}>{t.replace('_',' ')}</option>
              ))}
            </select>
          </div>
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Data</label>
              <input type="date" className="form-control" value={data} onChange={(e) => setData(e.target.value)} required />
            </div>
            <div className="col">
              <label className="form-label">Hora</label>
              <input type="time" className="form-control" value={hora} onChange={(e) => setHora(e.target.value)} required />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Registrar ajuste de um ponto existente?</label>
            <select className="form-select" value={pontoId} onChange={(e) => setPontoId(e.target.value)}>
              <option value="">Nenhum</option>
              {records.map((r) => (
                <option key={r.id} value={r.id}>{new Date(r.data_hora_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {r.tipo}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Motivo</label>
            <textarea className="form-control" value={motivo} onChange={(e) => setMotivo(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Enviar solicitação</button>
          <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/adjustments')}>Cancelar</button>
        </form>
      </div>
    </div>
  );
}