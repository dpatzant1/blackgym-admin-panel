import React, { useEffect, useState } from 'react';
import { obtenerRoles } from '../../services/rolesService';
import { asignarRolAdministrador } from '../../services/administradoresService';
import { RolBadge } from '../common';
import type { Admin, Rol } from '../../types/auth';
import { showSuccess, showError } from '../../utils/toast';

interface AsignarRolProps {
  admin: Admin;
  onRolAsignado: () => void;
  disabled?: boolean;
}

/**
 * Componente para asignar roles a administradores
 * Incluye dropdown de roles disponibles y confirmación antes de cambiar
 */
const AsignarRol: React.FC<AsignarRolProps> = ({ admin, onRolAsignado, disabled = false }) => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingRoles, setLoadingRoles] = useState<boolean>(true);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [nuevoRolId, setNuevoRolId] = useState<number | null>(null);
  const [nuevoRol, setNuevoRol] = useState<Rol | null>(null);

  // Cargar roles disponibles
  useEffect(() => {
    const cargarRoles = async () => {
      try {
        setLoadingRoles(true);
        const data = await obtenerRoles();
        setRoles(data);
      } catch (error) {
        console.error('Error al cargar roles:', error);
        showError('Error al cargar roles disponibles');
      } finally {
        setLoadingRoles(false);
      }
    };

    cargarRoles();
  }, []);

  // Manejar cambio de selección (mostrar confirmación)
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRolId = e.target.value === '' ? null : Number(e.target.value);
    
    // Si es el mismo rol actual, no hacer nada
    if (selectedRolId === admin.rol_id) {
      return;
    }

    setNuevoRolId(selectedRolId);
    
    // Encontrar el rol seleccionado
    const rolSeleccionado = selectedRolId ? roles.find(r => r.id === selectedRolId) : null;
    setNuevoRol(rolSeleccionado || null);
    
    // Mostrar modal de confirmación
    setShowConfirmModal(true);
  };

  // Confirmar asignación de rol
  const confirmarAsignacion = async () => {
    if (nuevoRolId === null && !confirm('¿Estás seguro de quitar el rol a este administrador?')) {
      setShowConfirmModal(false);
      return;
    }

    try {
      setLoading(true);
      await asignarRolAdministrador(admin.id, nuevoRolId);
      
      const mensaje = nuevoRolId 
        ? `Rol "${nuevoRol?.nombre}" asignado correctamente a ${admin.usuario}`
        : `Rol removido de ${admin.usuario}`;
      
      showSuccess(mensaje);
      setShowConfirmModal(false);
      onRolAsignado();
    } catch (error) {
      console.error('Error al asignar rol:', error);
      showError('Error al asignar rol');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar asignación
  const cancelarAsignacion = () => {
    setShowConfirmModal(false);
    setNuevoRolId(null);
    setNuevoRol(null);
  };

  return (
    <>
      {/* Dropdown de roles */}
      <select
        className="form-select form-select-sm"
        value={admin.rol_id || ''}
        onChange={handleSelectChange}
        disabled={disabled || loading || loadingRoles}
        style={{ minWidth: '150px' }}
      >
        {loadingRoles ? (
          <option value="">Cargando...</option>
        ) : (
          <>
            <option value="">Sin rol</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre.charAt(0).toUpperCase() + rol.nombre.slice(1)}
              </option>
            ))}
          </>
        )}
      </select>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div 
          className="modal fade show d-block" 
          tabIndex={-1} 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title">
                  <i className="bi bi-shield-exclamation me-2"></i>
                  Confirmar Cambio de Rol
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cancelarAsignacion}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-3">
                  ¿Estás seguro de cambiar el rol del administrador{' '}
                  <strong>{admin.usuario}</strong>?
                </p>

                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="text-center flex-fill">
                    <small className="text-muted d-block mb-1">Rol actual</small>
                    <RolBadge 
                      rol={admin.rol?.nombre} 
                      showTooltip={false}
                      size="md"
                    />
                  </div>
                  <div className="text-center">
                    <i className="bi bi-arrow-right fs-3 text-muted"></i>
                  </div>
                  <div className="text-center flex-fill">
                    <small className="text-muted d-block mb-1">Nuevo rol</small>
                    <RolBadge 
                      rol={nuevoRol?.nombre} 
                      showTooltip={false}
                      size="md"
                    />
                  </div>
                </div>

                {nuevoRol?.descripcion && (
                  <div className="alert alert-info mb-0">
                    <small>
                      <i className="bi bi-info-circle me-1"></i>
                      <strong>Permisos del nuevo rol:</strong> {nuevoRol.descripcion}
                    </small>
                  </div>
                )}

                {!nuevoRol && (
                  <div className="alert alert-warning mb-0">
                    <small>
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      El usuario quedará sin rol asignado y no tendrá permisos.
                    </small>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelarAsignacion}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={confirmarAsignacion}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Asignando...
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
      )}
    </>
  );
};

export default AsignarRol;
