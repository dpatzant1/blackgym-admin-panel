import React, { useState } from 'react';
import type { Orden, EstadoOrden } from '../../types/orden';
import { cambiarEstadoOrden } from '../../services/ordenesService';
import { EstadoBadge } from './';
import { showSuccess, showError } from '../../utils/toast';
import { usePermisos } from '../../hooks';

interface CambiarEstadoProps {
  orden: Orden;
  onEstadoCambiado: () => void;
  disabled?: boolean;
}

// Mapa de transiciones permitidas según el estado actual
const TRANSICIONES_PERMITIDAS: Record<EstadoOrden, EstadoOrden[]> = {
  'pendiente': ['pagado', 'cancelado'],
  'pagado': ['enviado', 'cancelado'],
  'enviado': ['completado'],
  'completado': [], // Estado final, no se puede cambiar
  'cancelado': []   // Estado final, no se puede cambiar
};

/**
 * Componente para cambiar el estado de una orden con validación de transiciones
 * Solo muestra los estados permitidos según el estado actual
 */
const CambiarEstado: React.FC<CambiarEstadoProps> = ({ orden, onEstadoCambiado, disabled = false }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [mostrarModal, setMostrarModal] = useState<boolean>(false);
  const [nuevoEstadoSeleccionado, setNuevoEstadoSeleccionado] = useState<EstadoOrden | null>(null);
  const { esAdmin } = usePermisos();

  // Obtener estados permitidos para el estado actual
  let estadosPermitidos = TRANSICIONES_PERMITIDAS[orden.estado] || [];
  
  // Filtrar "cancelado" si el usuario NO es administrador
  if (!esAdmin()) {
    estadosPermitidos = estadosPermitidos.filter(estado => estado !== 'cancelado');
  }

  // Verificar si la orden está en estado final
  const esEstadoFinal = estadosPermitidos.length === 0;

  // Handler cuando se selecciona un nuevo estado
  const handleSeleccionarEstado = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoEstado = e.target.value as EstadoOrden;
    
    if (nuevoEstado && nuevoEstado !== orden.estado) {
      setNuevoEstadoSeleccionado(nuevoEstado);
      setMostrarModal(true);
    }
  };

  // Confirmar el cambio de estado
  const confirmarCambioEstado = async () => {
    if (!nuevoEstadoSeleccionado) return;

    try {
      setLoading(true);
      await cambiarEstadoOrden(orden.id, { nuevoEstado: nuevoEstadoSeleccionado });
      
      showSuccess(`Estado cambiado exitosamente de "${orden.estado}" a "${nuevoEstadoSeleccionado}"`);
      setMostrarModal(false);
      setNuevoEstadoSeleccionado(null);
      onEstadoCambiado(); // Recargar lista de órdenes
    } catch (error: unknown) {
      console.error('Error al cambiar estado:', error);
      
      // Manejo específico de errores de transición inválida
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 400) {
        showError(`Transición inválida: No se puede cambiar de "${orden.estado}" a "${nuevoEstadoSeleccionado}"`);
      } else {
        showError('Error al cambiar el estado de la orden');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cancelar el cambio de estado
  const cancelarCambioEstado = () => {
    setMostrarModal(false);
    setNuevoEstadoSeleccionado(null);
  };

  // Obtener nombre legible del estado
  const getNombreEstado = (estado: EstadoOrden): string => {
    const nombres: Record<EstadoOrden, string> = {
      'pendiente': 'Pendiente',
      'pagado': 'Pagado',
      'enviado': 'Enviado',
      'completado': 'Completado',
      'cancelado': 'Cancelado'
    };
    return nombres[estado];
  };

  // Si es estado final, mostrar solo el badge sin selector
  if (esEstadoFinal) {
    return (
      <div className="d-flex align-items-center gap-2">
        <EstadoBadge estado={orden.estado} size="md" />
        <small className="text-muted" title="Este estado es final y no se puede cambiar">
          <i className="bi bi-lock-fill"></i>
        </small>
      </div>
    );
  }

  return (
    <>
      {/* Selector de estado */}
      <select
        className="form-select form-select-sm"
        value={orden.estado}
        onChange={handleSeleccionarEstado}
        disabled={disabled || loading || esEstadoFinal}
        style={{ minWidth: '150px' }}
      >
        {/* Estado actual */}
        <option value={orden.estado}>
          {getNombreEstado(orden.estado)} (actual)
        </option>
        
        {/* Estados permitidos */}
        {estadosPermitidos.map((estado) => (
          <option key={estado} value={estado}>
            ➜ {getNombreEstado(estado)}
          </option>
        ))}
      </select>

      {/* Modal de confirmación */}
      {mostrarModal && nuevoEstadoSeleccionado && (
        <>
          {/* Backdrop */}
          <div 
            className="modal-backdrop fade show" 
            onClick={cancelarCambioEstado}
          ></div>

          {/* Modal */}
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-arrow-left-right me-2"></i>
                    Confirmar Cambio de Estado
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={cancelarCambioEstado}
                    disabled={loading}
                  ></button>
                </div>
                
                <div className="modal-body">
                  <div className="text-center py-3">
                    <p className="mb-3">
                      ¿Estás seguro de cambiar el estado de la orden <strong>#{orden.id}</strong>?
                    </p>
                    
                    {/* Visualización del cambio */}
                    <div className="d-flex justify-content-center align-items-center gap-3 my-4">
                      <div>
                        <small className="text-muted d-block mb-2">Estado Actual</small>
                        <EstadoBadge estado={orden.estado} size="lg" />
                      </div>
                      
                      <div>
                        <i className="bi bi-arrow-right text-primary" style={{ fontSize: '2rem' }}></i>
                      </div>
                      
                      <div>
                        <small className="text-muted d-block mb-2">Nuevo Estado</small>
                        <EstadoBadge estado={nuevoEstadoSeleccionado} size="lg" />
                      </div>
                    </div>

                    <div className="alert alert-info small mt-3">
                      <i className="bi bi-info-circle me-2"></i>
                      Cliente: <strong>{orden.cliente}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={cancelarCambioEstado}
                    disabled={loading}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={confirmarCambioEstado}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Cambiando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Confirmar Cambio
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CambiarEstado;
