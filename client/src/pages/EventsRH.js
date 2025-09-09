import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { createApiClient } from '../utils/api';

const eventTypes = ['FERIADO','FOLGA','AFASTAMENTO','ATESTADO','FALTA','FERIAS','OUTRO'];

function EventsRH() {
  const { token, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ colaborador_id: '', tipo: 'FERIADO', inicio: '', fim: '', descricao: '' });
  const [collaborators, setCollaborators] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (['RH','MASTER'].includes(user?.role)) {
      fetchEvents();
      fetchCollaborators();
    }
  }, [user]);

  async function fetchEvents() {
    try {
      const api = createApiClient(token);
      const res = await api.get('/events');
      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchCollaborators() {
    try {
      const api = createApiClient(token);
      const res = await api.get('/collaborators');
      setCollaborators(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    const { colaborador_id, tipo, inicio, fim } = form;
    if (!colaborador_id || !tipo || !inicio || !fim) {
      setMessage({ type: 'danger', text: 'Todos os campos obrigatórios' });
      return;
    }
    try {
      const api = createApiClient(token);
      await api.post('/events', form);
      setMessage({ type: 'success', text: 'Evento lançado' });
      setForm({ colaborador_id: '', tipo: 'FERIADO', inicio: '', fim: '', descricao: '' });
      fetchEvents();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Erro ao lançar evento' });
    }
  }

  if (!user || !['RH','MASTER'].includes(user.role)) {
    return <p>Você não tem permissão para acessar esta página.</p>;
  }

  return (
    <div>
      <h3>Lançamento de Eventos (RH)</h3>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row">
          <div className="col-md-3 mb-3">
            <label className="form-label">Tipo do evento</label>
            <select name="tipo" className="form-select" value={form.tipo} onChange={handleChange}>
              {eventTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label">Colaborador</label>
            <select name="colaborador_id" className="form-select" value={form.colaborador_id} onChange={handleChange}>
              <option value="">Selecione</option>
              {collaborators.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label">Início</label>
            <input name="inicio" type="datetime-local" className="form-control" value={form.inicio} onChange={handleChange} />
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label">Fim</label>
            <input name="fim" type="datetime-local" className="form-control" value={form.fim} onChange={handleChange} />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Motivo/Observações</label>
          <textarea name="descricao" className="form-control" rows="2" value={form.descricao} onChange={handleChange}></textarea>
        </div>
        <button type="submit" className="btn btn-primary">Salvar evento</button>
      </form>
      <h5>Eventos lançados</h5>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Colaborador</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id}>
                <td>{ev.id}</td>
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
    </div>
  );
}

export default EventsRH;