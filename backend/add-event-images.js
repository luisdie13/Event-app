// Script para agregar imágenes temáticas a los eventos
import { pool } from './database/db.js';

const addEventImages = async () => {
    try {
        console.log('Agregando imágenes a los eventos...\n');
        
        // Mapeo de eventos a imágenes temáticas de Unsplash
        const eventImages = {
            // Música
            'festival-rock-2024': 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=400&fit=crop',
            'concierto-jazz-vivo': 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=400&fit=crop',
            'fiesta-electronica-2024': 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop',
            'noche-salsa-bachata': 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&h=400&fit=crop',
            'concierto-sinfonico-verano': 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&h=400&fit=crop',
            'festival-musica-latina': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop',
            
            // Deportes
            'maraton-ciudad-2024': 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&h=400&fit=crop',
            'torneo-futbol-relampago': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=400&fit=crop',
            
            // Tecnología
            'devfest-guatemala-2024': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
            'hackathon-innovacion-2024': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop',
            
            // Arte
            'exposicion-arte-contemporaneo': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=400&fit=crop',
            'festival-cine-independiente': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=400&fit=crop',
            
            // Educación
            'taller-marketing-digital': 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=400&fit=crop',
            'seminario-inteligencia-artificial': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop',
            
            // Negocios
            'cumbre-emprendimiento-2024': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop',
            'networking-empresarial-mensual': 'https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&h=400&fit=crop'
        };
        
        let insertedCount = 0;
        
        for (const [slug, imageUrl] of Object.entries(eventImages)) {
            // Obtener el event_id del evento
            const eventResult = await pool.query(
                'SELECT id, title FROM events WHERE slug = $1',
                [slug]
            );
            
            if (eventResult.rows.length === 0) {
                console.log(`⚠️  Evento no encontrado: ${slug}`);
                continue;
            }
            
            const eventId = eventResult.rows[0].id;
            const eventTitle = eventResult.rows[0].title;
            
            // Verificar si ya existe una imagen para este evento
            const existingImage = await pool.query(
                'SELECT id FROM images WHERE event_id = $1',
                [eventId]
            );
            
            if (existingImage.rows.length > 0) {
                // Actualizar la imagen existente
                await pool.query(
                    'UPDATE images SET url = $1, is_main = TRUE WHERE event_id = $2',
                    [imageUrl, eventId]
                );
                console.log(`✓ Actualizada imagen: ${eventTitle}`);
            } else {
                // Insertar nueva imagen
                await pool.query(
                    'INSERT INTO images (event_id, url, is_main) VALUES ($1, $2, TRUE)',
                    [eventId, imageUrl]
                );
                console.log(`✓ Insertada imagen: ${eventTitle}`);
            }
            
            insertedCount++;
        }
        
        console.log(`\n✅ Proceso completado: ${insertedCount} imágenes agregadas/actualizadas`);
        
        // Verificar eventos sin imagen
        const eventsWithoutImage = await pool.query(`
            SELECT e.title, e.slug 
            FROM events e 
            LEFT JOIN images i ON e.id = i.event_id 
            WHERE i.id IS NULL
        `);
        
        if (eventsWithoutImage.rows.length > 0) {
            console.log('\n⚠️  Eventos sin imagen:');
            eventsWithoutImage.rows.forEach(event => {
                console.log(`   - ${event.title} (${event.slug})`);
            });
        } else {
            console.log('\n🎉 Todos los eventos tienen imagen asignada');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

addEventImages();
