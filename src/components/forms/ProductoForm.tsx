import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { getCategorias } from '../../services/categoriasService';
import { uploadImage } from '../../services/productosService';
import { showApiError } from '../../utils/toast';
import type { ProductoFormData, Categoria } from '../../types';

interface ProductoFormProps {
  initialData?: Partial<ProductoFormData>;
  onSubmit: (data: ProductoFormData) => Promise<void>;
  isLoading?: boolean;
  submitText?: string;
  disabled?: boolean;
}

const ProductoForm: React.FC<ProductoFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  submitText = 'Guardar',
  disabled = false
}) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imagen_url || null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset
  } = useForm<ProductoFormData>({
    defaultValues: {
      nombre: initialData?.nombre || '',
      descripcion: initialData?.descripcion || '',
      precio: initialData?.precio || 0,
      stock: initialData?.stock || 0,
      imagen_url: initialData?.imagen_url || '',
      disponible: initialData?.disponible ?? true,
      categorias: initialData?.categorias || []
    }
  });

  // Cargar categorías disponibles
  const cargarCategorias = useCallback(async () => {
    try {
      setLoadingCategorias(true);
      const response = await getCategorias();
      setCategorias(response.data.categorias || []);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      showApiError(error);
      setCategorias([]);
    } finally {
      setLoadingCategorias(false);
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  // Actualizar form cuando cambian los datos iniciales
  useEffect(() => {
    if (initialData) {
      reset({
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        precio: initialData.precio || 0,
        stock: initialData.stock || 0,
        imagen_url: initialData.imagen_url || '',
        disponible: initialData.disponible ?? true,
        categorias: initialData.categorias || []
      });
      setImagePreview(initialData.imagen_url || null);
    }
  }, [initialData, reset]);

  // Manejar selección de imagen
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      showApiError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showApiError('La imagen debe ser menor a 5MB');
      return;
    }

    // Validar tamaño mínimo
    if (file.size < 100) {
      showApiError('El archivo seleccionado parece estar vacío');
      return;
    }

    // Crear preview inmediatamente
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Subir imagen inmediatamente
    try {
      setUploadingImage(true);
      const imageUrl = await uploadImage(file);
      setValue('imagen_url', imageUrl);
    } catch (error) {
      showApiError(error);
      // Limpiar preview si falló la subida
      setImagePreview(null);
      setValue('imagen_url', '');
    } finally {
      setUploadingImage(false);
    }
  };

  // Simplificar envío del formulario ya que la imagen ya está subida
  const onFormSubmit = async (data: ProductoFormData) => {
    try {
      // Validar que hay imagen
      if (!data.imagen_url) {
        showApiError('Debes seleccionar una imagen para el producto');
        return;
      }

      // Preparar datos finales
      const finalData: ProductoFormData = {
        ...data,
        precio: Number(data.precio),
        stock: Number(data.stock)
      };

      await onSubmit(finalData);
    } catch (error) {
      console.error('Error en formulario:', error);
      showApiError(error);
    }
  };

  // Limpiar preview de imagen
  const clearImage = () => {
    setImagePreview(null);
    setValue('imagen_url', '');
    
    // Limpiar input file
    const fileInput = document.getElementById('imagen') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="row g-3">
      {/* Nombre del producto */}
      <div className="col-12">
        <label htmlFor="nombre" className="form-label">
          Nombre del producto <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="nombre"
          className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
          placeholder="Ej: Proteína Whey Gold"
          disabled={disabled}
          {...register('nombre', {
            required: 'El nombre es obligatorio',
            minLength: {
              value: 2,
              message: 'El nombre debe tener al menos 2 caracteres'
            },
            maxLength: {
              value: 100,
              message: 'El nombre no puede exceder 100 caracteres'
            }
          })}
        />
        {errors.nombre && (
          <div className="invalid-feedback">{errors.nombre.message}</div>
        )}
      </div>

      {/* Descripción */}
      <div className="col-12">
        <label htmlFor="descripcion" className="form-label">
          Descripción <span className="text-danger">*</span>
        </label>
        <textarea
          id="descripcion"
          className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
          rows={3}
          placeholder="Describe las características del producto..."
          disabled={disabled}
          {...register('descripcion', {
            required: 'La descripción es obligatoria',
            minLength: {
              value: 10,
              message: 'La descripción debe tener al menos 10 caracteres'
            },
            maxLength: {
              value: 500,
              message: 'La descripción no puede exceder 500 caracteres'
            }
          })}
        />
        {errors.descripcion && (
          <div className="invalid-feedback">{errors.descripcion.message}</div>
        )}
      </div>

      {/* Precio y Stock */}
      <div className="col-md-6">
        <label htmlFor="precio" className="form-label">
          Precio (GTQ) <span className="text-danger">*</span>
        </label>
        <div className="input-group">
          <span className="input-group-text">Q</span>
          <input
            type="number"
            id="precio"
            step="0.01"
            min="0"
            className={`form-control ${errors.precio ? 'is-invalid' : ''}`}
            placeholder="0.00"
            disabled={disabled}
            {...register('precio', {
              required: 'El precio es obligatorio',
              min: {
                value: 0.01,
                message: 'El precio debe ser mayor a 0'
              },
              max: {
                value: 99999.99,
                message: 'El precio no puede exceder Q99,999.99'
              }
            })}
          />
        </div>
        {errors.precio && (
          <div className="invalid-feedback d-block">{errors.precio.message}</div>
        )}
      </div>

      <div className="col-md-6">
        <label htmlFor="stock" className="form-label">
          Stock disponible <span className="text-danger">*</span>
        </label>
        <input
          type="number"
          id="stock"
          min="0"
          className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
          placeholder="0"
          disabled={disabled}
          {...register('stock', {
            required: 'El stock es obligatorio',
            min: {
              value: 0,
              message: 'El stock no puede ser negativo'
            },
            max: {
              value: 99999,
              message: 'El stock no puede exceder 99,999 unidades'
            }
          })}
        />
        {errors.stock && (
          <div className="invalid-feedback">{errors.stock.message}</div>
        )}
      </div>

      {/* Categorías */}
      <div className="col-12">
        <label className="form-label">
          Categorías <span className="text-danger">*</span>
        </label>
        {loadingCategorias ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Cargando categorías...</span>
            </div>
          </div>
        ) : (
          <Controller
            name="categorias"
            control={control}
            rules={{
              required: 'Debes seleccionar al menos una categoría',
              validate: (value) => (value && value.length > 0) || 'Debes seleccionar al menos una categoría'
            }}
            render={({ field }) => (
              <div className={`${errors.categorias ? 'is-invalid' : ''}`}>
                {categorias.length === 0 ? (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    No hay categorías disponibles. <a href="/categorias/nuevo" className="alert-link">Crear una categoría primero</a>
                  </div>
                ) : (
                  <div className="row g-2">
                    {categorias.map((categoria) => (
                      <div key={categoria.id} className="col-md-4 col-sm-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`categoria-${categoria.id}`}
                            value={categoria.id}
                            checked={(field.value || []).includes(categoria.id)}
                            disabled={disabled}
                            onChange={(e) => {
                              const categoriaId = Number(e.target.value);
                              const currentValue = field.value || [];
                              const newValue = e.target.checked
                                ? [...currentValue, categoriaId]
                                : currentValue.filter((id: number) => id !== categoriaId);
                              field.onChange(newValue);
                            }}
                          />
                          <label className="form-check-label" htmlFor={`categoria-${categoria.id}`}>
                            {categoria.nombre}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.categorias && (
                  <div className="invalid-feedback d-block">{errors.categorias.message}</div>
                )}
              </div>
            )}
          />
        )}
      </div>

      {/* Upload de imagen */}
      <div className="col-12">
        <label htmlFor="imagen" className="form-label">
          Imagen del producto <span className="text-danger">*</span>
        </label>
        <input
          type="file"
          id="imagen"
          className="form-control"
          accept="image/*"
          disabled={disabled}
          onChange={handleImageChange}
        />
        <div className="form-text">
          Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
        </div>
        
        {/* Preview de imagen */}
        {imagePreview && (
          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold">Vista previa:</span>
              {!disabled && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={clearImage}
                >
                  <i className="bi bi-trash me-1"></i>
                  Quitar imagen
                </button>
              )}
            </div>
            <div className="border rounded p-2 bg-light">
              <img
                src={imagePreview}
                alt="Preview"
                className="img-fluid rounded"
                style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>
        )}

        {/* Validación de imagen obligatoria */}
        {!imagePreview && (
          <div className="invalid-feedback d-block">
            La imagen es obligatoria
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="col-12">
        <div className="d-flex gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => window.history.back()}
            disabled={isLoading || uploadingImage}
          >
            {disabled ? 'Volver' : 'Cancelar'}
          </button>
          {!disabled && (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || uploadingImage || !imagePreview}
            >
              {isLoading || uploadingImage ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  {uploadingImage ? 'Subiendo imagen...' : 'Guardando...'}
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  {submitText}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default ProductoForm;