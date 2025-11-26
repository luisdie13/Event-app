// frontend/src/components/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventCard from './EventCard';

const API_URL = 'http://localhost:3001';

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirigir admins al dashboard
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_URL}/api/events/featured`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFeaturedEvents(data);
      } catch (e) {
        console.error("Error fetching featured events:", e);
        setError("Error al cargar eventos destacados.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div className="text-center mt-10 text-xl">Cargando carrusel de eventos...</div>;
  if (error) return <div className="text-center mt-10 text-xl text-red-500">{error}</div>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-800 text-white py-24 flex items-center justify-center">
        <div className="w-full max-w-5xl px-4">
          <div className="flex flex-col items-center justify-center text-center space-y-8">
            <h1 className="text-5xl font-extrabold text-white w-full text-center">
              Descubre Eventos Increíbles
            </h1>
            <p className="text-xl text-white opacity-90 w-full text-center max-w-3xl mx-auto">
              Encuentra los mejores eventos cerca de ti. Música, deportes, tecnología y más.
            </p>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-24"></div>

      {/* Featured Events Section */}
      <div className="flex-grow flex flex-col items-center px-4 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-20 w-full">
          Eventos Destacados
        </h2>
        <div className="h-24"></div>
        
        {featuredEvents.length === 0 ? (
          <div className="text-center py-16 bg-slate-700 rounded-xl shadow-sm max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🎭</div>
            <p className="text-xl text-gray-300 mb-2">No hay eventos destacados disponibles</p>
            <p className="text-gray-400">¡Vuelve pronto para descubrir nuevos eventos!</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer - Call to Action Section */}
      <footer className="bg-slate-800 py-12 mt-auto border-t border-slate-700 flex items-center justify-center">
        <div className="w-full max-w-4xl px-4">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <h3 className="text-2xl font-bold text-white">
              ¿Buscas algo específico?
            </h3>
            <p className="text-gray-300 text-lg">
              Explora eventos por categoría usando el menú superior
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              <span className="px-4 py-2 bg-slate-600 rounded-full text-sm font-semibold text-white shadow-sm">
                🎵 Música
              </span>
              <span className="px-4 py-2 bg-slate-600 rounded-full text-sm font-semibold text-white shadow-sm">
                ⚽ Deportes
              </span>
              <span className="px-4 py-2 bg-slate-600 rounded-full text-sm font-semibold text-white shadow-sm">
                💻 Tecnología
              </span>
              <span className="px-4 py-2 bg-slate-600 rounded-full text-sm font-semibold text-white shadow-sm">
                🎨 Arte
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
