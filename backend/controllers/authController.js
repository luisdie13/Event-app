// backend/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../database/userQueries.js';

// Asegúrate de que esta variable esté en tu .env o hardcodeada si no tienes secrets
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_y_largo_debes_cambiarlo';

// Número de rondas de hashing. 10 es un valor seguro estándar.
const SALT_ROUNDS = 10; 

/**
 * POST /api/auth/register
 * Registra un nuevo usuario.
 */
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    // 1. Validación básica de entrada
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        // 2. Verificar si el usuario ya existe
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'El email ya está registrado.' });
        }

        // 3. Hashear la contraseña
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // 4. Crear el usuario en la DB
        const newUser = await createUser(name, email, passwordHash);

        // 5. Generar un JWT para la sesión
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role_id: newUser.role_id },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expira en 1 hora
        );

        // 6. Respuesta exitosa
        res.status(201).json({ 
            message: 'Registro exitoso.',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role_id: newUser.role_id,
            }
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error.message);
        res.status(500).json({ message: 'Error interno del servidor durante el registro.' });
    }
};

/**
 * POST /api/auth/login
 * Conecta a un usuario existente.
 */
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // 1. Validación básica
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
    }

    try {
        // 2. Buscar usuario por email (incluye password_hash)
        const user = await findUserByEmail(email);

        if (!user) {
            // No revelamos si fue el email o la contraseña incorrecta por seguridad
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 3. Comparar la contraseña hasheada
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 4. Generar JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role_id: user.role_id },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 5. Respuesta exitosa
        res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role_id: user.role_id,
            }
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);
        res.status(500).json({ message: 'Error interno del servidor durante el inicio de sesión.' });
    }
};
