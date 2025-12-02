// backend/database/cardQueries.js
import { pool } from './db.js';

/**
 * Obtener todas las tarjetas de un usuario
 * @param {string} userId - UUID del usuario
 * @returns {Promise<Array>} Lista de tarjetas del usuario
 */
export const getUserCards = async (userId) => {
    const sql = `
        SELECT 
            id, card_holder_name, card_number_last4, card_brand, 
            expiry_month, expiry_year, is_default, created_at
        FROM 
            payment_cards
        WHERE 
            user_id = $1
        ORDER BY 
            is_default DESC, created_at DESC;
    `;
    
    try {
        const result = await pool.query(sql, [userId]);
        return result.rows;
    } catch (error) {
        console.error("Error al obtener tarjetas:", error);
        throw new Error("Error interno al acceder a las tarjetas.");
    }
};

/**
 * Agregar una nueva tarjeta
 * @param {string} userId - UUID del usuario
 * @param {Object} cardData - Datos de la tarjeta
 * @returns {Promise<Object>} La tarjeta creada
 */
export const addCard = async (userId, cardData) => {
    const { cardHolderName, cardNumberLast4, cardBrand, expiryMonth, expiryYear, isDefault } = cardData;
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Si esta tarjeta se marca como predeterminada, desmarcar las demás
        if (isDefault) {
            await client.query(
                'UPDATE payment_cards SET is_default = FALSE WHERE user_id = $1',
                [userId]
            );
        }
        
        // Insertar la nueva tarjeta
        const sql = `
            INSERT INTO payment_cards 
                (user_id, card_holder_name, card_number_last4, card_brand, expiry_month, expiry_year, is_default)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7)
            RETURNING 
                id, card_holder_name, card_number_last4, card_brand, expiry_month, expiry_year, is_default, created_at;
        `;
        
        const result = await client.query(sql, [
            userId, 
            cardHolderName, 
            cardNumberLast4, 
            cardBrand, 
            expiryMonth, 
            expiryYear, 
            isDefault || false
        ]);
        
        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al agregar tarjeta:", error);
        throw new Error("Error interno al agregar la tarjeta.");
    } finally {
        client.release();
    }
};

/**
 * Eliminar una tarjeta
 * @param {string} cardId - UUID de la tarjeta
 * @param {string} userId - UUID del usuario (para verificar propiedad)
 * @returns {Promise<boolean>} True si se eliminó exitosamente
 */
export const deleteCard = async (cardId, userId) => {
    const sql = `
        DELETE FROM payment_cards 
        WHERE id = $1 AND user_id = $2
        RETURNING id;
    `;
    
    try {
        const result = await pool.query(sql, [cardId, userId]);
        return result.rowCount > 0;
    } catch (error) {
        console.error("Error al eliminar tarjeta:", error);
        throw new Error("Error interno al eliminar la tarjeta.");
    }
};

/**
 * Establecer una tarjeta como predeterminada
 * @param {string} cardId - UUID de la tarjeta
 * @param {string} userId - UUID del usuario
 * @returns {Promise<Object>} La tarjeta actualizada
 */
export const setDefaultCard = async (cardId, userId) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Desmarcar todas las tarjetas del usuario
        await client.query(
            'UPDATE payment_cards SET is_default = FALSE WHERE user_id = $1',
            [userId]
        );
        
        // Marcar la tarjeta seleccionada como predeterminada
        const sql = `
            UPDATE payment_cards 
            SET is_default = TRUE
            WHERE id = $1 AND user_id = $2
            RETURNING id, card_holder_name, card_number_last4, card_brand, expiry_month, expiry_year, is_default;
        `;
        
        const result = await client.query(sql, [cardId, userId]);
        
        await client.query('COMMIT');
        return result.rows[0] || null;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al establecer tarjeta predeterminada:", error);
        throw new Error("Error interno al actualizar la tarjeta.");
    } finally {
        client.release();
    }
};

/**
 * Obtener la tarjeta predeterminada de un usuario
 * @param {string} userId - UUID del usuario
 * @returns {Promise<Object|null>} La tarjeta predeterminada o null
 */
export const getDefaultCard = async (userId) => {
    const sql = `
        SELECT 
            id, card_holder_name, card_number_last4, card_brand, 
            expiry_month, expiry_year, is_default, created_at
        FROM 
            payment_cards
        WHERE 
            user_id = $1 AND is_default = TRUE
        LIMIT 1;
    `;
    
    try {
        const result = await pool.query(sql, [userId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error("Error al obtener tarjeta predeterminada:", error);
        throw new Error("Error interno al acceder a la tarjeta.");
    }
};
