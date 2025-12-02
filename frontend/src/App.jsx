// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Importación de Componentes
import Header from './components/Header';
import Home from './components/Home';
import EventList from './components/EventList';
import EventDetail from './components/EventDetail'; 
import RegisterForm from './components/RegisterForm'; 
import LoginForm from './components/LoginForm';       
import CreateEventForm from './components/CreateEventForm';
import AdminDashboard from './components/AdminDashboard';
import MyTickets from './components/MyTickets';
import Profile from './components/Profile';

// Importación de Páginas (Nuevas)
import CheckoutPage from './pages/CheckoutPage';

// Importación de Rutas Protegidas
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header /> 
      
      <Routes>
        {/* --- Rutas Públicas --- */}
        <Route path="/" element={<Home />} /> 
        <Route path="/events" element={<EventList />} />
        <Route path="/events/:categorySlug" element={<EventList />} /> 
        <Route path="/event/:slug" element={<EventDetail />} /> 
        
        {/* --- Rutas de Autenticación --- */}
        <Route path="/register" element={<RegisterForm />} /> 
        <Route path="/login" element={<LoginForm />} />       
        
        {/* --- Rutas Transaccionales (Requieren Login, manejado dentro del componente) --- */}
        {/* 👈 NUEVO: Esta es la ruta que hace funcionar el botón de compra */}
        <Route path="/checkout/:eventId" element={<CheckoutPage />} />
        
        {/* --- Ruta para ver tickets del usuario --- */}
        <Route path="/my-tickets" element={<MyTickets />} />
        
        {/* --- Ruta para perfil de usuario --- */}
        <Route path="/profile" element={<Profile />} />

        {/* --- Rutas de Administración (Protegidas por Rol) --- */}
        <Route path="/admin" element={<AdminRoute />}>
            {/* El Dashboard es la vista principal del admin */}
            <Route path="dashboard" element={<AdminDashboard />} />
            
            {/* Redirecciones de conveniencia para rutas viejas de admin */}
            <Route path="create-event" element={<AdminDashboard />} /> 
        </Route>
        
        {/* Redirección legacy para /create-event (redirige al dashboard) */}
        <Route path="/create-event" element={<AdminRoute />}>
             <Route index element={<AdminDashboard />} />
        </Route>
        
        {/* --- Página 404 --- */}
        <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <p className="text-xl">Página no encontrada</p>
            </div>
        } />
      </Routes>
    </div>
  );
}

export default App;
