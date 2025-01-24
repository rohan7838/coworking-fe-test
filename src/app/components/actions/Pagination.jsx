"use client"
import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';


function PaginationItem({ page, currentPage, onClick }) {
  const isActive = currentPage === page;

  return (
    <button
      onClick={() => onClick(page)}
      className={`relative inline-flex items-center ${
        isActive
          ? 'bg-red-600 text-white'
          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
      } px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600`}
    >
      {page}
    </button>
  );
}

export default function Pagination({ totalItems, itemsPerPage, currentPageNumber}) {
  const [currentPage, setCurrentPage] = useState( Number(currentPageNumber) || 1);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const hubIdFromSearchQueryParams = searchParams.get("hubId");
  const params = new URLSearchParams(searchParams); //will set existing search parameters

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(()=>{
    const pageQueryParam = searchParams.get("page");
  if (hubIdFromSearchQueryParams !== null && (pageQueryParam === null || isNaN(Number(pageQueryParam)))) {
    setCurrentPage(1);
  }
  },[hubIdFromSearchQueryParams])

  const appendPageNumberInUrlSearchParams = (pageNumber) => {
    params.set("page",pageNumber)
    const searchQueryString = params.toString();
    router.push(`${pathname}?${searchQueryString}`)
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 5) {
        for (let i = 1; i <= 7; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages - 1);
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 4) {
        pageNumbers.push(1);
        pageNumbers.push(2);
        pageNumbers.push('...');
        for (let i = totalPages - 6; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push(2);
        pageNumbers.push('...');
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages - 1);
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const handlePageChange = (page) => {
    if (page !== currentPage) {
    //   onPageChange(page);
    setCurrentPage(page)
    appendPageNumberInUrlSearchParams(page)
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{' '}
            of <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              href="#"
              onClick={() => handlePageChange(currentPage - 1)}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage === 1 ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                    ...
                  </span>
                ) : (
                  <PaginationItem
                    page={page}
                    currentPage={currentPage}
                    onClick={handlePageChange}
                  />
                )}
              </React.Fragment>
            ))}
            <button
              href="#"
              onClick={() => handlePageChange(currentPage + 1)}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
