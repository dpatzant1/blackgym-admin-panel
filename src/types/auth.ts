// Tipos para el sistema de autenticación

export interface Admin {
  id: number;
  usuario: string;
  creado_en: string;
}

export interface LoginCredentials {
  usuario: string;
  password: string;
}

export interface AuthContextType {
  // Estado de autenticación
  isAuthenticated: boolean;
  admin: Admin | null;
  isLoading: boolean;
  
  // Funciones de autenticación
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  
  // Función para verificar autenticación al cargar
  checkAuth: () => Promise<void>;
}

// Respuesta del backend para verificación de credenciales
export interface VerifyCredentialsResponse {
  success: boolean;
  data: {
    admin: Admin;
    authenticated: boolean;
  };
  message: string;
}

// Respuesta del backend para obtener perfil
export interface GetProfileResponse {
  success: boolean;
  data: {
    admin: Admin;
  };
  message: string;
}

// Respuesta genérica de error del backend
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string[] | null;
}