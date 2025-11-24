import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001';

// Recibimos 'startEdit' para editar y 'goToCreate' para cambiar de pestaña
const AdminEventList = ({ startEdit, goToCreate }) => {
    // FIX: Destructure 'user' here at the top level
    const { token, isLoggedIn, user } = useAuth(); 
    const navigate = useNavigate();
    
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    // ID del rol de administrador
    const ADMIN_ROLE_ID = 5; 

    // Función principal para obtener eventos
    const fetchEvents = async () => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/admin/events`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 403) {
                throw new Error("Acceso denegado. No tienes permisos de administrador.");
            }
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            setEvents(data);
        } catch (e) {
            setError(e.message || "Error al cargar la lista de eventos.");
            console.error("Fetch Event Error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        
        // Verificación de seguridad usando la variable 'user' extraída arriba
        if (isLoggedIn && user && (user.role_id !== ADMIN_ROLE_ID)) {
             setError("No tienes permiso para ver esta sección.");
             setIsLoading(false);
             return;
        }

        fetchEvents();
    }, [isLoggedIn, navigate, token, user]); 

    // Función para manejar la eliminación de un evento
    const handleDelete = async (eventId) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este evento?")) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/admin/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(`Error: ${data.message || 'No se pudo eliminar el evento.'}`);
                return;
            }

            // Éxito: Actualizar la lista filtrando el evento eliminado
            setEvents(prev => prev.filter(event => event.id !== eventId));
            setMessage(data.message);
            
        } catch (e) {
            setMessage("Error de conexión al intentar eliminar.");
            console.error("Delete Event Error:", e);
        }
    };

    if (isLoading) return <div className="text-center mt-10 text-xl">Cargando eventos de administración...</div>;
    if (error) return <div className="text-center mt-10 text-xl text-red-600">{error}</div>;

    const formatDate = (dateTimeStr) => {
        if (!dateTimeStr) return 'N/A';
        const date = new Date(dateTimeStr);
        return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-6xl mx-auto">
            
            {/* CABECERA MEJORADA: Título y Botón de Crear */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                    Gestionar Eventos <span className="text-gray-500 text-base">({events.length})</span>
                </h2>
                
                {/* Botón Nuevo Evento */}
                <button 
                    onClick={goToCreate}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow transition duration-150 flex items-center gap-2 text-sm font-bold"
                >
                    <span>➕</span> Nuevo Evento
                </button>
            </div>

            {message && (
                <div className="p-3 mb-4 rounded-lg bg-green-100 text-green-700 text-sm border border-green-200">
                    {message}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {events.map((event) => (
                            <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{event.title}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                                        {event.category_name}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500">{formatDate(event.date_time)}</td>
                                <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                                    {event.available_tickets} / {event.total_tickets}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => startEdit(event)} 
                                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition duration-150 text-xs font-bold border border-blue-200"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition duration-150 text-xs font-bold border border-red-200"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {events.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">No hay eventos creados todavía.</p>
                    <button onClick={goToCreate} className="mt-2 text-primary-600 hover:text-primary-800 font-medium">
                        ¡Crea el primero aquí!
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminEventList;
