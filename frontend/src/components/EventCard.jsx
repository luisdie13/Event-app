// frontend/src/components/EventCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// Función para formatear la fecha a un formato legible
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

const EventCard = ({ event }) => {
  // Manejo de valores nulos o vacíos
  const imageUrl = event.main_image_url || 'https://picsum.photos/800/400?random=1';
  const formattedDate = formatDate(event.date_time);
  const price = parseFloat(event.price) > 0 ? `$${event.price}` : 'Gratis';

  return (
    <div className="w-full bg-slate-800 rounded-xl shadow-2xl overflow-hidden transform transition duration-500 hover:scale-[1.02] hover:shadow-3xl border border-slate-700">
      {/* Imagen del Evento */}
      <div className="h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover" 
        />
      </div>

      <div className="p-4">
        {/* Título y Slug */}
        <h3 className="text-xl font-bold text-white mb-1 truncate">
          {event.title}
        </h3>
        
        {/* Categoría */}
        <span className="inline-block bg-secondary-100 text-secondary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
          {event.category_name}
        </span>

        {/* Detalles */}
        <p className="text-sm text-gray-300 mb-1 flex items-center">
          🗓️ **Fecha:** {formattedDate}
        </p>
        <p className="text-sm text-gray-300 mb-3 flex items-center">
          📍 **Lugar:** {event.location}
        </p>

        {/* Precio y Botón */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700">
          <span className="text-lg font-extrabold text-primary-600">
            {price}
          </span>
          
          <Link
            to={`/event/${event.slug}`}
            className="bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition duration-150"
          >
            Ver Detalles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
