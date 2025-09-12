import { toast } from 'react-toastify';

// Tipo para las opciones de toast (basado en react-toastify)
type ToastConfig = {
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  autoClose?: number | false;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
};

// Configuración base para todos los toast
const defaultOptions: ToastConfig = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Utilidades para diferentes tipos de notificaciones
export const showSuccess = (message: string, options?: ToastConfig) => {
  return toast.success(`✅ ${message}`, { ...defaultOptions, ...options });
};

export const showError = (message: string, options?: ToastConfig) => {
  return toast.error(`❌ ${message}`, { ...defaultOptions, ...options });
};

export const showWarning = (message: string, options?: ToastConfig) => {
  return toast.warning(`⚠️ ${message}`, { ...defaultOptions, ...options });
};

export const showInfo = (message: string, options?: ToastConfig) => {
  return toast.info(`ℹ️ ${message}`, { ...defaultOptions, ...options });
};

// Utilidad para notificaciones de carga
export const showLoading = (message: string = 'Procesando...') => {
  return toast.loading(`🔄 ${message}`, defaultOptions);
};

// Utilidad para actualizar un toast existente
export const updateToast = (
  toastId: string | number,
  type: 'success' | 'error' | 'warning' | 'info',
  message: string
) => {
  const emojis = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.update(toastId, {
    render: `${emojis[type]} ${message}`,
    type,
    isLoading: false,
    autoClose: 4000,
  });
};

// Tipo para errores de API
interface ApiError {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
  };
  message?: string;
}

// Utilidad para mostrar notificaciones de API
export const showApiError = (error: unknown) => {
  const apiError = error as ApiError;
  const message = apiError?.response?.data?.error || 
                  apiError?.response?.data?.message || 
                  apiError?.message || 
                  'Ha ocurrido un error inesperado';
  
  return showError(message);
};

export const showApiSuccess = (message: string = 'Operación completada exitosamente') => {
  return showSuccess(message);
};

// Utility para limpiar todos los toast
export const clearAllToasts = () => {
  toast.dismiss();
};