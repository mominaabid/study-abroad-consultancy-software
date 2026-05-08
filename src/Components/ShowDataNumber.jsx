import React from "react";

export const ShowDataNumber = ({ start = 1, end = 10, total = 7 }) => {
  return (
    <div className="text-xs sm:text-sm text-gray-800 ml-1">
      Showing {start} - {end} of {total} personnel
    </div>
  );
};
