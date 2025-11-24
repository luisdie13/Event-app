// backend/database/adminEventQueries.js
import { pool } from './db.js';

/**
 * Actualiza los datos principales de un evento.
 * @param {string} eventId - ID del evento a actualizar.
 * @param {Object} eventData - Datos del formulario del evento.
 * @returns {Promise<Object>} El evento actualizado.
 */
export const updateEventData = async (eventId, eventData) => {
  const {
    title,
    description,
    date_time,
    location,
    total_tickets,
    price,
    category_id,
    mainImageUrl,
  } = eventData;

  // Generar un slug basado en el título
  const newSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Use pool directly
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // A. Actualizar la tabla de eventos
    const updateEventSQL = `
      UPDATE events
      SET 
        title = $1,
        slug = $2,
        description = $3,
        date_time = $4,
        location = $5,
        total_tickets = $6,
        available_tickets = $6, -- Resetea a total_tickets (ajustar según tu lógica)
        price = $7,
        category_id = $8
      WHERE id = $9
      RETURNING id, title, slug;
    `;

    const eventParams = [
      title,
      newSlug,
      description,
      date_time,
      location,
      total_tickets,
      price,
      category_id,
      eventId,
    ];

    const eventResult = await client.query(updateEventSQL, eventParams);

    if (eventResult.rowCount === 0) {
      throw new Error('Evento no encontrado o no se pudo actualizar.');
    }

    // B. Actualizar o insertar imagen principal (si aplica)
    if (mainImageUrl) {
      const updateImageSQL = `
        UPDATE images
        SET url = $1
        WHERE event_id = $2 AND is_main = TRUE
        RETURNING id;
      `;

      const imageResult = await client.query(updateImageSQL, [mainImageUrl, eventId]);

      // Si no existe imagen principal, crearla
      if (imageResult.rowCount === 0) {
        const insertImageSQL = `
          INSERT INTO images (event_id, url, is_main)
          VALUES ($1, $2, TRUE);
        `;
        await client.query(insertImageSQL, [eventId, mainImageUrl]);
      }
    }

    await client.query('COMMIT');

    return eventResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en la actualización de evento:', error);
    throw new Error(`Fallo al actualizar evento: ${error.message}`);
  } finally {
    client.release();
  }
};