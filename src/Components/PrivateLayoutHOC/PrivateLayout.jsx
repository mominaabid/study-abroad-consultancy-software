import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import Header from '../Header';
import './PrivateLayout.css';

export default function PrivateLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  return (
    <div className="private-layout">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onHoverChange={setSidebarHovered}
      />

      {/* Right side shifts right when sidebar is hovered/expanded */}
      <div
        className="private-layout__right"
        style={{ marginLeft: sidebarHovered ? '256px' : '80px' }}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="private-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}