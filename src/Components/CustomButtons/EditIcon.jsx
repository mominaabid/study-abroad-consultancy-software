import { HiPencil } from "react-icons/hi";

export const EditIcon = ({ handleUpdate }) => {
  return (
    <div
      onClick={handleUpdate}
      className="
        flex items-center gap-0.5
        bg-grey
        p-0.5 py-0.5 px-1
        rounded-lg
        hover:cursor-pointer
        active:scale-95
        transition-all duration-300
      "
    >
      <span className="text-[10px]"></span>

      <HiPencil
        size={15}
        className="text-indigo-900"
        title="Edit"
      />
    </div>
  );
};