// backend/controllers/orderController.js
import { createOrderTransaction, getUserTickets } from '../database/orderQueries.js';

export const createOrder = async (req, res) => {
    // 1. Validación de seguridad extra
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "No autorizado. Inicie sesión nuevamente." });
    }

    const userId = req.user.id;
    // Accept both eventId (camelCase) and event_id (snake_case) for compatibility
    const eventId = req.body.eventId || req.body.event_id;
    const { quantity, cardId } = req.body;

    // 2. Validación de datos
    if (!eventId || !quantity || quantity < 1) {
        return res.status(400).json({ message: "Datos de orden inválidos (Falta evento o cantidad)." });
    }

    try {
        const result = await createOrderTransaction(userId, eventId, quantity, cardId);
        
        res.status(201).json({
            message: "¡Compra realizada con éxito!",
            ticket: {
                id: result.id,
                event_id: eventId,
                quantity: quantity,
                user_id: userId
            }
        });
    } catch (error) {
        console.error("Error creando orden:", error.message);
        
        // Manejar errores de negocio específicos (para no devolver siempre 500)
        if (error.message.includes("Evento no encontrado") || error.message.includes("ID inválido") || error.message.includes("invalid input syntax for type uuid")) {
            return res.status(404).json({ message: "Evento no encontrado." }); // 404 Not Found
        }
        
        if (error.message.includes("tickets disponibles") || error.message.includes("Stock insuficiente")) {
            return res.status(400).json({ message: error.message }); // 400 Bad Request
        }
        
        res.status(500).json({ message: "Error al procesar la compra en el servidor." });
    }
};

export const getMyTickets = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "No autorizado. Inicie sesión nuevamente." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const result = await getUserTickets(req.user.id, page, limit);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error obteniendo tickets:", error.message);
        res.status(500).json({ message: "Error al obtener el historial de tickets." });
    }
};
