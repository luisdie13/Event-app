// frontend/src/components/MyTickets.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Pagination from './Pagination';

const MyTickets = () => {
    const { user, token, logout } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalTickets: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, upcoming, past

    useEffect(() => {
        if (user && token) {
            fetchTickets();
        } else {
            setLoading(false);
        }
    }, [user, token, pagination.currentPage]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3001/api/orders/my-tickets?page=${pagination.currentPage}&limit=10`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                
                // Si el token es inválido, cerrar sesión
                if (response.status === 401) {
                    logout();
                    window.location.href = '/login?session=expired';
                    return;
                }
                
                throw new Error(errorData.message || 'Error al cargar los tickets');
            }

            const data = await response.json();
            setTickets(data.tickets || []);
            setPagination({
                currentPage: data.pagination?.currentPage || 1,
                totalPages: data.pagination?.totalPages || 1,
                totalTickets: data.pagination?.totalTickets || 0
            });
            setLoading(false);
        } catch (err) {
            // Si hay error de red, también podría ser un token inválido
            if (err.message.includes('No autorizado')) {
                logout();
                window.location.href = '/login?session=expired';
                return;
            }
            
            setError('Error al cargar tus tickets. Por favor, intenta nuevamente.');
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getFilteredTickets = () => {
        const now = new Date();
        
        switch(filter) {
            case 'upcoming':
                return tickets.filter(ticket => new Date(ticket.event_date) >= now);
            case 'past':
                return tickets.filter(ticket => new Date(ticket.event_date) < now);
            default:
                return tickets;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-GT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', { 
        style: 'currency',
        currency: 'USD'
    }).format(price);
};

    const getStatusBadge = (status, eventDate) => {
        const isPast = new Date(eventDate) < new Date();
        
        if (status === 'cancelled') {
            return <span className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Cancelado</span>;
        }
        
        if (isPast) {
            return <span className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">Finalizado</span>;
        }
        
        return <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Activo</span>;
    };

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Restringido</h2>
                <p className="text-gray-600 mb-6">Debes iniciar sesión para ver tus tickets.</p>
                <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                    Iniciar Sesión
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    const filteredTickets = getFilteredTickets();
    const allTicketsCount = pagination.totalTickets;
    const upcomingCount = tickets.filter(t => new Date(t.event_date) >= new Date()).length;
    const pastCount = tickets.filter(t => new Date(t.event_date) < new Date()).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex justify-center">
            <div className="container mx-auto px-4 pt-16 pb-8 max-w-5xl">
                {/* Header */}
                <div className="mb-16 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Mis Tickets</h1>
                    <p className="text-blue-200 text-lg">Historial de eventos y tickets comprados</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-28 max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600">{allTicketsCount}</div>
                        <div className="text-gray-600">Total de Tickets</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="text-3xl font-bold text-green-600">{upcomingCount}</div>
                        <div className="text-gray-600">Eventos Próximos</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="text-3xl font-bold text-gray-600">{pastCount}</div>
                        <div className="text-gray-600">Eventos Pasados</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-20 flex flex-wrap gap-6 justify-center">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            filter === 'all'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-blue-50'
                        }`}
                    >
                        Todos ({allTicketsCount})
                    </button>
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            filter === 'upcoming'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-blue-50'
                        }`}
                    >
                        Próximos ({upcomingCount})
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                            filter === 'past'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-blue-50'
                        }`}
                    >
                        Pasados ({pastCount})
                    </button>
                </div>

                {/* Tickets List */}
                {filteredTickets.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-4xl mx-auto">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay tickets</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        {filter === 'upcoming' && 'No tienes eventos próximos.'}
                        {filter === 'past' && 'No tienes eventos pasados.'}
                        {filter === 'all' && 'Aún no has comprado ningún ticket.'}
                    </p>
                        <Link to="/events" className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
                            Explorar Eventos
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-12 max-w-4xl mx-auto">
                            {filteredTickets.map((ticket) => (
                            <div key={ticket.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden">
                            <div className="md:flex">
                                {/* Image */}
                                <div className="md:w-40 h-32 md:h-auto flex-shrink-0">
                                    <img
                                        src={ticket.event_image || 'https://via.placeholder.com/400x300?text=No+Image'}
                                        alt={ticket.event_title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                      <Link
                        to={`/event/${ticket.event_slug}?from=tickets`}
                        className="text-lg font-semibold text-blue-400 hover:text-blue-300 hover:underline transition"
                      >
                        {ticket.event_title}
                      </Link>
                                            <p className="text-xs text-gray-500">{ticket.category_name}</p>
                                        </div>
                                        {getStatusBadge(ticket.status, ticket.event_date)}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                        <div>
                                            <p className="text-xs text-gray-600 mb-0.5">
                                                <span className="font-semibold">📅 Fecha del Evento:</span>
                                            </p>
                                            <p className="text-sm text-gray-800">{formatDate(ticket.event_date)}</p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-600 mb-0.5">
                                                <span className="font-semibold">📍 Ubicación:</span>
                                            </p>
                                            <p className="text-sm text-gray-800">{ticket.event_location}</p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-600 mb-0.5">
                                                <span className="font-semibold">🎫 Cantidad:</span>
                                            </p>
                                            <p className="text-sm text-gray-800">{ticket.quantity}</p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-600 mb-0.5">
                                                <span className="font-semibold">💰 Total:</span>
                                            </p>
                                            <p className="text-sm text-gray-800 font-semibold">{formatPrice(ticket.total_price)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <p className="text-xs text-gray-500">
                                            Comprado: {new Date(ticket.purchase_date).toLocaleDateString('es-GT', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            </div>
                            ))}
                        </div>
                        
                        {/* Pagination */}
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default MyTickets;
