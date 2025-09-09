import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';

export default function NewAdjustmentPage() {
  const navigate = useNavigate();
  const [novoTipo, setNovoTipo] = useState('ENTRADA');
  const [novaData, setNovaData] = useState('');
  const [novaHora, setNovaHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const validTypes = ['ENTRADA','INT_SAIDA','INT_RETORNO','SAIDA'];

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const iso = `${novaData}T${novaHora}`;
      await api.post('/adjustments', { novoTipo, novaDataHora: iso, motivo });
      setSuccess('Solicitação enviada com sucesso');
      // opcional: navegar de volta para listagem após alguns segundos
      setTimeout(() => navigate('/adjustments'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar solicitação');
    }
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <h4 className="mb-3">Nova solicitação de ajuste</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
          <div className="mb-3">
            <label className="form-label">Tipo</label>
            <select className="form-select" value={novoTipo} onChange={e => setNovoTipo(e.target.value)}>
              {validTypes.map(type => {
                let label = type;
                if (type === 'INT_SAIDA') label = 'INT SAÍDA';
                if (type === 'INT_RETORNO') label = 'INT RETORNO';
                return <option key={type} value={type}>{label}</option>;
              })}
            </select>
          </div>
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Data</label>
              <input type="date" className="form-control" value={novaData} onChange={e => setNovaData(e.target.value)} required />
            </div>
            <div className="col">
              <label className="form-label">Hora</label>
              <input type="time" className="form-control" value={novaHora} onChange={e => setNovaHora(e.target.value)} required />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Motivo</label>
            <textarea className="form-control" rows="3" value={motivo} onChange={e => setMotivo(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Enviar</button>
          <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/adjustments')}>Cancelar</button>
        </form>
      </div>
    </div>
  );
}