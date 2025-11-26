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
 * @desc Crear un nuevo evento (admin)
 * @route POST /api/admin/events
 * @access Private/Admin
 */
export const createEventAdmin = async (req, res) => {
    try {
        const {
            title,
            description,
            date_time,
            location,
            category_id,
            total_tickets,
            price,
            is_featured
        } = req.body;

        // Validación básica
        if (!title || !description || !date_time || !location || !category_id || !total_tickets || !price) {
            return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados.' });
        }

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');
        
        const result = await pool.query(`
            INSERT INTO events (
                user_id, category_id, title, slug, description, date_time, 
                location, total_tickets, available_tickets, price, is_featured
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10)
            RETURNING *
        `, [req.user.id, category_id, title, slug, description, date_time, location, total_tickets, price, is_featured || false]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear evento:', error);
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Ya existe un evento con un título similar.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear el evento.' });
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

        res.status(200).json(updatedEvent);

    } catch (error) {
        console.error(`Error al actualizar evento ID ${id}:`, error.message);
        // Usar 404 si la query falla porque no encuentra el evento
        if (error.message.includes('Evento no encontrado')) {
             return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar el evento.' });
    }
};
