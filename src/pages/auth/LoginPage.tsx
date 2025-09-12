import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import type { LoginCredentials } from '../../types/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Configurar react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginCredentials>({
    defaultValues: {
      usuario: '',
      password: '',
    },
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from?.pathname || '/categorias';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.state]);

  // Manejar envío del formulario
  const onSubmit: SubmitHandler<LoginCredentials> = async (data) => {
    setIsSubmitting(true);
    
    try {
      const success = await login(data);
      
      if (success) {
        toast.success('¡Bienvenido al panel de administración!');
        const from = location.state?.from?.pathname || '/categorias';
        navigate(from, { replace: true });
      } else {
        setError('root', {
          type: 'manual',
          message: 'Usuario o contraseña incorrectos',
        });
        toast.error('Credenciales incorrectas');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar spinner si está verificando autenticación inicial
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <div className="mt-3">
            <p className="text-muted">Verificando autenticación...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-4">
            {/* Card principal */}
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <img 
                      src="/logo-principal-optimizado.webp" 
                      alt="Black Gym Logo" 
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        objectFit: 'contain' 
                      }} 
                    />
                  </div>
                  <h1 className="h3 text-dark mb-2 fw-bold">Black Gym</h1>
                  <p className="text-muted mb-0 fs-6">Panel de Administración</p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ minWidth: '300px' }}>
                  {/* Error general */}
                  {errors.root && (
                    <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                      <span className="me-2 fs-5">⚠️</span>
                      <div className="flex-grow-1">{errors.root.message}</div>
                    </div>
                  )}

                  {/* Campo Usuario */}
                  <div className="mb-3">
                    <label htmlFor="usuario" className="form-label fw-semibold text-dark">
                      Usuario
                    </label>
                    <input
                      id="usuario"
                      type="text"
                      className={`form-control form-control-lg ${errors.usuario ? 'is-invalid' : ''}`}
                      placeholder="Ingresa tu usuario"
                      autoComplete="username"
                      style={{ minHeight: '48px' }}
                      {...register('usuario', {
                        required: 'El usuario es requerido',
                        minLength: {
                          value: 3,
                          message: 'El usuario debe tener al menos 3 caracteres',
                        },
                        pattern: {
                          value: /^[a-zA-Z0-9_]+$/,
                          message: 'Solo se permiten letras, números y guión bajo',
                        },
                      })}
                    />
                    {errors.usuario && (
                      <div className="invalid-feedback">
                        {errors.usuario.message}
                      </div>
                    )}
                  </div>

                  {/* Campo Contraseña */}
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold text-dark">
                      Contraseña
                    </label>
                    <div className="position-relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Ingresa tu contraseña"
                        autoComplete="current-password"
                        style={{ minHeight: '48px', paddingRight: '45px' }}
                        {...register('password', {
                          required: 'La contraseña es requerida',
                          minLength: {
                            value: 6,
                            message: 'La contraseña debe tener al menos 6 caracteres',
                          },
                        })}
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0"
                        style={{ 
                          border: 'none', 
                          backgroundColor: 'transparent',
                          zIndex: 10,
                          width: '30px',
                          height: '30px'
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                      </button>
                    </div>
                    {errors.password && (
                      <div className="invalid-feedback">
                        {errors.password.message}
                      </div>
                    )}
                  </div>

                  {/* Botón de envío */}
                  <div className="d-grid mb-4">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg fw-semibold"
                      disabled={isSubmitting}
                      style={{ minHeight: '50px' }}
                    >
                      {isSubmitting ? (
                        <div className="d-flex align-items-center justify-content-center">
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          <span>Iniciando sesión...</span>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center justify-content-center">
                          <span className="me-2">🔑</span>
                          <span>Iniciar Sesión</span>
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-muted small mb-0">
                Sistema de gestión para productos y categorías del gimnasio
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;