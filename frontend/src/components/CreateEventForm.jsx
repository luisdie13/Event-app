// frontend/src/components/CreateEventForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const API_URL = 'http://localhost:3001';

const CreateEventForm = () => {
  const { token, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    location: '',
    totalTickets: '',
    price: '',
    categoryId: '',
    mainImageUrl: '',
  });

  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirigir si el usuario no está autenticado
  useEffect(() => {
    if (!isLoggedIn) {
        navigate('/login', { state: { from: '/create-event' } });
    }
  }, [isLoggedIn, navigate]);

  // Obtener la lista de categorías para el dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories`);
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: data[0].id }));
        }
      } catch (e) {
        console.error("Error fetching categories:", e);
        // Manejar error de categorías si es crítico
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convierte totalTickets y price a número si son campos numéricos
    const processedValue = (name === 'totalTickets' || name === 'price') 
                           ? parseFloat(value) 
                           : value;

    setFormData({
      ...formData,
      [name]: processedValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Incluir el token JWT
        },
        body: JSON.stringify({
             ...formData,
             // Asegurar que categoryId sea un entero
             categoryId: parseInt(formData.categoryId), 
             // Asegurar que dateTime tenga el formato correcto para PostgreSQL
             dateTime: new Date(formData.dateTime).toISOString(), 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setIsError(true);
        setMessage(data.message || 'Error al crear el evento.');
        return;
      }

      // Creación exitosa
      setMessage('Evento creado con éxito. Redirigiendo a la página de detalle...');
      setTimeout(() => {
        // Redirigir al detalle del nuevo evento
        navigate(`/event/${data.event.slug}`); 
      }, 2000);

    } catch (error) {
      console.error('Error de conexión:', error);
      setIsError(true);
      setMessage('Error de conexión con el servidor. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
      // Si aún no ha redirigido, muestra un mensaje
      return <div className="text-center mt-20 text-xl">Redirigiendo para iniciar sesión...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto my-10 bg-white p-8 rounded-xl shadow-2xl border-t-4 border-primary-500">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Crear Nuevo Evento</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna 1 */}
        <div>
            {/* Título */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Título</label>
              <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="shadow border rounded w-full py-3 px-3" placeholder="Ej: Concierto de Jazz Nocturno"/>
            </div>

            {/* Categoría */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryId">Categoría</label>
              <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} required className="shadow border rounded w-full py-3 px-3 bg-white">
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Fecha y Hora */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateTime">Fecha y Hora</label>
              <input type="datetime-local" id="dateTime" name="dateTime" value={formData.dateTime} onChange={handleChange} required className="shadow border rounded w-full py-3 px-3"/>
            </div>

            {/* Lugar */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">Ubicación</label>
              <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required className="shadow border rounded w-full py-3 px-3" placeholder="Ej: Teatro Municipal, Sala 3"/>
            </div>
            
            {/* Imagen Principal URL */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mainImageUrl">URL Imagen Principal</label>
              <input type="url" id="mainImageUrl" name="mainImageUrl" value={formData.mainImageUrl} onChange={handleChange} className="shadow border rounded w-full py-3 px-3" placeholder="Ej: https://picsum.photos/800/400"/>
            </div>
        </div>

        {/* Columna 2 */}
        <div>
            {/* Descripción */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Descripción</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="6" required className="shadow border rounded w-full py-3 px-3 resize-none" placeholder="Describe los detalles, artistas, y ambiente del evento."></textarea>
            </div>

            {/* Tickets Totales */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="totalTickets">Tickets Totales</label>
              <input type="number" id="totalTickets" name="totalTickets" value={formData.totalTickets} onChange={handleChange} required min="1" className="shadow border rounded w-full py-3 px-3" placeholder="Cantidad total de entradas"/>
            </div>

            {/* Precio */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">Precio (USD)</label>
              <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required min="0.00" step="0.01" className="shadow border rounded w-full py-3 px-3" placeholder="Ej: 25.50 (Usa 0.00 para Gratuito)"/>
            </div>

            {/* Botón de Submit */}
            <button
              type="submit"
              disabled={isLoading || !isLoggedIn}
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-xl focus:outline-none w-full transition duration-150 disabled:bg-gray-400"
            >
              {isLoading ? 'Creando Evento...' : 'Publicar Evento'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;
