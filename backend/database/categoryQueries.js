// backend/database/categoryQueries.js

//Importamos 'pool' en lugar de 'db'
import { pool } from './db.js'; 

/**
 * Obtiene todas las categorías disponibles.
 * @returns {Promise<Array>} Un array de objetos de categorías.
 */
export const getAllCategories = async () => { 
    // Consulta SQL simple para obtener ID, nombre y slug.
    const sql = `
        SELECT 
            id, 
            name, 
            slug
        FROM 
            categories
        ORDER BY 
            name ASC;
    `;

    try {
        //Usamos pool.query
        const result = await pool.query(sql);
        return result.rows;
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        throw new Error("No se pudieron obtener las categorías de la base de datos.");
    }
};