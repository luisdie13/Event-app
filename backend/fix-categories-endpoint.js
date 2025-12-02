// Script temporal para corregir las categorías con codificación UTF-8
import { pool } from './database/db.js';

const fixCategories = async () => {
    try {
        console.log('Eliminando categorías existentes...');
        await pool.query('DELETE FROM categories');
        
        console.log('Reiniciando secuencia...');
        await pool.query('ALTER SEQUENCE categories_id_seq RESTART WITH 1');
        
        console.log('Insertando categorías con codificación correcta...');
        const categories = [
            { name: 'Música', slug: 'musica', description: 'Conciertos, festivales y eventos musicales' },
            { name: 'Deportes', slug: 'deportes', description: 'Eventos deportivos y competencias' },
            { name: 'Tecnología', slug: 'tecnologia', description: 'Conferencias, hackathons y eventos tech' },
            { name: 'Arte', slug: 'arte', description: 'Exposiciones, galerías y eventos artísticos' },
            { name: 'Educación', slug: 'educacion', description: 'Talleres, seminarios y cursos' },
            { name: 'Negocios', slug: 'negocios', description: 'Networking, conferencias empresariales' }
        ];
        
        for (const cat of categories) {
            await pool.query(
                'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3)',
                [cat.name, cat.slug, cat.description]
            );
            console.log(`✓ Insertada: ${cat.name}`);
        }
        
        console.log('\nVerificando categorías insertadas:');
        const result = await pool.query('SELECT id, name, slug FROM categories ORDER BY id');
        console.table(result.rows);
        
        console.log('\n✅ Categorías corregidas exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixCategories();
