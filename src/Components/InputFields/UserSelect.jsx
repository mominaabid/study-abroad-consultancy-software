import React from "react";

export const UserSelect = ({
  labelName,
  handlerChange,
  name,
  value,
  optionData,
  disabled,
}) => {
  return (
    <div className="flex flex-col">
      <label className="text-gray-600 text-xs font-semibold">{labelName}</label>

      <select
        value={value}
        onChange={handlerChange}
        name={name}
        disabled={disabled}
        className="p-3 rounded bg-white text-gray-500 border-1 shadow rounded-lg border-[#009E99]"
      >
        <option value="">Please Select</option>

        {optionData?.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
