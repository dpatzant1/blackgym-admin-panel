/**
 * Utilidades para manejar las preferencias personalizadas del usuario en el dashboard
 */

import type { DashboardConfig, WidgetVisibility } from '../types/dashboard';

// Clave para almacenar en localStorage
const DASHBOARD_CONFIG_KEY = 'dashboard_config';

/**
 * Obtiene la configuración del dashboard guardada en localStorage
 */
export const getDashboardConfig = (): DashboardConfig => {
  try {
    const savedConfig = localStorage.getItem(DASHBOARD_CONFIG_KEY);
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (error) {
    console.error('Error al recuperar configuración del dashboard:', error);
  }

  // Configuración por defecto si no hay nada guardado
  return {
    widgetVisibility: {
      kpis: true,
      evolucionMensual: true,
      evolucionDiaria: true,
      productosMasVendidos: true,
      distribucionVentas: true,
      categoriaDistribucion: true,
      distribucionCategorias: true,
      mapaCalorCategorias: true,
    },
    darkMode: true,
    ordenWidgets: [
      'kpis', 
      'evolucionMensual', 
      'productosMasVendidos', 
      'evolucionDiaria',
      'distribucionVentas',
      'categoriaDistribucion',
      'distribucionCategorias',
      'mapaCalorCategorias'
    ],
    periodosComparacion: {
      habilitado: false,
      periodoBase: new Date().getFullYear(),
      periodoComparacion: new Date().getFullYear() - 1
    },
    alertas: {
      stockBajo: true,
      umbralStockBajo: 10,
      tendenciasNegativas: true,
      umbralTendenciaNegativa: -10 // Porcentaje
    }
  };
};

/**
 * Guarda la configuración del dashboard en localStorage
 */
export const saveDashboardConfig = (config: DashboardConfig): void => {
  try {
    localStorage.setItem(DASHBOARD_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error al guardar configuración del dashboard:', error);
  }
};

/**
 * Actualiza la visibilidad de un widget específico
 */
export const updateWidgetVisibility = (widgetId: keyof WidgetVisibility, isVisible: boolean): DashboardConfig => {
  const config = getDashboardConfig();
  const updatedConfig = {
    ...config,
    widgetVisibility: {
      ...config.widgetVisibility,
      [widgetId]: isVisible
    }
  };
  saveDashboardConfig(updatedConfig);
  return updatedConfig;
};

/**
 * Actualiza el orden de los widgets
 */
export const updateWidgetsOrder = (newOrder: string[]): DashboardConfig => {
  const config = getDashboardConfig();
  const updatedConfig = {
    ...config,
    ordenWidgets: newOrder
  };
  saveDashboardConfig(updatedConfig);
  return updatedConfig;
};

/**
 * Actualiza el modo oscuro
 */
export const toggleDarkMode = (isDarkMode: boolean): DashboardConfig => {
  const config = getDashboardConfig();
  const updatedConfig = {
    ...config,
    darkMode: isDarkMode
  };
  saveDashboardConfig(updatedConfig);
  return updatedConfig;
};

/**
 * Actualiza la configuración de comparación de periodos
 */
export const updatePeriodosComparacion = (habilitado: boolean, periodoBase?: number, periodoComparacion?: number): DashboardConfig => {
  const config = getDashboardConfig();
  const updatedConfig = {
    ...config,
    periodosComparacion: {
      habilitado,
      periodoBase: periodoBase || config.periodosComparacion.periodoBase,
      periodoComparacion: periodoComparacion || config.periodosComparacion.periodoComparacion
    }
  };
  saveDashboardConfig(updatedConfig);
  return updatedConfig;
};

/**
 * Actualiza la configuración de alertas
 */
export const updateAlertas = (alertas: DashboardConfig['alertas']): DashboardConfig => {
  const config = getDashboardConfig();
  const updatedConfig = {
    ...config,
    alertas: {
      ...config.alertas,
      ...alertas
    }
  };
  saveDashboardConfig(updatedConfig);
  return updatedConfig;
};

/**
 * Resetea la configuración a los valores por defecto
 */
export const resetConfig = (): DashboardConfig => {
  localStorage.removeItem(DASHBOARD_CONFIG_KEY);
  return getDashboardConfig();
};

export default {
  getDashboardConfig,
  saveDashboardConfig,
  updateWidgetVisibility,
  updateWidgetsOrder,
  toggleDarkMode,
  updatePeriodosComparacion,
  updateAlertas,
  resetConfig
};