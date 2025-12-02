import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom'; 

const API_URL = 'http://localhost:3001';

const Header = () => {
  const { isLoggedIn, logout, user, isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
      logout();
  };
  
  const getUserName = () => {
    return (user && user.name) ? user.name.split(' ')[0] : 'Usuario';
  };

  const getUserInitials = () => {
    if (user && user.name) {
      const names = user.name.trim().split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return names[0].substring(0, 2).toUpperCase();
    }
    return 'U';
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
        {/* Solo mostramos navegación de eventos si NO es admin */}
        {!isAdmin && (
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
        )}
        
        {/* Navegación para Admins */}
        {isAdmin && (
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
              Panel de Administración
            </Link>
          </nav>
        )}

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
            // USUARIO CONECTADO - Dropdown con ícono circular
            <div className="relative flex items-center gap-4 pl-4 border-l border-gray-700">
                <div className="hidden lg:flex flex-col items-end">
                    <span className="text-xs text-gray-300">Bienvenido,</span>
                    <span className="text-sm font-bold text-primary-300 leading-none">{getUserName()}</span>
                </div>
                
                {/* Ícono circular con iniciales y dropdown */}
                {!isAdmin && (
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-slate-700"
                    >
                      {getUserInitials()}
                    </button>
                    
                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-blue-100 rounded-lg shadow-xl py-2 z-50 border-2 border-blue-300">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-3 text-base text-black hover:bg-gray-100 hover:text-gray-900 transition-colors font-bold"
                        >
                          👤 Mi Perfil
                        </Link>
                        <Link
                          to="/my-tickets"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-3 text-base text-black hover:bg-gray-100 hover:text-gray-900 transition-colors font-bold"
                        >
                          🎫 Mis Tickets
                        </Link>
                        <hr className="my-2 border-gray-300" />
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleLogout();
                          }}
                          className="block w-full text-left px-4 py-3 text-base text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-bold"
                        >
                          🚪 Salir
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Para admin, mantener botón de salir */}
                {isAdmin && (
                  <button 
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-red-400 font-medium text-sm transition-colors border border-gray-600 hover:border-red-400 rounded-lg px-3 py-1.5"
                  >
                    Salir
                  </button>
                )}
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
