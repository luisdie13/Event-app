import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_ROLE_ID = 5;

/**
 * Componente que protege las rutas de administración.
 * Permite el acceso solo si el usuario está logueado Y tiene el rol de administrador (ID 5).
 * En React Router v6, se usa <Outlet /> para renderizar las rutas anidadas (child routes).
 */
const AdminRoute = () => {
    const { isLoggedIn, user, loading } = useAuth();
    
    // Si todavía estamos cargando la sesión, muestra un indicador
    if (loading) {
        return <div className="text-center mt-20 text-xl">Cargando sesión...</div>;
    }
    
    // 1. Verificar Autenticación
    if (!isLoggedIn) {
        // No logueado: Redirigir al login y guardar la ruta actual en 'state'
        return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
    }

    // 2. Verificar Rol
    // Nota: user.role_id viene del contexto y es un número.
    if (user && user.role_id !== ADMIN_ROLE_ID) {
        // Logueado, pero no es admin (ID 5): Redirigir a la página principal
        return <Navigate to="/" replace />;
    }

    // 3. Es Admin y está logueado: Permitir el acceso a las rutas anidadas
    // Este es el punto crucial que permite renderizar el componente hijo (AdminDashboard)
    return <Outlet />;
};

export default AdminRoute;