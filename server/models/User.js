import bcrypt from 'bcryptjs';
import { query } from '../db.js';

const SALT_ROUNDS = 10;

/**
 * Recupera um usuário pelo e-mail. Se não existir retorna null.
 *
 * @param {string} email
 */
export async function getUserByEmail(email) {
  const rows = await query('SELECT * FROM usuarios WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

/**
 * Recupera um usuário pelo id. Se não existir retorna null.
 *
 * @param {number} id
 */
export async function getUserById(id) {
  const rows = await query('SELECT * FROM usuarios WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

/**
 * Cria um novo usuário com nome, e-mail e senha. A senha é
 * armazenada usando hash bcrypt. Por padrão o novo usuário terá o
 * papel "USUARIO". Retorna o id do usuário criado.
 *
 * @param {Object} user
 * @param {string} user.email
 * @param {string} user.nome
 * @param {string} user.senha
 */
export async function createUser({ email, senha, empresa_id = 1, role = 'USUARIO', must_reset_password = false }) {
  /**
   * Cria um usuário na tabela `usuarios`. O nome do colaborador não é
   * armazenado aqui (pertence a `colaboradores`). A coluna
   * `must_reset_password` é configurável.
   */
  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  const result = await query(
    'INSERT INTO usuarios (empresa_id, email, senha_hash, role, must_reset_password) VALUES (?, ?, ?, ?, ?)',
    [empresa_id, email, senhaHash, role, must_reset_password ? 1 : 0]
  );
  return result.insertId;
}

/**
 * Verifica se a senha fornecida coincide com a senha armazenada no usuário.
 *
 * @param {string} passwordPlain
 * @param {string} passwordHash
 */
export async function verifyPassword(passwordPlain, passwordHash) {
  return await bcrypt.compare(passwordPlain, passwordHash);
}

/**
 * Lista todos os usuários do sistema. Destinado a administradores.
 */
export async function listUsers() {
  /**
   * Lista usuários juntando informações da tabela `colaboradores` para
   * expor o nome. Caso o usuário ainda não possua um colaborador
   * associado, o nome retornado será nulo.
   *
   * Inclui também campos de falhas de login (failed_attempts) e data de
   * bloqueio (locked_until) para permitir monitoramento e desbloqueio
   * via interface administrativa.
   */
  const sql = `
    SELECT u.id, u.email, u.role, u.is_active,
           u.failed_attempts, u.locked_until,
           c.nome as nome_completo
    FROM usuarios u
    LEFT JOIN colaboradores c ON c.usuario_id = u.id
    ORDER BY c.nome, u.email
  `;
  return await query(sql);
}

/**
 * Incrementa o número de tentativas de login sem sucesso para o usuário.
 * Não retorna nenhum valor.
 *
 * @param {number} userId
 */
export async function incrementFailedAttempts(userId) {
  const sql = `UPDATE usuarios SET failed_attempts = failed_attempts + 1 WHERE id = ?`;
  await query(sql, [userId]);
}

/**
 * Reseta as tentativas falhadas de login e remove qualquer bloqueio
 * configurado para o usuário.
 *
 * @param {number} userId
 */
export async function resetFailedAttempts(userId) {
  const sql = `UPDATE usuarios SET failed_attempts = 0, locked_until = NULL WHERE id = ?`;
  await query(sql, [userId]);
}

/**
 * Bloqueia o usuário até a data/hora informada e zera as tentativas.
 *
 * @param {number} userId
 * @param {string|Date} until - Data/hora até quando o usuário ficará bloqueado
 */
export async function lockUserUntil(userId, until) {
  const sql = `UPDATE usuarios SET locked_until = ?, failed_attempts = 0 WHERE id = ?`;
  await query(sql, [until, userId]);
}

/**
 * Desbloqueia o usuário, removendo o bloqueio e zerando tentativas
 * falhadas. Também garante que o usuário fique ativo.
 *
 * @param {number} userId
 */
export async function unlockUser(userId) {
  const sql = `UPDATE usuarios SET locked_until = NULL, failed_attempts = 0, is_active = 1 WHERE id = ?`;
  await query(sql, [userId]);
}