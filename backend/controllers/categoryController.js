// backend/controllers/categoryController.js

// Usamos 'import' y la extensión '.js' para referenciar el archivo del modelo (queries)
import { getAllCategories } from '../database/categoryQueries.js';

/**
 * GET /api/categories
 * Obtiene la lista completa de categorías.
 */
// Usamos 'export' para que esta función esté disponible para el archivo de rutas
export const getCategories = async (req, res) => {
    try {
        const categories = await getAllCategories();

        if (categories.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(categories);
    } catch (error) {
        console.error('Error en getCategories:', error.message); 
        res.status(500).json({ 
            message: 'Error interno del servidor al obtener categorías.' 
        });
    }
};