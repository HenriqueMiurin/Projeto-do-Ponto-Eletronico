import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { createUser } from '../models/User.js';
import { createCollaboratorFull, listCollaborators } from '../models/Collaborator.js';

const router = express.Router();

// GET /api/collaborators
// Lista colaboradores - apenas RH/MASTER
router.get('/', authenticateToken, authorizeRoles(['RH','MASTER']), async (req, res) => {
  try {
    const rows = await listCollaborators();
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao listar colaboradores' });
  }
});

// POST /api/collaborators
// Cria colaborador completo e opcionalmente cria usuário vinculado.
router.post('/', authenticateToken, authorizeRoles(['RH','MASTER']), async (req, res) => {
  const { nome, email_login, senha, email_corporativo, cpf, matricula, cargo, setor, data_admissao, unidade_padrao_id = null, ativo = true, role = 'USUARIO', must_reset_password = false } = req.body;
  if (!nome || !email_login || !senha || !email_corporativo) {
    return res.status(400).json({ message: 'nome, email_login, senha e email_corporativo são obrigatórios' });
  }
  try {
    // Cria usuário com login e role
    const userId = await createUser({ email: email_login, senha, empresa_id: 1, role, must_reset_password });
    // Cria colaborador associado
    const colaboradorId = await createCollaboratorFull({
      empresa_id: 1,
      usuario_id: userId,
      nome,
      email_corporativo,
      cpf,
      matricula,
      cargo,
      setor,
      data_admissao,
      unidade_padrao_id,
      ativo
    });
    return res.status(201).json({ message: 'Colaborador cadastrado', colaboradorId, userId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao cadastrar colaborador' });
  }
});

export default router;