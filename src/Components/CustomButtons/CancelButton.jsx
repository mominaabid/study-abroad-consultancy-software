import { X } from "lucide-react";

export const CancelButton = ({ handleCancel }) => {
  return (
    <div
      onClick={handleCancel}
      className="
        flex items-center justify-center
        bg-red-100
        p-0.5 py-0.5 px-1
        rounded-lg
        hover:cursor-pointer
        active:scale-95
        transition-all duration-300
      "
    >
      <X size={15} className="text-red-500" title="Cancel" />
    </div>
  );
};
