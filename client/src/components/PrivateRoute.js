import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

/**
 * Componente de rota protegida. Se o usuário estiver autenticado,
 * renderiza o componente. Caso contrário, redireciona para a página de login.
 */
export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}