import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductoForm from '../../components/forms/ProductoForm';
import { createProducto } from '../../services/productosService';
import { showSuccess, showApiError } from '../../utils/toast';
import type { ProductoFormData } from '../../types';

const ProductoCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (data: ProductoFormData) => {
    try {
      setLoading(true);
      await createProducto(data);
      showSuccess('Producto creado correctamente');
      navigate('/productos');
    } catch (error) {
      console.error('Error creando producto:', error);
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-3">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">
                <i className="bi bi-plus-circle me-2 text-primary"></i>
                Nuevo Producto
              </h1>
              <p className="text-muted mb-0">Completa la información del nuevo producto</p>
            </div>
          </div>

          {/* Formulario */}
          <div className="card">
            <div className="card-body">
              <ProductoForm
                onSubmit={handleSubmit}
                isLoading={loading}
                submitText="Crear Producto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoCreatePage;