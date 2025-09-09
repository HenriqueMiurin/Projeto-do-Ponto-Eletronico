import React, { useEffect, useState } from 'react';
import { createApiClient } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

const EVENT_TYPES = ['ATESTADO','FOLGA','AFASTAMENTO','FERIADO','FALTA','FERIAS','OUTRO'];

function EventsPage() {
  const { token } = useAuth();
  const [collaborators, setCollaborators] = useState([]);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ colaborador_id: '', tipo: 'ATESTADO', inicio: '', fim: '', descricao: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const api = createApiClient(token);
        const colabRes = await api.get('/collaborators');
        setCollaborators(colabRes.data || []);
        const evtRes = await api.get('/events');
        setEvents(evtRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const api = createApiClient(token);
      await api.post('/events', form);
      setMessage({ type: 'success', text: 'Evento lançado com sucesso' });
      // atualizar lista
      const res = await api.get('/events');
      setEvents(res.data || []);
      setForm({ colaborador_id: '', tipo: 'ATESTADO', inicio: '', fim: '', descricao: '' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Erro ao lançar evento' });
    }
  }

  return (
    <div>
      <h3>Lançamento de Eventos (RH)</h3>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">Tipo do evento</label>
            <select className="form-select" name="tipo" value={form.tipo} onChange={handleChange}>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Colaborador</label>
            <select className="form-select" name="colaborador_id" value={form.colaborador_id} onChange={handleChange}>
              <option value="">Selecione</option>
              {collaborators.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Início</label>
            <input type="datetime-local" className="form-control" name="inicio" value={form.inicio} onChange={handleChange} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Fim</label>
            <input type="datetime-local" className="form-control" name="fim" value={form.fim} onChange={handleChange} />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Motivo/Observações</label>
          <textarea className="form-control" name="descricao" value={form.descricao} onChange={handleChange}></textarea>
        </div>
        <button type="submit" className="btn btn-primary">Salvar evento</button>
      </form>
      <h5>Eventos do período</h5>
      {loading ? <p>Carregando...</p> : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Colaborador</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev, idx) => (
                <tr key={idx}>
                  <td>{ev.tipo}</td>
                  <td>{ev.colaborador || '-'}</td>
                  <td>{new Date(ev.inicio).toLocaleString()}</td>
                  <td>{new Date(ev.fim).toLocaleString()}</td>
                  <td>{ev.descricao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EventsPage;