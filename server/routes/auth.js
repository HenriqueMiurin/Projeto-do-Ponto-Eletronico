import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getUserByEmail, createUser, verifyPassword, incrementFailedAttempts, resetFailedAttempts, lockUserUntil } from '../models/User.js';
import { createCollaborator } from '../models/Collaborator.js';

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

/**
 * POST /api/auth/login
 * Autentica o usuário com e-mail e senha. Retorna um token JWT e
 * algumas informações básicas do usuário. Se as credenciais forem
 * inválidas, retorna 401.
 */
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
  }
  try {
    const user = await getUserByEmail(email);
    // Usuário não encontrado
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    // Verifica se conta está ativa
    if (!user.is_active) {
      return res.status(403).json({ message: 'Conta desativada. Entre em contato com o administrador.' });
    }
    // Verifica se conta está bloqueada
    const now = new Date();
    if (user.locked_until && new Date(user.locked_until) > now) {
      return res.status(403).json({ message: `Conta bloqueada até ${new Date(user.locked_until).toLocaleString()}` });
    }
    // Verifica senha
    const isValid = await verifyPassword(senha, user.senha_hash);
    if (!isValid) {
      // Incrementa tentativas
      await incrementFailedAttempts(user.id);
      const attempts = user.failed_attempts + 1;
      // Se exceder 5 tentativas, bloqueia por 30 minutos
      if (attempts >= 5) {
        const unlockTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutos
        await lockUserUntil(user.id, unlockTime);
        return res.status(403).json({ message: 'Conta bloqueada devido a múltiplas tentativas. Tente novamente mais tarde.' });
      }
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    // Reset tentativas e bloqueio se autenticação for bem-sucedida
    await resetFailedAttempts(user.id);
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        mustResetPassword: !!user.must_reset_password
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao autenticar' });
  }
});

/**
 * POST /api/auth/register
 * Cria um novo usuário e colaborador. Requer e-mail, senha, nome e
 * email_corporativo. Apenas administradores devem utilizar este
 * endpoint. Neste projeto de exemplo ele está aberto para facilitar
 * cadastros.
 */
router.post('/register', async (req, res) => {
  const { nome, email, senha, email_corporativo, empresa_id = 1, role = 'USUARIO' } = req.body;
  if (!nome || !email || !senha || !email_corporativo) {
    return res.status(400).json({ message: 'nome, email, senha e email_corporativo são obrigatórios' });
  }
  try {
    // cria usuário
    const userId = await createUser({ email, senha, empresa_id, role });
    // cria colaborador
    await createCollaborator({ usuario_id: userId, empresa_id, nome, email_corporativo });
    return res.status(201).json({ message: 'Usuário criado com sucesso', userId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao criar usuário' });
  }
});

/**
 * POST /api/auth/reset
 * Solicita redefinição de senha. Apenas envia mensagem de confirmação;
 * não implementa envio de e-mail nesta versão.
 */
router.post('/reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email é obrigatório' });
  // Aqui você poderia gerar token e enviar e-mail para o usuário.
  return res.json({ message: 'Se existir conta para este e-mail, enviaremos instruções' });
});

export default router;