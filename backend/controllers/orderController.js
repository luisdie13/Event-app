// backend/controllers/orderController.js
import { createOrderTransaction, getUserTickets } from '../database/orderQueries.js';

export const createOrder = async (req, res) => {
    // 1. Validación de seguridad extra
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "No autorizado. Inicie sesión nuevamente." });
    }

    const userId = req.user.id;
    const { eventId, quantity } = req.body;

    // 2. Validación de datos
    if (!eventId || !quantity || quantity < 1) {
        return res.status(400).json({ message: "Datos de orden inválidos (Falta evento o cantidad)." });
    }

    try {
        const result = await createOrderTransaction(userId, eventId, quantity);
        
        res.status(201).json({
            message: "¡Compra realizada con éxito!",
            ticketId: result.id
        });
    } catch (error) {
        console.error("Error creando orden:", error.message);
        
        // Manejar errores de negocio específicos (para no devolver siempre 500)
        if (error.message.includes("tickets disponibles") || error.message.includes("Evento no encontrado")) {
            return res.status(409).json({ message: error.message }); // 409 Conflict
        }
        
        res.status(500).json({ message: "Error al procesar la compra en el servidor." });
    }
};

export const getMyTickets = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "No autorizado. Inicie sesión nuevamente." });
    }

    try {
        const tickets = await getUserTickets(req.user.id);
        res.status(200).json(tickets);
    } catch (error) {
        console.error("Error obteniendo tickets:", error.message);
        res.status(500).json({ message: "Error al obtener el historial de tickets." });
    }
};
