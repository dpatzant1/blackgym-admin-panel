import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermisos } from '../../hooks';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { esAdmin, puede } = usePermisos();

  // Función para determinar si una ruta está activa
  const isActiveRoute = (path: string): boolean => {
    return location.pathname === path;
  };

  // Función para obtener clases CSS del enlace
  const getLinkClasses = (path: string): string => {
    const baseClasses = "nav-link text-white d-flex align-items-center py-3 px-3";
    const activeClasses = "bg-primary";
    return isActiveRoute(path) ? `${baseClasses} ${activeClasses}` : baseClasses;
  };

  return (
    <div className="bg-dark sidebar-fixed d-flex flex-column d-none d-md-flex" style={{ width: '250px', height: '100vh', position: 'fixed', top: '56px', left: '0', zIndex: 1010 }}>
      {/* Título del sidebar */}
      <div className="text-center py-3 border-bottom border-secondary">
        <h6 className="text-white mb-0 fw-bold">
          <i className="bi bi-gear-fill me-2"></i>
          Administración
        </h6>
      </div>

      {/* Navegación principal */}
      <nav className="flex-grow-1 py-2">
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link to="/" className={getLinkClasses('/')}>
              <i className="bi bi-house-door-fill me-3"></i>
              <span>Inicio</span>
            </Link>
          </li>
          
          <li className="nav-item mt-1">
            <Link to="/dashboard" className={getLinkClasses('/dashboard')}>
              <i className="bi bi-graph-up me-3"></i>
              <span>Dashboard Ventas</span>
            </Link>
          </li>
          
          <li className="nav-item mt-1">
            <Link to="/categorias" className={getLinkClasses('/categorias')}>
              <i className="bi bi-tags-fill me-3"></i>
              <span>Categorías</span>
            </Link>
          </li>
          
          <li className="nav-item mt-1">
            <Link to="/productos" className={getLinkClasses('/productos')}>
              <i className="bi bi-box-fill me-3"></i>
              <span>Productos</span>
            </Link>
          </li>
          
          <li className="nav-item mt-1">
            <Link to="/ordenes" className={getLinkClasses('/ordenes')}>
              <i className="bi bi-cart-check-fill me-3"></i>
              <span>Órdenes</span>
            </Link>
          </li>
          
          {/* Separador para opciones administrativas */}
          {(esAdmin() || puede('bitacora.leer')) && (
            <li className="nav-item mt-3 mb-2">
              <div className="px-3">
                <small className="text-white text-uppercase fw-bold">Administración</small>
              </div>
            </li>
          )}
          
          {/* Opción de Usuarios - Solo visible para administradores */}
          {esAdmin() && (
            <li className="nav-item mt-1">
              <Link to="/administradores" className={getLinkClasses('/administradores')}>
                <i className="bi bi-people-fill me-3"></i>
                <span>Usuarios</span>
              </Link>
            </li>
          )}
          
          {/* Opción de Bitácora - Oculta para esta demo
          {puede('bitacora.leer') && (
            <li className="nav-item mt-1">
              <Link to="/bitacora" className={getLinkClasses('/bitacora')}>
                <i className="bi bi-journal-text me-3"></i>
                <span>Bitácora</span>
              </Link>
            </li>
          )}
          */}
        </ul>
      </nav>

      {/* Información adicional en la parte inferior */}
      <div className="mt-auto p-3 border-top border-secondary">
        <small className="text-muted d-block text-center">
          <i className="bi bi-info-circle me-1"></i>
          Black Gym Admin v1.0
        </small>
      </div>
    </div>
  );
};

export default Sidebar;