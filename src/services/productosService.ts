import axios from 'axios';
import type { 
  Producto,
  ProductoFormData,
  ProductoFilters,
  ProductosResponse,
  StockCheck,
  StockCheckResponse,
  ApiErrorResponse 
} from '../types';

// URL base del API
const API_URL = import.meta.env.VITE_API_URL;

// Cliente Axios configurado para productos
const productoClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para obtener headers de autenticación desde localStorage
const getAuthHeaders = () => {
  const usuario = localStorage.getItem('admin-user');
  const password = localStorage.getItem('admin-password');
  
  if (!usuario || !password) {
    throw new Error('No hay credenciales de autenticación');
  }
  
  return {
    'x-admin-user': usuario,
    'x-admin-password': password,
  };
};

/**
 * Obtener lista de productos con paginación y filtros
 * GET /api/productos
 */
export const getProductos = async (filters: ProductoFilters = {}): Promise<ProductosResponse> => {
  try {
    // Construir parámetros de consulta
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.categoria) params.append('categoria', filters.categoria.toString());
    if (filters.disponible !== undefined) params.append('disponible', filters.disponible.toString());
    if (filters.search) params.append('search', filters.search);
    
    // Siempre incluir categorías en la respuesta
    params.append('include_categories', 'true');
    
    const url = `/api/productos?${params.toString()}`;
    
    // GET /api/productos es público - no requiere autenticación
    const response = await productoClient.get<ProductosResponse>(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error || 'Error al obtener productos');
      } else if (error.request) {
        throw new Error('Error de conexión');
      }
    }
    throw new Error('Error inesperado al obtener productos');
  }
};

/**
 * Obtener un producto específico por ID
 * GET /api/productos/:id
 */
export const getProducto = async (id: number): Promise<Producto> => {
  try {
    // GET /api/productos/:id es público - no requiere autenticación
    const response = await productoClient.get(`/api/productos/${id}`);
    
    // Intentar diferentes estructuras de respuesta posibles
    let producto: Producto | null = null;
    
    // Estructura correcta: { success: true, data: { id, nombre, ... } }
    if (response.data?.data && response.data.data.id) {
      producto = response.data.data;
    }
    // Estructura esperada: { success: true, data: { producto: {...} } }
    else if (response.data?.data?.producto) {
      producto = response.data.data.producto;
    }
    // Estructura alternativa: { producto: {...} }
    else if (response.data?.producto) {
      producto = response.data.producto;
    }
    // Estructura directa: {...}
    else if (response.data?.id) {
      producto = response.data;
    }
    
    if (!producto) {
      throw new Error('No se pudo obtener los datos del producto');
    }
    
    return producto;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data as ApiErrorResponse;
        
        if (error.response.status === 404) {
          throw new Error('Producto no encontrado');
        }
        
        throw new Error(errorData.error || 'Error al obtener producto');
      } else if (error.request) {
        throw new Error('Error de conexión');
      }
    }
    throw new Error('Error inesperado al obtener producto');
  }
};

/**
 * Crear un nuevo producto
 * POST /api/productos
 */
export const createProducto = async (productoData: ProductoFormData): Promise<Producto> => {
  try {
    const authHeaders = getAuthHeaders();
    
    const response = await productoClient.post(
      '/api/productos',
      productoData,
      {
        headers: {
          ...authHeaders,
        },
      }
    );
    
    // Extraer producto de la respuesta
    if (response.data?.producto) {
      return response.data.producto;
    } else if (response.data?.data?.producto) {
      return response.data.data.producto;
    } else if (response.data?.data && response.data.data.id) {
      return response.data.data;
    }
    
    throw new Error('Respuesta inesperada del servidor');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data as ApiErrorResponse;
        
        if (error.response.status === 401 || error.response.status === 403) {
          throw new Error('No tienes permisos para crear productos');
        }
        
        if (error.response.status === 400) {
          const details = Array.isArray(errorData.details) 
            ? errorData.details.join(', ') 
            : errorData.details || 'Datos inválidos';
          throw new Error(`Error de validación: ${details}`);
        }
        
        throw new Error(errorData.error || 'Error al crear producto');
      } else if (error.request) {
        throw new Error('Error de conexión');
      }
    }
    throw new Error('Error inesperado al crear producto');
  }
};

