'use client';

import React from 'react';
import { cn } from '@/utilities/ui'; // Assuming a utility for class names

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const BlogPagination: React.FC<BlogPaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null; // Don't render pagination if only one page
  }

  const pageNumbers = [];
  // Display a limited range of pages around the current page
  const maxPageNumbersToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);

  // Adjust startPage if endPage is the totalPages
  if (endPage === totalPages) {
    startPage = Math.max(1, endPage - maxPageNumbersToShow + 1);
  }


  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center space-x-2" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'px-3 py-1 border rounded',
          currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-200'
        )}
      >
        Previous
      </button>

      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={cn(
            'px-3 py-1 border rounded',
            currentPage === number ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
          )}
        >
          {number}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'px-3 py-1 border rounded',
          currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-200'
        )}
      >
        Next
      </button>
    </nav>
  );
};

export default BlogPagination;