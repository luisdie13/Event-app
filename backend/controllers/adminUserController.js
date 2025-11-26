// backend/controllers/adminUserController.js
import { pool } from '../database/db.js';

const ADMIN_ROLE_ID = 5;
const MEMBER_ROLE_ID = 2;

/**
 * @desc Obtener todos los usuarios y sus roles
 * @route GET /api/admin/users
 * @access Private/Admin
 */
export const getAllUsers = async (req, res) => {
    try {
        const sql = `
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.created_at,
                r.name AS role_name, 
                r.id AS role_id
            FROM 
                users u
            JOIN 
                roles r ON u.role_id = r.id
            ORDER BY 
                u.created_at DESC;
        `;
        // Use pool.query
        const result = await pool.query(sql);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener la lista de usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
    }
};

/**
 * @desc Actualizar el rol de un usuario
 * @route PUT /api/admin/users/:userId/role
 * @access Private/Admin
 */
export const updateUserRole = async (req, res) => {
    const { userId } = req.params;
    const { roleName } = req.body;
    
    // 1. Determinar el ID del rol
    let newRoleId;
    if (roleName === 'administrator') {
        newRoleId = ADMIN_ROLE_ID;
    } else if (roleName === 'member') {
        newRoleId = MEMBER_ROLE_ID;
    } else {
        return res.status(400).json({ message: 'Rol inválido especificado.' });
    }

    // 2. Ejecutar la actualización
    try {
        const sql = `
            UPDATE users
            SET role_id = $1
            WHERE id = $2
            RETURNING id, name, email;
        `;
        // Use pool.query
        const result = await pool.query(sql, [newRoleId, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: `Usuario con ID ${userId} no encontrado.` });
        }

        res.status(200).json({ 
            message: `Rol de usuario actualizado a ${roleName}.`,
            user: result.rows[0]
        });
    } catch (error) {
        console.error(`Error al actualizar rol del usuario ${userId}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar el rol.' });
    }
};

/**
 * @desc Eliminar un usuario
 * @route DELETE /api/admin/users/:userId
 * @access Private/Admin
 */
export const deleteUser = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Prevenir que el admin se elimine a sí mismo
    if (parseInt(userId) === currentUserId) {
        return res.status(403).json({ message: 'No puedes eliminar tu propia cuenta.' });
    }

    try {
        const sql = `
            DELETE FROM users
            WHERE id = $1
            RETURNING id, name, email;
        `;
        const result = await pool.query(sql, [userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: `Usuario con ID ${userId} no encontrado.` });
        }

        res.status(200).json({ 
            message: `Usuario "${result.rows[0].name}" eliminado exitosamente.`,
            user: result.rows[0]
        });
    } catch (error) {
        console.error(`Error al eliminar usuario ${userId}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar el usuario.' });
    }
};
