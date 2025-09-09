import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './utils/AuthContext';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import ClockPage from './pages/Clock';
import HistoryPage from './pages/History';
import DaySummary from './pages/DaySummary';
import AdjustmentPage from './pages/Adjustment';
import RequestsPage from './pages/Requests';
import UsersPage from './pages/Users';
import TimesheetRH from './pages/TimesheetRH';
import MonitoringRH from './pages/MonitoringRH';
import EventsRH from './pages/EventsRH';
import ColabRegistration from './pages/ColabRegistration';
import Profile from './pages/Profile';
import Support from './pages/Support';
import ResetPassword from './pages/ResetPassword';
import FirstPasswordChange from './pages/FirstPasswordChange';
import Approvals from './pages/Approvals';
import Layout from './components/Layout';

function App() {
  const { user } = useAuth();

  if (!user) {
    // Para usuários não autenticados, exibimos tela de login ou redefinição de senha
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset" element={<ResetPassword />} />
        {/* Qualquer outra rota não autenticada redireciona para login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // Se o usuário precisa redefinir a senha no primeiro acesso, restringe a navegação
  if (user && user.mustResetPassword) {
    return (
      <Routes>
        <Route path="/first-change-password" element={<FirstPasswordChange />} />
        {/* Redireciona qualquer outra rota para a página de alteração de senha */}
        <Route path="*" element={<Navigate to="/first-change-password" />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clock" element={<ClockPage />} />
        <Route path="/history" element={<HistoryPage />} />
        {/* Resumo detalhado de um dia específico */}
        <Route path="/summary/:date" element={<DaySummary />} />
        <Route path="/summary" element={<DaySummary />} />
        <Route path="/adjustment" element={<AdjustmentPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/users" element={<UsersPage />} />
        {/* Rotas exclusivas para RH/master */}
        <Route path="/timesheet" element={<TimesheetRH />} />
        <Route path="/monitor" element={<MonitoringRH />} />
        <Route path="/events" element={<EventsRH />} />
        <Route path="/register-collab" element={<ColabRegistration />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;