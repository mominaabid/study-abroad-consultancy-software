import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../../Header";
import { SideBar } from "../../SideBar";

export const PrivateLayout = () => {
  const [isOpen, setIsopen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  const toggleSideBar = () => {
    setIsopen((prev) => !prev);
  };

  // 👇 Scroll reset on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: 0,
        behavior: "instant", // ya "smooth" agar animation chahiye
      });
    }
  }, [location.pathname, mainRef]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header isOpen={isOpen} toggleSideBar={toggleSideBar} />

      <div className="flex flex-1 overflow-hidden">
        <SideBar isOpen={isOpen} setIsOpen={setIsopen} />

        <main
          ref={mainRef}
          className="flex-1 flex flex-col overflow-y-auto bg-gray-50"
        >
          <div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
