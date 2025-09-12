import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCategorias, deleteCategoria } from '../../services/categoriasService';
import { showSuccess, showApiError } from '../../utils/toast';
import { ConfirmDeleteModal } from '../../components/common';
import { useConfirmDelete } from '../../hooks';
import type { Categoria } from '../../types';

const CategoriasListPage: React.FC = () => {
  const [todasLasCategorias, setTodasLasCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hook para manejar el modal de confirmación de eliminación
  const deleteModal = useConfirmDelete<Categoria>();

  // Cargar todas las categorías del backend
  const cargarTodasLasCategorias = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await getCategorias();
      console.log('Respuesta del backend:', response); // Debug temporal
      const todasCategorias = response.data.categorias || [];
      setTodasLasCategorias(todasCategorias);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      showApiError(error);
      setTodasLasCategorias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrar categorías basado en el término de búsqueda
  const categoriasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) {
      return todasLasCategorias;
    }
    
    const termino = searchTerm.toLowerCase();
    return todasLasCategorias.filter(categoria => 
      categoria.nombre.toLowerCase().includes(termino) ||
      (categoria.descripcion && categoria.descripcion.toLowerCase().includes(termino))
    );
  }, [todasLasCategorias, searchTerm]);

  // Cargar categorías al montar el componente
  useEffect(() => {
    cargarTodasLasCategorias();
  }, [cargarTodasLasCategorias]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Función para manejar la eliminación de categorías
  const handleDeleteCategoria = async () => {
    if (!deleteModal.itemToDelete) return;
    
    try {
      await deleteModal.handleConfirm(async (cat) => {
        await deleteCategoria(cat.id);
        
        // Actualizar la lista local removiendo la categoría eliminada
        setTodasLasCategorias(prev => prev.filter(c => c.id !== cat.id));
        
        showSuccess(`Categoría "${cat.nombre}" eliminada correctamente`);
      });
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      showApiError(error);
    }
  };

  return (
    <div className="container-fluid px-3">
      <div className="row">
        <div className="col-12">
          {/* Header de la página */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">
                <i className="bi bi-tags me-2 text-primary"></i>
                Gestión de Categorías
              </h1>
              <p className="text-muted mb-0">Administra las categorías de productos del gimnasio</p>
            </div>
            <Link 
              to="/categorias/nuevo" 
              className="btn btn-primary"
            >
              <i className="bi bi-plus-circle me-2"></i>
              Agregar Categoría
            </Link>
          </div>

          {/* Filtros y búsqueda */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="search" className="form-label">
                    <i className="bi bi-search me-1"></i>
                    Buscar categorías
                  </label>
                  <input
                    type="text"
                    id="search"
                    className="form-control"
                    placeholder="Buscar por nombre o descripción..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="card">
            <div className="card-body">
              {loading ? (
                // Estado de carga
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-3 text-muted">Cargando categorías...</p>
                </div>
              ) : !categoriasFiltradas || categoriasFiltradas.length === 0 ? (
                // Estado vacío
                <div className="text-center py-5">
                  <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                  <h5 className="text-muted">No hay categorías</h5>
                  <p className="text-muted">
                    {searchTerm 
                      ? 'No se encontraron categorías con los filtros aplicados.' 
                      : 'Aún no has creado ninguna categoría.'}
                  </p>
                  {!searchTerm && (
                    <Link to="/categorias/nuevo" className="btn btn-primary mt-3">
                      <i className="bi bi-plus-circle me-2"></i>
                      Crear primera categoría
                    </Link>
                  )}
                </div>
              ) : (
                // Lista de categorías
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                      {categoriasFiltradas?.length || 0} categoría{(categoriasFiltradas?.length || 0) !== 1 ? 's' : ''} encontrada{(categoriasFiltradas?.length || 0) !== 1 ? 's' : ''}
                    </h6>
                  </div>
                  
                  <div className="row g-3">
                    {categoriasFiltradas?.map((categoria: Categoria) => (
                      <div key={categoria.id} className="col-lg-4 col-md-6 col-12">
                        <div className="card h-100">
                          <div className="card-body d-flex flex-column">
                            <h5 className="card-title">{categoria.nombre}</h5>
                            
                            {categoria.descripcion && (
                              <p className="card-text text-muted flex-grow-1">
                                {categoria.descripcion}
                              </p>
                            )}

                            {/* Botones de acción */}
                            <div className="d-flex gap-2 mt-auto">
                              <Link
                                to={`/categorias/${categoria.id}/editar`}
                                className="btn btn-outline-primary btn-sm flex-fill"
                                title="Editar categoría"
                              >
                                <i className="bi bi-pencil me-1"></i>
                                Editar
                              </Link>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm flex-fill"
                                title="Eliminar categoría"
                                onClick={() => deleteModal.openModal(categoria)}
                              >
                                <i className="bi bi-trash me-1"></i>
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={() => handleDeleteCategoria()}
        title="Eliminar Categoría"
        itemName={deleteModal.itemToDelete?.nombre}
        itemType="categoría"
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default CategoriasListPage;