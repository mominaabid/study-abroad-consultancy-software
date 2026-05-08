import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

export const Pagination = ({ handlePageClick, pageNo, totalNum, pageSize }) => {
  const totalPages = Math.ceil(totalNum / pageSize);

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 3;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (pageNo > showMax) {
        pages.push("...");
      }

      const start = Math.max(2, pageNo - 1);
      const end = Math.min(totalPages - 1, pageNo + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (pageNo < totalPages - (showMax - 1)) {
        pages.push("...");
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const baseClass =
    "flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg border text-[10px] md:text-xs transition-all duration-200 font-medium";

  const activeClass = `${baseClass} bg-[#009E99] text-white shadow-md`;

  const inactiveClass = `${baseClass} bg-white text-gray-500 border-gray-200 hover:border-[#009E99] hover:text-[#009E99]`;

  const btnDisabled =
    "opacity-40 cursor-not-allowed hover:border-gray-200 hover:text-slate-600";

  if (totalPages === 0) return null;

  return (
    <div className="flex items-center justify-end mt-2 gap-1">
      {/* Previous */}
      <button
        className={`${inactiveClass} ${pageNo === 1 ? btnDisabled : ""}`}
        onClick={() => pageNo > 1 && handlePageClick(pageNo - 1)}
        disabled={pageNo === 1}
      >
        <FontAwesomeIcon icon={faChevronLeft} className="text-[8px]" />
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          disabled={page === "..."}
          onClick={() => typeof page === "number" && handlePageClick(page)}
          className={
            page === pageNo
              ? activeClass
              : page === "..."
                ? "px-1 text-slate-400 cursor-default"
                : inactiveClass
          }
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        className={`${inactiveClass} ${
          pageNo === totalPages ? btnDisabled : ""
        }`}
        onClick={() => pageNo < totalPages && handlePageClick(pageNo + 1)}
        disabled={pageNo === totalPages}
      >
        <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
      </button>
    </div>
  );
};
