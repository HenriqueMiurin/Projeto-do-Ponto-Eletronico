import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { createAdjustment, getAdjustmentsByUser, listPendingAdjustments, decideAdjustment } from '../models/Adjustment.js';

const router = express.Router();

/**
 * POST /api/adjustments
 * Cria uma nova solicitação de ajuste para o usuário autenticado.
 * Exemplo de corpo: { "novoTipo": "ENTRADA", "novaDataHora": "2025-08-31T08:00", "motivo": "Esqueci de registrar" }
 */
router.post('/', authenticateToken, async (req, res) => {
  const { pontoId = null, novoTipo, novaDataHora, motivo } = req.body;
  const validTypes = ['ENTRADA', 'INT_SAIDA', 'INT_RETORNO', 'SAIDA'];
  if (!novoTipo || !novaDataHora || !motivo) {
    return res.status(400).json({ message: 'novoTipo, novaDataHora e motivo são obrigatórios' });
  }
  if (!validTypes.includes(novoTipo)) {
    return res.status(400).json({ message: 'Tipo de marcação inválido' });
  }
  try {
    const ajusteId = await createAdjustment({ userId: req.user.id, pontoId, novoTipo, novaDataHora, motivo });
    return res.status(201).json({ message: 'Solicitação criada', ajusteId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao criar solicitação' });
  }
});

/**
 * GET /api/adjustments
 * Retorna todas as solicitações do usuário autenticado.
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const ajustes = await getAdjustmentsByUser(req.user.id);
    return res.json(ajustes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao obter solicitações' });
  }
});

/**
 * GET /api/adjustments/pending
 * Lista todas as solicitações pendentes. Acesso restrito a gestores/RH.
 */
router.get('/pending', authenticateToken, authorizeRoles(['GESTOR','RH','MASTER']), async (req, res) => {
  try {
    const pendentes = await listPendingAdjustments();
    return res.json(pendentes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao listar pendentes' });
  }
});

/**
 * POST /api/adjustments/:id/decide
 * Aprova ou rejeita uma solicitação pendente. Apenas gestores/RH.
 * Corpo: { "status": "APROVADO", "comentario": "Ok" }
 */
router.post('/:id/decide', authenticateToken, authorizeRoles(['GESTOR','RH','MASTER']), async (req, res) => {
  const { id } = req.params;
  const { status, comentario = '' } = req.body;
  if (!['APROVADO','REJEITADO'].includes(status)) {
    return res.status(400).json({ message: 'Status inválido' });
  }
  try {
    await decideAdjustment({ ajusteId: id, status, analistaId: req.user.id, comentario });
    return res.json({ message: 'Decisão registrada' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao atualizar solicitação' });
  }
});

export default router;