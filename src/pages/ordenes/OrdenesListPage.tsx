import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { obtenerOrdenes, type ObtenerOrdenesParams } from '../../services/ordenesService';
import { EstadoBadge, CambiarEstado } from '../../components/ordenes';
import { usePermisos } from '../../hooks';
import type { Orden } from '../../types/orden';
import { showError } from '../../utils/toast';

const OrdenesListPage: React.FC = () => {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [ordenesPorPagina, setOrdenesPorPagina] = useState<number>(25);
  const [ordenarPor, setOrdenarPor] = useState<'id' | 'fecha' | 'total' | 'cliente'>('id');
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('desc');
  const { puede } = usePermisos();

  // Cargar órdenes con useCallback para evitar warnings
  const cargarOrdenes = useCallback(async () => {
    try {
      setLoading(true);
      
      const params: ObtenerOrdenesParams = {
        sortBy: ordenarPor,
        sortOrder: direccionOrden,
        estado: filtroEstado !== 'todas' ? filtroEstado : undefined
      };
      
      const data = await obtenerOrdenes(params);
      console.log('📦 Órdenes recibidas:', data.length);
      console.log('📅 Primera orden (si existe):', data[0]);
      if (data[0]) {
        console.log('📅 Fecha de primera orden:', data[0].fecha);
        console.log('📅 Tipo de fecha:', typeof data[0].fecha);
      }
      setOrdenes(data);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      showError('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  }, [filtroEstado, ordenarPor, direccionOrden]);

  useEffect(() => {
    cargarOrdenes();
  }, [cargarOrdenes]); // Ahora cargarOrdenes está memoizado

  // Filtrar órdenes por estado
  const ordenesFiltradas = filtroEstado === 'todas' 
    ? ordenes 
    : ordenes.filter(orden => orden.estado === filtroEstado);

  // Calcular paginación
  const totalPaginas = Math.ceil(ordenesFiltradas.length / ordenesPorPagina);
  const indiceInicio = (paginaActual - 1) * ordenesPorPagina;
  const indiceFin = indiceInicio + ordenesPorPagina;
  const ordenesPaginadas = ordenesFiltradas.slice(indiceInicio, indiceFin);

  // Resetear a página 1 cuando cambia el filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado]);

  // Funciones de navegación
  const irAPagina = (numeroPagina: number) => {
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
      setPaginaActual(numeroPagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const cambiarOrdenesPorPagina = (cantidad: number) => {
    setOrdenesPorPagina(cantidad);
    setPaginaActual(1);
  };

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'Fecha no disponible';
    
    try {
      // El backend devuelve formato ISO con microsegundos: 2025-09-13T15:24:06.434033
      // JavaScript puede manejar este formato directamente
      const fechaObj = new Date(fecha);
      
      // Verificar si la fecha es válida
      if (isNaN(fechaObj.getTime())) {
        console.error('Fecha inválida recibida:', fecha);
        return 'Fecha inválida';
      }
      
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
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

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-cart-check-fill me-2 text-primary"></i>
            Órdenes
          </h2>
          <p className="text-muted mb-0">
            Gestiona todas las órdenes de compra del gimnasio
          </p>
        </div>
        {/* Botón Nueva Orden ocultado para esta demo
        <div className="d-flex gap-2">
          <Link to="/ordenes/nueva" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Orden
          </Link>
        </div>
        */}
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-4">
              <label className="form-label fw-bold">Filtrar por Estado:</label>
              <select 
                className="form-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todas">Todas las órdenes</option>
                <option value="pendiente">⏳ Pendientes</option>
                <option value="pagado">💳 Pagadas</option>
                <option value="enviado">📦 Enviadas</option>
                <option value="completado">✅ Completadas</option>
                <option value="cancelado">❌ Canceladas</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold">Ordenar por:</label>
              <select 
                className="form-select"
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value as 'id' | 'fecha' | 'total' | 'cliente')}
              >
                <option value="id">ID de Orden</option>
                <option value="fecha">Fecha</option>
                <option value="total">Monto Total</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">Dirección:</label>
              <select 
                className="form-select"
                value={direccionOrden}
                onChange={(e) => setDireccionOrden(e.target.value as 'asc' | 'desc')}
              >
                <option value="desc">
                  {ordenarPor === 'id' ? '↓ Mayor a menor' : 
                   ordenarPor === 'fecha' ? '↓ Más reciente' :
                   ordenarPor === 'total' ? '↓ Mayor monto' : '↓ Z a A'}
                </option>
                <option value="asc">
                  {ordenarPor === 'id' ? '↑ Menor a mayor' : 
                   ordenarPor === 'fecha' ? '↑ Más antiguo' :
                   ordenarPor === 'total' ? '↑ Menor monto' : '↑ A a Z'}
                </option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Mostrar por página:</label>
              <select 
                className="form-select"
                value={ordenesPorPagina}
                onChange={(e) => cambiarOrdenesPorPagina(Number(e.target.value))}
                style={{ width: 'auto' }}
              >
                <option value={10}>10 órdenes</option>
                <option value={25}>25 órdenes</option>
                <option value={50}>50 órdenes</option>
                <option value={100}>100 órdenes</option>
                <option value={ordenesFiltradas.length}>Todas ({ordenesFiltradas.length})</option>
              </select>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-12 text-center">
              <small className="text-muted">
                Mostrando <strong>{indiceInicio + 1}</strong> a <strong>{Math.min(indiceFin, ordenesFiltradas.length)}</strong> de <strong>{ordenesFiltradas.length}</strong> órdenes filtradas
                {filtroEstado !== 'todas' && ` (${ordenes.length} totales)`}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de órdenes */}
      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando órdenes...</span>
              </div>
              <p className="text-muted mt-3">Cargando órdenes...</p>
            </div>
          ) : ordenesFiltradas.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <p className="text-muted mt-3">
                {filtroEstado === 'todas' 
                  ? 'No hay órdenes registradas' 
                  : `No hay órdenes en estado "${filtroEstado}"`
                }
              </p>
              {/* Botón crear primera orden ocultado para esta demo
              <Link to="/ordenes/nueva" className="btn btn-primary mt-2">
                <i className="bi bi-plus-circle me-2"></i>
                Crear Primera Orden
              </Link>
              */}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>Cliente</th>
                    <th>Contacto</th>
                    <th style={{ width: '150px' }}>Estado</th>
                    <th className="text-end">Total</th>
                    <th style={{ width: '180px' }}>Fecha</th>
                    <th className="text-center" style={{ width: '120px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesPaginadas.map((orden) => (
                    <tr key={orden.id}>
                      <td>
                        <span className="badge bg-secondary">#{orden.id}</span>
                      </td>
                      <td>
                        <div>
                          <strong>{orden.cliente}</strong>
                          {orden.admin_usuario && (
                            <div className="text-muted small">
                              <i className="bi bi-person-badge me-1"></i>
                              por {orden.admin_usuario}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          {orden.telefono && (
                            <div>
                              <i className="bi bi-telephone me-1"></i>
                              {orden.telefono}
                            </div>
                          )}
                          {orden.direccion && (
                            <div className="text-muted">
                              <i className="bi bi-geo-alt me-1"></i>
                              {orden.direccion}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {puede('ordenes.cambiar_estado') ? (
                          <CambiarEstado 
                            orden={orden} 
                            onEstadoCambiado={cargarOrdenes}
                          />
                        ) : (
                          <span 
                            title="No tienes permiso para cambiar el estado de las órdenes. Solo administradores y gerentes pueden hacerlo."
                            style={{ cursor: 'help' }}
                          >
                            <EstadoBadge estado={orden.estado} size="md" />
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <strong className="text-primary">{formatearMoneda(orden.total)}</strong>
                      </td>
                      <td className="text-muted small">
                        {formatearFecha(orden.fecha)}
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm" role="group">
                          <Link
                            to={`/ordenes/${orden.id}`}
                            className="btn btn-outline-info"
                            title="Ver detalles"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                          {puede('ordenes.editar') && (
                            <Link
                              to={`/ordenes/${orden.id}/editar`}
                              className="btn btn-outline-primary"
                              title="Editar orden"
                            >
                              <i className="bi bi-pencil"></i>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Controles de Paginación */}
        {!loading && ordenesFiltradas.length > 0 && totalPaginas > 1 && (
          <div className="card-footer">
            <nav aria-label="Paginación de órdenes">
              <ul className="pagination pagination-sm mb-0 justify-content-center">
                {/* Botón Primera Página */}
                <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => irAPagina(1)}
                    disabled={paginaActual === 1}
                  >
                    <i className="bi bi-chevron-double-left"></i>
                  </button>
                </li>

                {/* Botón Anterior */}
                <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => irAPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>

                {/* Números de página */}
                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                  .filter(num => {
                    // Mostrar siempre la primera y última página
                    if (num === 1 || num === totalPaginas) return true;
                    // Mostrar páginas cercanas a la actual
                    return Math.abs(num - paginaActual) <= 2;
                  })
                  .map((num, index, array) => {
                    // Agregar "..." si hay saltos
                    const showEllipsis = index > 0 && num - array[index - 1] > 1;
                    
                    return (
                      <React.Fragment key={num}>
                        {showEllipsis && (
                          <li className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        )}
                        <li className={`page-item ${paginaActual === num ? 'active' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => irAPagina(num)}
                          >
                            {num}
                          </button>
                        </li>
                      </React.Fragment>
                    );
                  })}

                {/* Botón Siguiente */}
                <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => irAPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>

                {/* Botón Última Página */}
                <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => irAPagina(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                  >
                    <i className="bi bi-chevron-double-right"></i>
                  </button>
                </li>
              </ul>
            </nav>

            <div className="text-center mt-2">
              <small className="text-muted">
                Página {paginaActual} de {totalPaginas}
              </small>
            </div>
          </div>
        )}
      </div>

      {/* Resumen de estadísticas */}
      {!loading && ordenes.length > 0 && (
        <div className="row mt-4">
          <div className="col-md-3">
            <div className="card border-warning">
              <div className="card-body text-center">
                <h5 className="card-title">⏳ Pendientes</h5>
                <h2 className="text-warning">{ordenes.filter(o => o.estado === 'pendiente').length}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-info">
              <div className="card-body text-center">
                <h5 className="card-title">💳 Pagadas</h5>
                <h2 className="text-info">{ordenes.filter(o => o.estado === 'pagado').length}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-primary">
              <div className="card-body text-center">
                <h5 className="card-title">📦 Enviadas</h5>
                <h2 className="text-primary">{ordenes.filter(o => o.estado === 'enviado').length}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-success">
              <div className="card-body text-center">
                <h5 className="card-title">✅ Completadas</h5>
                <h2 className="text-success">{ordenes.filter(o => o.estado === 'completado').length}</h2>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenesListPage;