/**
 * Actualizar un producto existente
 * PUT /api/productos/:id
 */
export const updateProducto = async (id: number, productoData: ProductoFormData): Promise<Producto> => {
  try {
    const authHeaders = getAuthHeaders();
    
    const response = await productoClient.put(
      `/api/productos/${id}`,
      productoData,
      {
        headers: {
          ...authHeaders,
        },
      }
    );
    
    // Extraer producto de la respuesta
    if (response.data?.producto) {
      return response.data.producto;
    } else if (response.data?.data?.producto) {
      return response.data.data.producto;
    } else if (response.data?.data && response.data.data.id) {
      return response.data.data;
    }
    
    throw new Error('Respuesta inesperada del servidor');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data as ApiErrorResponse;
        
        if (error.response.status === 401 || error.response.status === 403) {
          throw new Error('No tienes permisos para actualizar productos');
        }
        
        if (error.response.status === 404) {
          throw new Error('Producto no encontrado');
        }
        
        if (error.response.status === 400) {
          const details = Array.isArray(errorData.details) 
            ? errorData.details.join(', ') 
            : errorData.details || 'Datos inválidos';
          throw new Error(`Error de validación: ${details}`);
        }
        
        throw new Error(errorData.error || 'Error al actualizar producto');
      } else if (error.request) {
        throw new Error('Error de conexión');
      }
    }
    throw new Error('Error inesperado al actualizar producto');
  }
};

/**
 * Eliminar un producto
 * DELETE /api/productos/:id
 */
export const deleteProducto = async (id: number): Promise<void> => {
  try {
    const authHeaders = getAuthHeaders();
    
    await productoClient.delete(`/api/productos/${id}`, {
      headers: {
        ...authHeaders,
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data as ApiErrorResponse;
        
        if (error.response.status === 401 || error.response.status === 403) {
          throw new Error('No tienes permisos para eliminar productos');
        }
        
        if (error.response.status === 404) {
          throw new Error('Producto no encontrado');
        }
        
        throw new Error(errorData.error || 'Error al eliminar producto');
      } else if (error.request) {
        throw new Error('Error de conexión');
      }
    }
    throw new Error('Error inesperado al eliminar producto');
  }
};

/**
 * Subir imagen de producto
 * POST /api/uploads/image
 */
export const uploadImage = async (file: File): Promise<string> => {
  // Validaciones básicas
  if (!file) {
    throw new Error('No hay archivo seleccionado');
  }

  if (!(file instanceof File)) {
    throw new Error('El objeto proporcionado no es un archivo válido');
  }

  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Solo se permiten archivos JPG, PNG, WebP o GIF');
  }
  
  // Validar tamaño (5MB máximo)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('El archivo es muy grande. Máximo 5MB');
  }

  // Crear FormData
  const formData = new FormData();
  formData.append('image', file);

  const authHeaders = getAuthHeaders();

  try {
    const response = await fetch(`${API_URL}/api/uploads/image`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        // NO incluir Content-Type para FormData, el navegador lo configura automáticamente
      },
      body: formData
    });

    if (!response.ok) {
      await response.text(); // Leer respuesta para liberar el stream
      
      // Manejar errores específicos
      if (response.status === 401 || response.status === 403) {
        throw new Error('No tienes permisos para subir imágenes');
      }
      if (response.status === 413) {
        throw new Error('El archivo es muy grande. Máximo 5MB');
      }
      if (response.status === 415) {
        throw new Error('Tipo de archivo no permitido. Solo JPG, PNG o WebP');
      }
      if (response.status === 400) {
        throw new Error('Error en la validación del archivo');
      }
      
      throw new Error(`Error del servidor: ${response.status}`);
    }

    // Leer y parsear la respuesta
    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error('Respuesta del servidor no es JSON válido');
    }

    // Buscar la URL en diferentes ubicaciones posibles
    let imageUrl = null;
    
    if (result?.data?.url) {
      imageUrl = result.data.url;
    } else if (result?.data?.publicUrl) {
      imageUrl = result.data.publicUrl;
    } else if (result?.data?.image?.publicUrl) {
      imageUrl = result.data.image.publicUrl;
    } else if (result?.data?.image?.url) {
      imageUrl = result.data.image.url;
    } else if (result?.url) {
      imageUrl = result.url;
    } else if (typeof result === 'string' && result.startsWith('http')) {
      imageUrl = result;
    } else {
      // Buscar en cualquier propiedad que contenga 'url'
      const findUrl = (obj: unknown): string | null => {
        if (typeof obj === 'string' && obj.startsWith('http')) {
          return obj;
        }
        if (typeof obj === 'object' && obj !== null) {
          for (const [key, value] of Object.entries(obj)) {
            if (key.toLowerCase().includes('url') && typeof value === 'string' && value.startsWith('http')) {
              return value;
            }
            const found = findUrl(value);
            if (found) return found;
          }
        }
        return null;
      };
      
      imageUrl = findUrl(result);
    }

    if (imageUrl) {
      return imageUrl;
    }

    throw new Error('Error en la respuesta del servidor: no se recibió URL de imagen');

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Error inesperado al subir imagen');
  }
};

