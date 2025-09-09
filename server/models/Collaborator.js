import { query } from '../db.js';

/**
 * Cria um novo colaborador vinculado a um usuário. O colaborador
 * representa o colaborador/cadastro funcional com nome, email
 * corporativo, etc.
 *
 * @param {Object} data
 * @param {number} data.usuario_id - ID do usuário ao qual o colaborador está associado
 * @param {number} data.empresa_id - ID da empresa
 * @param {string} data.nome - Nome completo do colaborador
 * @param {string} data.email_corporativo - E-mail corporativo
 */
export async function createCollaborator({ usuario_id, empresa_id, nome, email_corporativo }) {
  const sql = `
    INSERT INTO colaboradores (empresa_id, usuario_id, nome, email_corporativo, ativo)
    VALUES (?, ?, ?, ?, 1)
  `;
  const result = await query(sql, [empresa_id, usuario_id, nome, email_corporativo]);
  return result.insertId;
}

/**
 * Cria um colaborador com dados completos utilizados pelo RH. É
 * destinado ao cadastro via painel de RH e requer que o usuário já
 * exista (usuario_id). Caso o usuário ainda não exista, ele deve
 * ser criado antes.
 */
export async function createCollaboratorFull({ empresa_id, usuario_id, nome, email_corporativo, cpf = null, matricula = null, cargo = null, setor = null, data_admissao = null, unidade_padrao_id = null, ativo = true }) {
  const sql = `
    INSERT INTO colaboradores (
      empresa_id, usuario_id, nome, email_corporativo, cpf, matricula,
      cargo, setor, data_admissao, unidade_padrao_id, ativo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [
    empresa_id,
    usuario_id,
    nome,
    email_corporativo,
    cpf,
    matricula,
    cargo,
    setor,
    data_admissao,
    unidade_padrao_id,
    ativo ? 1 : 0
  ]);
  return result.insertId;
}

/**
 * Lista colaboradores com informações de usuário, jornada padrão (unidade) e status. Útil para RH.
 */
export async function listCollaborators() {
  const sql = `
    SELECT c.id, c.nome, c.email_corporativo, c.cpf, c.matricula, c.cargo, c.setor, c.data_admissao, c.ativo,
           u.email AS login_email, u.role
    FROM colaboradores c
    LEFT JOIN usuarios u ON u.id = c.usuario_id
    ORDER BY c.nome
  `;
  return await query(sql);
}

/**
 * Recupera as informações do colaborador a partir do id do usuário.
 */
export async function getCollaboratorByUserId(usuario_id) {
  const rows = await query('SELECT * FROM colaboradores WHERE usuario_id = ? LIMIT 1', [usuario_id]);
  return rows[0] || null;
}

/**
 * Retorna um colaborador pelo id
 */
export async function getCollaboratorById(colaborador_id) {
  const rows = await query('SELECT * FROM colaboradores WHERE id = ? LIMIT 1', [colaborador_id]);
  return rows[0] || null;
}