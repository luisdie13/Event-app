// backend/database/db.js
import pg from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno (.env)
dotenv.config();

const { Pool } = pg;

// Crear la conexión (Pool)
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Listener para confirmar conexión exitosa en consola
pool.on('connect', () => {
  // Esto ayuda a confirmar visualmente que la BD está conectada
  // console.log('✅ Base de datos conectada'); 
});

// Listener para errores inesperados en la conexión
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el cliente de PostgreSQL', err);
  process.exit(-1);
});