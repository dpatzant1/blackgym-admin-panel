import axios from 'axios';
import type { 
  LoginCredentials, 
  VerifyCredentialsResponse, 
  GetProfileResponse,
  ApiErrorResponse 
} from '../types/auth';

// URL base del API
const API_URL = import.meta.env.VITE_API_URL;

// Cliente Axios configurado para autenticación
const authClient = axios.create({
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
    return {};
  }
  
  return {
    'x-admin-user': usuario,
    'x-admin-password': password,
  };
};

/**
 * Verificar credenciales de administrador
 * POST /api/administradores/verify
 */
export const verifyCredentials = async (credentials: LoginCredentials): Promise<VerifyCredentialsResponse> => {
  try {
    const response = await authClient.post<VerifyCredentialsResponse>(
      '/api/administradores/verify',
      credentials
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Error del servidor con respuesta
      const errorData = error.response.data as ApiErrorResponse;
      throw new Error(errorData.error || 'Error en verificación de credenciales');
    } else {
      // Error de red o conexión
      throw new Error('Error de conexión. Verifica que el servidor esté funcionando.');
    }
  }
};

/**
 * Obtener perfil del administrador autenticado
 * GET /api/administradores/profile
 */
export const getProfile = async (): Promise<GetProfileResponse> => {
  try {
    const authHeaders = getAuthHeaders();
    
    if (!authHeaders['x-admin-user'] || !authHeaders['x-admin-password']) {
      throw new Error('No hay credenciales de autenticación');
    }
    
    const response = await authClient.get<GetProfileResponse>(
      '/api/administradores/profile',
      {
        headers: authHeaders,
      }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiErrorResponse;
      
      if (error.response.status === 401 || error.response.status === 403) {
        // Credenciales inválidas, limpiar localStorage
        localStorage.removeItem('admin-user');
        localStorage.removeItem('admin-password');
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      throw new Error(errorData.error || 'Error obteniendo perfil');
    } else {
      throw new Error('Error de conexión. Verifica que el servidor esté funcionando.');
    }
  }
};

/**
 * Cambiar contraseña del administrador
 * PUT /api/administradores/change-password
 */
export const changePassword = async (passwordActual: string, passwordNuevo: string): Promise<void> => {
  try {
    const authHeaders = getAuthHeaders();
    
    if (!authHeaders['x-admin-user'] || !authHeaders['x-admin-password']) {
      throw new Error('No hay credenciales de autenticación');
    }
    
    const response = await authClient.put(
      '/api/administradores/change-password',
      {
        passwordActual,
        passwordNuevo,
      },
      {
        headers: authHeaders,
      }
    );
    
    if (response.data.success) {
      // Actualizar la contraseña en localStorage
      localStorage.setItem('admin-password', passwordNuevo);
    } else {
      throw new Error(response.data.error || 'Error cambiando contraseña');
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiErrorResponse;
      
      if (error.response.status === 401 || error.response.status === 403) {
        // Credenciales inválidas
        throw new Error('Contraseña actual incorrecta');
      }
      
      throw new Error(errorData.error || 'Error cambiando contraseña');
    } else {
      throw new Error('Error de conexión. Verifica que el servidor esté funcionando.');
    }
  }
};

/**
 * Función auxiliar para verificar si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  const usuario = localStorage.getItem('admin-user');
  const password = localStorage.getItem('admin-password');
  return !!(usuario && password);
};

/**
 * Función auxiliar para limpiar credenciales
 */
export const clearCredentials = (): void => {
  localStorage.removeItem('admin-user');
  localStorage.removeItem('admin-password');
};

// Interceptor para manejar errores de autenticación globalmente
authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si recibimos un 401 o 403, limpiar credenciales automáticamente
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      clearCredentials();
      // Podrías disparar un evento aquí para que el contexto de autenticación se actualice
      window.dispatchEvent(new Event('auth-error'));
    }
    
    return Promise.reject(error);
  }
);