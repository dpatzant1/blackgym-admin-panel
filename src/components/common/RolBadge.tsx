import React from 'react';

interface RolBadgeProps {
  rol?: string | null;
  descripcion?: string;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente Badge visual para mostrar roles de usuario
 * Incluye código de colores distintivo por rol y tooltip opcional
 */
const RolBadge: React.FC<RolBadgeProps> = ({ 
  rol, 
  descripcion,
  showTooltip = true, 
  size = 'md' 
}) => {
  // Si no hay rol, mostrar badge de "Sin rol"
  if (!rol) {
    return (
      <span 
        className="badge bg-secondary"
        data-bs-toggle={showTooltip ? "tooltip" : undefined}
        data-bs-placement="bottom"
        title={showTooltip ? "Usuario sin rol asignado. Contacte al administrador." : undefined}
      >
        <i className="bi bi-exclamation-circle me-1"></i>
        Sin rol
      </span>
    );
  }

  // Configuración de colores e iconos por rol
  const rolConfig: Record<string, { color: string; bgColor: string; icon: string; textColor: string }> = {
    'administrador': {
      color: 'bg-danger',
      bgColor: '#dc3545',
      icon: 'bi-shield-fill-check',
      textColor: 'text-white'
    },
    'gerente': {
      color: 'bg-primary',
      bgColor: '#0d6efd',
      icon: 'bi-person-badge-fill',
      textColor: 'text-white'
    },
    'asesor de ventas': {
      color: 'bg-info',
      bgColor: '#0dcaf0',
      icon: 'bi-person-fill',
      textColor: 'text-dark'
    }
  };

  // Obtener configuración del rol (case-insensitive)
  const rolKey = rol.toLowerCase();
  const config = rolConfig[rolKey] || {
    color: 'bg-secondary',
    bgColor: '#6c757d',
    icon: 'bi-person',
    textColor: 'text-white'
  };

  // Clases de tamaño
  const sizeClasses = {
    sm: 'badge-sm',
    md: '',
    lg: 'badge-lg'
  };

  // Capitalizar primera letra de cada palabra para mostrar
  const displayRol = rol.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // Tooltip text
  const tooltipText = descripcion || `Rol: ${displayRol}`;

  return (
    <span 
      className={`badge ${config.color} ${config.textColor} ${sizeClasses[size]}`}
      data-bs-toggle={showTooltip ? "tooltip" : undefined}
      data-bs-placement="bottom"
      title={showTooltip ? tooltipText : undefined}
      style={{ 
        fontWeight: 500,
        fontSize: size === 'sm' ? '0.7rem' : size === 'lg' ? '0.9rem' : '0.75rem'
      }}
    >
      <i className={`bi ${config.icon} me-1`}></i>
      {displayRol}
    </span>
  );
};

export default RolBadge;
