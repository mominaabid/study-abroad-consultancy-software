import { HiTrash } from "react-icons/hi";

export const DeleteIcon = ({ handleDelete }) => {
  return (
    <div
      onClick={handleDelete}
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
      <HiTrash
        size={15}
        className="text-red-500"
        title="Delete"
      />
    </div>
  );
};