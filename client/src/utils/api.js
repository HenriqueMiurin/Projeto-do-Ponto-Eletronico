import axios from 'axios';
import { useAuth } from './AuthContext';

// Base URL of our API (adjust if your backend runs on different port)
export const apiBaseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

/**
 * Cria uma instância do axios com configuração básica. Não podemos
 * acessar o contexto dentro deste arquivo diretamente, então o header
 * de autorização será definido nos componentes que chamarem a API.
 */
export function createApiClient(token) {
  const instance = axios.create({
    baseURL: apiBaseURL
  });
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  return instance;
}