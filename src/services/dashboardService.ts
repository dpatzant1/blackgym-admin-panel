/**
 * Servicio para obtener datos del Dashboard
 */
import axios from 'axios';
import type { 
  FiltrosDashboard, 
  DashboardData,
  VentasMensuales,
  VentasDiarias,
  ProductoMasVendido,
  VentasPorCategoria
} from '../types';
import dashboardDataGenerator from './dashboardDataGenerator';

// URL base del API
const API_URL = import.meta.env.VITE_API_URL;

// Cliente Axios para el dashboard
const dashboardClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir headers de autenticación automáticamente
dashboardClient.interceptors.request.use(
  (config) => {
    const usuario = localStorage.getItem('admin-user');
    const password = localStorage.getItem('admin-password');
    
    if (usuario && password) {
      // Asegurarse de que headers existe
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers['x-admin-user'] = usuario;
      config.headers['x-admin-password'] = password;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
dashboardClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Limpiar credenciales y disparar evento de error de autenticación
      localStorage.removeItem('admin-user');
      localStorage.removeItem('admin-password');
      window.dispatchEvent(new Event('auth-error'));
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// FUNCIONES DE MAPEO - Convierten respuestas de API a tipos del frontend
// ============================================================================

/**
 * Mapea la respuesta del endpoint /general a los tipos del frontend
 */
const mapearDashboardGeneral = (apiData: any): DashboardData => {
  // Validación de datos
  if (!apiData || !apiData.metricas) {
    throw new Error('Datos de API incompletos o inválidos');
  }

  return {
    kpis: {
      ventas: {
        totalVentas: apiData.metricas.ventasTotales || 0,
        gananciaTotal: Math.round((apiData.metricas.ventasTotales || 0) * 0.6), // Estimación 60% ganancia
        porcentajeGanancia: 60, // Valor fijo
        comparativaAnterior: 0 // Se calcula con otra llamada si es necesario
      },
      productos: {
        productoTop: {
          id: apiData.metricas.productoTop?.id || 0,
          nombre: apiData.metricas.productoTop?.nombre || 'Sin datos',
          ventas: apiData.metricas.productoTop?.unidadesVendidas || 0,
          monto: apiData.metricas.productoTop?.totalVentas || 0
        },
        categoriaTop: {
          id: apiData.metricas.categoriaTop?.id || 0,
          nombre: apiData.metricas.categoriaTop?.nombre || 'Sin datos',
          ventas: 0, // No disponible directamente en la API
          monto: apiData.metricas.categoriaTop?.totalVentas || 0
        }
      }
    },
    graficos: {
      ventasMensuales: [], // Se obtiene con otro endpoint
      ventasDiarias: [], // Se obtiene con otro endpoint
      productosMasVendidos: [], // Se obtiene con otro endpoint
      distribucion: { // Este campo se eliminará en fase posterior
        porTipo: { online: 0, local: 0 },
        porPago: { efectivo: 0, transferencia: 0 }
      },
      categorias: [] // Se obtiene con otro endpoint
    },
    metadata: {
      añosDisponibles: [2021, 2022, 2023, 2024, 2025], // Hardcodeado por ahora
      ultimaActualizacion: new Date().toISOString()
    }
  };
};

/**
 * Mapea evolución mensual de la API a tipos del frontend
 */
const mapearEvolucionMensual = (evolucion: any[]): VentasMensuales[] => {
  return evolucion.map(item => ({
    mes: item.mesAbreviado, // "ene", "feb", etc.
    ventas: item.ventas,
    ganancia: Math.round(item.ventas * 0.6) // Estimación 60%
  }));
};

/**
 * Mapea evolución diaria de la API a tipos del frontend
 */
const mapearEvolucionDiaria = (evolucion: any[]): VentasDiarias[] => {
  return evolucion.map(item => ({
    fecha: item.fecha, // "2025-03-01"
    ventas: item.ventas,
    ganancia: Math.round(item.ventas * 0.6) // Estimación 60%
  }));
};

/**
 * Mapea top productos de la API a tipos del frontend
 */
const mapearTopProductos = (productos: any[]): ProductoMasVendido[] => {
  return productos.map(prod => ({
    id: prod.id,
    nombre: prod.nombre,
    ventas: prod.unidadesVendidas,
    ganancia: prod.totalVentas // La API retorna el monto total como ganancia
  }));
};

/**
 * Mapea análisis de categorías de la API a tipos del frontend
 */
const mapearAnalisisCategorias = (categorias: any[]): VentasPorCategoria[] => {
  return categorias.map(cat => ({
    id: cat.id,
    nombre: cat.nombre,
    ventas: cat.productosUnicos, // Cantidad de productos únicos vendidos
    ganancia: cat.totalVentas, // Monto total en ventas
    porcentaje: cat.porcentaje
  }));
};

// ============================================================================
// FUNCIONES PRINCIPALES DEL SERVICIO
// ============================================================================

/**
 * Obtiene los datos completos del dashboard según los filtros aplicados
 * Endpoint: GET /api/dashboard/general
 */
export const getDashboardData = async (filtros: FiltrosDashboard): Promise<DashboardData> => {
  try {
    // Construir parámetros para la consulta (según la API del backend)
    const params = new URLSearchParams();
    params.append('year', filtros.año.toString());
    
    if (filtros.mes) {
      params.append('month', filtros.mes.toString());
    }

    const response = await dashboardClient.get(
      `/api/dashboard/general?${params.toString()}`
    );
    
    if (response.data.success) {
      return mapearDashboardGeneral(response.data.data);
    } else {
      throw new Error(response.data.message || 'Error al obtener datos del dashboard');
    }
  } catch (error) {
    console.error('Error en getDashboardData:', error);
    throw error;
  }
};

/**
 * Obtiene los años disponibles para datos históricos
 * Por ahora retorna un array hardcodeado, se puede implementar endpoint futuro
 */
export const getAniosDisponibles = async (): Promise<number[]> => {
  try {
    // TODO: Cuando exista endpoint en el backend, descomentar esto:
    // const authHeaders = getAuthHeaders();
    // const response = await dashboardClient.get('/api/dashboard/anios', { headers: authHeaders });
    // return response.data.data.anios;
    
    // Por ahora retornamos años hardcodeados
    return [2021, 2022, 2023, 2024, 2025];
  } catch (error) {
    console.error('Error en getAniosDisponibles:', error);
    throw error;
  }
};

/**
 * Obtiene los datos para el gráfico de evolución mensual de un año específico
 * Endpoint: GET /api/dashboard/ventas-periodo?year=XXXX&tipo=mensual
 */
export const getEvolucionMensual = async (año: number): Promise<DashboardData['graficos']['ventasMensuales']> => {
  try {
    const response = await dashboardClient.get(
      `/api/dashboard/ventas-periodo?year=${año}&tipo=mensual`
    );
    
    if (response.data.success) {
      return mapearEvolucionMensual(response.data.data.evolucion);
    } else {
      throw new Error(response.data.message || 'Error al obtener evolución mensual');
    }
  } catch (error) {
    console.error('Error en getEvolucionMensual:', error);
    throw error;
  }
};

/**
 * Obtiene los datos para el gráfico de evolución diaria de un mes específico
 * Endpoint: GET /api/dashboard/ventas-periodo?year=XXXX&month=XX&tipo=diario
 */
export const getEvolucionDiaria = async (año: number, mes: number): Promise<DashboardData['graficos']['ventasDiarias']> => {
  try {
    const response = await dashboardClient.get(
      `/api/dashboard/ventas-periodo?year=${año}&month=${mes}&tipo=diario`
    );
    
    if (response.data.success) {
      return mapearEvolucionDiaria(response.data.data.evolucion);
    } else {
      throw new Error(response.data.message || 'Error al obtener evolución diaria');
    }
  } catch (error) {
    console.error('Error en getEvolucionDiaria:', error);
    throw error;
  }
};

/**
 * Obtiene los N productos más vendidos
 * Endpoint: GET /api/dashboard/top-productos
 */
export const getTopProductos = async (año: number, mes?: number, limit: number = 10): Promise<ProductoMasVendido[]> => {
  try {
    const params = new URLSearchParams();
    params.append('year', año.toString());
    params.append('limit', limit.toString());
    
    if (mes) {
      params.append('month', mes.toString());
    }

    const response = await dashboardClient.get(
      `/api/dashboard/top-productos?${params.toString()}`
    );
    
    if (response.data.success) {
      return mapearTopProductos(response.data.data.productos);
    } else {
      throw new Error(response.data.message || 'Error al obtener top productos');
    }
  } catch (error) {
    console.error('Error en getTopProductos:', error);
    throw error;
  }
};

/**
 * Obtiene el análisis de ventas por categoría
 * Endpoint: GET /api/dashboard/analisis-categorias
 */
export const getAnalisisCategorias = async (año: number, mes?: number): Promise<VentasPorCategoria[]> => {
  try {
    const params = new URLSearchParams();
    params.append('year', año.toString());
    
    if (mes) {
      params.append('month', mes.toString());
    }

    const response = await dashboardClient.get(
      `/api/dashboard/analisis-categorias?${params.toString()}`
    );
    
    if (response.data.success) {
      return mapearAnalisisCategorias(response.data.data.categorias);
    } else {
      throw new Error(response.data.message || 'Error al obtener análisis de categorías');
    }
  } catch (error) {
    console.error('Error en getAnalisisCategorias:', error);
    throw error;
  }
};

/**
 * Obtiene los datos para comparar la evolución mensual entre dos años diferentes
 * Endpoint: GET /api/dashboard/comparativa-anual
 */
export const getDatosComparativos = async (añoBase: number, añoComparacion: number): Promise<{
  actual: DashboardData['graficos']['ventasMensuales'],
  anterior: DashboardData['graficos']['ventasMensuales']
}> => {
  try {
    const response = await dashboardClient.get(
      `/api/dashboard/comparativa-anual?year=${añoBase}&year_comparacion=${añoComparacion}`
    );
    
    if (response.data.success) {
      return {
        actual: mapearEvolucionMensual(response.data.data.evolucionYear1),
        anterior: mapearEvolucionMensual(response.data.data.evolucionYear2)
      };
    } else {
      throw new Error(response.data.message || 'Error al obtener datos comparativos');
    }
  } catch (error) {
    console.error('Error en getDatosComparativos:', error);
    // Fallback a datos simulados si la API falla
    return {
      actual: dashboardDataGenerator.generarDatosDashboard({ año: añoBase }).graficos.ventasMensuales,
      anterior: dashboardDataGenerator.generarDatosDashboard({ año: añoComparacion }).graficos.ventasMensuales
    };
  }
};

/**
 * Exporta datos del dashboard a CSV
 * Nota: Por ahora usa exportación del lado del cliente (ver dashboardExport.ts)
 * TODO: Implementar endpoint en backend si se desea exportación del servidor
 */
export const exportarDashboardCSV = async (filtros: FiltrosDashboard): Promise<Blob> => {
  try {
    // Construir parámetros para la consulta
    const params = new URLSearchParams();
    params.append('anio', filtros.año.toString());
    
    if (filtros.mes) {
      params.append('mes', filtros.mes.toString());
    }
    
    // tipoVenta y tipoPago eliminados - no soportados por API
    
    if (filtros.fechaInicio && filtros.fechaFin) {
      params.append('fechaInicio', filtros.fechaInicio);
      params.append('fechaFin', filtros.fechaFin);
    }

    const response = await dashboardClient.get(`/api/dashboard/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return new Blob([response.data], { type: 'text/csv' });
  } catch (error) {
    console.error('Error en exportarDashboardCSV:', error);
    throw error;
  }
};

/**
 * Mock data para desarrollo mientras no exista la API
 * Utiliza el generador de datos históricos para obtener datos consistentes
 */
export const getDashboardMockData = (filtros: FiltrosDashboard): DashboardData => {
  return dashboardDataGenerator.generarDatosDashboard(filtros);
};

// Interceptor para manejar errores de autenticación globalmente
dashboardClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si recibimos un 401 o 403, limpiar credenciales y disparar evento
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('admin-user');
      localStorage.removeItem('admin-password');
      window.dispatchEvent(new Event('auth-error'));
    }
    
    return Promise.reject(error);
  }
);

export default {
  getDashboardData,
  getAniosDisponibles,
  getEvolucionMensual,
  getEvolucionDiaria,
  getDatosComparativos,
  exportarDashboardCSV,
  getDashboardMockData,
  // Nuevas funciones añadidas en Fase 2
  getTopProductos,
  getAnalisisCategorias
};