import axios from 'axios';
import type { Admin } from '../types/auth';

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
 * Obtener lista de todos los administradores
 * GET /api/administradores/admins
 */
export const obtenerAdministradores = async (): Promise<Admin[]> => {
  try {
    const authHeaders = getAuthHeaders();
    
    const response = await apiClient.get<{ success: boolean; data: { administradores: Admin[]; total: number }; message: string }>(
      '/api/administradores/admins',
      { headers: authHeaders }
    );
    
    return response.data.data.administradores;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Error al obtener administradores');
    }
    throw error;
  }
};

/**
 * Obtener un administrador por ID
 * GET /api/administradores/:id
 */
export const obtenerAdministradorPorId = async (id: number): Promise<Admin> => {
  try {
    const authHeaders = getAuthHeaders();
    
    const response = await apiClient.get<{ success: boolean; data: { admin: Admin } }>(
      `/api/administradores/${id}`,
      { headers: authHeaders }
    );
    
    return response.data.data.admin;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Error al obtener administrador');
    }
    throw error;
  }
};

/**
 * Crear un nuevo administrador
 * POST /api/administradores
 */
export const crearAdministrador = async (data: { usuario: string; password: string; rol_id?: number }): Promise<Admin> => {
  try {
    const authHeaders = getAuthHeaders();
    
    const response = await apiClient.post<{ success: boolean; data: { admin: Admin } }>(
      '/api/administradores',
      data,
      { headers: authHeaders }
    );
    
    return response.data.data.admin;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Error al crear administrador');
    }
    throw error;
  }
};

/**
 * Actualizar un administrador (usuario, password y/o rol_id)
 * PUT /api/administradores/:id
 */
export const actualizarAdministrador = async (id: number, data: { usuario?: string; password?: string; rol_id?: number }): Promise<Admin> => {
  try {
    const authHeaders = getAuthHeaders();
    
    const response = await apiClient.put<{ success: boolean; data: { admin: Admin } }>(
      `/api/administradores/${id}`,
      data,
      { headers: authHeaders }
    );
    
    return response.data.data.admin;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Error al actualizar administrador');
    }
    throw error;
  }
};

/**
 * Actualizar contraseña de un administrador (alias para compatibilidad)
 * PUT /api/administradores/:id
 */
export const actualizarPasswordAdministrador = async (id: number, password: string): Promise<void> => {
  await actualizarAdministrador(id, { password });
};

/**
 * Eliminar un administrador
 * DELETE /api/administradores/:id
 */
export const eliminarAdministrador = async (id: number): Promise<void> => {
  try {
    const authHeaders = getAuthHeaders();
    
    await apiClient.delete(
      `/api/administradores/${id}`,
      { headers: authHeaders }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Error al eliminar administrador');
    }
    throw error;
  }
};

/**
 * Asignar rol a un administrador
 * PUT /api/administradores/:id/rol
 */
export const asignarRolAdministrador = async (id: number, rol_id: number | null): Promise<Admin> => {
  try {
    const authHeaders = getAuthHeaders();
    
    const response = await apiClient.put<{ success: boolean; data: { admin: Admin } }>(
      `/api/administradores/${id}/rol`,
      { rol_id },
      { headers: authHeaders }
    );
    
    return response.data.data.admin;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Error al asignar rol');
    }
    throw error;
  }
};
