// frontend/src/components/RegisterForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3001';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setIsError(true);
        setMessage(data.message || 'Error desconocido durante el registro.');
        return;
      }

      // Registro exitoso: Guardar el token y redirigir
      login(data.user, data.token); 
      
      setMessage('¡Registro exitoso! Redirigiendo...');
      setTimeout(() => {
        navigate('/'); 
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl border-t-4 border-primary-500">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Crear una Cuenta</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Campo Nombre */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Nombre</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Tu nombre completo"
          />
        </div>

        {/* Campo Email */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="ejemplo@correo.com"
          />
        </div>

        {/* Campo Contraseña */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {/* Botón de Submit */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:shadow-outline w-full transition duration-150 disabled:bg-gray-400"
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </div>
      </form>
      
        <p className="text-center text-sm mt-4 text-gray-600">
          ¿Ya tienes cuenta? <a href="/login" className="text-primary-500 hover:text-primary-700 font-semibold">Inicia Sesión</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
