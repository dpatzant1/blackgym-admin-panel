import React from 'react';
import type { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-vh-100 bg-light" style={{ overflowX: 'hidden' }}>
      {/* Header/Navbar */}
      <Header />
      
      {/* Sidebar fijo */}
      <Sidebar />
      
      {/* Contenido principal con margen para el sidebar */}
      <main 
        className="container-fluid py-4 main-content" 
        style={{ 
          marginTop: '56px',
          transition: 'margin-left 0.3s ease',
          overflowX: 'hidden'
        }}
      >
        <div className="d-block d-md-none">
          {/* Espaciado adicional para móviles */}
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;