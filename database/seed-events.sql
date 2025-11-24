-- Script para insertar eventos de prueba

-- Evento 1: Concierto de Rock (ya creado, pero por si acaso)
INSERT INTO events (user_id, category_id, title, slug, description, date_time, location, total_tickets, available_tickets, price, is_featured)
SELECT 
    (SELECT id FROM users WHERE email = 'admin@eventplatform.com'),
    1, -- Música
    'Concierto de Rock en Vivo',
    'concierto-de-rock-en-vivo',
    'Un increíble concierto de rock con las mejores bandas locales. Disfruta de una noche llena de música, energía y diversión. ¡No te lo pierdas!',
    NOW() + INTERVAL '30 days',
    'Estadio Nacional, Ciudad de Guatemala',
    500,
    500,
    150.00,
    TRUE
WHERE NOT EXISTS (SELECT 1 FROM events WHERE slug = 'concierto-de-rock-en-vivo');

-- Imagen para Concierto de Rock
INSERT INTO images (event_id, url, is_main)
SELECT 
    id,
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop',
    TRUE
FROM events 
WHERE slug = 'concierto-de-rock-en-vivo'
AND NOT EXISTS (SELECT 1 FROM images WHERE event_id = (SELECT id FROM events WHERE slug = 'concierto-de-rock-en-vivo'));

-- Evento 2: Partido de Fútbol
INSERT INTO events (user_id, category_id, title, slug, description, date_time, location, total_tickets, available_tickets, price, is_featured)
SELECT 
    (SELECT id FROM users WHERE email = 'admin@eventplatform.com'),
    2, -- Deportes
    'Final del Campeonato Nacional de Fútbol',
    'final-campeonato-nacional-futbol',
    'La gran final del campeonato nacional. Los dos mejores equipos se enfrentan por el título. ¡Vive la emoción del fútbol!',
    NOW() + INTERVAL '15 days',
    'Estadio Doroteo Guamuch Flores',
    10000,
    10000,
    75.00,
    TRUE
WHERE NOT EXISTS (SELECT 1 FROM events WHERE slug = 'final-campeonato-nacional-futbol');

INSERT INTO images (event_id, url, is_main)
SELECT 
    id,
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop',
    TRUE
FROM events 
WHERE slug = 'final-campeonato-nacional-futbol'
AND NOT EXISTS (SELECT 1 FROM images WHERE event_id = (SELECT id FROM events WHERE slug = 'final-campeonato-nacional-futbol'));

-- Evento 3: Conferencia de Tecnología
INSERT INTO events (user_id, category_id, title, slug, description, date_time, location, total_tickets, available_tickets, price, is_featured)
SELECT 
    (SELECT id FROM users WHERE email = 'admin@eventplatform.com'),
    3, -- Tecnología
    'TechConf 2025 - Innovación y Futuro',
    'techconf-2025-innovacion-futuro',
    'La conferencia de tecnología más importante del año. Expertos internacionales compartirán las últimas tendencias en IA, blockchain y desarrollo web.',
    NOW() + INTERVAL '45 days',
    'Centro de Convenciones Tikal Futura',
    300,
    300,
    250.00,
    TRUE
WHERE NOT EXISTS (SELECT 1 FROM events WHERE slug = 'techconf-2025-innovacion-futuro');

INSERT INTO images (event_id, url, is_main)
SELECT 
    id,
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
    TRUE
FROM events 
WHERE slug = 'techconf-2025-innovacion-futuro'
AND NOT EXISTS (SELECT 1 FROM images WHERE event_id = (SELECT id FROM events WHERE slug = 'techconf-2025-innovacion-futuro'));

-- Evento 4: Exposición de Arte
INSERT INTO events (user_id, category_id, title, slug, description, date_time, location, total_tickets, available_tickets, price, is_featured)
SELECT 
    (SELECT id FROM users WHERE email = 'admin@eventplatform.com'),
    4, -- Arte
    'Exposición de Arte Contemporáneo',
    'exposicion-arte-contemporaneo',
    'Descubre las obras de los artistas contemporáneos más destacados. Una experiencia visual única que no puedes perderte.',
    NOW() + INTERVAL '20 days',
    'Museo Nacional de Arte Moderno',
    200,
    200,
    50.00,
    FALSE
WHERE NOT EXISTS (SELECT 1 FROM events WHERE slug = 'exposicion-arte-contemporaneo');

INSERT INTO images (event_id, url, is_main)
SELECT 
    id,
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=400&fit=crop',
    TRUE
FROM events 
WHERE slug = 'exposicion-arte-contemporaneo'
AND NOT EXISTS (SELECT 1 FROM images WHERE event_id = (SELECT id FROM events WHERE slug = 'exposicion-arte-contemporaneo'));

-- Evento 5: Taller de Programación
INSERT INTO events (user_id, category_id, title, slug, description, date_time, location, total_tickets, available_tickets, price, is_featured)
SELECT 
    (SELECT id FROM users WHERE email = 'admin@eventplatform.com'),
    5, -- Educación
    'Taller Intensivo de React y Node.js',
    'taller-intensivo-react-nodejs',
    'Aprende a crear aplicaciones full-stack modernas con React y Node.js. Incluye certificado de participación.',
    NOW() + INTERVAL '10 days',
    'Universidad Galileo, Campus Central',
    50,
    50,
    350.00,
    FALSE
WHERE NOT EXISTS (SELECT 1 FROM events WHERE slug = 'taller-intensivo-react-nodejs');

INSERT INTO images (event_id, url, is_main)
SELECT 
    id,
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop',
    TRUE
FROM events 
WHERE slug = 'taller-intensivo-react-nodejs'
AND NOT EXISTS (SELECT 1 FROM images WHERE event_id = (SELECT id FROM events WHERE slug = 'taller-intensivo-react-nodejs'));

-- Evento 6: Networking Empresarial
INSERT INTO events (user_id, category_id, title, slug, description, date_time, location, total_tickets, available_tickets, price, is_featured)
SELECT 
    (SELECT id FROM users WHERE email = 'admin@eventplatform.com'),
    6, -- Negocios
    'Networking Night - Conecta con Emprendedores',
    'networking-night-emprendedores',
    'Una noche de networking para emprendedores y profesionales. Expande tu red de contactos y descubre nuevas oportunidades de negocio.',
    NOW() + INTERVAL '7 days',
    'Hotel Westin Camino Real',
    100,
    100,
    0.00,
    FALSE
WHERE NOT EXISTS (SELECT 1 FROM events WHERE slug = 'networking-night-emprendedores');

INSERT INTO images (event_id, url, is_main)
SELECT 
    id,
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop',
    TRUE
FROM events 
WHERE slug = 'networking-night-emprendedores'
AND NOT EXISTS (SELECT 1 FROM images WHERE event_id = (SELECT id FROM events WHERE slug = 'networking-night-emprendedores'));
