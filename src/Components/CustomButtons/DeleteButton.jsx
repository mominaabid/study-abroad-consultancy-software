import { RiDeleteBin5Fill } from "react-icons/ri";

export const DeleteButton = ({ handleDelete }) => {
  return (
    <div
      onClick={() => handleDelete()}
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
      <RiDeleteBin5Fill size={15} className="text-red-500" title="Delete" />
    </div>
  );
};