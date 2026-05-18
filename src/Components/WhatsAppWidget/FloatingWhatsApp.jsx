import { FaWhatsapp } from "react-icons/fa";

export default function FloatingWhatsApp() {
  const whatsappNumber = "923004900046";

  const handleClick = () => {
    const message = encodeURIComponent(
      "Hello, I need help regarding my student portal.",
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Chat on WhatsApp"
      className="
        fixed 
        bottom-6 
        right-6 
        z-50 
        flex 
        items-center 
        justify-center 
        w-16 
        h-16 
        rounded-full 
        bg-green-500 
        text-white 
        shadow-lg 
        hover:bg-green-600 
        hover:scale-110 
        transition-all 
        duration-300
      "
    >
      <FaWhatsapp size={30} />
    </button>
  );
}
