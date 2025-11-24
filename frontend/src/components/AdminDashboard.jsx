import React, { useState } from 'react';
import CreateEventForm from './CreateEventForm';
import AdminEventList from './AdminEventList';
import AdminUserList from './AdminUserList';
import AdminReports from './AdminReports';
import EditEventForm from './EditEventForm';

const AdminDashboard = () => {
  // Estado para manejar la pestaña activa: 'create', 'events', 'users'
  const [activeTab, setActiveTab] = useState('events');

  // Estado para manejar qué evento estamos editando (null si no estamos editando)
  const [editingEvent, setEditingEvent] = useState(null);

  // Función para iniciar el modo de edición desde AdminEventList
  const startEditEvent = (eventData) => {
    setEditingEvent(eventData);
    setActiveTab('edit');
  };

  // Función para cancelar la edición y volver a la lista
  const cancelEdit = () => {
    setEditingEvent(null);
    setActiveTab('events');
  };

  // Renderizar la vista principal según la pestaña activa
  const renderContent = () => {
    if (editingEvent && activeTab === 'edit') {
      return (
        <EditEventForm
          eventData={editingEvent}
          onCancel={cancelEdit}
          onSuccess={cancelEdit} // Volver a la lista después de la edición exitosa
        />
      );
    }

    switch (activeTab) {
      case 'create':
        return <CreateEventForm />;
      case 'events':
        return (
          <AdminEventList 
            startEdit={startEditEvent} 
            // 👇 MEJORA: Pasamos esta función para que el botón "Nuevo Evento" funcione
            goToCreate={() => setActiveTab('create')} 
          />
        );
      case 'users':
        return <AdminUserList />;
      case 'reports':
        return <AdminReports />;
      default:
        return <h2 className="text-2xl text-gray-500">Selecciona una herramienta.</h2>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-8">
      <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-white mb-8 border-b border-blue-800 pb-4 text-center">Panel de Administración</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Columna de Navegación */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Herramientas</h2>
            <nav className="space-y-2">
              <button
                onClick={() => { setActiveTab('create'); setEditingEvent(null); }}
                className={`block w-full text-left p-3 rounded-lg font-medium transition duration-150 flex items-center gap-3 ${activeTab === 'create' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <span>➕</span> Crear Evento
              </button>
              <button
                onClick={() => { setActiveTab('events'); setEditingEvent(null); }}
                className={`block w-full text-left p-3 rounded-lg font-medium transition duration-150 flex items-center gap-3 ${activeTab === 'events' || activeTab === 'edit' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <span>✍️</span> Gestionar Eventos
              </button>
              <button
                onClick={() => { setActiveTab('users'); setEditingEvent(null); }}
                className={`block w-full text-left p-3 rounded-lg font-medium transition duration-150 flex items-center gap-3 ${activeTab === 'users' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <span>👥</span> Gestionar Usuarios
              </button>
              <button
                onClick={() => { setActiveTab('reports'); setEditingEvent(null); }}
                className={`block w-full text-left p-3 rounded-lg font-medium transition duration-150 flex items-center gap-3 ${activeTab === 'reports' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <span>📊</span> Reportes
              </button>
            </nav>
            <p className="mt-6 text-xs text-gray-600 border-t border-gray-200 pt-4">
              Panel exclusivo para administradores.
            </p>
          </div>
        </div>

        {/* Columna Principal: Contenido Dinámico */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
