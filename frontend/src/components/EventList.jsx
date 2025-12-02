// frontend/src/components/EventList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import EventCard from './EventCard';
import Pagination from './Pagination';
import SearchFilters from './SearchFilters';

const API_URL = 'http://localhost:3001';

const EventList = () => {
  // Obtiene el parámetro 'categorySlug' de la URL (si existe)
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEvents: 0
  });
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    dateFrom: '',
    dateTo: '',
    location: '',
    sortBy: 'date_asc'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Título dinámico
  const pageTitle = categorySlug 
    ? `Eventos en la categoría: ${categorySlug.toUpperCase()}` 
    : 'Todos los Eventos';

  useEffect(() => {
    const fetchEvents = async () => {
      // Solo mostrar loading en la carga inicial, no durante búsquedas
      if (events.length === 0) {
        setLoading(true);
      }
      setError(null);

      // Construir query params
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: 9,
        ...filters
      });

      // Filtrar valores vacíos
      for (let [key, value] of Array.from(queryParams.entries())) {
        if (!value || value === '') {
          queryParams.delete(key);
        }
      }

      // Define la URL de la API con paginación y filtros
      const endpoint = categorySlug 
        ? `${API_URL}/api/events/category/${categorySlug}?${queryParams}` 
        : `${API_URL}/api/events?${queryParams}`;

      try {
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setEvents(data.events || []);
        setPagination({
          currentPage: data.pagination?.currentPage || 1,
          totalPages: data.pagination?.totalPages || 1,
          totalEvents: data.pagination?.totalEvents || 0
        });
      } catch (e) {
        console.error("Error fetching events:", e);
        setError("Error al cargar eventos. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [categorySlug, pagination.currentPage, filters]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 when filters change
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      minPrice: '',
      maxPrice: '',
      dateFrom: '',
      dateTo: '',
      location: '',
      sortBy: 'date_asc'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Reset page to 1 when category changes (pero mantener búsqueda)
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [categorySlug]);

  if (loading && events.length === 0) {
    return <div className="text-center mt-10 text-xl">Cargando lista de eventos...</div>;
  }
  
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
      <div className="h-12"></div>

      {/* Search and Filters */}
      <div className="w-full flex justify-center">
        <SearchFilters 
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          currentSearch={filters.search}
        />
      </div>

      {/* Events Grid */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 pb-20">
        {events.length === 0 ? (
          <div className="text-center py-16 bg-slate-700 rounded-xl shadow-sm max-w-2xl w-full mx-auto">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-300 mb-2">
              No se encontraron eventos {categorySlug ? `para la categoría "${categorySlug}"` : 'disponibles'}
            </p>
            <p className="text-gray-400">Intenta explorar otras categorías</p>
          </div>
        ) : (
          <div className="w-full max-w-7xl">
            <div className="flex justify-center mb-12 w-full">
              <p className="text-gray-300 text-center">
                Mostrando <span className="font-semibold text-white">{events.length}</span> de{' '}
                <span className="font-semibold text-white">{pagination.totalEvents}</span> evento{pagination.totalEvents !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="h-12"></div>
            <div className="flex justify-center w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
            
            {/* Pagination */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;
