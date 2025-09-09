import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getUserById, verifyPassword } from '../models/User.js';
import { getCollaboratorByUserId } from '../models/Collaborator.js';
import { query } from '../db.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET /api/profile
// Retorna informações de usuário e colaborador
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    const collaborator = await getCollaboratorByUserId(req.user.id);
    return res.json({ user, collaborator });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao carregar perfil' });
  }
});

// POST /api/profile/change-password
// Permite ao usuário alterar a própria senha. Exige senha atual e nova senha.
router.post('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ message: 'Nova senha é obrigatória' });
  }
  try {
    const user = await getUserById(req.user.id);
    // Se o usuário está em modo de troca obrigatória de senha, não exige senha atual
    if (user.must_reset_password) {
      const hash = await bcrypt.hash(newPassword, 10);
      await query(
        'UPDATE usuarios SET senha_hash = ?, password_updated_at = NOW(), must_reset_password = 0 WHERE id = ?',
        [hash, req.user.id]
      );
      return res.json({ message: 'Senha definida com sucesso' });
    }
    // Para demais usuários, exige a senha atual
    if (!currentPassword) {
      return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
    }
    const valid = await verifyPassword(currentPassword, user.senha_hash);
    if (!valid) {
      return res.status(400).json({ message: 'Senha atual incorreta' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE usuarios SET senha_hash = ?, password_updated_at = NOW() WHERE id = ?', [hash, req.user.id]);
    return res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao alterar senha' });
  }
});

export default router;