import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePermisos } from '../../hooks/usePermisos';

interface ProtectedRouteProps {
  children: ReactNode;
  requiereAdmin?: boolean; // Requiere rol de administrador
  requierePermiso?: string; // Requiere un permiso específico (ej: 'productos.crear')
}

/**
 * Componente para proteger rutas que requieren autenticación y/o permisos
 * Redirige automáticamente a /login si el usuario no está autenticado
 * Redirige a /sin-permisos si no tiene los permisos necesarios
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiereAdmin = false,
  requierePermiso 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { esAdmin, puede } = usePermisos();
  const location = useLocation();

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Verificando autenticación...</span>
          </div>
          <div className="mt-3">
            <p className="text-muted">Verificando autenticación...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    // Guardar la ubicación actual para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si requiere admin y no lo es, redirigir a página de sin permisos
  if (requiereAdmin && !esAdmin()) {
    return <Navigate to="/sin-permisos" replace />;
  }

  // Si requiere un permiso específico y no lo tiene, redirigir a página de sin permisos
  if (requierePermiso && !puede(requierePermiso)) {
    return <Navigate to="/sin-permisos" replace />;
  }

  // Si está autenticado y tiene permisos, mostrar el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;