import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Ao montar, carrega dados do localStorage se existirem
  useEffect(() => {
    const stored = localStorage.getItem('pontoAuth');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user);
      setToken(parsed.token);
    }
  }, []);

  function login(data) {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('pontoAuth', JSON.stringify(data));
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pontoAuth');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}