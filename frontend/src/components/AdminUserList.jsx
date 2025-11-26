import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3001';

const AdminUserList = () => {
    const { token, user: currentUser } = useAuth();
    
    // Estados de datos y carga
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para el formulario de "Crear Usuario"
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role_id: 2 }); // 2 = Member por defecto

    // Constantes de Roles
    const ADMIN_ROLE_ID = 5; 
    const MEMBER_ROLE_ID = 2; 

    // --- FETCH USUARIOS ---
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Fallo al cargar usuarios.');
            }

            const data = await response.json();
            setUsers(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token]);

    // --- CAMBIAR ROL (EXISTENTE) ---
    const handleRoleChange = async (userId, currentRoleName) => {
        const newRoleName = currentRoleName === 'administrator' ? 'member' : 'administrator';
        
        if (userId === currentUser.id) {
            setStatusMessage({ type: 'error', message: 'No puedes cambiar tu propio rol en el panel por seguridad.' });
            return;
        }

        if (!window.confirm(`¿Estás seguro de que deseas cambiar el rol a ${newRoleName}?`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ roleName: newRoleName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al cambiar el rol.');
            }

            // Actualizar localmente
            setUsers(prevUsers => 
                prevUsers.map(u => 
                    u.id === userId ? { 
                        ...u, 
                        role_name: newRoleName, 
                        role_id: newRoleName === 'administrator' ? ADMIN_ROLE_ID : MEMBER_ROLE_ID 
                    } : u
                )
            );
            setStatusMessage({ type: 'success', message: `Rol actualizado correctamente a ${newRoleName}.` });

        } catch (e) {
            setStatusMessage({ type: 'error', message: e.message });
        }
    };

    // --- ELIMINAR USUARIO (NUEVO) ---
    const handleDeleteUser = async (userId, userName) => {
        if (userId === currentUser.id) {
            setStatusMessage({ type: 'error', message: 'No puedes eliminar tu propia cuenta.' });
            return;
        }

        if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al eliminar el usuario.');
            }

            // Actualizar lista eliminando el usuario
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
            setStatusMessage({ type: 'success', message: data.message });

        } catch (e) {
            setStatusMessage({ type: 'error', message: e.message });
        }
    };

    // --- CREAR NUEVO USUARIO (NUEVO) ---
    const handleInputChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setStatusMessage({ type: '', message: '' });

        try {
            // Nota: Usamos el endpoint de registro. Si tu backend requiere un endpoint específico de admin
            // para crear usuarios con rol directo, asegúrate de ajustarlo aquí.
            const response = await fetch(`${API_URL}/api/auth/register`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Si el registro es público no necesita token, pero si es admin creation, lo enviamos por si acaso
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(newUser)
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Error al crear usuario');

            setStatusMessage({ type: 'success', message: 'Usuario creado exitosamente.' });
            setNewUser({ name: '', email: '', password: '', role_id: MEMBER_ROLE_ID }); // Reset form
            setShowCreateForm(false); // Ocultar form
            fetchUsers(); // Recargar lista

        } catch (error) {
            setStatusMessage({ type: 'error', message: error.message });
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">Cargando usuarios...</div>;
    if (error) return <div className="text-center py-10 text-red-600">Error: {error}</div>;

    // Filtrar usuarios basándose en el término de búsqueda
    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.role_name.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            
            {/* CABECERA: Título y Botón Agregar */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    Lista de Usuarios <span className="text-gray-500 text-lg">({users.length})</span>
                </h2>
                {!showCreateForm && (
                    <button 
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-400 hover:bg-blue-500 text-blue-900 px-4 py-2 rounded-lg shadow transition duration-150 flex items-center gap-2 text-sm font-bold"
                    >
                        <span>👤</span> Agregar Usuario
                    </button>
                )}
            </div>

            {/* Barra de búsqueda */}
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar usuarios por nombre, email o rol..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-12 py-3 pl-11 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm text-gray-900"
                        style={{ paddingLeft: '2.75rem' }}
                    />
                    <svg 
                        className="absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                        style={{ left: '0.75rem' }}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Limpiar búsqueda"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                {searchTerm && (
                    <p className="mt-2 text-sm text-gray-600">
                        Mostrando {filteredUsers.length} de {users.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            {/* MENSAJES DE ESTADO */}
            {statusMessage.message && (
                <div className={`p-3 mb-4 rounded-lg text-sm border ${
                    statusMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
                }`}>
                    {statusMessage.message}
                </div>
            )}

            {/* FORMULARIO DE CREACIÓN (DESPLEGABLE) */}
            {showCreateForm && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8 animate-fade-in">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Registrar Nuevo Usuario</h3>
                    <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                            <input 
                                type="text" name="name" value={newUser.name} onChange={handleInputChange} required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                            <input 
                                type="email" name="email" value={newUser.email} onChange={handleInputChange} required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="usuario@ejemplo.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <input 
                                type="password" name="password" value={newUser.password} onChange={handleInputChange} required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="********"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol Inicial</label>
                            <select 
                                name="role_id" value={newUser.role_id} onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                            >
                                <option value={MEMBER_ROLE_ID}>Miembro (Usuario Normal)</option>
                                <option value={ADMIN_ROLE_ID}>Administrador</option>
                            </select>
                        </div>
                        
                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                            <button 
                                type="button" onClick={() => setShowCreateForm(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md transition font-medium"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit"
                                className="px-6 py-2 bg-blue-400 hover:bg-blue-500 text-blue-900 rounded-md transition shadow font-bold"
                            >
                                Guardar Usuario
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TABLA DE USUARIOS */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol Actual</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {user.name} 
                                    {user.id === currentUser?.id && <span className="ml-2 text-xs text-primary-600 font-bold">(Tú)</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                        user.role_name === 'administrator' 
                                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                            : 'bg-green-100 text-green-800 border border-green-200'
                                    }`}>
                                        {user.role_name === 'administrator' ? 'Administrador' : 'Miembro'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => handleRoleChange(user.id, user.role_name)}
                                        disabled={user.id === currentUser?.id}
                                        className={`px-3 py-1 text-xs font-bold rounded shadow-sm transition duration-150 border ${
                                            user.id === currentUser?.id 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                                                : user.role_name === 'administrator' 
                                                    ? 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50' 
                                                    : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                                        }`}
                                    >
                                        {user.role_name === 'administrator' ? '⬇ Degradar' : '⬆ Promover'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                        disabled={user.id === currentUser?.id}
                                        className={`px-3 py-1 text-xs font-bold rounded shadow-sm transition duration-150 border ${
                                            user.id === currentUser?.id 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                                                : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                                        }`}
                                    >
                                        🗑️ Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Mensaje cuando no hay usuarios */}
            {users.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">No hay usuarios registrados todavía.</p>
                </div>
            )}
            
            {/* Mensaje cuando no hay resultados de búsqueda */}
            {users.length > 0 && filteredUsers.length === 0 && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-gray-400 text-lg">No se encontraron usuarios que coincidan con "{searchTerm}"</p>
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="mt-3 text-primary-600 hover:text-primary-800 font-medium"
                    >
                        Limpiar búsqueda
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminUserList;
