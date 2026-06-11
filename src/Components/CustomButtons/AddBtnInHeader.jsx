import { PlusIcon } from "lucide-react";

export const AddBtnInHeader = ({
  label,
  handleToggle,
  className = "",
  showIcon = true,
}) => {
  return (
    <button
      onClick={handleToggle}
      className={`bg-[#009E99] text-white 
  px-2 py-3 sm:px-4 sm:py-3
  text-[15px] sm:text-sm font-medium
  rounded-lg shadow-md
  hover:opacity-95 active:scale-95 transition-all duration-300 
  flex items-center gap-2 whitespace-nowrap ${className}`}
    >
      {showIcon && (
        <PlusIcon size={16} className="sm:w-5 sm:h-5 fill-current" />
      )}
      <span>{label}</span>
    </button>
  );
};
