import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import recordsRoutes from './routes/records.js';
import adjustmentsRoutes from './routes/adjustments.js';
import usersRoutes from './routes/users.js';
import profileRoutes from './routes/profile.js';
import collaboratorsRoutes from './routes/collaborators.js';
import eventsRoutes from './routes/events.js';
import hrRoutes from './routes/hr.js';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/adjustments', adjustmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/collaborators', collaboratorsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/hr', hrRoutes);

// Rota raiz apenas para status
app.get('/', (req, res) => {
  res.json({ message: 'Ponto Certo API está em execução' });
});

// Inicializa o servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});