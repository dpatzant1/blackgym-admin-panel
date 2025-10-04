import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePermisos } from '../hooks';

/**
 * Página mostrada cuando el usuario intenta acceder a una ruta sin permisos suficientes
 */
const SinPermisosPage: React.FC = () => {
  const navigate = useNavigate();
  const { rol } = usePermisos();

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="row justify-content-center w-100">
        <div className="col-md-8 col-lg-6">
          <div className="card border-danger shadow-lg">
            <div className="card-body text-center py-5">
              {/* Icono de error */}
              <div className="mb-4">
                <i className="bi bi-shield-lock text-danger" style={{ fontSize: '5rem' }}></i>
              </div>

              {/* Título */}
              <h1 className="display-5 text-danger mb-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Acceso Denegado
              </h1>

              {/* Mensaje principal */}
              <p className="lead text-muted mb-4">
                No tienes permisos suficientes para acceder a esta sección del panel de administración.
              </p>

              {/* Información del rol */}
              <div className="alert alert-info d-inline-block">
                <i className="bi bi-person-badge me-2"></i>
                <strong>Tu rol actual:</strong> {' '}
                <span className="badge bg-primary">{rol || 'Sin rol asignado'}</span>
              </div>

              {/* Mensaje de ayuda */}
              <div className="mt-4 p-3 bg-light rounded">
                <p className="mb-2 text-muted small">
                  <i className="bi bi-info-circle me-2"></i>
                  Si crees que deberías tener acceso a esta funcionalidad:
                </p>
                <ul className="text-start text-muted small mb-0">
                  <li>Contacta a un <strong>administrador</strong> del sistema</li>
                  <li>Verifica que tu rol tenga los permisos necesarios</li>
                  <li>Consulta la documentación de permisos por rol</li>
                </ul>
              </div>

              {/* Botones de acción */}
              <div className="d-flex justify-content-center gap-3 mt-4">
                <button 
                  onClick={() => navigate(-1)} 
                  className="btn btn-outline-secondary"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver Atrás
                </button>
                <Link to="/" className="btn btn-primary">
                  <i className="bi bi-house-door me-2"></i>
                  Ir al Inicio
                </Link>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="text-center mt-4">
            <p className="text-muted small">
              <i className="bi bi-lightbulb me-1"></i>
              Recuerda que cada rol tiene acceso a diferentes funcionalidades del sistema según las políticas de seguridad establecidas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinPermisosPage;
