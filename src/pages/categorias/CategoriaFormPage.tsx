import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createCategoria, updateCategoria, getCategoria } from '../../services/categoriasService';
import { showSuccess, showApiError } from '../../utils/toast';
import type { CreateCategoriaRequest, UpdateCategoriaRequest } from '../../types';

interface FormData {
  nombre: string;
  descripcion: string;
}

const CategoriaFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<FormData>({
    defaultValues: {
      nombre: '',
      descripcion: ''
    }
  });

  // Cargar datos de la categoría si estamos editando
  useEffect(() => {
    const cargarCategoria = async (categoriaId: number) => {
      try {
        setLoadingData(true);
        
        const categoria = await getCategoria(categoriaId);
        
        
        if (!categoria) {
          throw new Error('No se recibieron datos de la categoría');
        }
        
        setValue('nombre', categoria.nombre || '');
        setValue('descripcion', categoria.descripcion || '');
      } catch (error) {
        console.error('Error cargando categoría:', error);
        showApiError(error);
        navigate('/categorias');
      } finally {
        setLoadingData(false);
      }
    };

    if (isEdit && id) {
      cargarCategoria(parseInt(id));
    }
  }, [isEdit, id, setValue, navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      if (isEdit && id) {
        // Actualizar categoría existente
        const updateData: UpdateCategoriaRequest = {
          nombre: data.nombre.trim(),
          descripcion: data.descripcion.trim() || undefined
        };
        await updateCategoria(parseInt(id), updateData);
        showSuccess('Categoría actualizada correctamente');
      } else {
        // Crear nueva categoría
        const createData: CreateCategoriaRequest = {
          nombre: data.nombre.trim(),
          descripcion: data.descripcion.trim() || undefined
        };
        await createCategoria(createData);
        showSuccess('Categoría creada correctamente');
      }

      navigate('/categorias');
    } catch (error) {
      console.error('Error guardando categoría:', error);
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/categorias');
  };

  const handleReset = () => {
    reset();
  };

  if (loadingData) {
    return (
      <div className="container-fluid px-3">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted">Cargando datos de la categoría...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3">
      <div className="row">
        <div className="col-12">
          {/* Header de la página */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">
                <i className="bi bi-tag me-2 text-primary"></i>
                {isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
              </h1>
              <p className="text-muted mb-0">
                {isEdit ? 'Modifica los datos de la categoría' : 'Completa los datos para crear una nueva categoría'}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              <i className="bi bi-arrow-left me-1"></i>
              Volver
            </button>
          </div>

          {/* Formulario */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-12">
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Nombre de la categoría */}
                    <div className="mb-3">
                      <label htmlFor="nombre" className="form-label">
                        Nombre de la categoría <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                        placeholder="Ej: Suplementos, Equipos, Ropa Deportiva..."
                        disabled={loading}
                        {...register('nombre', {
                          required: 'El nombre es obligatorio',
                          minLength: {
                            value: 2,
                            message: 'El nombre debe tener al menos 2 caracteres'
                          },
                          maxLength: {
                            value: 100,
                            message: 'El nombre no puede exceder 100 caracteres'
                          },
                          pattern: {
                            value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                            message: 'El nombre solo puede contener letras y espacios'
                          }
                        })}
                      />
                      {errors.nombre && (
                        <div className="invalid-feedback">
                          {errors.nombre.message}
                        </div>
                      )}
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        El nombre debe ser único y descriptivo
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="mb-4">
                      <label htmlFor="descripcion" className="form-label">
                        Descripción
                        <span className="text-muted ms-1">(opcional)</span>
                      </label>
                      <textarea
                        id="descripcion"
                        rows={4}
                        className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                        placeholder="Describe brevemente qué tipos de productos incluye esta categoría..."
                        disabled={loading}
                        {...register('descripcion', {
                          maxLength: {
                            value: 500,
                            message: 'La descripción no puede exceder 500 caracteres'
                          }
                        })}
                      />
                      {errors.descripcion && (
                        <div className="invalid-feedback">
                          {errors.descripcion.message}
                        </div>
                      )}
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        Ayuda a los usuarios a entender qué productos pertenecen a esta categoría
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
                      {!isEdit && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleReset}
                          disabled={loading}
                        >
                          <i className="bi bi-arrow-clockwise me-1"></i>
                          Limpiar
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        <i className="bi bi-x-circle me-1"></i>
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
                            {isEdit ? 'Actualizando...' : 'Creando...'}
                          </>
                        ) : (
                          <>
                            <i className={`bi ${isEdit ? 'bi-check-circle' : 'bi-plus-circle'} me-1`}></i>
                            {isEdit ? 'Actualizar Categoría' : 'Crear Categoría'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Información adicional */}
              <div className="card mt-3">
                <div className="card-body bg-light">
                  <h6 className="card-title">
                    <i className="bi bi-lightbulb text-warning me-2"></i>
                    Consejos para crear categorías
                  </h6>
                  <ul className="mb-0 small text-muted">
                    <li>Usa nombres claros y descriptivos</li>
                    <li>Evita categorías muy específicas o muy generales</li>
                    <li>Las categorías te ayudarán a organizar mejor tus productos</li>
                    <li>Puedes editar o eliminar categorías en cualquier momento</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriaFormPage;