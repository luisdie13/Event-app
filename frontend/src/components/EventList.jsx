// frontend/src/components/EventList.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EventCard from './EventCard'; // Reusa el componente de tarjeta

const API_URL = 'http://localhost:3001';

const EventList = () => {
  // Obtiene el parámetro 'categorySlug' de la URL (si existe)
  const { categorySlug } = useParams(); 
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Título dinámico
  const pageTitle = categorySlug 
    ? `Eventos en la categoría: ${categorySlug.toUpperCase()}` 
    : 'Todos los Eventos';

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      // Define la URL de la API:
      // Si hay categorySlug, usa la ruta de categoría. Si no, usa la ruta general.
      const endpoint = categorySlug 
        ? `${API_URL}/api/events/category/${categorySlug}` 
        : `${API_URL}/api/events`;

      try {
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setEvents(data);
      } catch (e) {
        console.error("Error fetching events:", e);
        setError("Error al cargar eventos. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [categorySlug]); // Dependencia: re-ejecuta el fetch si el categorySlug de la URL cambia

  if (loading) return <div className="text-center mt-10 text-xl">Cargando lista de eventos...</div>;
  if (error) return <div className="text-center mt-10 text-xl text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-800 text-white py-24 flex items-center justify-center">
        <div className="w-full max-w-5xl px-4">
          <div className="flex flex-col items-center justify-center text-center space-y-8">
            <h1 className="text-4xl font-extrabold text-white w-full text-center">
              {pageTitle}
            </h1>
            <p className="text-white opacity-90 w-full text-center max-w-3xl mx-auto">
              {categorySlug ? `Explora todos los eventos de ${categorySlug}` : 'Explora todos nuestros eventos disponibles'}
            </p>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-24"></div>

      {/* Events Grid */}
      <div className="flex-grow flex flex-col items-center px-4 pb-20">
        {events.length === 0 ? (
          <div className="text-center py-16 bg-slate-700 rounded-xl shadow-sm max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-300 mb-2">
              No se encontraron eventos {categorySlug ? `para la categoría "${categorySlug}"` : 'disponibles'}
            </p>
            <p className="text-gray-400">Intenta explorar otras categorías</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-12 w-full">
              <p className="text-gray-300 text-center">
                Mostrando <span className="font-semibold text-white">{events.length}</span> evento{events.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="h-12"></div>
            <div className="flex justify-center w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventList;
