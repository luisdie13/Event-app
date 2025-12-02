// frontend/src/components/EventDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

const API_URL = 'http://localhost:3001';

const formatDate = (dateTimeStr) => {
  if (!dateTimeStr) return 'Fecha no definida';
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const EventDetail = () => {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromTickets = searchParams.get('from') === 'tickets'; // Detectar si viene de Mis Tickets
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_URL}/api/events/${slug}`);
        
        if (response.status === 404) {
             setEvent(null);
             setLoading(false);
             return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setEvent(data);
      } catch (e) {
        console.error("Error fetching event detail:", e);
        setError("Error al cargar los detalles del evento.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
        fetchEventDetail();
    }
  }, [slug]);

  // Manejador del Click de Compra
  const handleBuyClick = () => {
    if (event && event.id) {
        // Redirige a la página de checkout pasando el ID del evento
        navigate(`/checkout/${event.id}`);
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl text-gray-600 animate-pulse">Cargando detalles del evento...</div>;
  
  if (!event) {
    return (
        <div className="flex flex-col items-center justify-center mt-20">
            <div className="text-4xl text-gray-300 mb-4">😕</div>
            <div className="text-2xl text-gray-600">Evento no encontrado.</div>
            <button onClick={() => navigate('/')} className="mt-4 text-primary-600 hover:underline">Volver al inicio</button>
        </div>
    );
  }
  
  const formattedDate = formatDate(event.date_time);
  const price = parseFloat(event.price) > 0 ? `$${event.price}` : 'Gratis';
  
  const mainImageUrl = event.image_urls && event.image_urls.length > 0 
                       ? event.image_urls[0] 
                       : 'https://picsum.photos/1200/600?random=1';

  return (
    <div className="min-h-screen bg-slate-900 pb-12">
      <main className="container mx-auto px-4 py-8">
        
        {/* Sección de Imagen Principal */}
        <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-xl mb-8 group">
            <img 
                src={mainImageUrl} 
                alt={event.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 flex items-end p-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-2xl">
                    {event.title}
                </h1>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
            {/* Columna de Contenido (Izquierda) */}
            <div className="lg:w-2/3">
                <div className="bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-700">
                    <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-600 pb-4">Descripción del Evento</h2>
                    
                    <p className="text-gray-300 whitespace-pre-line mb-8 leading-relaxed text-lg">
                        {event.description}
                    </p>

                    {/* Detalles Adicionales */}
                    <h3 className="text-lg font-semibold text-white mb-4">Detalles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        <div className="flex items-start">
                             <div className="bg-secondary-50 p-2 rounded-lg text-secondary-600 mr-3">📅</div>
                             <div>
                                 <p className="font-semibold text-white">Fecha y Hora</p>
                                 <p className="text-gray-300">{formattedDate}</p>
                             </div>
                        </div>
                        <div className="flex items-start">
                             <div className="bg-secondary-50 p-2 rounded-lg text-secondary-600 mr-3">📍</div>
                             <div>
                                 <p className="font-semibold text-white">Ubicación</p>
                                 <p className="text-gray-300">{event.location}</p>
                             </div>
                        </div>
                        <div className="flex items-start">
                             <div className="bg-secondary-50 p-2 rounded-lg text-secondary-600 mr-3">🏷️</div>
                             <div>
                                 <p className="font-semibold text-white">Categoría</p>
                                 <p className="text-gray-300 capitalize">{event.category_name}</p>
                             </div>
                        </div>
                        <div className="flex items-start">
                             <div className="bg-secondary-50 p-2 rounded-lg text-secondary-600 mr-3">🎟️</div>
                             <div>
                                 <p className="font-semibold text-white">Disponibilidad</p>
                                 <p className="text-gray-300">
                                    {event.available_tickets} / {event.total_tickets} tickets
                                 </p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Columna de Compra o Información de Ticket (Derecha) */}
            <div className="lg:w-1/3">
                <div className="sticky top-24 bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
                    {fromTickets ? (
                        /* Información para acceder al código QR */
                        <>
                            <div className="text-center mb-6">
                                <div className="bg-green-100 p-4 rounded-full inline-block mb-4">
                                    <span className="text-5xl">🎫</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">¡Ya tienes tu ticket!</h3>
                                <p className="text-gray-400 text-sm">Accede a tu entrada para el evento</p>
                            </div>

                            <div className="bg-slate-700 p-6 rounded-xl mb-6">
                                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <span>📧</span> Código QR en tu Email
                                </h4>
                                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                                    Tu código QR de entrada ha sido enviado a tu correo electrónico.
                                </p>
                                
                                <div className="bg-slate-600 p-4 rounded-lg mb-4">
                                    <p className="text-xs text-gray-400 mb-2">Para encontrar tu entrada:</p>
                                    <ol className="text-sm text-gray-200 space-y-2 list-decimal list-inside">
                                        <li>Abre tu correo electrónico</li>
                                        <li>Busca: <span className="font-bold text-blue-400">"Confirmación de compra"</span></li>
                                        <li>Descarga el código QR adjunto</li>
                                        <li>Preséntalo en la entrada del evento</li>
                                    </ol>
                                </div>

                                <div className="flex items-start gap-2 bg-blue-900/30 p-3 rounded-lg border border-blue-700">
                                    <span className="text-blue-400 text-xl">💡</span>
                                    <p className="text-xs text-blue-200">
                                        <strong>Tip:</strong> Guarda el código QR en tu teléfono para acceder más fácilmente el día del evento.
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate('/my-tickets')}
                                className="w-full py-3 rounded-xl text-base font-semibold bg-slate-600 hover:bg-slate-500 text-white transition-all"
                            >
                                ← Volver a Mis Tickets
                            </button>
                        </>
                    ) : (
                        /* Formulario de compra normal */
                        <>
                            <div className="text-center mb-6">
                                <p className="text-gray-400 text-sm uppercase tracking-wide font-semibold">Precio por entrada</p>
                                <p className="text-4xl font-extrabold text-primary-600 mt-1">
                                    {price}
                                </p>
                            </div>
                            
                            <button 
                                onClick={handleBuyClick}
                                disabled={event.available_tickets <= 0}
                                className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg transition-all duration-200 transform hover:-translate-y-1 ${
                                    event.available_tickets > 0
                                    ? 'bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {event.available_tickets > 0 ? '¡Comprar Tickets Ahora!' : 'Agotado'}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                                {event.available_tickets > 0 ? (
                                    <>
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Quedan {event.available_tickets} tickets disponibles
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                        Venta finalizada
                                    </>
                                )}
                            </div>
                            
                            <p className="text-xs text-gray-500 text-center mt-6 pt-4 border-t border-slate-700">
                                Pago seguro con tarjeta de crédito o débito.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetail;
