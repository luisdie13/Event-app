import React from 'react';
import { Carousel as RCarousel } from 'react-bootstrap';

const Carousel = ({ events }) => {
  return (
    <RCarousel>
      {events.map((event, index) => (
        <RCarousel.Item key={index}>
          <img
            className="d-block w-100"
            src={event.imageUrl} // Reemplaza con la URL de la imagen del evento
            alt={event.name}
            style={{ maxHeight: '400px', objectFit: 'cover' }}
          />
          <RCarousel.Caption>
            <h3>{event.name}</h3>
            <p>{event.description}</p>
          </RCarousel.Caption>
        </RCarousel.Item>
      ))}
    </RCarousel>
  );
};

export default Carousel;