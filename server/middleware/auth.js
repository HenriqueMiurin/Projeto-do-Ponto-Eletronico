import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

/**
 * Middleware para validar tokens JWT. Caso o token seja válido, o
 * usuário autenticado é adicionado ao objeto req (req.user). Caso
 * contrário, responde com erro 401 (não autorizado).
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

/**
 * Cria uma função middleware para autorizar usuários com base em suas
 * funções (roles). Recebe uma lista de roles permitidas e compara com
 * a role do usuário autenticado. Caso não esteja autorizado, responde
 * com 403 (proibido).
 *
 * @param {Array<string>} allowedRoles - Funções permitidas
 */
export function authorizeRoles(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    return next();
  };
}