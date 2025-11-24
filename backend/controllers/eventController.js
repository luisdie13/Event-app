// backend/controllers/eventController.js

// Importamos las queries existentes
import { getFeaturedEvents, getEventsList, getEventBySlug, createEvent } from '../database/eventQueries.js'; 

// Apuntamos a la carpeta 'database' donde está db.js
import { pool } from '../database/db.js';

/**
 * GET /api/events/featured
 * Controlador para obtener los eventos destacados.
 */
export const getFeatured = async (req, res) => {
    try {
        const events = await getFeaturedEvents(); 
        
        if (events.length === 0) {
            return res.status(200).json([]); 
        }

        res.status(200).json(events);
    } catch (error) {
        console.error('Error en getFeatured:', error.message); 
        res.status(500).json({ 
            message: 'Error interno del servidor al obtener eventos destacados.' 
        });
    }
};

/**
 * GET /api/events
 * GET /api/events/category/:slug
 */
export const getEvents = async (req, res) => {
    const categorySlug = req.params.slug; 

    try {
        const events = await getEventsList(categorySlug);
        
        if (events.length === 0) {
            return res.status(200).json([]);
        }
        
        res.status(200).json(events);
    } catch (error) {
        console.error('Error en getEvents:', error.message);
        res.status(500).json({ 
            message: 'Error interno del servidor al obtener la lista de eventos.' 
        });
    }
};

/**
 * GET /api/events/:slug
 * Busca por URL amigable (ej: concierto-rock)
 */
export const getEventDetail = async (req, res) => {
    const { slug } = req.params;

    try {
        const event = await getEventBySlug(slug);

        if (!event) {
            return res.status(404).json({ message: 'Evento no encontrado.' });
        }

        res.status(200).json(event);
    } catch (error) {
        console.error('Error en getEventDetail:', error.message);
        res.status(500).json({ 
            message: 'Error interno del servidor al obtener el detalle del evento.' 
        });
    }
};

/**
 * GET /api/events/id/:id
 * 👇 NUEVA FUNCIÓN: Busca por ID exacto (UUID) para el Checkout
 */
export const getEventById = async (req, res) => {
    const { id } = req.params;

    try {
        // Consulta directa para obtener el evento por ID
        const result = await pool.query(`
            SELECT e.*, c.name as category_name 
            FROM events e
            JOIN categories c ON e.category_id = c.id
            WHERE e.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Evento no encontrado por ID' });
        }

        // Devolvemos el primer resultado
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error en getEventById:', error.message);
        res.status(500).json({ 
            message: 'Error interno del servidor al buscar evento por ID.' 
        });
    }
};

/**
 * POST /api/events
 * Crea un nuevo evento. Requiere autenticación.
 */
export const createEventController = async (req, res) => {
    // Los datos del usuario vienen del middleware 'protect'
    const userId = req.user.id; 
    const eventData = req.body;

    // Validación básica de campos obligatorios
    const requiredFields = ['title', 'description', 'dateTime', 'location', 'totalTickets', 'price', 'categoryId'];
    for (const field of requiredFields) {
        if (!eventData[field]) {
            return res.status(400).json({ message: `El campo '${field}' es obligatorio.` });
        }
    }

    try {
        const newEvent = await createEvent(eventData, userId);

        res.status(201).json({ 
            message: 'Evento creado exitosamente.',
            event: newEvent
        });

    } catch (error) {
        console.error('Error al crear evento:', error.message);
        // Manejo de errores específicos lanzados desde las queries
        if (error.message.includes('Fallo en la creación del evento.') || error.message.includes('Ya existe un evento')) {
             return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear el evento.' });
    }
};