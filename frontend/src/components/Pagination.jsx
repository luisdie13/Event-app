// frontend/src/components/Pagination.jsx
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-8">
      {/* Botón Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          currentPage === 1
            ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
            : 'bg-slate-700 text-white hover:bg-accent-600 hover:shadow-lg'
        }`}
      >
        ← Anterior
      </button>

      {/* Primera página si no está visible */}
      {pageNumbers[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-4 py-2 rounded-lg font-medium bg-slate-700 text-white hover:bg-accent-600 transition-all"
          >
            1
          </button>
          {pageNumbers[0] > 2 && (
            <span className="px-2 text-gray-400">...</span>
          )}
        </>
      )}

      {/* Números de página */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            page === currentPage
              ? 'bg-accent-600 text-white shadow-lg scale-110'
              : 'bg-slate-700 text-white hover:bg-accent-600 hover:shadow-lg'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Última página si no está visible */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="px-2 text-gray-400">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-4 py-2 rounded-lg font-medium bg-slate-700 text-white hover:bg-accent-600 transition-all"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Botón Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          currentPage === totalPages
            ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
            : 'bg-slate-700 text-white hover:bg-accent-600 hover:shadow-lg'
        }`}
      >
        Siguiente →
      </button>
    </div>
  );
};

export default Pagination;
