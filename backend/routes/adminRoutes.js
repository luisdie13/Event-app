import { Router } from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getAllEventsForAdmin, deleteEvent, updateEvent } from '../controllers/adminEventController.js';
import { getAllUsers, updateUserRole } from '../controllers/adminUserController.js';
import { getReports } from '../controllers/reportController.js';

const router = Router();

// Todas las rutas en este archivo están protegidas por 'protect' y 'admin'

// --- Rutas de Gestión de Eventos (Eventos CRUD) ---
// GET /api/admin/events
router.get('/events', protect, admin, getAllEventsForAdmin);
// DELETE /api/admin/events/:id
router.delete('/events/:id', protect, admin, deleteEvent);
// PUT /api/admin/events/:id (Placeholder para edición)
router.put('/events/:id', protect, admin, updateEvent); 

// --- Rutas de Gestión de Usuarios (Users CRUD) ---
// GET /api/admin/users
router.get('/users', protect, admin, getAllUsers);
// PUT /api/admin/users/:userId/role
router.put('/users/:userId/role', protect, admin, updateUserRole);

// --- Rutas de Reportes ---
// GET /api/admin/reports
router.get('/reports', protect, admin, getReports);

export default router;
