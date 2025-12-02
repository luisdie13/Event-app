// backend/database/orderQueries.js
import { pool } from './db.js';

export const createOrderTransaction = async (userId, eventId, quantity, cardId = null) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Obtener datos del evento y bloquear fila
        const eventQuery = `
            SELECT price, available_tickets 
            FROM events 
            WHERE id = $1 
            FOR UPDATE; 
        `;
        const eventResult = await client.query(eventQuery, [eventId]);

        if (eventResult.rows.length === 0) {
            throw new Error("Evento no encontrado (ID inválido).");
        }

        const { price, available_tickets } = eventResult.rows[0];

        // Validar stock
        if (parseInt(available_tickets) < parseInt(quantity)) {
            throw new Error(`Stock insuficiente. Solo quedan ${available_tickets} tickets.`);
        }

        // 2. Calcular total
        const totalPrice = parseFloat(price) * parseInt(quantity);

        // 3. Restar inventario
        const updateEventSql = `
            UPDATE events 
            SET available_tickets = available_tickets - $1
            WHERE id = $2;
        `;
        await client.query(updateEventSql, [quantity, eventId]);

        // 4. Crear el ticket (sin card_id por ahora, columna no existe en schema)
        const insertTicketSql = `
            INSERT INTO tickets (event_id, user_id, quantity, status, total_price, purchase_date)
            VALUES ($1, $2, $3, 'active', $4, NOW())
            RETURNING id;
        `;
        
        const ticketResult = await client.query(insertTicketSql, [eventId, userId, quantity, totalPrice]);

        await client.query('COMMIT');
        return ticketResult.rows[0];

    } catch (error) {
        await client.query('ROLLBACK');
        // ESTO IMPRIMIRÁ EL ERROR EXACTO EN TERMINAL BACKEND
        console.error("ERROR SQL EN TRANSACCIÓN:", error.message); 
        throw error;
    } finally {
        client.release();
    }
};

export const getUserTickets = async (userId, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;

        // Consulta para obtener el total de tickets
        const countQuery = `
            SELECT COUNT(*) as total
            FROM tickets t
            WHERE t.user_id = $1
        `;
        const countResult = await pool.query(countQuery, [userId]);
        const total = parseInt(countResult.rows[0].total);

        // Consulta para obtener los tickets paginados
        const query = `
            SELECT 
                t.id,
                t.purchase_date,
                t.quantity,
                t.total_price,
                t.status,
                e.id as event_id,
                e.title as event_title,
                e.slug as event_slug,
                e.date_time as event_date,
                e.location as event_location,
                e.price as event_price,
                c.name as category_name,
                (SELECT url FROM images WHERE event_id = e.id AND is_main = true LIMIT 1) as event_image
            FROM tickets t
            INNER JOIN events e ON t.event_id = e.id
            INNER JOIN categories c ON e.category_id = c.id
            WHERE t.user_id = $1
            ORDER BY t.purchase_date DESC
            LIMIT $2 OFFSET $3
        `;
        
        const result = await pool.query(query, [userId, limit, offset]);
        
        return {
            tickets: result.rows,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalTickets: total,
                ticketsPerPage: limit,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        };
    } catch (error) {
        console.error("Error obteniendo tickets del usuario:", error.message);
        throw error;
    }
};
