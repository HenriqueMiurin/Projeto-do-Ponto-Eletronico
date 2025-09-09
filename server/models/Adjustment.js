import { query } from '../db.js';
import { getCollaboratorByUserId } from './Collaborator.js';

/**
 * Cria uma solicitação de ajuste de ponto. A data/hora informada deve
 * estar em ISO 8601 (local), será convertida para UTC pelo banco. O
 * colaborador é identificado a partir do userId.
 *
 * @param {Object} params
 * @param {number} params.userId
 * @param {number|null} params.pontoId - id do registro original (pode ser nulo)
 * @param {string} params.novoTipo
 * @param {string} params.novaDataHora - data/hora em formato ISO local (YYYY-MM-DDTHH:mm)
 * @param {string} params.motivo
 */
export async function createAdjustment({ userId, pontoId = null, novoTipo, novaDataHora, motivo }) {
  const collaborator = await getCollaboratorByUserId(userId);
  if (!collaborator) {
    throw new Error('Colaborador não encontrado');
  }
  const sql = `
    INSERT INTO solicitacoes_ajuste (
      colaborador_id,
      ponto_id,
      novo_tipo,
      nova_data_hora_utc,
      motivo,
      status,
      created_at
    ) VALUES (?, ?, ?, ?, ?, 'PENDENTE', UTC_TIMESTAMP())
  `;
  // Converte data/hora local para UTC no MySQL usando CONVERT_TZ; se o
  // campo novaDataHora já estiver em UTC, pode-se ajustá-lo no front.
  // Para simplicidade, assumimos que vem no formato ISO local e usamos
  // a função CONVERT_TZ no SQL; aqui substituímos na query.
  // Entretanto, a API do mysql2 não permite usar funções no VALUES
  // facilmente, portanto fazemos a conversão no código JavaScript.
  const newDate = new Date(novaDataHora);
  const utc = new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000);
  const result = await query(sql, [
    collaborator.id,
    pontoId,
    novoTipo,
    utc.toISOString().slice(0, 19).replace('T', ' '),
    motivo
  ]);
  return result.insertId;
}

/**
 * Lista solicitações de ajuste de um colaborador
 */
export async function getAdjustmentsByUser(userId) {
  const collaborator = await getCollaboratorByUserId(userId);
  if (!collaborator) return [];
  const sql = `
    SELECT id, ponto_id, novo_tipo, nova_data_hora_utc, motivo, status, analista_id, comentario_decisao, created_at
    FROM solicitacoes_ajuste
    WHERE colaborador_id = ?
    ORDER BY created_at DESC
  `;
  return await query(sql, [collaborator.id]);
}

/**
 * Lista todas as solicitações pendentes para avaliação (admin ou gestor).
 */
export async function listPendingAdjustments() {
  const sql = `
    SELECT sa.id, c.nome AS nome_colaborador, sa.novo_tipo, sa.nova_data_hora_utc, sa.motivo,
           sa.status, sa.created_at
    FROM solicitacoes_ajuste sa
    JOIN colaboradores c ON c.id = sa.colaborador_id
    WHERE sa.status = 'PENDENTE'
    ORDER BY sa.created_at ASC
  `;
  return await query(sql);
}

/**
 * Aprova ou rejeita uma solicitação de ajuste. Atualiza o status e
 * registra o analista e comentário. Não lida com a substituição do
 * registro original; isso deve ser tratado em alto nível.
 *
 * @param {Object} params
 * @param {number} params.ajusteId
 * @param {string} params.status - 'APROVADO' ou 'REJEITADO'
 * @param {number} params.analistaId
 * @param {string} params.comentario
 */
export async function decideAdjustment({ ajusteId, status, analistaId, comentario }) {
  const sql = `
    UPDATE solicitacoes_ajuste
    SET status = ?, analista_id = ?, comentario_decisao = ?, decided_at = UTC_TIMESTAMP()
    WHERE id = ?
  `;
  await query(sql, [status, analistaId, comentario, ajusteId]);
}