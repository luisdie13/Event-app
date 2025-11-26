// backend/database/eventQueries.js

// Importamos 'pool' en lugar de 'db'
import { pool } from './db.js';

/**
 * Obtiene una lista de eventos marcados como destacados (is_featured = TRUE).
 * @returns {Promise<Array>} Array de objetos de eventos.
 */
export const getFeaturedEvents = async () => {
    const sql = `
        SELECT 
            e.id, 
            e.title, 
            e.slug,
            e.date_time, 
            e.location,
            e.price,
            e.is_featured,
            c.name AS category_name,
            (SELECT url FROM images WHERE event_id = e.id AND is_main = TRUE LIMIT 1) AS main_image_url
        FROM 
            events e
        JOIN 
            categories c ON e.category_id = c.id
        WHERE 
            e.is_featured = TRUE AND e.date_time >= NOW()
        ORDER BY 
            e.date_time ASC
        LIMIT 
            10;
    `;

    try {
        // 👇 USO DE POOL
        const result = await pool.query(sql);
        return result.rows;
    } catch (error) {
        console.error("Error al obtener eventos destacados:", error);
        throw new Error("No se pudieron obtener los eventos destacados de la base de datos.");
    }
};

/**
 * Obtiene todos los eventos, opcionalmente filtrados por slug de categoría.
 * @param {string} categorySlug - El slug de la categoría para filtrar.
 * @returns {Promise<Array>} Array de objetos de eventos.
 */
export const getEventsList = async (categorySlug) => {
    let sql = `
        SELECT 
            e.id, 
            e.title, 
            e.slug,
            e.date_time, 
            e.location,
            e.price,
            c.name AS category_name,
            (SELECT url FROM images WHERE event_id = e.id AND is_main = TRUE LIMIT 1) AS main_image_url
        FROM 
            events e
        JOIN 
            categories c ON e.category_id = c.id
        WHERE 
            e.date_time >= NOW()
    `;
    
    const params = [];

    if (categorySlug) {
        sql += ` AND c.slug = $1`;
        params.push(categorySlug);
    }

    sql += ` ORDER BY e.date_time ASC LIMIT 10`;

    try {
        // 👇 USO DE POOL
        const result = await pool.query(sql, params);
        return result.rows;
    } catch (error) {
        console.error("Error al obtener lista de eventos:", error);
        throw new Error("No se pudieron obtener los eventos.");
    }
};

/**
 * Obtiene todos los detalles de un evento específico por su slug.
 * @param {string} slug - El slug único del evento.
 * @returns {Promise<Object>} Objeto del evento o null.
 */
export const getEventBySlug = async (slug) => {
    const sql = `
        SELECT 
            e.id, 
            e.title, 
            e.slug,
            e.description, 
            e.date_time, 
            e.location, 
            e.total_tickets, 
            e.available_tickets, 
            e.price, 
            e.is_featured,
            c.name AS category_name,
            c.slug AS category_slug,
            (SELECT json_agg(url) FROM images WHERE event_id = e.id) AS image_urls
        FROM 
            events e
        JOIN 
            categories c ON e.category_id = c.id
        WHERE 
            e.slug = $1
    `;

    try {
        // 👇 USO DE POOL
        const result = await pool.query(sql, [slug]);
        return result.rows[0] || null;
    } catch (error) {
        console.error("Error al obtener evento por slug:", error);
        throw new Error("No se pudo obtener el detalle del evento.");
    }
};

/**
 * Inserta un nuevo evento en la base de datos.
 * @param {Object} eventData - Datos del evento (title, description, price, etc.)
 * @param {number} userId - ID del usuario creador.
 * @returns {Promise<Object>} El evento creado.
 */
export const createEvent = async (eventData, userId) => {
    const { 
        title, 
        description, 
        dateTime, 
        location, 
        totalTickets, 
        price, 
        categoryId, 
        mainImageUrl 
    } = eventData;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');
    
    // 👇 CORRECCIÓN: pool.connect() directamente
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // A. Insertar el Evento
        const eventSql = `
            INSERT INTO events (
                user_id, category_id, title, slug, description, date_time, 
                location, total_tickets, available_tickets, price, is_featured
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9, FALSE)
            RETURNING id, title, slug, date_time;
        `;
        const eventParams = [
            userId, categoryId, title, slug, description, dateTime, 
            location, totalTickets, price
        ];

        const eventResult = await client.query(eventSql, eventParams);
        const newEventId = eventResult.rows[0].id;
        
        // B. Insertar la Imagen principal (si existe)
        if (mainImageUrl) {
            const imageSql = `
                INSERT INTO images (event_id, url, is_main)
                VALUES ($1, $2, TRUE);
            `;
            await client.query(imageSql, [newEventId, mainImageUrl]);
        }

        await client.query('COMMIT');

        return eventResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error en la transacción de creación de evento:", error);
        if (error.code === '23505') { 
            throw new Error("Ya existe un evento con un título similar.");
        }
        throw new Error("Fallo en la creación del evento.");
    } finally {
        client.release();
    }
};
