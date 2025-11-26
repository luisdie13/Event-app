// backend/controllers/reportController.js

// Use pool from the new standardized db.js
import { pool } from '../database/db.js';

/**
 * @desc Obtener reportes de ventas y asistentes
 * @route GET /api/admin/reports
 * @access Private/Admin
 */
export const getReports = async (req, res) => {
    try {
        // 1. Total de ventas (suma de todos los tickets vendidos)
        const salesQuery = `
            SELECT 
                COALESCE(SUM(total_price), 0) AS total_sales,
                COALESCE(SUM(quantity), 0) AS total_tickets_sold
            FROM tickets
            WHERE status = 'active';
        `;
        // pool.query
        const salesResult = await pool.query(salesQuery);
        
        // 2. Total de asistentes únicos (usuarios que compraron tickets)
        const attendeesQuery = `
            SELECT COUNT(DISTINCT user_id) AS total_attendees
            FROM tickets
            WHERE status = 'active';
        `;
        const attendeesResult = await pool.query(attendeesQuery);
        
        // 3. Eventos con más ventas
        const topEventsQuery = `
            SELECT 
                e.title,
                e.slug,
                COALESCE(SUM(t.quantity), 0) AS tickets_sold,
                COALESCE(SUM(t.total_price), 0) AS revenue
            FROM events e
            LEFT JOIN tickets t ON e.id = t.event_id AND t.status = 'active'
            GROUP BY e.id, e.title, e.slug
            ORDER BY revenue DESC NULLS LAST
            LIMIT 10;
        `;
        const topEventsResult = await pool.query(topEventsQuery);
        
        // 4. Ventas por categoría
        const categoryQuery = `
            SELECT 
                c.name AS category_name,
                COALESCE(SUM(t.quantity), 0) AS tickets_sold,
                COALESCE(SUM(t.total_price), 0) AS revenue
            FROM categories c
            LEFT JOIN events e ON c.id = e.category_id
            LEFT JOIN tickets t ON e.id = t.event_id AND t.status = 'active'
            GROUP BY c.id, c.name
            ORDER BY revenue DESC;
        `;
        const categoryResult = await pool.query(categoryQuery);
        
        // 5. Estadísticas generales
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role_id = 2) AS total_members,
                (SELECT COUNT(*) FROM events WHERE date_time >= NOW()) AS upcoming_events,
                (SELECT COUNT(*) FROM events WHERE date_time < NOW()) AS past_events,
                (SELECT COUNT(*) FROM events) AS total_events
        `;
        const statsResult = await pool.query(statsQuery);

        // Construir la respuesta
        const reports = {
            sales: {
                total_sales: parseFloat(salesResult.rows[0].total_sales),
                total_tickets_sold: parseInt(salesResult.rows[0].total_tickets_sold)
            },
            attendees: {
                total_attendees: parseInt(attendeesResult.rows[0].total_attendees)
            },
            top_events: topEventsResult.rows.map(event => ({
                title: event.title,
                slug: event.slug,
                tickets_sold: parseInt(event.tickets_sold) || 0,
                revenue: parseFloat(event.revenue) || 0
            })),
            by_category: categoryResult.rows.map(cat => ({
                category_name: cat.category_name,
                tickets_sold: parseInt(cat.tickets_sold) || 0,
                revenue: parseFloat(cat.revenue) || 0
            })),
            statistics: {
                total_members: parseInt(statsResult.rows[0].total_members),
                upcoming_events: parseInt(statsResult.rows[0].upcoming_events),
                past_events: parseInt(statsResult.rows[0].past_events),
                total_events: parseInt(statsResult.rows[0].total_events)
            }
        };

        res.status(200).json(reports);
    } catch (error) {
        console.error('Error al obtener reportes:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener reportes.' });
    }
};
