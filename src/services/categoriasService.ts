import axios from 'axios';
import type { 
  Categoria,
  CategoriaFilters,
  CategoriasResponse,
  CreateCategoriaRequest,
  UpdateCategoriaRequest,
  ApiErrorResponse 
} from '../types';

// URL base del API
const API_URL = import.meta.env.VITE_API_URL;

// Cliente Axios configurado para categorías
const categoriaClient = axios.create({
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
 * Obtener lista de categorías
 * GET /api/categorias
 */
export const getCategorias = async (filters?: CategoriaFilters): Promise<CategoriasResponse> => {
  try {
    // Construir parámetros de consulta
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }
    
    const queryString = params.toString();
    const url = queryString ? `/api/categorias?${queryString}` : '/api/categorias';
    
    // GET /api/categorias es público - no requiere autenticación
    const response = await categoriaClient.get<CategoriasResponse>(url);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiErrorResponse;
      
      if (error.response.status === 401 || error.response.status === 403) {
        throw new Error('No tienes permisos para acceder a las categorías');
      }
      
      throw new Error(errorData.error || 'Error obteniendo categorías');
    } else {
      throw new Error('Error de conexión. Verifica que el servidor esté funcionando.');
    }
  }
};

/**
 * Obtener una categoría específica por ID
 * GET /api/categorias/:id
 */
export const getCategoria = async (id: number): Promise<Categoria> => {
  try {
    // GET /api/categorias/:id es público - no requiere autenticación
    const response = await categoriaClient.get(`/api/categorias/${id}`);
    
    // Intentar diferentes estructuras de respuesta posibles
    let categoria: Categoria | null = null;
    
    // Estructura correcta: { success: true, data: { id, nombre, descripcion } }
    if (response.data?.data && response.data.data.id) {
      categoria = response.data.data;
    }
    // Estructura esperada: { success: true, data: { categoria: {...} } }
    else if (response.data?.data?.categoria) {
      categoria = response.data.data.categoria;
    }
    // Estructura alternativa: { categoria: {...} }
    else if (response.data?.categoria) {
      categoria = response.data.categoria;
    }
    // Estructura directa: {...}
    else if (response.data?.id) {
      categoria = response.data;
    }
    
    if (!categoria) {
      throw new Error('No se pudo obtener los datos de la categoría');
    }
    
    return categoria;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data as ApiErrorResponse;
        
        if (error.response.status === 404) {
          throw new Error('Categoría no encontrada');
        }
        
        if (error.response.status === 401 || error.response.status === 403) {
          throw new Error('No tienes permisos para acceder a esta categoría');
        }
        
        throw new Error(errorData.error || 'Error obteniendo categoría');
      } else if (error.request) {
        // La petición se hizo pero no se recibió respuesta
        throw new Error('No se recibió respuesta del servidor. Verifica la conexión.');
      } else {
        // Error al configurar la petición
        throw new Error(`Error configurando la petición: ${error.message}`);
      }
    } else {
      // Error que no es de Axios
      throw new Error(`Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
};

/**
 * Crear una nueva categoría
 * POST /api/categorias
 */
export const createCategoria = async (categoriaData: CreateCategoriaRequest): Promise<Categoria> => {
  try {
    const response = await categoriaClient.post<{ categoria: Categoria }>(
      '/api/categorias',
      categoriaData,
      {
        headers: getAuthHeaders(),
      }
    );
    
    return response.data.categoria;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiErrorResponse;
      
      if (error.response.status === 400) {
        throw new Error(errorData.error || 'Datos de categoría inválidos');
      }
      
      if (error.response.status === 409) {
        throw new Error('Ya existe una categoría con ese nombre');
      }
      
      if (error.response.status === 401 || error.response.status === 403) {
        throw new Error('No tienes permisos para crear categorías');
      }
      
      throw new Error(errorData.error || 'Error creando categoría');
    } else {
      throw new Error('Error de conexión. Verifica que el servidor esté funcionando.');
    }
  }
};

/**
 * Actualizar una categoría existente
 * PUT /api/categorias/:id
 */
export const updateCategoria = async (id: number, categoriaData: UpdateCategoriaRequest): Promise<Categoria> => {
  try {
    const response = await categoriaClient.put<{ categoria: Categoria }>(
      `/api/categorias/${id}`,
      categoriaData,
      {
        headers: getAuthHeaders(),
      }
    );
    
    return response.data.categoria;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiErrorResponse;
      
      if (error.response.status === 404) {
        throw new Error('Categoría no encontrada');
      }
      
      if (error.response.status === 400) {
        throw new Error(errorData.error || 'Datos de categoría inválidos');
      }
      
      if (error.response.status === 409) {
        throw new Error('Ya existe otra categoría con ese nombre');
      }
      
      if (error.response.status === 401 || error.response.status === 403) {
        throw new Error('No tienes permisos para editar esta categoría');
      }
      
      throw new Error(errorData.error || 'Error actualizando categoría');
    } else {
      throw new Error('Error de conexión. Verifica que el servidor esté funcionando.');
    }
  }
};

/**
 * Eliminar una categoría
 * DELETE /api/categorias/:id
 */
export const deleteCategoria = async (id: number): Promise<void> => {
  try {
    await categoriaClient.delete(`/api/categorias/${id}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiErrorResponse;
      
      if (error.response.status === 404) {
        throw new Error('Categoría no encontrada');
      }
      
      if (error.response.status === 409) {
        throw new Error('No se puede eliminar la categoría porque tiene productos asociados');
      }
      
      if (error.response.status === 401 || error.response.status === 403) {
        throw new Error('No tienes permisos para eliminar esta categoría');
      }
      
      throw new Error(errorData.error || 'Error eliminando categoría');
    } else {
      throw new Error('Error de conexión. Verifica que el servidor esté funcionando.');
    }
  }
};

/**
 * Obtener solo categorías activas (útil para selectors)
 */
export const getCategoriasActivas = async (): Promise<Categoria[]> => {
  const response = await getCategorias();
  return response.data.categorias;
};

// Interceptor para manejar errores de autenticación globalmente
categoriaClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si recibimos un 401 o 403, disparar evento para que el contexto se actualice
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      window.dispatchEvent(new Event('auth-error'));
    }
    
    return Promise.reject(error);
  }
);