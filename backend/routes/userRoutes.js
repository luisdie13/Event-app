// backend/routes/userRoutes.js
import express from 'express';
import { 
    getProfile, 
    updateProfile, 
    changePassword,
    getCards,
    createCard,
    removeCard,
    setCardAsDefault
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// GET /api/users/profile - Obtener perfil del usuario
router.get('/profile', getProfile);

// PUT /api/users/profile - Actualizar perfil del usuario
router.put('/profile', updateProfile);

// PUT /api/users/password - Cambiar contraseña
router.put('/password', changePassword);

// GET /api/users/cards - Obtener tarjetas del usuario
router.get('/cards', getCards);

// POST /api/users/cards - Agregar nueva tarjeta
router.post('/cards', createCard);

// DELETE /api/users/cards/:cardId - Eliminar tarjeta
router.delete('/cards/:cardId', removeCard);

// PUT /api/users/cards/:cardId/default - Establecer tarjeta como predeterminada
router.put('/cards/:cardId/default', setCardAsDefault);

export default router;
