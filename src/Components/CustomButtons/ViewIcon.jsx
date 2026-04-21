import { PiEyeFill } from "react-icons/pi";

export const ViewIcon = ({ handleView }) => {
  return (
    <div
      onClick={handleView}
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
      <PiEyeFill size={15} className="text-green-500" title="View" />
    </div>
  );
};