import React from 'react';
import Sidebar from '../components/Sidebar';

export default function NotificationsPage() {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <h4>Notificações</h4>
        <p>Em breve você poderá visualizar notificações aqui.</p>
      </div>
    </div>
  );
}