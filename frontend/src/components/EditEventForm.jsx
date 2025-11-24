import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3001';

const EditEventForm = ({ eventData, onCancel, onSuccess }) => {
  const { token } = useAuth();
  
  // Estado local del formulario inicializado con los datos del evento
  const [formData, setFormData] = useState({
    ...eventData,
    // Formatear la fecha para el input 'datetime-local' (YYYY-MM-DDThh:mm)
    dateTime: eventData.date_time ? new Date(eventData.date_time).toISOString().substring(0, 16) : '',
  });

  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar las categorías para el dropdown (similar a CreateEventForm)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories`);
        const data = await response.json();
        setCategories(data);
      } catch (e) {
        console.error("Error fetching categories:", e);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Conversión a número para campos numéricos
    const processedValue = (name === 'total_tickets' || name === 'price') 
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
      const response = await fetch(`${API_URL}/api/admin/events/${eventData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Incluir el token JWT
        },
        body: JSON.stringify({
             ...formData,
             // Asegurar que category_id sea un entero y usar el nombre correcto de la columna
             category_id: parseInt(formData.category_id || formData.categoryid || eventData.category_id), 
             // Formatear la fecha para PostgreSQL (ISO string)
             date_time: new Date(formData.dateTime).toISOString(), 
             
             // Asegurar que solo enviamos el price y total_tickets como números
             price: parseFloat(formData.price),
             total_tickets: parseInt(formData.total_tickets),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setIsError(true);
        setMessage(data.message || 'Error al actualizar el evento.');
        return;
      }

      // Edición exitosa
      setMessage('✅ Evento actualizado con éxito.');
      setTimeout(() => {
        onSuccess(); // Llama a la función onSuccess (que es cancelEdit) para volver a la lista
      }, 1500);

    } catch (error) {
      console.error('Error de conexión:', error);
      setIsError(true);
      setMessage('Error de conexión con el servidor. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl border-t-4 border-blue-500">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
        Editando: {eventData.title}
      </h2>
      
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
              <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="shadow border rounded w-full py-3 px-3" />
            </div>

            {/* Categoría */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category_id">Categoría</label>
              <select id="category_id" name="category_id" 
                      // Usar el ID numérico para el value
                      value={formData.category_id || formData.categoryid || eventData.category_id} 
                      onChange={handleChange} required className="shadow border rounded w-full py-3 px-3 bg-white">
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
              <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required className="shadow border rounded w-full py-3 px-3" />
            </div>
            
            {/* Imagen Principal URL */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mainImageUrl">URL Imagen Principal</label>
              {/* Nota: En la tabla events, la URL se maneja en la tabla images, 
                  pero la pasamos aquí como un campo simple para el PUT 
                  asumiendo que se actualiza la imagen principal
              */}
              <input type="url" id="mainImageUrl" name="mainImageUrl" value={formData.mainImageUrl || eventData.main_image_url} onChange={handleChange} className="shadow border rounded w-full py-3 px-3" />
              {formData.mainImageUrl && (
                  <img src={formData.mainImageUrl} alt="Preview" className="mt-2 w-full h-32 object-cover rounded" />
              )}
            </div>
        </div>

        {/* Columna 2 */}
        <div>
            {/* Descripción */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Descripción</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="6" required className="shadow border rounded w-full py-3 px-3 resize-none"></textarea>
            </div>

            {/* Tickets Totales */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="total_tickets">Tickets Totales</label>
              <input type="number" id="total_tickets" name="total_tickets" value={formData.total_tickets} onChange={handleChange} required min="1" className="shadow border rounded w-full py-3 px-3" />
            </div>

            {/* Precio */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">Precio (USD)</label>
              <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required min="0.00" step="0.01" className="shadow border rounded w-full py-3 px-3" />
            </div>

            {/* Botón de Actualizar */}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl focus:outline-none w-full transition duration-150 disabled:bg-gray-400"
            >
              {isLoading ? 'Guardando Cambios...' : 'Actualizar Evento'}
            </button>
            
            {/* Botón de Cancelar */}
            <button
              type="button"
              onClick={onCancel}
              className="mt-3 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl focus:outline-none w-full transition duration-150"
            >
              Cancelar Edición
            </button>
        </div>
      </form>
    </div>
  );
};

export default EditEventForm;
