import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getProductos, deleteProducto } from '../../services/productosService';
import { getCategorias } from '../../services/categoriasService';
import { showSuccess, showApiError } from '../../utils/toast';
import { ConfirmDeleteModal } from '../../components/common';
import { useConfirmDelete } from '../../hooks';
import type { Producto, Categoria, ProductoFilters, PaginationData } from '../../types';

const ProductosListPage: React.FC = () => {
  const [todosLosProductos, setTodosLosProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<number | undefined>(undefined);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  
  // Hook para manejar el modal de confirmación de eliminación
  const deleteModal = useConfirmDelete<Producto>();

  // Filtrar productos localmente (como en la página de categorías)
  const productosFiltrados = useMemo(() => {
    let filtrados = [...todosLosProductos];

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const termino = searchTerm.trim().toLowerCase();
      filtrados = filtrados.filter(producto =>
        producto.nombre.toLowerCase().includes(termino) ||
        (producto.descripcion && producto.descripcion.toLowerCase().includes(termino))
      );
    }

    // Filtrar por categoría
    if (selectedCategoria) {
      filtrados = filtrados.filter(producto =>
        producto.categorias && producto.categorias.some(cat => cat.id === selectedCategoria)
      );
    }

    return filtrados;
  }, [todosLosProductos, searchTerm, selectedCategoria]);

  // Productos paginados
  const productosPaginados = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return productosFiltrados.slice(startIndex, endIndex);
  }, [productosFiltrados, pagination.currentPage, pagination.itemsPerPage]);

  // Actualizar paginación cuando cambien los productos filtrados
  useEffect(() => {
    const totalItems = productosFiltrados.length;
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
    const currentPage = Math.min(pagination.currentPage, Math.max(1, totalPages));

    setPagination(prev => ({
      ...prev,
      currentPage,
      totalPages: Math.max(1, totalPages),
      totalItems,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    }));
  }, [productosFiltrados.length, pagination.itemsPerPage, pagination.currentPage]);

  // Cargar categorías para el filtro
  const cargarCategorias = useCallback(async () => {
    try {
      const response = await getCategorias();
      setCategorias(response.data.categorias || []);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setCategorias([]);
    }
  }, []);

  // Cargar todos los productos del backend (sin filtros)
  const cargarTodosLosProductos = useCallback(async () => {
    try {
      setLoading(true);
      
      const filters: ProductoFilters = {
        page: 1,
        limit: 1000,  //Cargar muchos productos de una vez
      };
      
      const response = await getProductos(filters);
      
      const todosProductos = response.data.productos || [];
      setTodosLosProductos(todosProductos);
      
      // Configurar paginación inicial
      const itemsPerPage = 10;
      const totalItems = todosProductos.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      
      setPagination({
        currentPage: 1,
        totalPages,
        totalItems,
        itemsPerPage,
        hasNextPage: totalPages > 1,
        hasPreviousPage: false,
      });
      
    } catch (error) {
      console.error('Error cargando productos:', error);
      showApiError(error);
      setTodosLosProductos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Manejar eliminación de producto
  const handleEliminarProducto = useCallback(async (producto: Producto) => {
    try {
      await deleteProducto(producto.id);
      showSuccess('Producto eliminado correctamente');
      
      // Recargar la lista
      cargarTodosLosProductos();
    } catch (error) {
      showApiError(error);
    }
  }, [cargarTodosLosProductos]);

  // Abrir modal de confirmación
  const confirmarEliminacion = useCallback((producto: Producto) => {
    deleteModal.openModal(producto);
  }, [deleteModal]);

  // Manejar cambio de página
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  }, [pagination.totalPages]);

  // Manejar búsqueda
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Resetear a página 1
  }, []);

  // Manejar filtro por categoría
  const handleCategoriaChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoriaId = e.target.value ? parseInt(e.target.value) : undefined;
    setSelectedCategoria(categoriaId);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Resetear a página 1
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarCategorias();
    cargarTodosLosProductos();
  }, [cargarCategorias, cargarTodosLosProductos]);

  // Formatear precio
  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(precio);
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Gestión de Productos</h1>
          <p className="text-muted">
            {pagination.totalItems} producto{pagination.totalItems !== 1 ? 's' : ''} encontrado{pagination.totalItems !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/productos/nuevo" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          Agregar Producto
        </Link>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Búsqueda */}
            <div className="col-md-6">
              <label htmlFor="search" className="form-label">
                Buscar productos
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  id="search"
                  className="form-control"
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Filtro por categoría */}
            <div className="col-md-4">
              <label htmlFor="categoria" className="form-label">
                Filtrar por categoría
              </label>
              <select
                id="categoria"
                className="form-select"
                value={selectedCategoria || ''}
                onChange={handleCategoriaChange}
              >
                <option value="">Todas las categorías</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Limpiar filtros */}
            <div className="col-md-2">
              <label className="form-label">&nbsp;</label>
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategoria(undefined);
                }}
                disabled={!searchTerm && !selectedCategoria}
              >
                <i className="fas fa-broom me-2"></i>
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2 text-muted">Cargando productos...</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No se encontraron productos</h5>
              <p className="text-muted">
                {searchTerm || selectedCategoria
                  ? 'Intenta ajustar tus filtros de búsqueda'
                  : 'Comienza agregando tu primer producto'}
              </p>
              {!searchTerm && !selectedCategoria && (
                <Link to="/productos/nuevo" className="btn btn-primary mt-2">
                  <i className="fas fa-plus me-2"></i>
                  Agregar Primer Producto
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Desktop: Tabla responsiva; Móvil: lista de tarjetas */}
              {/* Tabla (oculto en pantallas xs) */}
              <div className="table-responsive d-none d-sm-block">
                <table className="table table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>Imagen</th>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Categorías</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosPaginados.map((producto: Producto) => (
                      <tr key={producto.id}>
                        {/* Imagen */}
                        <td>
                          <div className="product-image-container">
                            {producto.imagen_url ? (
                              <img
                                src={producto.imagen_url}
                                alt={producto.nombre}
                                className="rounded"
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  objectFit: 'cover',
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-product.png';
                                }}
                              />
                            ) : (
                              <div 
                                className="bg-light rounded d-flex align-items-center justify-content-center"
                                style={{ width: '50px', height: '50px' }}
                              >
                                <i className="fas fa-image text-muted"></i>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Producto */}
                        <td>
                          <div>
                            <h6 className="mb-1">{producto.nombre}</h6>
                            <small className="text-muted">
                              {producto.descripcion && producto.descripcion.length > 50
                                ? `${producto.descripcion.substring(0, 50)}...`
                                : producto.descripcion}
                            </small>
                          </div>
                        </td>

                        {/* Precio */}
                        <td>
                          <strong className="text-success">
                            {formatearPrecio(producto.precio)}
                          </strong>
                        </td>

                        {/* Stock */}
                        <td>
                          <span className={`badge ${
                            producto.stock > 10 
                              ? 'bg-success' 
                              : producto.stock > 0 
                                ? 'bg-warning text-dark' 
                                : 'bg-danger'
                          }`}>
                            {producto.stock} unidades
                          </span>
                        </td>

                        {/* Categorías */}
                        <td>
                          {producto.categorias && producto.categorias.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {producto.categorias.slice(0, 2).map((categoria) => (
                                <span key={categoria.id} className="badge bg-info text-dark">
                                  {categoria.nombre}
                                </span>
                              ))}
                              {producto.categorias.length > 2 && (
                                <span className="badge bg-secondary">
                                  +{producto.categorias.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">Sin categorías</span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td>
                          <div className="btn-group btn-group-sm" role="group">
                            <Link
                              to={`/productos/editar/${producto.id}`}
                              className="btn btn-outline-primary"
                              title="Editar producto"
                            >
                              <i className="bi bi-pencil me-1"></i>
                            </Link>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => confirmarEliminacion(producto)}
                              title="Eliminar producto"
                            >
                              <i className="bi bi-trash me-1"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lista de tarjetas para pantallas pequeñas */}
              <div className="d-block d-sm-none">
                <div className="row g-3">
                  {productosPaginados.map((producto: Producto) => (
                    <div key={producto.id} className="col-12">
                      <div className="card shadow-sm">
                        <div className="card-body d-flex gap-3 align-items-start">
                          <div style={{width: 64, height: 64, flexShrink: 0}}>
                            {producto.imagen_url ? (
                              <img src={producto.imagen_url} alt={producto.nombre} className="rounded" style={{width: '64px', height: '64px', objectFit: 'cover'}} />
                            ) : (
                              <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{width: '64px', height: '64px'}}>
                                <i className="fas fa-image text-muted"></i>
                              </div>
                            )}
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <h6 className="mb-1">{producto.nombre}</h6>
                              <strong className="text-success">{formatearPrecio(producto.precio)}</strong>
                            </div>
                            <p className="mb-1 small text-muted">{producto.descripcion && producto.descripcion.length > 80 ? `${producto.descripcion.substring(0,80)}...` : producto.descripcion}</p>
                            <div className="d-flex gap-2 align-items-center mt-2">
                              <Link to={`/productos/editar/${producto.id}`} className="btn btn-outline-primary btn-sm">Editar</Link>
                              <button className="btn btn-outline-danger btn-sm" onClick={() => confirmarEliminacion(producto)}>Eliminar</button>
                              <span className="ms-auto small text-muted">{producto.stock} unidades</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted">
                    Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} a{' '}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de{' '}
                    {pagination.totalItems} productos
                  </div>
                  
                  <nav aria-label="Paginación de productos">
                    <ul className="pagination pagination-sm mb-0">
                      {/* Botón Anterior */}
                      <li className={`page-item ${!pagination.hasPreviousPage ? 'disabled' : ''}`}>
                        <button
                          style={{ height: '100%' }}
                          className="page-link"
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={!pagination.hasPreviousPage}
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      </li>

                      {/* Números de página */}
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          const current = pagination.currentPage;
                          return page === 1 || 
                                 page === pagination.totalPages || 
                                 (page >= current - 1 && page <= current + 1);
                        })
                        .map((page, index, array) => {
                          const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && (
                                <li className="page-item disabled">
                                  <span className="page-link">...</span>
                                </li>
                              )}
                              <li className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => handlePageChange(page)}
                                >
                                  {page}
                                </button>
                              </li>
                            </React.Fragment>
                          );
                        })}

                      {/* Botón Siguiente */}
                      <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                        <button
                          style={{ height: '100%' }}
                          className="page-link"
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={!pagination.hasNextPage}
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}

              {/* Información de productos sin paginación */}
              {pagination.totalPages <= 1 && productosFiltrados.length > 0 && (
                <div className="d-flex justify-content-center align-items-center mt-4">
                  <div className="text-muted">
                    {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={() => deleteModal.handleConfirm(handleEliminarProducto)}
        loading={deleteModal.loading}
        title="Eliminar Producto"
        message="¿Estás seguro de que deseas eliminar este producto?"
        itemName={deleteModal.itemToDelete?.nombre}
        itemType="producto"
      />
    </div>
  );
};

export default ProductosListPage;