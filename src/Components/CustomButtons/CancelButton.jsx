export const CancelButton = ({ handleCancel }) => {
  return (
    <button
      type="button"
      onClick={handleCancel}
      className="
        px-5 py-2.5 
        bg-gray-200 text-black
        rounded-xl 
        hover:bg-red-200 
        hover:cursor-pointer 
        active:scale-95 
        transition-all duration-300
      "
    >
      Cancel
    </button>
  );
};
