export const Footer = () => {
  return (
    <footer className="w-full p-2 bg-white">
      <div className="flex justify-center bg-white md:justify-end">
        <h1 className="font-sans text-gray-500 font-semibold bg-white text-sm md:text-base flex items-center">
          Developed With 
          <span className="inline-block mx-1 animate-pulse text-red-500">
          ❤️
          </span> 
          By:{" "}
          <a
            href="https://technicmentors.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline font-extrabold text-blue-400 cursor-pointer hover:text-blue-600 
            transition-colors duration-300 ml-1"
          >
            Technic Mentors
          </a>
        </h1>
      </div>
    </footer>
  );
};