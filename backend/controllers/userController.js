// backend/controllers/userController.js
import { getUserById, updateUserProfile, updateUserPassword } from '../database/userQueries.js';
import { getUserCards, addCard, deleteCard, setDefaultCard } from '../database/cardQueries.js';
import bcrypt from 'bcrypt';

/**
 * GET /api/users/profile
 * Obtener perfil del usuario autenticado
 */
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await getUserById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        
        // No devolver el password_hash
        const { password_hash, ...userProfile } = user;
        
        res.status(200).json(userProfile);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * GET /api/users/cards
 * Obtener todas las tarjetas del usuario
 */
export const getCards = async (req, res) => {
    try {
        const userId = req.user.id;
        const cards = await getUserCards(userId);
        
        res.status(200).json(cards);
    } catch (error) {
        console.error('Error al obtener tarjetas:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * POST /api/users/cards
 * Agregar una nueva tarjeta
 */
export const createCard = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cardHolderName, cardNumberLast4, cardBrand, expiryMonth, expiryYear, isDefault } = req.body;
        
        // Validación
        if (!cardHolderName || !cardNumberLast4 || !cardBrand || !expiryMonth || !expiryYear) {
            return res.status(400).json({ message: 'Todos los campos de la tarjeta son obligatorios.' });
        }
        
        // Validar que cardNumberLast4 tenga exactamente 4 dígitos
        if (!/^\d{4}$/.test(cardNumberLast4)) {
            return res.status(400).json({ message: 'Los últimos 4 dígitos deben ser numéricos.' });
        }
        
        // Validar mes
        if (expiryMonth < 1 || expiryMonth > 12) {
            return res.status(400).json({ message: 'Mes de expiración inválido.' });
        }
        
        // Validar año (debe ser año actual o futuro)
        const currentYear = new Date().getFullYear();
        if (expiryYear < currentYear) {
            return res.status(400).json({ message: 'Año de expiración inválido.' });
        }
        
        const newCard = await addCard(userId, {
            cardHolderName,
            cardNumberLast4,
            cardBrand,
            expiryMonth,
            expiryYear,
            isDefault
        });
        
        res.status(201).json({
            message: 'Tarjeta agregada exitosamente.',
            card: newCard
        });
    } catch (error) {
        console.error('Error al agregar tarjeta:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * DELETE /api/users/cards/:cardId
 * Eliminar una tarjeta
 */
export const removeCard = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cardId } = req.params;
        
        const deleted = await deleteCard(cardId, userId);
        
        if (!deleted) {
            return res.status(404).json({ message: 'Tarjeta no encontrada.' });
        }
        
        res.status(200).json({ message: 'Tarjeta eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar tarjeta:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * PUT /api/users/cards/:cardId/default
 * Establecer una tarjeta como predeterminada
 */
export const setCardAsDefault = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cardId } = req.params;
        
        const updatedCard = await setDefaultCard(cardId, userId);
        
        if (!updatedCard) {
            return res.status(404).json({ message: 'Tarjeta no encontrada.' });
        }
        
        res.status(200).json({
            message: 'Tarjeta establecida como predeterminada.',
            card: updatedCard
        });
    } catch (error) {
        console.error('Error al establecer tarjeta predeterminada:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * PUT /api/users/profile
 * Actualizar perfil del usuario autenticado
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email } = req.body;
        
        // Validación
        if (!name || !email) {
            return res.status(400).json({ message: 'Nombre y email son obligatorios.' });
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Formato de email inválido.' });
        }
        
        const updatedUser = await updateUserProfile(userId, name, email);
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        
        // No devolver el password_hash
        const { password_hash, ...userProfile } = updatedUser;
        
        res.status(200).json({
            message: 'Perfil actualizado exitosamente.',
            user: userProfile
        });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        
        // Manejo de error de email duplicado
        if (error.code === '23505' && error.constraint === 'users_email_key') {
            return res.status(409).json({ message: 'Este email ya está en uso.' });
        }
        
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * PUT /api/users/password
 * Cambiar contraseña del usuario autenticado
 */
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        
        // Validación
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Contraseña actual y nueva contraseña son obligatorias.' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        }
        
        // Obtener usuario
        const user = await getUserById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        
        // Verificar contraseña actual
        const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta.' });
        }
        
        // Hash de la nueva contraseña
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        
        // Actualizar contraseña
        await updateUserPassword(userId, newPasswordHash);
        
        res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
