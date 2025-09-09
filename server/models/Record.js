import { query } from '../db.js';
import { getCollaboratorByUserId } from './Collaborator.js';

/**
 * Calcula a distância em metros entre dois pares de coordenadas
 * geográficas usando a fórmula de haversine.
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distância em metros
 */
function haversine(lat1, lon1, lat2, lon2) {
  function toRad(degrees) {
    return degrees * Math.PI / 180;
  }
  const R = 6371000; // raio da Terra em metros
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Obtém todos os registros de ponto de um usuário (colaborador) ordenados por data/hora
 */
export async function getRecordsByUser(userId) {
  const collaborator = await getCollaboratorByUserId(userId);
  if (!collaborator) return [];
  const sql = `
    SELECT id, tipo, data_hora_utc, validacao_geofence, sequencia_valida, observacao
    FROM registros_ponto
    WHERE colaborador_id = ?
    ORDER BY data_hora_utc DESC
  `;
  return await query(sql, [collaborator.id]);
}

/**
 * Obtém registros de um usuário para uma data específica (YYYY-MM-DD)
 */
export async function getRecordsByUserAndDate(userId, dateIso) {
  const collaborator = await getCollaboratorByUserId(userId);
  if (!collaborator) return [];
  const sql = `
    SELECT id, tipo, data_hora_utc, validacao_geofence, sequencia_valida, observacao
    FROM registros_ponto
    WHERE colaborador_id = ? AND DATE(data_hora_utc) = ?
    ORDER BY data_hora_utc ASC
  `;
  return await query(sql, [collaborator.id, dateIso]);
}

/**
 * Obtém um resumo diário do usuário, retornando primeira entrada, última saída
 * e quantidade de divergências de geofence e de sequência para cada dia.
 */
export async function getDailySummary(userId) {
  const collaborator = await getCollaboratorByUserId(userId);
  if (!collaborator) return [];
  const sql = `
    SELECT DATE(data_hora_utc) AS dia,
           MIN(CASE WHEN tipo IN ('ENTRADA','INT_RETORNO') THEN data_hora_utc END) AS primeira_entrada,
           MAX(CASE WHEN tipo IN ('SAIDA','INT_SAIDA') THEN data_hora_utc END) AS ultima_saida,
           SUM(CASE WHEN validacao_geofence='FORA' THEN 1 ELSE 0 END) AS geofence_fora_qtd,
           SUM(CASE WHEN sequencia_valida=0 THEN 1 ELSE 0 END) AS sequencia_alerta_qtd
    FROM registros_ponto
    WHERE colaborador_id = ?
    GROUP BY DATE(data_hora_utc)
    ORDER BY dia DESC
  `;
  return await query(sql, [collaborator.id]);
}

/**
 * Cria um novo registro de ponto, validando a sequência e geofence.
 *
 * @param {Object} params
 * @param {number} params.userId - id do usuário autenticado
 * @param {string} params.tipo - tipo de marcação (ENTRADA, INT_SAIDA, INT_RETORNO, SAIDA)
 * @param {number|null} params.latitude
 * @param {number|null} params.longitude
 * @param {string|null} params.observacao
 * @param {string|null} params.ip - endereço IP de origem
 * @param {string|null} params.userAgent - user agent do cliente
 */
export async function createRecord({ userId, tipo, latitude = null, longitude = null, observacao = null, ip = null, userAgent = null }) {
  // recupera colaborador associado ao usuário
  const collaborator = await getCollaboratorByUserId(userId);
  if (!collaborator) {
    throw new Error('Colaborador não encontrado');
  }

  // data/hora atual em UTC
  const nowUtc = new Date();
  const nowDate = nowUtc.toISOString().split('T')[0];

  // busca registros do dia
  const dailyRecords = await getRecordsByUserAndDate(userId, nowDate);

  // regra: máximo 4 registros por dia
  if (dailyRecords.length >= 4) {
    return { error: 'Limite de marcações diárias atingido' };
  }

  // valida sequência: define a ordem esperada
  const sequenceOrder = ['ENTRADA', 'INT_SAIDA', 'INT_RETORNO', 'SAIDA'];
  let sequenciaValida = 1;
  if (dailyRecords.length > 0) {
    const last = dailyRecords[dailyRecords.length - 1];
    const lastIndex = sequenceOrder.indexOf(last.tipo);
    const thisIndex = sequenceOrder.indexOf(tipo);
    // sequencia só é válida se a nova marcação for a próxima na ordem
    if (thisIndex !== lastIndex + 1) {
      sequenciaValida = 0;
    }
  } else {
    // primeiro registro do dia deve ser ENTRADA
    if (tipo !== 'ENTRADA') {
      sequenciaValida = 0;
    }
  }

  // valida geofence
  let validacaoGeofence = 'INDEFINIDO';
  if (latitude !== null && longitude !== null) {
    const latRef = parseFloat(process.env.GEOFENCE_LAT || '0');
    const lonRef = parseFloat(process.env.GEOFENCE_LON || '0');
    const raio = parseFloat(process.env.GEOFENCE_RADIUS || '0');
    const dist = haversine(latitude, longitude, latRef, lonRef);
    validacaoGeofence = dist <= raio ? 'DENTRO' : 'FORA';
  }

  // insere registro
  const insertSql = `
    INSERT INTO registros_ponto (
      colaborador_id,
      tipo,
      data_hora_utc,
      latitude,
      longitude,
      origem,
      validacao_geofence,
      sequencia_valida,
      observacao,
      ip_origem,
      user_agent
    ) VALUES (?, ?, UTC_TIMESTAMP(), ?, ?, 'WEB', ?, ?, ?, ?, ?)
  `;
  const result = await query(insertSql, [
    collaborator.id,
    tipo,
    latitude,
    longitude,
    validacaoGeofence,
    sequenciaValida,
    observacao,
    ip,
    userAgent
  ]);

  // retorna o registro criado
  return {
    id: result.insertId,
    tipo,
    data_hora_utc: nowUtc,
    validacao_geofence: validacaoGeofence,
    sequencia_valida: sequenciaValida
  };
}