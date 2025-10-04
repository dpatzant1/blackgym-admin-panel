import axios from 'axios';
import type { Orden, CrearOrdenDTO, ActualizarOrdenDTO, CambiarEstadoDTO } from '../types/orden';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Obtiene las credenciales de autenticación del localStorage
 */
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
 * Opciones para obtener órdenes
 */
export interface ObtenerOrdenesParams {
  page?: number;          // Página (empezando en 1)
  limit?: number;         // Órdenes por página  
  sortBy?: 'id' | 'fecha' | 'total' | 'cliente';  // Campo de ordenamiento
  sortOrder?: 'asc' | 'desc';  // Dirección del ordenamiento
  estado?: string;        // Filtro por estado
}

/**
 * Respuesta paginada de órdenes
 */
export interface OrdenesResponse {
  ordenes: Orden[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Obtiene todas las órdenes con paginación y ordenamiento
 */
export const obtenerOrdenes = async (params: ObtenerOrdenesParams = {}): Promise<Orden[]> => {
  // Si no se especifica límite, pedimos un número alto para obtener todas
  const queryParams = new URLSearchParams();
  
  // Usar valores por defecto que traigan todas las órdenes ordenadas
  queryParams.append('page', String(params.page || 1));
  queryParams.append('limit', String(params.limit || 10000)); // Límite alto para obtener todas
  queryParams.append('sortBy', params.sortBy || 'id');
  queryParams.append('sortOrder', params.sortOrder || 'desc'); // Más recientes primero
  
  if (params.estado && params.estado !== 'todas') {
    queryParams.append('estado', params.estado);
  }

  const response = await axios.get(`${API_URL}/api/ordenes?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  // Manejar tanto respuesta simple como paginada
  const data = response.data.data;
  return data.ordenes || data || [];
};

/**
 * Obtiene órdenes con información de paginación completa
 */
export const obtenerOrdenesPaginadas = async (params: ObtenerOrdenesParams): Promise<OrdenesResponse> => {
  const queryParams = new URLSearchParams();
  
  queryParams.append('page', String(params.page || 1));
  queryParams.append('limit', String(params.limit || 25));
  queryParams.append('sortBy', params.sortBy || 'id');
  queryParams.append('sortOrder', params.sortOrder || 'desc');
  
  if (params.estado && params.estado !== 'todas') {
    queryParams.append('estado', params.estado);
  }

  const response = await axios.get(`${API_URL}/api/ordenes?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  const data = response.data.data;
  
  // Si el backend no devuelve paginación, simularla
  if (!data.pagination) {
    const ordenes = data.ordenes || data || [];
    return {
      ordenes,
      pagination: {
        page: 1,
        limit: ordenes.length,
        total: ordenes.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    };
  }
  
  return {
    ordenes: data.ordenes || [],
    pagination: data.pagination
  };
};

/**
 * Obtiene una orden por ID con sus detalles
 */
export const obtenerOrdenPorId = async (id: number): Promise<Orden> => {
  const response = await axios.get(`${API_URL}/api/ordenes/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data.data.orden || response.data.data;
};

/**
 * Crea una nueva orden
 */
export const crearOrden = async (orden: CrearOrdenDTO): Promise<Orden> => {
  const response = await axios.post(`${API_URL}/api/ordenes`, orden, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });
  return response.data.data.orden || response.data.data;
};

/**
 * Actualiza una orden existente
 */
export const actualizarOrden = async (id: number, orden: ActualizarOrdenDTO): Promise<Orden> => {
  const response = await axios.put(`${API_URL}/api/ordenes/${id}`, orden, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });
  return response.data.data.orden || response.data.data;
};

/**
 * Cambia el estado de una orden
 */
export const cambiarEstadoOrden = async (id: number, nuevoEstado: CambiarEstadoDTO): Promise<Orden> => {
  const response = await axios.put(`${API_URL}/api/ordenes/${id}/estado`, nuevoEstado, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });
  return response.data.data.orden || response.data.data;
};

/**
 * Cancela una orden (cambia estado a cancelado)
 */
export const cancelarOrden = async (id: number): Promise<Orden> => {
  const response = await axios.delete(`${API_URL}/api/ordenes/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data.data.orden || response.data.data;
};
