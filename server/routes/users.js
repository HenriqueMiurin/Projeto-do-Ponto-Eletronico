import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { listUsers, createUser, unlockUser } from '../models/User.js';
import { createCollaborator } from '../models/Collaborator.js';

const router = express.Router();

/**
 * GET /api/users
 * Lista todos os usuários do sistema. Acesso restrito a gestores/RH.
 */
router.get('/', authenticateToken, authorizeRoles(['GESTOR','RH','MASTER']), async (req, res) => {
  try {
    const users = await listUsers();
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao listar usuários' });
  }
});

/**
 * POST /api/users
 * Cadastra um novo usuário e colaborador. Acesso restrito a gestores/RH.
 */
router.post('/', authenticateToken, authorizeRoles(['GESTOR','RH','MASTER']), async (req, res) => {
  const { nome, email, senha, email_corporativo, empresa_id = 1, role = 'USUARIO' } = req.body;
  if (!nome || !email || !senha || !email_corporativo) {
    return res.status(400).json({ message: 'nome, email, senha e email_corporativo são obrigatórios' });
  }
  try {
    const userId = await createUser({ email, senha, empresa_id, role });
    await createCollaborator({ usuario_id: userId, empresa_id, nome, email_corporativo });
    return res.status(201).json({ message: 'Usuário criado', userId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao criar usuário' });
  }
});

/**
 * PATCH /api/users/:id/unlock
 * Desbloqueia um usuário (zera tentativas falhadas e remove bloqueio).
 * Acesso restrito a gestores, RH ou master.
 */
router.patch('/:id/unlock', authenticateToken, authorizeRoles(['GESTOR','RH','MASTER']), async (req, res) => {
  const { id } = req.params;
  try {
    await unlockUser(id);
    return res.json({ message: 'Usuário desbloqueado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao desbloquear usuário' });
  }
});

export default router;