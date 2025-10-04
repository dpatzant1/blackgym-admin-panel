import axios from 'axios';
import type { Rol } from '../types/auth';

// URL base del API
const API_URL = import.meta.env.VITE_API_URL;

// Cliente Axios configurado
const apiClient = axios.create({
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
 * Obtener lista de todos los roles disponibles
 * GET /api/roles
 */
export const obtenerRoles = async (): Promise<Rol[]> => {
  try {
    const authHeaders = getAuthHeaders();
    
    const response = await apiClient.get<{ success: boolean; data: { roles: Rol[] } }>(
      '/api/roles',
      { headers: authHeaders }
    );
    
    return response.data.data.roles;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Error al obtener roles');
    }
    throw error;
  }
};

/**
 * Obtener rol por ID
 * GET /api/roles/:id
 */
export const obtenerRolPorId = async (id: number): Promise<Rol> => {
  try {
    const authHeaders = getAuthHeaders();
    
    const response = await apiClient.get<{ success: boolean; data: { rol: Rol } }>(
      `/api/roles/${id}`,
      { headers: authHeaders }
    );
    
    return response.data.data.rol;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Error al obtener rol');
    }
    throw error;
  }
};

/**
 * Obtener estadísticas de roles
 * GET /api/roles/stats
 */
export const obtenerEstadisticasRoles = async (): Promise<{
  totalAdministradores: number;
  administradoresSinRol: number;
  distribucionPorRol: Record<string, number>;
}> => {
  try {
    const authHeaders = getAuthHeaders();
    
    const response = await apiClient.get<{ 
      success: boolean; 
      data: {
        totalAdministradores: number;
        administradoresSinRol: number;
        distribucionPorRol: Record<string, number>;
      }
    }>(
      '/api/roles/stats',
      { headers: authHeaders }
    );
    
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Error al obtener estadísticas');
    }
    throw error;
  }
};
