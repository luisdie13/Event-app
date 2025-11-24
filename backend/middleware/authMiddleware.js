// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_y_largo_debes_cambiarlo';

/**
 * Middleware para proteger rutas.
 * Verifica que el token JWT sea válido y adjunta los datos del usuario (id, role_id) al objeto req.
 */
export const protect = (req, res, next) => {
    let token;

    // 1. Buscar el token en el encabezado (Bearer Token)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Ejemplo: 'Bearer asdf.qwer.zxcv' -> toma solo el token
            token = req.headers.authorization.split(' ')[1];

            let decoded;
            try {
                // 2. Intentar verificar con el secret actual
                decoded = jwt.verify(token, JWT_SECRET);
            } catch (firstError) {
                // Si falla, intentar con el secret anterior (fallback)
                try {
                    decoded = jwt.verify(token, 'mi_secreto_super_seguro_y_largo_debes_cambiarlo');
                } catch (secondError) {
                    throw firstError; // Lanzar el error original
                }
            }

            // 3. Adjuntar los datos del payload (id, role_id, email) al objeto request
            req.user = decoded; 

            next(); // Continuar con el siguiente middleware o controlador
        } catch (error) {
            // El token no es válido (expirado, modificado, etc.)
            console.error('Error en token:', error.message);
            return res.status(401).json({ message: 'No autorizado, token fallido.' });
        }
    } else {
        return res.status(401).json({ message: 'No autorizado, no hay token.' });
    }
};

/**
 * Middleware para restringir el acceso solo a administradores (role_id: 1).
 * ASUME que 'protect' ya ha adjuntado req.user.
 */
export const admin = (req, res, next) => {
    // role_id 5 es 'administrator'
    if (req.user && req.user.role_id === 5) {
        next(); // Es admin, permitir el acceso
    } else {
        res.status(403).json({ 
            message: 'Acceso denegado. Solo administradores pueden realizar esta acción.' 
        });
    }
};
