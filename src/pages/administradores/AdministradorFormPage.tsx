import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { crearAdministrador, obtenerAdministradorPorId, actualizarAdministrador } from '../../services/administradoresService';
import { showSuccess, showError } from '../../utils/toast';

interface FormData {
  usuario: string;
  password: string;
  confirmarPassword: string;
}

const AdministradorFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    usuario: '',
    password: '',
    confirmarPassword: '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Cargar datos del administrador si estamos editando
  useEffect(() => {
    const cargarAdministrador = async (adminId: number) => {
      try {
        setLoading(true);
        const admin = await obtenerAdministradorPorId(adminId);
        setFormData({
          usuario: admin.usuario,
          password: '',
          confirmarPassword: '',
        });
      } catch (error) {
        console.error('Error al cargar administrador:', error);
        showError('Error al cargar administrador');
        navigate('/administradores');
      } finally {
        setLoading(false);
      }
    };

    if (isEditing && id) {
      cargarAdministrador(parseInt(id));
    }
  }, [id, isEditing, navigate]);

  // Manejar cambios en los campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo al escribir
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Validar formulario
  const validarFormulario = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Validar usuario
    if (!formData.usuario.trim()) {
      newErrors.usuario = 'El nombre de usuario es requerido';
    } else if (formData.usuario.length < 3) {
      newErrors.usuario = 'El usuario debe tener al menos 3 caracteres';
    } else if (formData.usuario.length > 50) {
      newErrors.usuario = 'El usuario no puede tener más de 50 caracteres';
    }

    // Validar password solo si estamos creando o si se está cambiando
    if (!isEditing || formData.password) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      } else if (formData.password.length > 100) {
        newErrors.password = 'La contraseña no puede tener más de 100 caracteres';
      } else {
        // Validar que tenga mayúscula, minúscula, número y símbolo
        const tieneMayuscula = /[A-Z]/.test(formData.password);
        const tieneMinuscula = /[a-z]/.test(formData.password);
        const tieneNumero = /[0-9]/.test(formData.password);
        const tieneSimbolo = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

        if (!tieneMayuscula || !tieneMinuscula || !tieneNumero || !tieneSimbolo) {
          newErrors.password = 'La contraseña debe contener mayúscula, minúscula, número y símbolo';
        }
      }

      if (formData.password !== formData.confirmarPassword) {
        newErrors.confirmarPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      showError('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setLoading(true);

      if (isEditing && id) {
        // Actualizar administrador
        const dataToUpdate: { usuario?: string; password?: string } = {
          usuario: formData.usuario,
        };
        
        // Solo incluir password si se está cambiando
        if (formData.password) {
          dataToUpdate.password = formData.password;
        }

        await actualizarAdministrador(parseInt(id), dataToUpdate);
        showSuccess('Usuario actualizado correctamente');
      } else {
        // Crear nuevo administrador
        await crearAdministrador({
          usuario: formData.usuario,
          password: formData.password,
        });
        showSuccess('Usuario creado correctamente');
      }

      navigate('/administradores');
    } catch (error: unknown) {
      console.error('Error al guardar administrador:', error);
      const mensaje = error instanceof Error ? error.message : 'Error al guardar usuario';
      showError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  // Cancelar y volver
  const handleCancel = () => {
    navigate('/administradores');
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/administradores" onClick={(e) => { e.preventDefault(); navigate('/administradores'); }}>
                Usuarios
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {isEditing ? 'Editar' : 'Crear'} Usuario
            </li>
          </ol>
        </nav>

        <h1 className="h3 mb-1">
          <i className={`bi ${isEditing ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
          {isEditing ? 'Editar' : 'Crear'} Usuario
        </h1>
        <p className="text-muted mb-0">
          {isEditing 
            ? 'Actualiza la información del usuario' 
            : 'Completa el formulario para crear un nuevo usuario'}
        </p>
      </div>

      {/* Formulario */}
      <div className="row">
        <div className="col-lg-8 col-xl-6">
          <div className="card shadow-sm">
            <div className="card-body">
              {loading && !formData.usuario ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Usuario */}
                  <div className="mb-4">
                    <label htmlFor="usuario" className="form-label fw-semibold">
                      Nombre de Usuario <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.usuario ? 'is-invalid' : ''}`}
                      id="usuario"
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleChange}
                      placeholder="Ingresa el nombre de usuario"
                      disabled={loading}
                      autoComplete="username"
                    />
                    {errors.usuario && (
                      <div className="invalid-feedback">{errors.usuario}</div>
                    )}
                    <small className="form-text text-muted">
                      Entre 3 y 50 caracteres
                    </small>
                  </div>

                  {/* Contraseña */}
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Contraseña {!isEditing && <span className="text-danger">*</span>}
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={isEditing ? 'Dejar en blanco para no cambiar' : 'Ingresa la contraseña'}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                    <small className="form-text text-muted">
                      {isEditing 
                        ? 'Solo completa si deseas cambiar la contraseña. Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo.'
                        : 'Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo'}
                    </small>
                  </div>

                  {/* Confirmar Contraseña */}
                  {(!isEditing || formData.password) && (
                    <div className="mb-4">
                      <label htmlFor="confirmarPassword" className="form-label fw-semibold">
                        Confirmar Contraseña <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.confirmarPassword ? 'is-invalid' : ''}`}
                        id="confirmarPassword"
                        name="confirmarPassword"
                        value={formData.confirmarPassword}
                        onChange={handleChange}
                        placeholder="Confirma la contraseña"
                        disabled={loading}
                        autoComplete="new-password"
                      />
                      {errors.confirmarPassword && (
                        <div className="invalid-feedback">{errors.confirmarPassword}</div>
                      )}
                    </div>
                  )}

                  {/* Información adicional */}
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Nota:</strong> El rol del usuario puede ser asignado desde la lista de usuarios 
                    después de crearlo.
                  </div>

                  {/* Botones */}
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className={`bi ${isEditing ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>
                          {isEditing ? 'Actualizar' : 'Crear'} Usuario
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar con ayuda */}
        <div className="col-lg-4 col-xl-6 mt-4 mt-lg-0">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-question-circle me-2"></i>
                Información
              </h5>
              <ul className="list-unstyled mb-0">
                <li className="mb-3">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  El nombre de usuario debe ser único (3-50 caracteres)
                </li>
                <li className="mb-3">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  La contraseña debe tener 8-100 caracteres
                </li>
                <li className="mb-3">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Debe contener mayúscula, minúscula, número y símbolo
                </li>
                <li className="mb-3">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Por defecto, no tendrá rol asignado
                </li>
                <li className="mb-0">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Puedes asignar el rol desde la lista de usuarios
                </li>
              </ul>
            </div>
          </div>

          {isEditing && (
            <div className="card shadow-sm mt-3">
              <div className="card-body">
                <h5 className="card-title text-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Cambiar Contraseña
                </h5>
                <p className="mb-0">
                  Si cambias la contraseña del usuario, deberá usar la nueva contraseña 
                  para iniciar sesión.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdministradorFormPage;