/**
 * Verificar stock de productos
 * POST /api/productos/check-stock
 */
export const checkStock = async (productos: StockCheck[]): Promise<StockCheckResponse> => {
  try {
    const response = await productoClient.post<StockCheckResponse>(
      '/api/productos/check-stock',
      { productos }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error || 'Error al verificar stock');
      } else if (error.request) {
        throw new Error('Error de conexión');
      }
    }
    throw new Error('Error inesperado al verificar stock');
  }
};

/**
 * Búsqueda avanzada de productos
 * GET /api/productos/search
 */
export const searchProductos = async (query: string): Promise<Producto[]> => {
  try {
    const response = await productoClient.get(`/api/productos/search?q=${encodeURIComponent(query)}`);
    
    // Extraer productos de la respuesta
    if (response.data?.data?.productos) {
      return response.data.data.productos;
    } else if (response.data?.productos) {
      return response.data.productos;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error || 'Error en la búsqueda');
      } else if (error.request) {
        throw new Error('Error de conexión');
      }
    }
    throw new Error('Error inesperado en la búsqueda');
  }
};

/**
 * Actualizar solo el stock de un producto
 * PATCH /api/productos/:id/stock
 */
export const updateStock = async (id: number, stock: number): Promise<Producto> => {
  try {
    const authHeaders = getAuthHeaders();
    
    const response = await productoClient.patch(
      `/api/productos/${id}/stock`,
      { stock },
      {
        headers: {
          ...authHeaders,
        },
      }
    );
    
    // Extraer producto de la respuesta
    if (response.data?.producto) {
      return response.data.producto;
    } else if (response.data?.data?.producto) {
      return response.data.data.producto;
    } else if (response.data?.data && response.data.data.id) {
      return response.data.data;
    }
    
    throw new Error('Respuesta inesperada del servidor');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data as ApiErrorResponse;
        
        if (error.response.status === 401 || error.response.status === 403) {
          throw new Error('No tienes permisos para actualizar stock');
        }
        
        if (error.response.status === 404) {
          throw new Error('Producto no encontrado');
        }
        
        if (error.response.status === 400) {
          throw new Error('Stock inválido');
        }
        
        throw new Error(errorData.error || 'Error al actualizar stock');
      } else if (error.request) {
        throw new Error('Error de conexión');
      }
    }
    throw new Error('Error inesperado al actualizar stock');
  }
};

// Interceptor de respuesta para manejo global de errores
productoClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Limpiar almacenamiento local y redirigir al login
      localStorage.removeItem('admin-user');
      localStorage.removeItem('admin-password');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);