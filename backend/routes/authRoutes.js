// backend/routes/authRoutes.js
import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = Router();

// Ruta de Registro: POST /api/auth/register
router.post('/register', registerUser);

// Ruta de Login: POST /api/auth/login
router.post('/login', loginUser);

export default router;