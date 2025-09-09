import React, { useEffect, useState } from 'react';
import { createApiClient } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

const types = ['ENTRADA', 'INT_SAIDA', 'INT_RETORNO', 'SAIDA'];

function AdjustmentPage() {
  const { token } = useAuth();
  const [novoTipo, setNovoTipo] = useState('ENTRADA');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [message, setMessage] = useState(null);
  const [ajustes, setAjustes] = useState([]);

  useEffect(() => {
    // fetch existing adjustments
    async function fetchAjustes() {
      try {
        const api = createApiClient(token);
        const res = await api.get('/adjustments');
        setAjustes(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAjustes();
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!data || !hora || !motivo) {
      setMessage({ type: 'danger', text: 'Preencha todos os campos' });
      return;
    }
    const novaDataHora = `${data}T${hora}`;
    try {
      const api = createApiClient(token);
      const res = await api.post('/adjustments', { novoTipo, novaDataHora, motivo });
      setMessage({ type: 'success', text: res.data.message });
      // add to local list
      setAjustes((prev) => [
        {
          id: res.data.ajusteId,
          novo_tipo: novoTipo,
          nova_data_hora_utc: novaDataHora,
          motivo,
          status: 'PENDENTE'
        },
        ...prev
      ]);
      // reset fields
      setData('');
      setHora('');
      setMotivo('');
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Erro ao enviar ajuste' });
    }
  }

  function formatDateTime(dt) {
    const d = new Date(dt);
    return d.toLocaleString();
  }

  return (
    <div>
      <h3>Solicitar ajuste</h3>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Tipo</label>
            <select className="form-select" value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)}>
              {types.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Data</label>
            <input type="date" className="form-control" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Hora</label>
            <input type="time" className="form-control" value={hora} onChange={(e) => setHora(e.target.value)} />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Motivo</label>
          <textarea className="form-control" rows="3" value={motivo} onChange={(e) => setMotivo(e.target.value)}></textarea>
        </div>
        <button type="submit" className="btn btn-primary">Enviar solicitação</button>
      </form>
      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}
      <h5>Minhas solicitações</h5>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Data/Hora</th>
              <th>Motivo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ajustes.map((aj) => (
              <tr key={aj.id}>
                <td>{aj.id}</td>
                <td>{aj.novo_tipo.replace('_', ' ')}</td>
                <td>{formatDateTime(aj.nova_data_hora_utc)}</td>
                <td>{aj.motivo}</td>
                <td>{aj.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdjustmentPage;