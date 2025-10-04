import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import RolBadge from '../common/RolBadge';

const Header: React.FC = () => {
  const { admin, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm fixed-top">
      <div className="container-fluid" style={{ overflow: 'visible' }}>
        {/* Logo del gimnasio */}
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-dumbbell me-2"></i>
          Black Gym Admin
        </Link>

        {/* Botón para toggle en móviles */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navegación principal */}
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          {/* Navegación principal (incluye enlaces que se mostrarán también en móvil) */}
          {/* Enlaces que solo se muestran en móvil (ocultos en pantallas grandes) */}
          <div className="navbar-nav me-auto d-lg-none">
            <Link className="nav-link text-end" to="/productos">Productos</Link>
            <Link className="nav-link text-end" to="/categorias">Categorías</Link>
          </div>

          {/* Información del usuario y logout */}
          <div className="navbar-nav">
            <div className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle text-light text-end"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                id="userDropdown"
              >
                <i className="bi bi-person-circle me-1"></i>
                {admin?.usuario || 'Administrador'}
              </a>
              <ul className="dropdown-menu dropdown-menu-end custom-dropdown" aria-labelledby="userDropdown">
                <li>
                  <span className="dropdown-item-text">
                    <small className="text-muted">
                      Usuario: {admin?.usuario}
                    </small>
                  </span>
                </li>
                <li>
                  <span className="dropdown-item-text d-flex align-items-center">
                    <small className="text-muted me-2">Rol:</small>
                    <RolBadge 
                      rol={admin?.rol?.nombre} 
                      descripcion={admin?.rol?.descripcion}
                      showTooltip={true}
                      size="sm"
                    />
                  </span>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;