import React from "react";
import { RxCross1 } from "react-icons/rx";
 
export const Title = ({ children, setModal, className = "" }) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between p-5 bg-[#009E99] rounded-t-lg   text-white font-sans">
        <span className="font-semibold text-lg md:text-2xl">{children}</span>
 
        <span className="hover:cursor-pointer">
          <RxCross1 size={22} onClick={() => setModal()} title="Close" />
        </span>
      </div>
 
      <div className="border-b border-gray-300"></div>
    </div>
  );
};
