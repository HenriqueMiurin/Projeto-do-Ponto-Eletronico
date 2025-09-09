import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { query } from '../db.js';
import { getCollaboratorById, getCollaboratorByUserId } from '../models/Collaborator.js';

const router = express.Router();

// GET /api/events
// Lista eventos - RH ou colaborador vê os próprios eventos
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (['RH','MASTER'].includes(req.user.role)) {
      // RH: vê todos eventos
      const rows = await query(`
        SELECT e.id, e.tipo, e.inicio, e.fim, e.descricao, c.nome as colaborador
        FROM eventos_calendario e
        LEFT JOIN colaboradores c ON c.id = e.colaborador_id
        ORDER BY e.inicio DESC
      `);
      return res.json(rows);
    } else {
      // Usuário comum: vê apenas seus eventos
      const colab = await getCollaboratorByUserId(req.user.id);
      if (!colab) return res.json([]);
      const rows = await query(`
        SELECT id, tipo, inicio, fim, descricao
        FROM eventos_calendario
        WHERE colaborador_id = ?
        ORDER BY inicio DESC
      `, [colab.id]);
      return res.json(rows);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao listar eventos' });
  }
});

// POST /api/events
// Cria um novo evento. Apenas RH/Master.
router.post('/', authenticateToken, authorizeRoles(['RH','MASTER']), async (req, res) => {
  const { colaborador_id, tipo, inicio, fim, descricao } = req.body;
  if (!colaborador_id || !tipo || !inicio || !fim) {
    return res.status(400).json({ message: 'colaborador_id, tipo, inicio e fim são obrigatórios' });
  }
  try {
    // valida colaborador
    const colab = await getCollaboratorById(colaborador_id);
    if (!colab) {
      return res.status(400).json({ message: 'Colaborador inexistente' });
    }
    await query(`
      INSERT INTO eventos_calendario (empresa_id, colaborador_id, tipo, inicio, fim, descricao, criado_por)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [colab.empresa_id, colaborador_id, tipo, inicio, fim, descricao, req.user.id]);
    return res.status(201).json({ message: 'Evento criado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao criar evento' });
  }
});

export default router;