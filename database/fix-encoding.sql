-- Script para corregir la codificación de las categorías
-- Ejecutar este script en la base de datos

-- Actualizar las categorías con los caracteres correctos
UPDATE categories SET name = 'Música' WHERE slug = 'musica';
UPDATE categories SET name = 'Deportes' WHERE slug = 'deportes';
UPDATE categories SET name = 'Tecnología' WHERE slug = 'tecnologia';
UPDATE categories SET name = 'Arte' WHERE slug = 'arte';
UPDATE categories SET name = 'Educación' WHERE slug = 'educacion';
UPDATE categories SET name = 'Negocios' WHERE slug = 'negocios';

-- Actualizar las descripciones
UPDATE categories SET description = 'Conciertos, festivales y eventos musicales' WHERE slug = 'musica';
UPDATE categories SET description = 'Eventos deportivos y competencias' WHERE slug = 'deportes';
UPDATE categories SET description = 'Conferencias, hackathons y eventos tech' WHERE slug = 'tecnologia';
UPDATE categories SET description = 'Exposiciones, galerías y eventos artísticos' WHERE slug = 'arte';
UPDATE categories SET description = 'Talleres, seminarios y cursos' WHERE slug = 'educacion';
UPDATE categories SET description = 'Networking, conferencias empresariales' WHERE slug = 'negocios';

-- Verificar los cambios
SELECT id, name, slug, description FROM categories ORDER BY id;
