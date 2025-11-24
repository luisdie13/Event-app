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
  
  // Datos del formulario de pago (Simulados visualmente)
  const [paymentData, setPaymentData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  useEffect(() => {
    // 1. Si no está logueado, mandar al login
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // 2. Cargar detalles del evento (Usando la ruta correcta por ID)
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/events/id/${eventId}`);
        
        if (response.ok) {
          const data = await response.json();
          setEvent(data);
        } else {
          alert("Evento no encontrado o no disponible.");
          navigate('/');
        }
      } catch (error) {
        console.error("Error fetching event for checkout:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, isLoggedIn, navigate]);

  const handleInputChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  // 👇 FUNCIÓN CORREGIDA: Ahora guarda la compra en la Base de Datos
  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // 1. Enviar la orden al backend
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Autenticación obligatoria
        },
        body: JSON.stringify({
          eventId: event.id,
          quantity: quantity,
          // Nota: En un sistema real, aquí enviarías un token de Stripe/PayPal, no los datos crudos.
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al procesar la compra.");
      }

      // 2. Éxito
      alert(`¡Compra Exitosa! 🎉\n\n${data.message}`);
      navigate('/'); // Redirigir al inicio (o a una página de "Mis Tickets")

    } catch (error) {
      console.error("Error de pago:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
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
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre en la tarjeta</label>
              <input 
                required type="text" name="cardName" placeholder="Juan Pérez" 
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Número de Tarjeta</label>
              <input 
                required type="text" name="cardNumber" placeholder="0000 0000 0000 0000" maxLength="19"
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Vencimiento</label>
                <input 
                  required type="text" name="expiry" placeholder="MM/YY" maxLength="5"
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">CVC</label>
                <input 
                  required type="text" name="cvc" placeholder="123" maxLength="3"
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={processing}
              className={`w-full py-4 mt-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${
                processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900 hover:shadow-xl'
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
                  onClick={() => setQuantity(q => Math.min(10, q + 1))} // Límite de 10 tickets por compra
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
