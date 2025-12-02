// backend/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Importamos 'pool' para verificar la conexión
import { pool } from './database/db.js';

// Importar las rutas existentes
import eventRoutes from './routes/eventRoutes.js'; 
import categoryRoutes from './routes/categoryRoutes.js'; 
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Inicialización de Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// 1. CORS: Permite solicitudes desde el frontend
app.use(cors({
    origin: ['http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178'], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// 2. Body Parser: Permite a Express leer JSON en el cuerpo de las peticiones
app.use(express.json());

// 3. Health Check
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'API de gestión de eventos funcionando.',
        environment: process.env.NODE_ENV || 'development'
    });
});

// ********** RUTAS DE LA API **********
app.use('/api/events', eventRoutes); 
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);


// Inicio del Servidor
const startServer = async () => {
    try {
        // 1. Verificar la conexión a la base de datos con una consulta simple
        await pool.query('SELECT NOW()'); 
        console.log("✅ Verificación de Base de Datos exitosa");

        // 2. Iniciar Express
        app.listen(PORT, () => {
            console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error Fatal: No se pudo conectar a la base de datos.");
        console.error(error);
        process.exit(1); // Salir si la BD no funciona
    }
};

startServer();
