import React from "react";

export const OptionField = ({
  labelName,
  handlerChange,
  name,
  value,
  optionData,
  inital,
  disabled,
  icon,
}) => {
  return (
    <div className="flex flex-col">
      <label className="text-gray-600 text-xs font-semibold">{labelName}</label>

      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-[#009E99] z-10">
            {icon}
          </div>
        )}

        <select
          value={value}
          onChange={handlerChange}
          name={name}
          disabled={disabled}
          className={`w-full p-2.5 ${
            icon ? "pl-10" : "pl-3"
          } rounded-lg bg-white text-gray-500 border border-gray-200 shadow 
          transition duration-200 focus:outline-none focus:ring-1 focus:ring-[#009E99] appearance-none`}
        >
          <option value="">{inital}</option>

          {optionData?.map((option) => (
            <option value={option.value} key={option.id}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
