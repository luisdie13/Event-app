// Script para crear eventos de ejemplo con UTF-8 correcto
import { pool } from './database/db.js';

const createEvents = async () => {
    try {
        console.log('Obteniendo usuarios y categorías...');
        
        // Obtener el usuario admin
        const adminResult = await pool.query("SELECT id FROM users WHERE email = 'luis@admin.com'");
        if (adminResult.rows.length === 0) {
            throw new Error('Usuario admin no encontrado');
        }
        const adminId = adminResult.rows[0].id;
        
        // Obtener categorías
        const categoriesResult = await pool.query('SELECT id, slug FROM categories ORDER BY id');
        const categories = {};
        categoriesResult.rows.forEach(cat => {
            categories[cat.slug] = cat.id;
        });
        
        console.log('Creando eventos de ejemplo...');
        
        const events = [
            // Música (6 eventos para paginación)
            {
                category: categories['musica'],
                title: 'Festival de Rock 2024',
                slug: 'festival-rock-2024',
                description: 'El mejor festival de rock del año con bandas internacionales. Disfruta de un día completo de música en vivo con los mejores artistas del género.',
                date_time: '2024-07-15 19:00:00',
                location: 'Estadio Nacional, Ciudad de Guatemala',
                total_tickets: 5000,
                available_tickets: 4800,
                price: 250.00,
                is_featured: true
            },
            {
                category: categories['musica'],
                title: 'Concierto de Jazz en Vivo',
                slug: 'concierto-jazz-vivo',
                description: 'Una noche mágica de jazz con los mejores músicos locales e internacionales. Ambiente íntimo y sofisticado.',
                date_time: '2024-06-20 20:30:00',
                location: 'Teatro Nacional, Zona 1',
                total_tickets: 800,
                available_tickets: 650,
                price: 180.00,
                is_featured: true
            },
            {
                category: categories['musica'],
                title: 'Fiesta Electrónica 2024',
                slug: 'fiesta-electronica-2024',
                description: 'La mejor música electrónica con DJs reconocidos mundialmente. Producción de luces y sonido de primera clase.',
                date_time: '2024-08-10 22:00:00',
                location: 'Club Nocturno Premium, Zona 10',
                total_tickets: 2000,
                available_tickets: 1850,
                price: 200.00,
                is_featured: true
            },
            {
                category: categories['musica'],
                title: 'Noche de Salsa y Bachata',
                slug: 'noche-salsa-bachata',
                description: 'Baila toda la noche con los mejores ritmos latinos. Orquesta en vivo y clases gratuitas para principiantes.',
                date_time: '2024-06-25 21:00:00',
                location: 'Salón de Baile Tropical, Zona 9',
                total_tickets: 600,
                available_tickets: 480,
                price: 120.00,
                is_featured: true
            },
            {
                category: categories['musica'],
                title: 'Concierto Sinfónico de Verano',
                slug: 'concierto-sinfonico-verano',
                description: 'La Orquesta Sinfónica Nacional presenta un repertorio de obras clásicas y contemporáneas bajo las estrellas.',
                date_time: '2024-07-01 19:30:00',
                location: 'Parque Central, Antigua Guatemala',
                total_tickets: 1500,
                available_tickets: 1200,
                price: 150.00,
                is_featured: true
            },
            {
                category: categories['musica'],
                title: 'Festival de Música Latina',
                slug: 'festival-musica-latina',
                description: 'Celebración de la música latinoamericana con artistas de toda la región. Reggaeton, pop latino y mucho más.',
                date_time: '2024-08-20 18:00:00',
                location: 'Plaza Mayor, Ciudad de Guatemala',
                total_tickets: 8000,
                available_tickets: 7200,
                price: 300.00,
                is_featured: true
            },
            
            // Deportes
            {
                category: categories['deportes'],
                title: 'Maratón de la Ciudad 2024',
                slug: 'maraton-ciudad-2024',
                description: 'Participa en la carrera más grande del país. Distancias de 5K, 10K y 21K. Incluye kit del corredor y medalla de finisher.',
                date_time: '2024-09-15 06:00:00',
                location: 'Centro Histórico, Ciudad de Guatemala',
                total_tickets: 3000,
                available_tickets: 2100,
                price: 150.00,
                is_featured: true
            },
            {
                category: categories['deportes'],
                title: 'Torneo de Fútbol Relámpago',
                slug: 'torneo-futbol-relampago',
                description: 'Competencia de fútbol 7 para equipos amateur. Premios en efectivo para los tres primeros lugares.',
                date_time: '2024-07-08 08:00:00',
                location: 'Complejo Deportivo Zone, Zona 15',
                total_tickets: 500,
                available_tickets: 420,
                price: 100.00,
                is_featured: false
            },
            
            // Tecnología
            {
                category: categories['tecnologia'],
                title: 'DevFest Guatemala 2024',
                slug: 'devfest-guatemala-2024',
                description: 'El evento más grande de desarrolladores en Guatemala. Conferencias, talleres y networking con expertos en tecnología.',
                date_time: '2024-10-05 09:00:00',
                location: 'Centro de Convenciones, Zona 10',
                total_tickets: 1000,
                available_tickets: 750,
                price: 0.00,
                is_featured: true
            },
            {
                category: categories['tecnologia'],
                title: 'Hackathon Innovación 2024',
                slug: 'hackathon-innovacion-2024',
                description: 'Maratón de programación de 48 horas. Crea soluciones innovadoras y compite por premios increíbles.',
                date_time: '2024-08-30 18:00:00',
                location: 'Universidad del Valle, Campus Central',
                total_tickets: 200,
                available_tickets: 120,
                price: 50.00,
                is_featured: false
            },
            
            // Arte
            {
                category: categories['arte'],
                title: 'Exposición de Arte Contemporáneo',
                slug: 'exposicion-arte-contemporaneo',
                description: 'Muestra de obras de artistas guatemaltecos emergentes. Pinturas, esculturas y arte digital.',
                date_time: '2024-06-30 17:00:00',
                location: 'Galería Nacional de Arte, Zona 1',
                total_tickets: 400,
                available_tickets: 320,
                price: 80.00,
                is_featured: false
            },
            {
                category: categories['arte'],
                title: 'Festival de Cine Independiente',
                slug: 'festival-cine-independiente',
                description: 'Proyección de películas independientes de realizadores locales e internacionales. Incluye conversatorios con directores.',
                date_time: '2024-09-20 19:00:00',
                location: 'Cine Universitario, Zona 12',
                total_tickets: 300,
                available_tickets: 280,
                price: 60.00,
                is_featured: true
            },
            
            // Educación
            {
                category: categories['educacion'],
                title: 'Taller de Marketing Digital',
                slug: 'taller-marketing-digital',
                description: 'Aprende las mejores estrategias de marketing digital. Redes sociales, SEO, publicidad pagada y más.',
                date_time: '2024-07-12 14:00:00',
                location: 'Centro de Capacitación Empresarial, Zona 10',
                total_tickets: 100,
                available_tickets: 65,
                price: 350.00,
                is_featured: false
            },
            {
                category: categories['educacion'],
                title: 'Seminario de Inteligencia Artificial',
                slug: 'seminario-inteligencia-artificial',
                description: 'Descubre las últimas tendencias en IA y machine learning. Casos de uso reales y aplicaciones prácticas.',
                date_time: '2024-08-15 10:00:00',
                location: 'Hotel Marriott, Zona 10',
                total_tickets: 250,
                available_tickets: 180,
                price: 400.00,
                is_featured: true
            },
            
            // Negocios
            {
                category: categories['negocios'],
                title: 'Cumbre de Emprendimiento 2024',
                slug: 'cumbre-emprendimiento-2024',
                description: 'Conecta con inversionistas, mentores y otros emprendedores. Conferencias inspiradoras y oportunidades de networking.',
                date_time: '2024-09-05 08:30:00',
                location: 'Westin Camino Real, Zona 10',
                total_tickets: 500,
                available_tickets: 350,
                price: 500.00,
                is_featured: true
            },
            {
                category: categories['negocios'],
                title: 'Networking Empresarial Mensual',
                slug: 'networking-empresarial-mensual',
                description: 'Reunión mensual de profesionales y empresarios. Expande tu red de contactos en un ambiente relajado.',
                date_time: '2024-07-18 18:30:00',
                location: 'Roof Garden Sky Bar, Zona 9',
                total_tickets: 150,
                available_tickets: 95,
                price: 180.00,
                is_featured: false
            }
        ];
        
        let eventCount = 0;
        for (const event of events) {
            const result = await pool.query(
                `INSERT INTO events (user_id, category_id, title, slug, description, date_time, location, 
                 total_tickets, available_tickets, price, is_featured) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
                 RETURNING id, title`,
                [
                    adminId, event.category, event.title, event.slug, event.description,
                    event.date_time, event.location, event.total_tickets, event.available_tickets,
                    event.price, event.is_featured
                ]
            );
            eventCount++;
            console.log(`✓ [${eventCount}/${events.length}] ${result.rows[0].title}`);
        }
        
        console.log('\n📊 Resumen:');
        const stats = await pool.query(`
            SELECT 
                c.name as categoria,
                COUNT(*) as total_eventos,
                SUM(CASE WHEN e.is_featured THEN 1 ELSE 0 END) as destacados
            FROM events e
            JOIN categories c ON e.category_id = c.id
            GROUP BY c.name
            ORDER BY c.name
        `);
        console.table(stats.rows);
        
        const featured = await pool.query('SELECT COUNT(*) as total FROM events WHERE is_featured = true');
        console.log(`\n✅ Total de eventos creados: ${eventCount}`);
        console.log(`⭐ Eventos destacados: ${featured.rows[0].total}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createEvents();
