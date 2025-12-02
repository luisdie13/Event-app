// backend/database/eventQueries.js

// Importamos 'pool' en lugar de 'db'
import { pool } from './db.js';

/**
 * Obtiene una lista de eventos marcados como destacados (is_featured = TRUE).
 * @param {number} page - Número de página (por defecto 1)
 * @param {number} limit - Eventos por página (por defecto 6)
 * @returns {Promise<Object>} Objeto con eventos y metadatos de paginación
 */
export const getFeaturedEvents = async (page = 1, limit = 6) => {
    const offset = (page - 1) * limit;

    // Consulta para obtener el total de eventos destacados
    const countSql = `
        SELECT COUNT(*) as total
        FROM events e
        WHERE e.is_featured = TRUE AND e.date_time >= NOW()
    `;

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
        LIMIT $1 OFFSET $2;
    `;

    try {
        // Obtener el total de eventos
        const countResult = await pool.query(countSql);
        const total = parseInt(countResult.rows[0].total);
        
        // Obtener los eventos paginados
        const result = await pool.query(sql, [limit, offset]);
        
        return {
            events: result.rows,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalEvents: total,
                eventsPerPage: limit,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        };
    } catch (error) {
        console.error("Error al obtener eventos destacados:", error);
        throw new Error("No se pudieron obtener los eventos destacados de la base de datos.");
    }
};

/**
 * Obtiene todos los eventos con filtros avanzados.
 * @param {Object} filters - Objeto con filtros (categorySlug, search, minPrice, maxPrice, dateFrom, dateTo, location, sortBy)
 * @param {number} page - Número de página (por defecto 1)
 * @param {number} limit - Eventos por página (por defecto 9)
 * @returns {Promise<Object>} Objeto con eventos y metadatos de paginación
 */
export const getEventsList = async (filters = {}, page = 1, limit = 9) => {
    const offset = (page - 1) * limit;
    const { categorySlug, search, minPrice, maxPrice, dateFrom, dateTo, location, sortBy } = filters;
    
    let countSql = `
        SELECT COUNT(*) as total
        FROM events e
        JOIN categories c ON e.category_id = c.id
        WHERE e.date_time >= NOW()
    `;
    
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
    const countParams = [];
    let paramIndex = 1;

    // Filtro por categoría
    if (categorySlug) {
        sql += ` AND c.slug = $${paramIndex}`;
        countSql += ` AND c.slug = $${paramIndex}`;
        params.push(categorySlug);
        countParams.push(categorySlug);
        paramIndex++;
    }

    // Filtro por búsqueda de texto (título o descripción)
    if (search && search.trim() !== '') {
        sql += ` AND (LOWER(e.title) LIKE $${paramIndex} OR LOWER(e.description) LIKE $${paramIndex})`;
        countSql += ` AND (LOWER(e.title) LIKE $${paramIndex} OR LOWER(e.description) LIKE $${paramIndex})`;
        const searchPattern = `%${search.toLowerCase()}%`;
        params.push(searchPattern);
        countParams.push(searchPattern);
        paramIndex++;
    }

    // Filtro por precio mínimo
    if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
        sql += ` AND e.price >= $${paramIndex}`;
        countSql += ` AND e.price >= $${paramIndex}`;
        params.push(parseFloat(minPrice));
        countParams.push(parseFloat(minPrice));
        paramIndex++;
    }

    // Filtro por precio máximo
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
        sql += ` AND e.price <= $${paramIndex}`;
        countSql += ` AND e.price <= $${paramIndex}`;
        params.push(parseFloat(maxPrice));
        countParams.push(parseFloat(maxPrice));
        paramIndex++;
    }

    // Filtro por fecha desde
    if (dateFrom) {
        sql += ` AND e.date_time >= $${paramIndex}`;
        countSql += ` AND e.date_time >= $${paramIndex}`;
        params.push(dateFrom);
        countParams.push(dateFrom);
        paramIndex++;
    }

    // Filtro por fecha hasta
    if (dateTo) {
        sql += ` AND e.date_time <= $${paramIndex}`;
        countSql += ` AND e.date_time <= $${paramIndex}`;
        params.push(dateTo);
        countParams.push(dateTo);
        paramIndex++;
    }

    // Filtro por ubicación
    if (location && location.trim() !== '') {
        sql += ` AND LOWER(e.location) LIKE $${paramIndex}`;
        countSql += ` AND LOWER(e.location) LIKE $${paramIndex}`;
        const locationPattern = `%${location.toLowerCase()}%`;
        params.push(locationPattern);
        countParams.push(locationPattern);
        paramIndex++;
    }

    // Ordenamiento
    let orderClause = 'ORDER BY e.date_time ASC'; // Por defecto: fecha ascendente
    if (sortBy) {
        switch(sortBy) {
            case 'date_asc':
                orderClause = 'ORDER BY e.date_time ASC';
                break;
            case 'date_desc':
                orderClause = 'ORDER BY e.date_time DESC';
                break;
            case 'price_asc':
                orderClause = 'ORDER BY e.price ASC';
                break;
            case 'price_desc':
                orderClause = 'ORDER BY e.price DESC';
                break;
            case 'title_asc':
                orderClause = 'ORDER BY e.title ASC';
                break;
            case 'title_desc':
                orderClause = 'ORDER BY e.title DESC';
                break;
            default:
                orderClause = 'ORDER BY e.date_time ASC';
        }
    }

    sql += ` ${orderClause} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    try {
        // Obtener el total de eventos
        const countResult = await pool.query(countSql, countParams);
        const total = parseInt(countResult.rows[0].total);
        
        // Obtener los eventos paginados
        const result = await pool.query(sql, params);
        
        return {
            events: result.rows,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalEvents: total,
                eventsPerPage: limit,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        };
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
