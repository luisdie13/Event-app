// frontend/src/components/AdminReports.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3001';

const AdminReports = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/admin/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener reportes');
      }

      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!reports) {
    return null;
  }

  return (
    <div className="space-y-12">
      <h2 className="text-3xl font-bold text-white mb-12">📊 Reportes y Estadísticas</h2>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Ventas Totales</p>
              <p className="text-3xl font-bold mt-2">
                ${reports.sales.total_sales.toFixed(2)}
              </p>
            </div>
            <div className="text-5xl opacity-50">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Tickets Vendidos</p>
              <p className="text-3xl font-bold mt-2">
                {reports.sales.total_tickets_sold}
              </p>
            </div>
            <div className="text-5xl opacity-50">🎫</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Asistentes Únicos</p>
              <p className="text-3xl font-bold mt-2">
                {reports.attendees.total_attendees}
              </p>
            </div>
            <div className="text-5xl opacity-50">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Eventos Próximos</p>
              <p className="text-3xl font-bold mt-2">
                {reports.statistics.upcoming_events}
              </p>
            </div>
            <div className="text-5xl opacity-50">📅</div>
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-4 border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Estadísticas Generales</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-800">{reports.statistics.total_members}</p>
            <p className="text-sm text-gray-600 mt-1">Miembros Totales</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-800">{reports.statistics.total_events}</p>
            <p className="text-sm text-gray-600 mt-1">Eventos Totales</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-800">{reports.statistics.upcoming_events}</p>
            <p className="text-sm text-gray-600 mt-1">Eventos Próximos</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-800">{reports.statistics.past_events}</p>
            <p className="text-sm text-gray-600 mt-1">Eventos Pasados</p>
          </div>
        </div>
      </div>

      {/* Top 10 Eventos */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-4 border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Top 10 Eventos por Ingresos</h3>
        {reports.top_events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tickets Vendidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingresos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.top_events.map((event, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.tickets_sold}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        ${event.revenue.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay datos de ventas disponibles</p>
        )}
      </div>

      {/* Ventas por Categoría */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-4 border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Ventas por Categoría</h3>
        {reports.by_category.length > 0 ? (
          <div className="space-y-3">
            {reports.by_category.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{category.category_name}</p>
                  <p className="text-sm text-gray-600">{category.tickets_sold} tickets vendidos</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    ${category.revenue.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay datos de categorías disponibles</p>
        )}
      </div>

      {/* Botón de Actualizar */}
      <div className="text-center">
        <button
          onClick={fetchReports}
          className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-150"
        >
          🔄 Actualizar Reportes
        </button>
      </div>
    </div>
  );
};

export default AdminReports;
