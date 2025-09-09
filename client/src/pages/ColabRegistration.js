import React, { useState } from 'react';
import { createApiClient } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

function ColabRegistrationPage() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    nome: '',
    email_login: '',
    senha: '',
    email_corporativo: '',
    cpf: '',
    matricula: '',
    cargo: '',
    setor: '',
    data_admissao: '',
    unidade_padrao_id: '',
    ativo: true,
    role: 'USUARIO',
    must_reset_password: true
  });
  const [message, setMessage] = useState(null);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const api = createApiClient(token);
      await api.post('/collaborators', form);
      setMessage({ type: 'success', text: 'Colaborador cadastrado com sucesso' });
      setForm({
        nome: '',
        email_login: '',
        senha: '',
        email_corporativo: '',
        cpf: '',
        matricula: '',
        cargo: '',
        setor: '',
        data_admissao: '',
        unidade_padrao_id: '',
        ativo: true,
        role: 'USUARIO',
        must_reset_password: true
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Erro ao cadastrar colaborador' });
    }
  }

  return (
    <div>
      <h3>Cadastro de Colaborador – RH/TI</h3>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Nome</label>
            <input className="form-control" name="nome" value={form.nome} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">E-mail corporativo</label>
            <input className="form-control" name="email_corporativo" value={form.email_corporativo} onChange={handleChange} />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">CPF</label>
            <input className="form-control" name="cpf" value={form.cpf} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Matrícula</label>
            <input className="form-control" name="matricula" value={form.matricula} onChange={handleChange} />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Cargo</label>
            <input className="form-control" name="cargo" value={form.cargo} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Setor</label>
            <input className="form-control" name="setor" value={form.setor} onChange={handleChange} />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Data de admissão</label>
            <input type="date" className="form-control" name="data_admissao" value={form.data_admissao} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Login (e-mail)</label>
            <input type="email" className="form-control" name="email_login" value={form.email_login} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Senha inicial</label>
            <input type="password" className="form-control" name="senha" value={form.senha} onChange={handleChange} />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Role</label>
            <select className="form-select" name="role" value={form.role} onChange={handleChange}>
              <option value="USUARIO">Usuário</option>
              <option value="GESTOR">Gestor</option>
              <option value="RH">RH</option>
              <option value="MASTER">Master</option>
            </select>
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" name="ativo" checked={form.ativo} onChange={handleChange} id="ativoToggle" />
              <label className="form-check-label" htmlFor="ativoToggle">Ativo</label>
            </div>
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="must_reset_password" checked={form.must_reset_password} onChange={handleChange} id="resetToggle" />
              <label className="form-check-label" htmlFor="resetToggle">Obrigar troca de senha no primeiro acesso</label>
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Salvar</button>
      </form>
    </div>
  );
}

export default ColabRegistrationPage;