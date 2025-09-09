import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { query } from '../db.js';

const router = express.Router();

// GET /api/hr/summary
// Retorna resumo de ponto de todos colaboradores em um intervalo de datas. Apenas RH/Master.
router.get('/summary', authenticateToken, authorizeRoles(['RH','MASTER']), async (req, res) => {
  let { start, end } = req.query;
  if (!start || !end) {
    // padrão: últimos 7 dias
    const now = new Date();
    end = now.toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    start = sevenDaysAgo.toISOString().slice(0, 10);
  }
  try {
    const sql = `
      SELECT c.id AS colaborador_id, c.nome, c.matricula, c.setor, c.email_corporativo,
             DATE(rp.data_hora_utc) AS dia,
             MIN(CASE WHEN rp.tipo IN ('ENTRADA','INT_RETORNO') THEN rp.data_hora_utc END) AS primeira_entrada,
             MAX(CASE WHEN rp.tipo IN ('SAIDA','INT_SAIDA') THEN rp.data_hora_utc END) AS ultima_saida,
             SUM(CASE WHEN rp.validacao_geofence='FORA' THEN 1 ELSE 0 END) AS geofence_fora_qtd,
             SUM(CASE WHEN rp.sequencia_valida=0 THEN 1 ELSE 0 END) AS sequencia_alerta_qtd,
             COUNT(rp.id) AS total_batidas,
             GREATEST(0, TIMESTAMPDIFF(MINUTE,
               MIN(CASE WHEN rp.tipo IN ('ENTRADA','INT_RETORNO') THEN rp.data_hora_utc END),
               MAX(CASE WHEN rp.tipo IN ('SAIDA','INT_SAIDA') THEN rp.data_hora_utc END)
             ) - 60) AS horas_trabalhadas_min
      FROM colaboradores c
      LEFT JOIN registros_ponto rp
        ON rp.colaborador_id = c.id AND DATE(rp.data_hora_utc) BETWEEN ? AND ?
      GROUP BY c.id, DATE(rp.data_hora_utc)
      ORDER BY c.nome, dia;
    `;
    const rows = await query(sql, [start, end]);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao gerar resumo' });
  }
});

export default router;