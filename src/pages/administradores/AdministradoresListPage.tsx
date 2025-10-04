import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerAdministradores, eliminarAdministrador } from '../../services/administradoresService';
import { AsignarRol } from '../../components/admin';
import { useConfirmDelete } from '../../hooks';
import type { Admin } from '../../types/auth';
import { showSuccess, showError } from '../../utils/toast';

const AdministradoresListPage: React.FC = () => {
  const [administradores, setAdministradores] = useState<Admin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [ordenarPorRol, setOrdenarPorRol] = useState<boolean>(false);

  const {
    isOpen,
    itemToDelete,
    openModal,
    closeModal,
    handleConfirm,
  } = useConfirmDelete<Admin>();

  // Cargar administradores
  const cargarAdministradores = async () => {
    try {
      setLoading(true);
      const data = await obtenerAdministradores();
      setAdministradores(data);
    } catch (error) {
      console.error('Error al cargar administradores:', error);
      showError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAdministradores();
  }, []);

  // Manejar eliminación de administrador
  const onConfirmDelete = async () => {
    await handleConfirm(async (admin) => {
      await eliminarAdministrador(admin.id);
      showSuccess('Usuario eliminado correctamente');
      cargarAdministradores();
    });
  };

  // Ordenar administradores por rol
  const administradoresOrdenados = React.useMemo(() => {
    if (!ordenarPorRol) return administradores;

    return [...administradores].sort((a, b) => {
      const rolA = a.rol?.nombre || 'zzz'; // Sin rol al final
      const rolB = b.rol?.nombre || 'zzz';
      return rolA.localeCompare(rolB);
    });
  }, [administradores, ordenarPorRol]);

  // Formatear fecha
  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">
            <i className="bi bi-people-fill me-2"></i>
            Usuarios
          </h1>
          <p className="text-muted mb-0">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <Link to="/administradores/crear" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Crear Usuario
        </Link>
      </div>

      {/* Filtros y opciones */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Total: <strong>{administradores.length}</strong> usuarios
              </span>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="ordenarPorRol"
                checked={ordenarPorRol}
                onChange={(e) => setOrdenarPorRol(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="ordenarPorRol">
                Ordenar por rol
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de administradores */}
      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : administradoresOrdenados.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <p className="text-muted mt-3">No hay usuarios registrados</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>
                      Rol
                      {ordenarPorRol && (
                        <i className="bi bi-sort-alpha-down ms-1 text-primary"></i>
                      )}
                    </th>
                    <th>Fecha de Creación</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {administradoresOrdenados.map((admin) => (
                    <tr key={admin.id}>
                      <td>
                        <span className="badge bg-secondary">{admin.id}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person-circle fs-4 text-muted me-2"></i>
                          <strong>{admin.usuario}</strong>
                        </div>
                      </td>
                      <td>
                        <AsignarRol
                          admin={admin}
                          onRolAsignado={cargarAdministradores}
                        />
                      </td>
                      <td>
                        <small className="text-muted">
                          <i className="bi bi-calendar3 me-1"></i>
                          {formatearFecha(admin.creado_en)}
                        </small>
                      </td>
                      <td className="text-end">
                        <div className="btn-group" role="group">
                          <Link
                            to={`/administradores/${admin.id}/editar`}
                            className="btn btn-sm btn-outline-primary"
                            title="Editar usuario"
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button
                            onClick={() => openModal(admin)}
                            className="btn btn-sm btn-outline-danger"
                            title="Eliminar usuario"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {isOpen && itemToDelete && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Confirmar Eliminación
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  ¿Estás seguro de que deseas eliminar al usuario{' '}
                  <strong>{itemToDelete.usuario}</strong>?
                </p>
                <div className="alert alert-warning mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Esta acción no se puede deshacer.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={onConfirmDelete}
                >
                  <i className="bi bi-trash me-2"></i>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministradoresListPage;
