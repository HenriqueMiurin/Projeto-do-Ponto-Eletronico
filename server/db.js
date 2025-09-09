import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

/**
 * Cria um pool de conexões com o banco de dados MySQL. O uso de pool
 * permite que múltiplas requisições reutilizem conexões já abertas,
 * melhorando a performance em ambientes com muitos acessos simultâneos.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ponto_mvp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z' // utiliza UTC como padrão
});

/**
 * Exporta uma função utilitária para executar queries SQL. Ela captura
 * automaticamente erros e garante que a conexão seja liberada após o uso.
 *
 * @param {string} sql - Instrução SQL a ser executada
 * @param {Array} params - Parâmetros para a instrução
 * @returns {Promise<Object>} Resultado da consulta
 */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export default pool;