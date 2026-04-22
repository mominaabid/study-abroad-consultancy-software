import React from "react";

export const TextareaField = ({
  labelName,
  placeHolder,
  handlerChange,
  name,
  value,
  disabled,
  className,
  readOnly,
  minLength,
  maxLength,
}) => {
  return (
    <div>
      <div className="flex flex-col">
        <label className="text-gray-600 text-xs font-semibold">
          {labelName}
        </label>

        <textarea
          className={`rounded-lg pl-3 bg-white text-gray-500 border border-gray-200 shadow 
          transition duration-200 focus:outline-none focus:ring-1 focus:ring-[#009E99] appearance-none ${className || ""}`}
          placeholder={placeHolder}
          onChange={handlerChange}
          name={name}
          value={value}
          readOnly={readOnly}
          disabled={disabled}
          minLength={minLength}
          maxLength={maxLength}
        />
      </div>
    </div>
  );
};
