import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3001';

const CheckoutPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { token, isLoggedIn } = useAuth();

  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Tarjetas guardadas
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [useNewCard, setUseNewCard] = useState(false);
  
  // Datos del formulario de pago (para nueva tarjeta)
  const [paymentData, setPaymentData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    saveCard: true // Por defecto guardar la tarjeta
  });

  useEffect(() => {
    // 1. Si no está logueado, mandar al login
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // 2. Cargar detalles del evento y tarjetas guardadas
    const fetchData = async () => {
      try {
        // Cargar evento
        const eventResponse = await fetch(`${API_URL}/api/events/id/${eventId}`);
        
        if (eventResponse.ok) {
          const eventData = await eventResponse.json();
          setEvent(eventData);
        } else {
          alert("Evento no encontrado o no disponible.");
          navigate('/');
          return;
        }

        // Cargar tarjetas guardadas
        const cardsResponse = await fetch(`${API_URL}/api/users/cards`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (cardsResponse.ok) {
          const cardsData = await cardsResponse.json();
          setSavedCards(cardsData);
          
          // Seleccionar la tarjeta predeterminada automáticamente
          const defaultCard = cardsData.find(card => card.is_default);
          if (defaultCard) {
            setSelectedCardId(defaultCard.id);
          } else if (cardsData.length > 0) {
            setSelectedCardId(cardsData[0].id);
          } else {
            setUseNewCard(true);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [eventId, isLoggedIn, navigate, token]);

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setPaymentData({ ...paymentData, [e.target.name]: value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      let cardId = selectedCardId;

      // Si usa tarjeta nueva y quiere guardarla
      if (useNewCard && paymentData.saveCard) {
        console.log('Intentando guardar tarjeta...');
        console.log('Datos del formulario:', paymentData);
        
        // Extraer últimos 4 dígitos y datos de la nueva tarjeta
        const last4 = paymentData.cardNumber.replace(/\s/g, '').slice(-4);
        const [month, year] = paymentData.expiry.split('/');
        
        // Asegurar que el año tenga 4 dígitos
        let fullYear = year;
        if (year && year.length === 2) {
          const currentYear = new Date().getFullYear();
          const currentCentury = Math.floor(currentYear / 100) * 100; // 2000
          const yearNum = parseInt(year);
          
          // Si el año de 2 dígitos + siglo actual es menor que el año actual,
          // entonces pertenece al siguiente siglo
          let calculatedYear = currentCentury + yearNum;
          if (calculatedYear < currentYear) {
            calculatedYear += 100; // Próximo siglo
          }
          
          fullYear = calculatedYear.toString();
        }
        
        const newCardData = {
          cardHolderName: paymentData.cardName.toUpperCase(),
          cardNumberLast4: last4,
          cardBrand: 'Visa', // En un sistema real, detectarías esto del número
          expiryMonth: parseInt(month),
          expiryYear: parseInt(fullYear),
          isDefault: savedCards.length === 0 // Primera tarjeta = predeterminada
        };

        console.log('Datos de tarjeta a guardar:', newCardData);

        // Guardar la nueva tarjeta
        const cardResponse = await fetch(`${API_URL}/api/users/cards`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newCardData)
        });

        const cardResult = await cardResponse.json();
        console.log('Respuesta del servidor al guardar tarjeta:', cardResult);

        if (cardResponse.ok) {
          cardId = cardResult.card.id;
          console.log('Tarjeta guardada exitosamente con ID:', cardId);
        } else {
          console.error('Error al guardar tarjeta:', cardResult);
          // Continuar con la compra aunque falle guardar la tarjeta
          alert('Nota: La tarjeta no pudo guardarse, pero la compra continuará.');
        }
      }

      // 1. Enviar la orden al backend
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: event.id,
          quantity: quantity,
          cardId: cardId // Enviar el ID de la tarjeta usada
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al procesar la compra.");
      }

      // 2. Éxito
      alert(`¡Compra Exitosa! 🎉\n\n${data.message}`);
      navigate('/'); 

    } catch (error) {
      console.error("Error de pago:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(false);
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

  if (loading) return <div className="text-center mt-20 text-xl text-gray-600">Cargando detalles de compra...</div>;
  if (!event) return null;

  const totalPrice = (parseFloat(event.price) * quantity).toFixed(2);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
        
        {/* COLUMNA IZQUIERDA: Formulario de Pago */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 text-gray-700 flex items-center gap-2">
            💳 Método de Pago
          </h2>
          
          <form onSubmit={handlePayment} className="space-y-4">
            {/* Tarjetas Guardadas */}
            {savedCards.length > 0 && (
              <div className="mb-6">
                <label className="flex items-center mb-3">
                  <input
                    type="radio"
                    checked={!useNewCard}
                    onChange={() => setUseNewCard(false)}
                    className="mr-2"
                  />
                  <span className="font-semibold text-black">Usar tarjeta guardada</span>
                </label>
                
                {!useNewCard && (
                  <div className="space-y-2 ml-6">
                    {savedCards.map((card) => (
                      <label
                        key={card.id}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                          selectedCardId === card.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="savedCard"
                          value={card.id}
                          checked={selectedCardId === card.id}
                          onChange={(e) => setSelectedCardId(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-2xl mr-2">{getCardIcon(card.card_brand)}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-black">
                            {card.card_brand} •••• {card.card_number_last4}
                          </p>
                          <p className="text-sm text-gray-600">
                            {card.card_holder_name} | Expira: {String(card.expiry_month).padStart(2, '0')}/{card.expiry_year}
                          </p>
                        </div>
                        {card.is_default && (
                          <span className="text-xs bg-primary-500 text-white px-2 py-1 rounded-full">
                            Predeterminada
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Opción de Nueva Tarjeta */}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useNewCard}
                  onChange={() => setUseNewCard(true)}
                  className="mr-2"
                />
                <span className="font-semibold text-black">Usar nueva tarjeta</span>
              </label>
            </div>

            {/* Formulario de Nueva Tarjeta */}
            {useNewCard && (
              <>
                <div>
                  <label className="block text-sm text-black font-semibold mb-1">Nombre en la tarjeta</label>
                  <input 
                    required 
                    type="text" 
                    name="cardName" 
                    placeholder="Juan Pérez" 
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-black font-semibold mb-1">Número de Tarjeta</label>
                  <input 
                    required 
                    type="text" 
                    name="cardNumber" 
                    placeholder="0000 0000 0000 0000" 
                    maxLength="19"
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-black font-semibold mb-1">Vencimiento</label>
                    <input 
                      required 
                      type="text" 
                      name="expiry" 
                      placeholder="MM/YY" 
                      maxLength="5"
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-black font-semibold mb-1">CVC</label>
                    <input 
                      required 
                      type="text" 
                      name="cvc" 
                      placeholder="123" 
                      maxLength="3"
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="saveCard"
                      checked={paymentData.saveCard}
                      onChange={handleInputChange}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="text-sm text-blue-900 font-semibold">💾 Guardar esta tarjeta para futuras compras</span>
                  </label>
                  <p className="text-xs text-blue-700 ml-7 mt-1">
                    La tarjeta se almacenará de forma segura en tu perfil
                  </p>
                </div>
              </>
            )}

            <button 
              type="submit" 
              disabled={processing || (!useNewCard && !selectedCardId)}
              className={`w-full py-4 mt-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${
                processing || (!useNewCard && !selectedCardId)
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gray-800 hover:bg-gray-900 hover:shadow-xl'
              }`}
            >
              {processing ? 'Procesando pago...' : `Pagar Q${totalPrice}`}
            </button>
            
            <p className="text-xs text-gray-400 text-center mt-2">
              🔒 Transacción encriptada y segura.
            </p>
          </form>
        </div>

        {/* COLUMNA DERECHA: Resumen de Orden */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Resumen del Pedido</h2>
          
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center text-3xl">
               🎫
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{event.title}</h3>
              <p className="text-sm text-gray-500">{new Date(event.date_time).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">{event.location}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Precio por ticket</span>
              <span className="font-semibold text-gray-800">Q{event.price}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Cantidad</span>
              <div className="flex items-center gap-3 bg-white border rounded-lg px-2 py-1">
                <button 
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-secondary-600 font-bold hover:bg-secondary-50 rounded"
                >
                  -
                </button>
                <span className="font-bold w-4 text-center">{quantity}</span>
                <button 
                  type="button"
                  onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  className="w-8 h-8 flex items-center justify-center text-primary-600 font-bold hover:bg-primary-50 rounded"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-300">
              <span className="text-xl font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">Q{totalPrice}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
