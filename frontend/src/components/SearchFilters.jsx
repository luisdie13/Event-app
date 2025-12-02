// frontend/src/components/SearchFilters.jsx
import React, { useState, useEffect, useRef } from 'react';

const SearchFilters = ({ onFilterChange, onReset, currentSearch = '' }) => {
  const [searchValue, setSearchValue] = useState(currentSearch);
  const timeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Actualizar valor de búsqueda solo si viene de reset externo
  useEffect(() => {
    if (currentSearch === '' && searchValue !== '') {
      setSearchValue('');
    }
  }, [currentSearch]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Crear nuevo timeout para búsqueda automática
    timeoutRef.current = setTimeout(() => {
      onFilterChange({
        search: value,
        minPrice: '',
        maxPrice: '',
        dateFrom: '',
        dateTo: '',
        location: '',
        sortBy: 'date_asc'
      });
      // Mantener el foco en el input después de la búsqueda
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Cancelar búsqueda pendiente y buscar inmediatamente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onFilterChange({
      search: searchValue,
      minPrice: '',
      maxPrice: '',
      dateFrom: '',
      dateTo: '',
      location: '',
      sortBy: 'date_asc'
    });
  };

  return (
    <div className="mb-12 flex justify-center items-center w-full">
      {/* Barra de búsqueda centrada */}
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            name="search"
            value={searchValue}
            onChange={handleInputChange}
            placeholder="🔍 Buscar eventos por nombre..."
            className="w-full px-6 py-4 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 shadow-lg text-lg text-center"
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
};

export default SearchFilters;
