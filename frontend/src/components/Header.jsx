import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom'; 

const API_URL = 'http://localhost:3001';

const Header = () => {
  const { isLoggedIn, logout, user, isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // Para saber en qué página estamos y resaltarla

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (e) {
        console.error("Error al cargar categorías", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []); 

  const handleLogout = () => {
      logout();
  };
  
  const getUserName = () => {
    return (user && user.name) ? user.name.split(' ')[0] : 'Usuario';
  };

  // Clases comunes para los enlaces de navegación (Estilo de botón suave)
  // px-3 py-2: Da "cuerpo" al enlace (padding horizontal y vertical)
  // rounded-md: Bordes redondeados
  // hover:bg-gray-700: Efecto visual al pasar el mouse
  const navLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-secondary-600 text-white shadow-sm' // Estilo si es la página actual
        : 'text-gray-100 hover:bg-slate-600 hover:text-white' // Estilo normal
    }`;
  };
  
  return (
    <header className="bg-slate-700 text-white shadow-lg sticky top-0 z-50 border-b border-slate-600">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        
        {/* --- SECCIÓN IZQUIERDA: LOGO --- */}
        <div className="flex-shrink-0 flex items-center">
          <Link to="/" className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {/* Icono decorativo opcional */}
            <span className="text-primary-400">⚡</span>
            MyTicket.com
          </Link>
        </div>

        {/* --- SECCIÓN CENTRAL: NAVEGACIÓN --- */}
        {/* Usamos 'gap-2' para separar cada botón y 'hidden md:flex' para ocultarlo en móviles */}
        <nav className="hidden md:flex items-center gap-2">
          
          <Link to="/" className={navLinkClass('/')}>
            Inicio
          </Link>
          
          {loading && <span className="text-xs text-gray-500 animate-pulse">Cargando...</span>}

          {!loading && categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/events/${category.slug}`} 
              className={navLinkClass(`/events/${category.slug}`)}
            >
              {category.name}
            </Link>
          ))}
        </nav>

        {/* --- SECCIÓN DERECHA: USUARIO Y ACCIONES --- */}
        {/* Usamos 'gap-4' para separar los botones de acción del saludo */}
        <div className="flex items-center gap-4">
          
          {/* BOTÓN CREAR (Solo Admin) */}
          {isAdmin && (
            <Link 
                to="/admin/dashboard"
                className="hidden sm:flex items-center gap-2 bg-blue-400 hover:bg-blue-500 text-blue-900 font-bold py-1.5 px-4 rounded-full transition duration-150 text-sm shadow-md transform hover:scale-105"
            >
                <span></span> Admin
            </Link>
          )}

          {isLoggedIn ? (
            // USUARIO CONECTADO
            <div className="flex items-center gap-4 pl-4 border-l border-gray-700">
                <div className="hidden lg:flex flex-col items-end">
                    <span className="text-xs text-gray-300">Bienvenido,</span>
                    <span className="text-sm font-bold text-primary-300 leading-none">{getUserName()}</span>
                </div>
                
                <Link 
                  to="/my-tickets"
                  className="text-gray-300 hover:text-primary-400 font-medium text-sm transition-colors border border-gray-600 hover:border-primary-400 rounded-lg px-3 py-1.5"
                >
                  Mis Tickets
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-red-400 font-medium text-sm transition-colors border border-gray-600 hover:border-red-400 rounded-lg px-3 py-1.5"
                >
                  Salir
                </button>
            </div>
          ) : (
            // USUARIO DESCONECTADO
            <div className="flex items-center gap-3">
                <Link 
                    to="/login" 
                    className="text-gray-100 hover:text-white font-medium text-sm transition-colors"
                >
                    Ingresar
                </Link>
                <Link 
                    to="/register"
                    className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md text-sm"
                >
                    Registrarse
                </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
