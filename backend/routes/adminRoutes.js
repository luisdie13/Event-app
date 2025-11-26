import { Router } from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getAllEventsForAdmin, deleteEvent, updateEvent, createEventAdmin } from '../controllers/adminEventController.js';
import { getAllUsers, updateUserRole, deleteUser } from '../controllers/adminUserController.js';
import { getReports } from '../controllers/reportController.js';

const router = Router();

// Todas las rutas en este archivo están protegidas por 'protect' y 'admin'

// --- Rutas de Gestión de Eventos (Eventos CRUD) ---
// GET /api/admin/events
router.get('/events', protect, admin, getAllEventsForAdmin);
// POST /api/admin/events
router.post('/events', protect, admin, createEventAdmin);
// DELETE /api/admin/events/:id
router.delete('/events/:id', protect, admin, deleteEvent);
// PUT /api/admin/events/:id (Placeholder para edición)
router.put('/events/:id', protect, admin, updateEvent);

// --- Rutas de Gestión de Usuarios (Users CRUD) ---
// GET /api/admin/users
router.get('/users', protect, admin, getAllUsers);
// PUT /api/admin/users/:userId/role
router.put('/users/:userId/role', protect, admin, updateUserRole);
// DELETE /api/admin/users/:userId
router.delete('/users/:userId', protect, admin, deleteUser);

// --- Rutas de Reportes ---
// GET /api/admin/reports
router.get('/reports', protect, admin, getReports);

export default router;
