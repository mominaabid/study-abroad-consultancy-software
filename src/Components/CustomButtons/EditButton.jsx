export const EditButton = ({ handleUpdate }) => {
  return (
    <button
      onClick={handleUpdate}
      className="
        bg-[#009E99]
        text-white
        px-3 py-3
        rounded-lg
        active:scale-95
        transition-all duration-300
        text-sm font-medium
      "
    >
      Update
    </button>
  );
};
