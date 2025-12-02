// Script para crear usuarios con contraseñas correctas
import bcrypt from 'bcryptjs';
import { pool } from './database/db.js';

const createUsers = async () => {
    try {
        console.log('Eliminando usuarios de ejemplo...');
        await pool.query("DELETE FROM users WHERE email IN ('admin@eventplatform.com', 'user@eventplatform.com')");
        
        console.log('Creando nuevos usuarios...');
        
        // Usuario admin: luis@admin.com / admin123*
        const adminHash = await bcrypt.hash('admin123*', 10);
        await pool.query(
            'INSERT INTO users (role_id, name, email, password_hash) VALUES ($1, $2, $3, $4)',
            [5, 'Luis Admin', 'luis@admin.com', adminHash]
        );
        console.log('✓ Admin creado: luis@admin.com / admin123*');
        
        // Usuario miembro: usuario@prueba.com / 123456
        const userHash = await bcrypt.hash('123456', 10);
        await pool.query(
            'INSERT INTO users (role_id, name, email, password_hash) VALUES ($1, $2, $3, $4)',
            [2, 'Usuario Prueba', 'usuario@prueba.com', userHash]
        );
        console.log('✓ Usuario creado: usuario@prueba.com / 123456');
        
        console.log('\nVerificando usuarios creados:');
        const result = await pool.query('SELECT id, name, email, role_id FROM users ORDER BY role_id DESC');
        console.table(result.rows);
        
        console.log('\n✅ Usuarios creados exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createUsers();
