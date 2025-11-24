// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

// URL base de tu backend
const API_URL = 'http://localhost:3001';

// 1. Crea el Contexto
export const AuthContext = createContext({
  user: null, // Objeto de usuario (id, name, email, role_id)
  token: null, // Token JWT
  isLoggedIn: false,
  login: () => {}, // Función para iniciar sesión
  logout: () => {}, // Función para cerrar sesión
});

// 2. Crea el Provider (el componente que proveerá el estado)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // 3. Verifica la sesión al cargar la aplicación
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (e) {
        // Limpia el localStorage si los datos están corruptos
        localStorage.clear();
      }
    }
  }, []);

  // 4. Función de Login (maneja la respuesta exitosa del formulario)
  const login = (userData, jwtToken) => {
    localStorage.setItem('authToken', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  // 5. Función de Logout
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const contextValue = {
    user,
    token,
    isLoggedIn: !!user, // Booleano: ¿Hay un usuario?
    isAdmin: user?.role_id === 5, // Booleano: ¿Es administrador?
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
    return useContext(AuthContext);
};
