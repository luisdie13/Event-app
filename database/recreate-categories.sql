-- Script para recrear las categorías con codificación correcta
-- Ejecutar este script en la base de datos

-- Eliminar todas las categorías existentes
DELETE FROM categories;

-- Reiniciar la secuencia
ALTER SEQUENCE categories_id_seq RESTART WITH 1;

-- Insertar las categorías nuevamente con codificación correcta
INSERT INTO categories (name, slug, description) VALUES
    ('Música', 'musica', 'Conciertos, festivales y eventos musicales'),
    ('Deportes', 'deportes', 'Eventos deportivos y competencias'),
    ('Tecnología', 'tecnologia', 'Conferencias, hackathons y eventos tech'),
    ('Arte', 'arte', 'Exposiciones, galerías y eventos artísticos'),
    ('Educación', 'educacion', 'Talleres, seminarios y cursos'),
    ('Negocios', 'negocios', 'Networking, conferencias empresariales');

-- Verificar los cambios
SELECT id, name, slug, description FROM categories ORDER BY id;
