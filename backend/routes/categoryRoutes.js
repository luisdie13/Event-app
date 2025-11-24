// backend/routes/categoryRoutes.js
import { Router } from 'express'; // Importamos Router de express
import { getCategories } from '../controllers/categoryController.js'; // Importamos la función controladora

const router = Router(); // Usamos Router()

// Ruta para obtener todas las categorías
// GET /api/categories
router.get('/', getCategories); // Referenciamos directamente la función importada

export default router;