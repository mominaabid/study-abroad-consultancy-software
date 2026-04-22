import React from "react";

export const InputField = ({
  type,
  labelName,
  placeHolder,
  handlerChange,
  onKeyDown,
  name,
  value,
  disabled,
  className,
  readOnly,
  icon,
  minLength,
  maxLength,
  autoComplete,
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

        <input
          type={type}
          autoComplete={autoComplete || "off"}
          className={`w-full p-2.5 ${icon ? "pl-10" : "pl-3"} border border-gray-200 rounded-lg shadow text-gray-500
            ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
            focus:outline-none focus:ring-1 focus:ring-[#009E99]
            ${type === "date" ? "relative" : ""}
            ${className || ""}`}
          placeholder={placeHolder}
          onChange={handlerChange}
          onKeyDown={onKeyDown}
          name={name}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          minLength={minLength}
          maxLength={maxLength}
        />
      </div>
    </div>
  );
};
