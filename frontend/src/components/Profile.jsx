import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001';

const Profile = () => {
  const { user, token, login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  // Datos del perfil
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  // Datos de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Datos de tarjetas
  const [cards, setCards] = useState([]);
  const [showCardForm, setShowCardForm] = useState(false);
  const [newCard, setNewCard] = useState({
    cardHolderName: '',
    cardNumber: '',
    cardNumberLast4: '',
    cvv: '',
    cardBrand: 'Visa',
    expiryMonth: '',
    expiryYear: '',
    isDefault: false
  });
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!isLoggedIn || !token) {
      navigate('/login');
      return;
    }
    
    fetchProfile();
    fetchCards();
  }, [isLoggedIn, token, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      } else {
        setIsError(true);
        setMessage('Error al cargar perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      setIsError(true);
      setMessage('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/cards`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCards(data);
      }
    } catch (error) {
      console.error('Error al cargar tarjetas:', error);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleCardChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setNewCard({
      ...newCard,
      [e.target.name]: value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Perfil actualizado exitosamente');
        setIsError(false);
        
        // Actualizar el contexto con los nuevos datos
        login({ ...user, ...data.user }, token);
      } else {
        setIsError(true);
        setMessage(data.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      setIsError(true);
      setMessage('Error de conexión');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setIsError(true);
      setMessage('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setIsError(true);
      setMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Contraseña actualizada exitosamente');
        setIsError(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
      } else {
        setIsError(true);
        setMessage(data.message || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      setIsError(true);
      setMessage('Error de conexión');
    }
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    // Extraer los últimos 4 dígitos del número de tarjeta
    const cardNumberClean = newCard.cardNumber.replace(/\s/g, '');
    const last4Digits = cardNumberClean.slice(-4);

    const cardData = {
      cardHolderName: newCard.cardHolderName,
      cardNumberLast4: last4Digits,
      cardBrand: newCard.cardBrand,
      expiryMonth: newCard.expiryMonth,
      expiryYear: newCard.expiryYear,
      isDefault: newCard.isDefault
    };

    try {
      const response = await fetch(`${API_URL}/api/users/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cardData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Tarjeta agregada exitosamente');
        setIsError(false);
        setShowCardForm(false);
        setNewCard({
          cardHolderName: '',
          cardNumber: '',
          cardNumberLast4: '',
          cvv: '',
          cardBrand: 'Visa',
          expiryMonth: '',
          expiryYear: '',
          isDefault: false
        });
        fetchCards();
      } else {
        setIsError(true);
        setMessage(data.message || 'Error al agregar tarjeta');
      }
    } catch (error) {
      console.error('Error:', error);
      setIsError(true);
      setMessage('Error de conexión');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm('¿Estás seguro de eliminar esta tarjeta?')) return;

    setMessage('');
    setIsError(false);

    try {
      const response = await fetch(`${API_URL}/api/users/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Tarjeta eliminada exitosamente');
        setIsError(false);
        fetchCards();
      } else {
        setIsError(true);
        setMessage(data.message || 'Error al eliminar tarjeta');
      }
    } catch (error) {
      console.error('Error:', error);
      setIsError(true);
      setMessage('Error de conexión');
    }
  };

  const handleSetDefaultCard = async (cardId) => {
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch(`${API_URL}/api/users/cards/${cardId}/default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Tarjeta predeterminada actualizada');
        setIsError(false);
        fetchCards();
      } else {
        setIsError(true);
        setMessage(data.message || 'Error al actualizar tarjeta');
      }
    } catch (error) {
      console.error('Error:', error);
      setIsError(true);
      setMessage('Error de conexión');
    }
  };

  const getCardIcon = (brand) => {
    const icons = {
      'Visa': '💳',
      'Mastercard': '💳',
      'American Express': '💳',
      'Discover': '💳',
      'Other': '💳'
    };
    return icons[brand] || '💳';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-950 py-12 px-4 flex justify-center">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>
        
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* Información del Perfil */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Información Personal</h2>
          
          <form onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  required
                  className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                  className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+502 1234-5678"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Calle, ciudad, país"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-white hover:bg-gray-50 text-blue-900 border-2 border-blue-900 font-bold py-3 px-6 rounded-lg transition duration-150"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>

        {/* Tarjetas de Pago */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tarjetas de Pago</h2>
            {!showCardForm && (
              <button
                onClick={() => setShowCardForm(true)}
                className="bg-white hover:bg-gray-50 text-blue-900 border-2 border-blue-900 font-semibold py-2 px-4 rounded-lg transition duration-150"
              >
                + Agregar Tarjeta
              </button>
            )}
          </div>

          {showCardForm && (
            <form onSubmit={handleCardSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-4 text-center text-blue-900">Nueva Tarjeta</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nombre en la Tarjeta
                  </label>
                  <input
                    type="text"
                    name="cardHolderName"
                    value={newCard.cardHolderName}
                    onChange={handleCardChange}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="JUAN PEREZ"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Tipo de Tarjeta
                  </label>
                  <select
                    name="cardBrand"
                    value={newCard.cardBrand}
                    onChange={handleCardChange}
                    required
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="American Express">American Express</option>
                    <option value="Discover">Discover</option>
                    <option value="Other">Otra</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Número de Tarjeta
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={newCard.cardNumber || ''}
                  onChange={handleCardChange}
                  required
                  maxLength="19"
                  pattern="\d{4}\s?\d{4}\s?\d{4}\s?\d{4}"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={newCard.cvv || ''}
                    onChange={handleCardChange}
                    required
                    maxLength="4"
                    pattern="\d{3,4}"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="123"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Mes de Expiración
                  </label>
                  <select
                    name="expiryMonth"
                    value={newCard.expiryMonth}
                    onChange={handleCardChange}
                    required
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Mes</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Año de Expiración
                  </label>
                  <select
                    name="expiryYear"
                    value={newCard.expiryYear}
                    onChange={handleCardChange}
                    required
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Año</option>
                    {[...Array(10)].map((_, i) => {
                      const year = new Date().getFullYear() + i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={newCard.isDefault}
                    onChange={handleCardChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-blue-900 font-semibold">Establecer como tarjeta predeterminada</span>
                </label>
              </div>

              <div className="flex gap-2 justify-center">
                <button
                  type="submit"
                  className="bg-white hover:bg-gray-50 text-blue-900 border-2 border-blue-900 font-bold py-2 px-4 rounded-lg transition duration-150"
                >
                  Guardar Tarjeta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCardForm(false);
                    setNewCard({
                      cardHolderName: '',
                      cardNumber: '',
                      cardNumberLast4: '',
                      cvv: '',
                      cardBrand: 'Visa',
                      expiryMonth: '',
                      expiryYear: '',
                      isDefault: false
                    });
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-lg transition duration-150"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Lista de Tarjetas */}
          <div className="space-y-3">
            {cards.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No tienes tarjetas registradas</p>
            ) : (
              cards.map((card) => (
                <div
                  key={card.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    card.is_default ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCardIcon(card.card_brand)}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{card.card_brand} •••• {card.card_number_last4}</p>
                      <p className="text-sm text-gray-900">
                        {card.card_holder_name} | Expira: {String(card.expiry_month).padStart(2, '0')}/{card.expiry_year}
                      </p>
                      {card.is_default && (
                        <span className="text-xs bg-primary-500 text-white px-2 py-1 rounded-full">
                          Predeterminada
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!card.is_default && (
                      <button
                        onClick={() => handleSetDefaultCard(card.id)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                      >
                        Hacer Predeterminada
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cambiar Contraseña */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Seguridad</h2>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-blue-900 hover:text-blue-700 font-semibold"
              >
                Cambiar Contraseña
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                  className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                  className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  type="submit"
                  className="bg-white hover:bg-gray-50 text-blue-900 border-2 border-blue-900 font-bold py-3 px-6 rounded-lg transition duration-150"
                >
                  Actualizar Contraseña
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition duration-150"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {!showPasswordForm && (
            <p className="text-gray-600 text-center">
              Mantén tu cuenta segura actualizando tu contraseña regularmente
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="mt-6 text-primary-500 hover:text-primary-600 font-semibold"
          >
            ← Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
