import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthContextType, Admin, LoginCredentials } from '../types/auth';
import { AuthContext } from './AuthContext';
import { getProfile, verifyCredentials } from '../services/authService';

// Props para el provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider del contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Función para verificar autenticación al cargar la app
  const checkAuth = async (): Promise<void> => {
    try {
      const storedUser = localStorage.getItem('admin-user');
      const storedPassword = localStorage.getItem('admin-password');

      if (!storedUser || !storedPassword) {
        setIsLoading(false);
        return;
      }

      // Obtener perfil completo con información de rol
      const profileResponse = await getProfile();

      if (profileResponse.success && profileResponse.data.admin) {
        const adminData = profileResponse.data.admin;
        setIsAuthenticated(true);
        setAdmin(adminData);
        
        // Persistir información de rol en localStorage
        localStorage.setItem('admin-data', JSON.stringify(adminData));
      } else {
        // Limpiar localStorage si las credenciales no son válidas
        localStorage.removeItem('admin-user');
        localStorage.removeItem('admin-password');
        localStorage.removeItem('admin-data');
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      // Limpiar localStorage en caso de error
      localStorage.removeItem('admin-user');
      localStorage.removeItem('admin-password');
      localStorage.removeItem('admin-data');
      // Si el backend no está disponible, permitir acceso sin autenticación para desarrollo
      if (import.meta.env.DEV) {
        console.warn('Modo desarrollo: Backend no disponible, permitiendo acceso');
        setIsAuthenticated(true);
        setAdmin({ id: 1, usuario: 'dev-admin', creado_en: new Date().toISOString() });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para hacer login
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Primero verificar credenciales
      const verifyResponse = await verifyCredentials(credentials);

      if (verifyResponse.success && verifyResponse.data.authenticated) {
        // Guardar credenciales en localStorage
        localStorage.setItem('admin-user', credentials.usuario);
        localStorage.setItem('admin-password', credentials.password);
        
        // Obtener perfil completo con información de rol
        const profileResponse = await getProfile();
        
        if (profileResponse.success && profileResponse.data && profileResponse.data.admin) {
          const adminData = profileResponse.data.admin;
          
          // Actualizar estado
          setIsAuthenticated(true);
          setAdmin(adminData);
          
          // Persistir información completa del admin incluyendo rol
          localStorage.setItem('admin-data', JSON.stringify(adminData));
        } else {
          throw new Error('No se pudo obtener el perfil del administrador');
        }
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para hacer logout
  const logout = (): void => {
    // Limpiar localStorage
    localStorage.removeItem('admin-user');
    localStorage.removeItem('admin-password');
    localStorage.removeItem('admin-data');
    
    // Limpiar estado
    setIsAuthenticated(false);
    setAdmin(null);
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    admin,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};