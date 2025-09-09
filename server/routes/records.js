import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createRecord, getRecordsByUser, getDailySummary } from '../models/Record.js';

const router = express.Router();

/**
 * POST /api/records
 * Registra uma nova marcação de ponto para o usuário autenticado.
 * Exemplo de corpo: { "tipo": "ENTRADA", "latitude": -23.5, "longitude": -46.6, "observacao": "cheguei" }
 */
router.post('/', authenticateToken, async (req, res) => {
  const { tipo, latitude = null, longitude = null, observacao = null } = req.body;
  const validTypes = ['ENTRADA', 'INT_SAIDA', 'INT_RETORNO', 'SAIDA'];
  if (!validTypes.includes(tipo)) {
    return res.status(400).json({ message: 'Tipo de marcação inválido' });
  }
  try {
    const result = await createRecord({
      userId: req.user.id,
      tipo,
      latitude,
      longitude,
      observacao,
      ip: req.ip || null,
      userAgent: req.get('User-Agent') || null
    });
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }
    return res.status(201).json({ message: 'Ponto registrado', record: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao registrar ponto' });
  }
});

/**
 * GET /api/records
 * Retorna todas as marcações do usuário autenticado.
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const records = await getRecordsByUser(req.user.id);
    return res.json(records);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao obter registros' });
  }
});

/**
 * GET /api/records/daily
 * Retorna um resumo diário das marcações do usuário autenticado (primeira entrada, última saída, divergências).
 */
router.get('/daily', authenticateToken, async (req, res) => {
  try {
    const summary = await getDailySummary(req.user.id);
    return res.json(summary);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao obter resumo diário' });
  }
});

export default router;