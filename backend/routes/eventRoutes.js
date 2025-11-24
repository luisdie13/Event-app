// backend/routes/eventRoutes.js
import { Router } from 'express';
// 👇 AGREGADO: Importamos el nuevo controlador 'getEventById'
import { 
    getFeatured, 
    getEvents, 
    getEventDetail, 
    createEventController, 
    getEventById 
} from '../controllers/eventController.js'; 

import { protect, admin } from '../middleware/authMiddleware.js'; 

const router = Router();

// --- Rutas Públicas (GET) ---

// 1. Obtener todos o filtrar
router.get('/', getEvents);
router.get('/category/:slug', getEvents); 

// 2. Eventos destacados
router.get('/featured', getFeatured);

// 3. 👇 NUEVO: Obtener evento por ID (Para el Checkout)
// IMPORTANTE: Esta ruta debe ir ANTES de /:slug para evitar conflictos
router.get('/id/:id', getEventById);

// 4. Obtener detalle por Slug (Para la vista de detalles)
router.get('/:slug', getEventDetail); 


// --- Rutas Privadas (POST/PUT/DELETE) ---

// 5. Crear evento (Solo Admin)
router.post('/', protect, admin, createEventController);

export default router;