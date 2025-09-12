import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductoForm from '../../components/forms/ProductoForm';
import { getProducto, updateProducto } from '../../services/productosService';
import { showSuccess, showApiError } from '../../utils/toast';
import type { Producto, ProductoFormData } from '../../types';

const ProductoEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [producto, setProducto] = useState<Producto | null>(null);

  // Cargar datos del producto
  useEffect(() => {
    const cargarProducto = async () => {
      if (!id) {
        navigate('/productos');
        return;
      }

      try {
        setLoading(true);
        const productoData = await getProducto(Number(id));
        setProducto(productoData);
      } catch (error) {
        console.error('Error cargando producto:', error);
        showApiError(error);
        navigate('/productos');
      } finally {
        setLoading(false);
      }
    };

    cargarProducto();
  }, [id, navigate]);

  const handleSubmit = async (data: ProductoFormData) => {
    if (!id || !producto) return;

    try {
      setSubmitting(true);
      await updateProducto(Number(id), data);
      showSuccess('Producto actualizado correctamente');
      navigate('/productos');
    } catch (error) {
      console.error('Error actualizando producto:', error);
      showApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Convertir producto a datos de formulario
  const getInitialData = (): Partial<ProductoFormData> | undefined => {
    if (!producto) return undefined;

    return {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      imagen_url: producto.imagen_url || '',
      disponible: producto.disponible,
      categorias: producto.categorias?.map(cat => cat.id) || []
    };
  };

  if (loading) {
    return (
      <div className="container-fluid px-3">
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando producto...</span>
              </div>
              <p className="mt-3 text-muted">Cargando datos del producto...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="container-fluid px-3">
        <div className="row">
          <div className="col-12">
            <div className="alert alert-danger">
              <h4 className="alert-heading">Producto no encontrado</h4>
              <p>El producto que buscas no existe o no tienes permisos para verlo.</p>
              <hr />
              <button 
                className="btn btn-outline-danger"
                onClick={() => navigate('/productos')}
              >
                Volver a productos
              </button>
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
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">
                <i className="bi bi-pencil me-2 text-primary"></i>
                Editar Producto
              </h1>
              <p className="text-muted mb-0">
                Modificando: <strong>{producto.nombre}</strong>
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="card">
            <div className="card-body">
              <ProductoForm
                initialData={getInitialData()}
                onSubmit={handleSubmit}
                isLoading={submitting}
                submitText="Actualizar Producto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoEditPage;