import React from 'react';
import type { EstadoOrden } from '../../types/orden';

interface OrdenTimelineProps {
  estadoActual: EstadoOrden;
  vertical?: boolean;
}

/**
 * Componente timeline visual que muestra el progreso de una orden
 * a través de sus estados posibles
 */
const OrdenTimeline: React.FC<OrdenTimelineProps> = ({ estadoActual, vertical = false }) => {
  // Definir el flujo principal de estados (excluyendo cancelado por ser alternativo)
  const estadosFlujoPrincipal: EstadoOrden[] = ['pendiente', 'pagado', 'enviado', 'completado'];
  
  // Determinar el índice del estado actual en el flujo principal
  const estadoActualIndex = estadosFlujoPrincipal.indexOf(estadoActual);
  
  // Si el estado es cancelado, mostramos flujo especial
  const esCancelado = estadoActual === 'cancelado';

  // Configuración de iconos y labels para cada estado
  const estadoConfig: Record<EstadoOrden, { icon: string; label: string; color: string }> = {
    'pendiente': { icon: '⏳', label: 'Pendiente', color: 'warning' },
    'pagado': { icon: '💳', label: 'Pagado', color: 'info' },
    'enviado': { icon: '📦', label: 'Enviado', color: 'primary' },
    'completado': { icon: '✅', label: 'Completado', color: 'success' },
    'cancelado': { icon: '❌', label: 'Cancelado', color: 'danger' }
  };

  // Renderizado vertical (opcional)
  if (vertical) {
    return (
      <div className="d-flex flex-column gap-3">
        {estadosFlujoPrincipal.map((estado, index) => {
          const config = estadoConfig[estado];
          const isCompleted = index < estadoActualIndex;
          const isCurrent = index === estadoActualIndex;
          const isPending = index > estadoActualIndex;

          return (
            <div key={estado} className="d-flex align-items-start gap-3">
              {/* Círculo del estado */}
              <div className="d-flex flex-column align-items-center">
                <div 
                  className={`
                    rounded-circle d-flex align-items-center justify-content-center
                    ${isCompleted ? `bg-${config.color} text-white` : ''}
                    ${isCurrent ? `bg-${config.color} text-white` : ''}
                    ${isPending ? 'bg-light text-muted border' : ''}
                  `}
                  style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}
                >
                  {isCompleted ? '✓' : config.icon}
                </div>
                {index < estadosFlujoPrincipal.length - 1 && (
                  <div 
                    className={`${isCompleted ? `bg-${config.color}` : 'bg-light'}`}
                    style={{ width: '2px', height: '40px' }}
                  ></div>
                )}
              </div>

              {/* Información del estado */}
              <div className="flex-grow-1">
                <strong className={isCurrent ? `text-${config.color}` : ''}>
                  {config.label}
                </strong>
                {isCurrent && <small className="d-block text-muted">Estado actual</small>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Renderizado horizontal (por defecto)
  return (
    <div className="py-4">
      {esCancelado ? (
        // Vista especial para órdenes canceladas
        <div className="alert alert-danger d-flex align-items-center justify-content-center gap-3">
          <span style={{ fontSize: '2rem' }}>❌</span>
          <div>
            <strong>Orden Cancelada</strong>
            <p className="mb-0 small">Esta orden fue cancelada y no se procesará.</p>
          </div>
        </div>
      ) : (
        // Timeline horizontal para el flujo normal
        <div className="d-flex align-items-center justify-content-between position-relative">
          {/* Línea de fondo */}
          <div 
            className="position-absolute bg-light"
            style={{ 
              height: '4px', 
              left: '40px', 
              right: '40px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              zIndex: 0
            }}
          ></div>

          {/* Línea de progreso */}
          <div 
            className="position-absolute bg-success"
            style={{ 
              height: '4px', 
              left: '40px', 
              width: estadoActualIndex > 0 
                ? `calc(${(estadoActualIndex / (estadosFlujoPrincipal.length - 1)) * 100}% - 40px)` 
                : '0%',
              top: '50%', 
              transform: 'translateY(-50%)',
              zIndex: 0
            }}
          ></div>

          {/* Estados */}
          {estadosFlujoPrincipal.map((estado, index) => {
            const config = estadoConfig[estado];
            const isCompleted = index < estadoActualIndex;
            const isCurrent = index === estadoActualIndex;
            const isPending = index > estadoActualIndex;

            return (
              <div 
                key={estado} 
                className="d-flex flex-column align-items-center position-relative"
                style={{ flex: 1, zIndex: 1 }}
              >
                {/* Círculo del estado */}
                <div 
                  className={`
                    rounded-circle d-flex align-items-center justify-content-center shadow-sm
                    ${isCompleted ? 'bg-success text-white' : ''}
                    ${isCurrent ? `bg-${config.color} text-white` : ''}
                    ${isPending ? 'bg-white text-muted border border-2' : ''}
                  `}
                  style={{ 
                    width: '50px', 
                    height: '50px', 
                    fontSize: '1.5rem',
                    transition: 'all 0.3s ease'
                  }}
                  title={config.label}
                >
                  {isCompleted ? '✓' : config.icon}
                </div>

                {/* Label del estado */}
                <small 
                  className={`
                    mt-2 text-center fw-semibold
                    ${isCompleted ? 'text-success' : ''}
                    ${isCurrent ? `text-${config.color}` : ''}
                    ${isPending ? 'text-muted' : ''}
                  `}
                  style={{ fontSize: '0.85rem' }}
                >
                  {config.label}
                </small>

                {/* Indicador de estado actual */}
                {isCurrent && (
                  <span className="badge bg-primary mt-1" style={{ fontSize: '0.7rem' }}>
                    Actual
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdenTimeline;
