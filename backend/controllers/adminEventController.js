import { pool } from '../database/db.js';
import { updateEventData } from '../database/adminEventQueries.js'; // Función de actualización

/**
 * @desc Obtener todos los eventos para el panel de administración
 * @route GET /api/admin/events
 * @access Private/Admin
 */
export const getAllEventsForAdmin = async (req, res) => {
    try {
        // CORREGIDO: Consulta que trae todos los datos necesarios para la tabla de administración y el formulario de edición.
        const result = await pool.query(`
            SELECT 
                e.id, 
                e.title, 
                e.slug, 
                e.date_time, 
                e.location,
                e.total_tickets,
                e.available_tickets,
                e.price,
                e.is_featured,
                c.id AS category_id,
                c.name AS category_name,
                (SELECT url FROM images WHERE event_id = e.id AND is_main = TRUE LIMIT 1) AS main_image_url
            FROM events e
            JOIN categories c ON e.category_id = c.id
            ORDER BY e.date_time DESC
        `);
        
        console.log(`Admin ${req.user.id} solicitando todos los eventos.`);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los eventos para admin:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener eventos de administración.' });
    }
};

/**
 * @desc Eliminar un evento
 * @route DELETE /api/admin/events/:id
 * @access Private/Admin
 */
export const deleteEvent = async (req, res) => {
    const { id } = req.params;
    try {
        // En PostgreSQL, DELETE en la tabla 'events' con ON DELETE CASCADE debería manejar las 'images' y 'tickets'.
        const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: `Evento con ID ${id} no encontrado.` });
        }
        
        res.status(200).json({ message: `Evento ID ${id} eliminado exitosamente.` });
    } catch (error) {
        console.error(`Error al eliminar evento ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar el evento.' });
    }
};

/**
 * @desc Actualizar un evento
 * @route PUT /api/admin/events/:id
 * @access Private/Admin
 */
export const updateEvent = async (req, res) => {
    const { id } = req.params;
    const eventData = req.body;
    
    // Validación básica de ID
    if (!id) {
        return res.status(400).json({ message: 'ID de evento es requerido para la actualización.' });
    }

    try {
        const updatedEvent = await updateEventData(id, eventData);

        res.status(200).json({
            message: 'Evento actualizado exitosamente.',
            event: updatedEvent,
        });

    } catch (error) {
        console.error(`Error al actualizar evento ID ${id}:`, error.message);
        // Usar 404 si la query falla porque no encuentra el evento
        if (error.message.includes('Evento no encontrado')) {
             return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar el evento.' });
    }
};