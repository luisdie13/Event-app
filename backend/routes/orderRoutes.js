// backend/routes/orderRoutes.js
import { Router } from 'express';
import { createOrder, getMyTickets } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/orders - Crear una nueva orden (compra)
router.post('/', protect, createOrder);

// GET /api/orders/my-tickets - Obtener tickets del usuario autenticado
router.get('/my-tickets', protect, getMyTickets);

export default router;
