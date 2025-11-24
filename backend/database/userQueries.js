// backend/database/userQueries.js
import { pool } from './db.js';

/**
 * Busca un usuario por su dirección de correo electrónico.
 * Se usa para verificar si el usuario existe (registro) y para la autenticación (login).
 * @param {string} email - El email del usuario.
 * @returns {Promise<Object | null>} El objeto del usuario con todos los campos, o null si no existe.
 */
export const findUserByEmail = async (email) => {
    const sql = `
        SELECT 
            id, role_id, name, email, password_hash
        FROM 
            users
        WHERE 
            email = $1;
    `;
    
    try {
        const result = await pool.query(sql, [email]);
        return result.rows[0] || null;
    } catch (error) {
        console.error("Error al buscar usuario por email:", error);
        throw new Error("Error interno al acceder a la base de datos.");
    }
};

/**
 * Crea un nuevo usuario en la base de datos con el rol de 'member' por defecto.
 * @param {string} name - Nombre del usuario.
 * @param {string} email - Email único del usuario.
 * @param {string} passwordHash - Contraseña hasheada (ya procesada por bcrypt).
 * @returns {Promise<Object>} El objeto del usuario creado.
 */
export const createUser = async (name, email, passwordHash) => {
    // Busca el ID del rol 'member' (asumiendo que lo tienes en la tabla roles)
    const roleIdQuery = `SELECT id FROM roles WHERE name = 'member'`;
    let roleIdResult;
    try {
        roleIdResult = await pool.query(roleIdQuery);
    } catch (e) {
        console.error("Error al buscar role_id:", e);
        throw new Error("Error interno: no se pudo encontrar el ID de rol 'member'.");
    }
    
    if (roleIdResult.rows.length === 0) {
        throw new Error("El rol 'member' no existe en la base de datos.");
    }
    const roleId = roleIdResult.rows[0].id;

    // Insertar el nuevo usuario
    const sql = `
        INSERT INTO users (role_id, name, email, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role_id;
    `;
    const params = [roleId, name, email, passwordHash];

    try {
        const result = await pool.query(sql, params);
        return result.rows[0];
    } catch (error) {
        // En caso de que falle la restricción UNIQUE de email (aunque debería ser manejado antes)
        if (error.code === '23505') { 
             throw new Error("El email ya está registrado.");
        }
        console.error("Error al crear usuario:", error);
        throw new Error("Error interno al crear el usuario.");
    }
};