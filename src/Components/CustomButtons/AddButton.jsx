import React from "react";
import { ClipLoader } from "react-spinners";

export const AddButton = ({
  label,
  handleClick,
  param,
  loading,
  disabled,
}) => {
  return (
    <div>
      <button
        type="submit"
        disabled={loading || disabled}
        className="bg-[#009E99] text-white py-2.5 px-4 rounded-lg duration-300 
               hover:cursor-pointer hover:scale-105 active:scale-95
               shadow-lg shadow-gray-400 hover:shadow-xl hover:shadow-gray-400
               disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        onClick={(e) => handleClick && handleClick(e, param)}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <span>{label}</span>
            <ClipLoader size={18} color="#009E99" />
          </div>
        ) : (
          label
        )}
      </button>
    </div>
  );
};