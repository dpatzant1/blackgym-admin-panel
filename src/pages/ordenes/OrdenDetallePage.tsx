import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { obtenerOrdenPorId } from '../../services/ordenesService';
import { EstadoBadge, CambiarEstado, OrdenTimeline } from '../../components/ordenes';
import { usePermisos } from '../../hooks';
import type { Orden } from '../../types/orden';
import { showError } from '../../utils/toast';

const OrdenDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { puede } = usePermisos();
  
  const [orden, setOrden] = useState<Orden | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar orden
  const cargarOrden = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await obtenerOrdenPorId(parseInt(id));
      setOrden(data);
    } catch (error) {
      console.error('Error al cargar orden:', error);
      showError('Error al cargar la orden');
      // Redirigir a la lista si no se encuentra
      setTimeout(() => navigate('/ordenes'), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarOrden();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'Fecha no disponible';
    
    try {
      // El backend devuelve formato ISO con microsegundos: 2025-09-13T15:24:06.434033
      const fechaObj = new Date(fecha);
      
      // Verificar si la fecha es válida
      if (isNaN(fechaObj.getTime())) {
        console.error('Fecha inválida recibida:', fecha);
        return 'Fecha inválida';
      }
      
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', fecha, error);
      return 'Fecha inválida';
    }
  };

  // Formatear moneda en Quetzales
  const formatearMoneda = (monto: number) => {
    return `Q${monto.toFixed(2)}`;
  };

  // Verificar si es estado final
  const esEstadoFinal = orden && ['completado', 'cancelado'].includes(orden.estado);

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando orden...</span>
          </div>
          <p className="text-muted mt-3">Cargando detalles de la orden...</p>
        </div>
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          No se encontró la orden solicitada.
        </div>
        <Link to="/ordenes" className="btn btn-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Volver a Órdenes
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <h2 className="mb-0">
              <i className="bi bi-receipt me-2 text-primary"></i>
              Orden #{orden.id}
            </h2>
            <EstadoBadge estado={orden.estado} size="lg" />
          </div>
          <p className="text-muted mb-0">
            <i className="bi bi-calendar me-1"></i>
            Creada el {formatearFecha(orden.fecha)}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/ordenes" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>
            Volver
          </Link>
          {puede('ordenes.editar') && !esEstadoFinal && (
            <Link to={`/ordenes/${orden.id}/editar`} className="btn btn-primary">
              <i className="bi bi-pencil me-2"></i>
              Editar Orden
            </Link>
          )}
        </div>
      </div>

      {/* Timeline de Estados */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="bi bi-diagram-3 me-2"></i>
            Progreso de la Orden
          </h5>
        </div>
        <div className="card-body">
          <OrdenTimeline estadoActual={orden.estado} />
          
          {/* Mensaje para estados finales */}
          {esEstadoFinal && (
            <div className={`alert ${orden.estado === 'completado' ? 'alert-success' : 'alert-danger'} mt-3 mb-0`}>
              <i className={`bi ${orden.estado === 'completado' ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
              <strong>Estado Final:</strong> Esta orden está en estado{' '}
              <strong>{orden.estado === 'completado' ? 'completado' : 'cancelado'}</strong> y no se puede modificar.
            </div>
          )}

          {/* Selector de cambio de estado */}
          {!esEstadoFinal && puede('ordenes.cambiar_estado') && (
            <div className="mt-4 p-3 bg-light rounded">
              <label className="form-label fw-bold mb-3">
                <i className="bi bi-arrow-repeat me-2"></i>
                Cambiar Estado de la Orden:
              </label>
              <CambiarEstado orden={orden} onEstadoCambiado={cargarOrden} />
            </div>
          )}

          {/* Mensaje cuando no tiene permiso */}
          {!esEstadoFinal && !puede('ordenes.cambiar_estado') && (
            <div className="mt-4 p-3 bg-light rounded border border-warning">
              <div className="text-muted">
                <i className="bi bi-lock me-2 text-warning"></i>
                <strong>Permiso requerido:</strong> No tienes permiso para cambiar el estado de las órdenes. 
                Solo los administradores y gerentes pueden modificar el estado.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="row">
        {/* Información del Cliente */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Información del Cliente
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong className="text-muted d-block mb-1">Nombre:</strong>
                <p className="mb-0 fs-5">{orden.cliente}</p>
              </div>
              
              {orden.telefono && (
                <div className="mb-3">
                  <strong className="text-muted d-block mb-1">
                    <i className="bi bi-telephone me-1"></i>
                    Teléfono:
                  </strong>
                  <p className="mb-0">
                    <a href={`tel:${orden.telefono}`}>{orden.telefono}</a>
                  </p>
                </div>
              )}
              
              {orden.direccion && (
                <div className="mb-0">
                  <strong className="text-muted d-block mb-1">
                    <i className="bi bi-geo-alt me-1"></i>
                    Dirección:
                  </strong>
                  <p className="mb-0">{orden.direccion}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información de la Orden */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Detalles de la Orden
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong className="text-muted d-block mb-1">ID de Orden:</strong>
                <p className="mb-0">
                  <span className="badge bg-secondary fs-6">#{orden.id}</span>
                </p>
              </div>

              <div className="mb-3">
                <strong className="text-muted d-block mb-1">Estado Actual:</strong>
                <EstadoBadge estado={orden.estado} size="md" />
              </div>

              <div className="mb-3">
                <strong className="text-muted d-block mb-1">Fecha de Creación:</strong>
                <p className="mb-0">{formatearFecha(orden.fecha)}</p>
              </div>

              {orden.admin_usuario && (
                <div className="mb-3">
                  <strong className="text-muted d-block mb-1">
                    <i className="bi bi-person-badge me-1"></i>
                    Creada por:
                  </strong>
                  <p className="mb-0">{orden.admin_usuario}</p>
                </div>
              )}

              <div className="mb-0">
                <strong className="text-muted d-block mb-1">Total:</strong>
                <p className="mb-0 fs-3 text-primary fw-bold">
                  {formatearMoneda(orden.total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productos de la Orden */}
      {orden.detalles && orden.detalles.length > 0 && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              <i className="bi bi-box-seam me-2"></i>
              Productos de la Orden
            </h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '60px' }}>#</th>
                    <th>Producto</th>
                    <th className="text-center" style={{ width: '120px' }}>Cantidad</th>
                    <th className="text-end" style={{ width: '150px' }}>Precio Unit.</th>
                    <th className="text-end" style={{ width: '150px' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orden.detalles.map((detalle, index) => (
                    <tr key={detalle.id}>
                      <td className="text-muted">{index + 1}</td>
                      <td>
                        <strong>{detalle.producto_nombre || `Producto #${detalle.producto_id}`}</strong>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-secondary">{detalle.cantidad}</span>
                      </td>
                      <td className="text-end">{formatearMoneda(detalle.precio_unitario)}</td>
                      <td className="text-end fw-bold text-primary">
                        {formatearMoneda(detalle.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-light">
                  <tr>
                    <td colSpan={4} className="text-end fw-bold">TOTAL:</td>
                    <td className="text-end fw-bold fs-5 text-primary">
                      {formatearMoneda(orden.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Notas */}
      {orden.notas && (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              <i className="bi bi-sticky me-2"></i>
              Notas Adicionales
            </h5>
          </div>
          <div className="card-body">
            <p className="mb-0 text-muted">{orden.notas}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenDetallePage;
