import React from 'react';
import type { EstadoOrden } from '../../types/orden';

interface EstadoBadgeProps {
  estado: EstadoOrden;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente badge visual para mostrar el estado de una orden
 * con colores distintivos e iconos según el estado
 */
const EstadoBadge: React.FC<EstadoBadgeProps> = ({ estado, size = 'md' }) => {
  // Configuración de estilos por estado
  const estadoConfig: Record<EstadoOrden, { color: string; bgColor: string; icon: string; label: string }> = {
    'pendiente': {
      color: 'text-warning',
      bgColor: 'bg-warning',
      icon: '⏳',
      label: 'Pendiente'
    },
    'pagado': {
      color: 'text-info',
      bgColor: 'bg-info',
      icon: '💳',
      label: 'Pagado'
    },
    'enviado': {
      color: 'text-primary',
      bgColor: 'bg-primary',
      icon: '📦',
      label: 'Enviado'
    },
    'completado': {
      color: 'text-success',
      bgColor: 'bg-success',
      icon: '✅',
      label: 'Completado'
    },
    'cancelado': {
      color: 'text-danger',
      bgColor: 'bg-danger',
      icon: '❌',
      label: 'Cancelado'
    }
  };

  const config = estadoConfig[estado] || estadoConfig['pendiente'];

  // Clases de tamaño
  const sizeClasses = {
    sm: 'badge-sm px-2 py-1',
    md: 'px-3 py-1',
    lg: 'px-4 py-2 fs-6'
  };

  return (
    <span 
      className={`badge ${config.bgColor} text-white ${sizeClasses[size]} d-inline-flex align-items-center gap-1`}
      title={config.label}
      style={{ fontWeight: 500 }}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

export default EstadoBadge;
