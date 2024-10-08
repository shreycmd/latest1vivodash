import { useEffect, useState } from "react";

export const Pagination = ({ productsPerPage, totalProducts, paginate, currentPage }) => {
    const [pageNumbers , setPageNumbers] = useState([])
      
    useEffect(()=>{
      const pages = [];
      for (let i = 1; i <= totalProducts; i++) {
        pages.push(i);
      }
      setPageNumbers(pages)
    },[totalProducts])

    useEffect(()=>{
        console.log("P",pageNumbers);
    },[pageNumbers])
  
    return (
      <nav>
        <ul className="flex justify-center space-x-2 my-4">
          {pageNumbers.map((number) => (
            <li key={number}>
              <button
                onClick={() => paginate(number)}
                className={`px-4 py-2 border rounded-lg focus:outline-none transition-colors ${
                  currentPage === number
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-black border-gray-300 hover:bg-gray-200'
                }`}
              >
                {number}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };
  