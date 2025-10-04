/**
 * Tipos relacionados con el Dashboard
 */

// Tipos de venta
export type TipoVenta = 'online' | 'local' | 'todas';

// Tipos de pago
export type TipoPago = 'efectivo' | 'transferencia' | 'todas';

// Periodo de tiempo para filtrado
export type PeriodoTiempo = 'dia' | 'semana' | 'mes' | 'año' | 'personalizado';

// Widgets disponibles en el dashboard
export type WidgetId = 'kpis' | 'evolucionMensual' | 'evolucionDiaria' | 'productosMasVendidos' | 
  'distribucionVentas' | 'categoriaDistribucion' | 'distribucionCategorias' | 'mapaCalorCategorias';

// Configuración de visibilidad de widgets
export interface WidgetVisibility {
  kpis: boolean;
  evolucionMensual: boolean;
  evolucionDiaria: boolean;
  productosMasVendidos: boolean;
  distribucionVentas: boolean;
  categoriaDistribucion: boolean;
  distribucionCategorias: boolean;
  mapaCalorCategorias: boolean;
}

// Configuración para comparación de periodos
export interface PeriodosComparacion {
  habilitado: boolean;
  periodoBase: number; // año base (actual)
  periodoComparacion: number; // año para comparar (anterior)
}

// Configuración para alertas
export interface ConfiguracionAlertas {
  stockBajo: boolean;
  umbralStockBajo: number;
  tendenciasNegativas: boolean;
  umbralTendenciaNegativa: number; // porcentaje
}

// Configuración completa del dashboard guardada en localStorage
export interface DashboardConfig {
  widgetVisibility: WidgetVisibility;
  darkMode: boolean;
  ordenWidgets: string[];
  periodosComparacion: PeriodosComparacion;
  alertas: ConfiguracionAlertas;
}

// Datos para KPI de ventas
export interface VentasKPI {
  totalVentas: number;
  gananciaTotal: number;
  porcentajeGanancia: number;
  comparativaAnterior: number; // Porcentaje de cambio respecto al periodo anterior
}

// Datos para KPI de productos
export interface ProductosKPI {
  productoTop: {
    id: number;
    nombre: string;
    ventas: number;
    monto: number;
  };
  categoriaTop: {
    id: number;
    nombre: string;
    ventas: number;
    monto: number;
  };
}

// Datos para gráfico de evolución mensual
export interface VentasMensuales {
  mes: string;
  ventas: number;
  ganancia: number;
}

// Datos para gráfico de evolución diaria
export interface VentasDiarias {
  fecha: string;
  ventas: number;
  ganancia: number;
}

// Datos para gráfico de productos más vendidos
export interface ProductoMasVendido {
  id: number;
  nombre: string;
  ventas: number;
  ganancia: number;
}

// Datos para gráficos de distribución
export interface DistribucionVentas {
  porTipo: {
    online: number;
    local: number;
  };
  porPago: {
    efectivo: number;
    transferencia: number;
  };
}

// Datos para gráfico de categorías
export interface VentasPorCategoria {
  id: number;
  nombre: string;
  ventas: number;
  ganancia: number;
  porcentaje: number;
}

// Filtros para el dashboard
export interface FiltrosDashboard {
  año: number;
  mes?: number;
  tipoVenta?: TipoVenta; // ⚠️ Deprecated - No soportado por API
  tipoPago?: TipoPago; // ⚠️ Deprecated - No soportado por API
  fechaInicio?: string;
  fechaFin?: string;
}

// Respuesta completa del API para dashboard
export interface DashboardData {
  kpis: {
    ventas: VentasKPI;
    productos: ProductosKPI;
  };
  graficos: {
    ventasMensuales: VentasMensuales[];
    ventasDiarias: VentasDiarias[];
    productosMasVendidos: ProductoMasVendido[];
    distribucion?: DistribucionVentas; // ⚠️ Opcional - será eliminado (no soportado por API)
    categorias: VentasPorCategoria[];
  };
  metadata: {
    añosDisponibles: number[];
    ultimaActualizacion: string;
  };
}

// Respuesta del endpoint de Dashboard
export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  message: string;
}

// ============================================================================
// TIPOS ESPECÍFICOS DE LA API - Para mayor type-safety (opcional)
// ============================================================================

/**
 * Respuesta del endpoint GET /api/dashboard/general
 * Diferencias con frontend:
 * - API usa 'ventasTotales' → Frontend usa 'totalVentas'
 * - API usa 'unidadesVendidas' → Frontend lo mapea a 'ventas'
 * - API no retorna 'ganancia' → Frontend lo calcula (60% estimado)
 */
export interface APIDashboardGeneral {
  success: boolean;
  message: string;
  data: {
    periodo: {
      year: number;
      month: string | number;
      mesNombre: string;
    };
    metricas: {
      ventasTotales: number;
      totalOrdenes: number;
      promedioOrden: number;
      productoTop: {
        id: number;
        nombre: string;
        imagen_url: string;
        totalVentas: number;
        unidadesVendidas: number;
      };
      categoriaTop: {
        id: number;
        nombre: string;
        totalVentas: number;
      };
    };
  };
}

/**
 * Respuesta del endpoint GET /api/dashboard/ventas-periodo
 * Puede retornar evolución mensual o diaria según parámetro 'tipo'
 */
export interface APIVentasPeriodo {
  success: boolean;
  message: string;
  data: {
    periodo: {
      year: number;
      month: string | number;
      tipo: 'mensual' | 'diario';
      mesNombre: string | null;
    };
    resumen: {
      totalVentas: number;
      totalOrdenes: number;
      promedioOrden: number;
    };
    evolucion: Array<{
      // Campos para tipo 'mensual'
      mes?: number;
      mesNombre?: string;
      mesAbreviado?: string;
      // Campos para tipo 'diario'
      dia?: number;
      fecha?: string;
      // Campos comunes
      ventas: number;
      ordenes: number;
      promedioOrden?: number;
    }>;
  };
}

/**
 * Respuesta del endpoint GET /api/dashboard/comparativa-anual
 */
export interface APIComparativaAnual {
  success: boolean;
  message: string;
  data: {
    periodo: {
      yearBase: number;
      yearComparacion: number;
    };
    resumen: {
      ventasYear1: number;
      ventasYear2: number;
      crecimiento: number;
      diferencia: number;
    };
    evolucionYear1: Array<{
      mes: number;
      mesNombre: string;
      mesAbreviado: string;
      ventas: number;
      ordenes: number;
      promedioOrden: number;
    }>;
    evolucionYear2: Array<{
      mes: number;
      mesNombre: string;
      mesAbreviado: string;
      ventas: number;
      ordenes: number;
      promedioOrden: number;
    }>;
    analisisMensual: Array<{
      mes: number;
      mesNombre: string;
      mesAbreviado: string;
      ventasYear1: number;
      ventasYear2: number;
      diferencia: number;
      crecimientoMes: number;
    }>;
  };
}

/**
 * Respuesta del endpoint GET /api/dashboard/top-productos
 */
export interface APITopProductos {
  success: boolean;
  message: string;
  data: {
    periodo: {
      year: number;
      month: string | number;
      mesNombre: string;
    };
    resumen: {
      totalVentas: number;
      totalUnidades: number;
      productosAnalizados: number;
      limite: number;
    };
    productos: Array<{
      id: number;
      nombre: string;
      imagen_url: string;
      precioActual: number;
      totalVentas: number;
      unidadesVendidas: number;
      precioPromedio: number;
      porcentajeDelTotal: number;
      porcentajeAcumulado: number;
      posicion: number;
    }>;
  };
}

/**
 * Respuesta del endpoint GET /api/dashboard/analisis-categorias
 */
export interface APIAnalisisCategorias {
  success: boolean;
  message: string;
  data: {
    periodo: {
      year: number;
      month: string | number;
      mesNombre: string;
    };
    resumen: {
      totalVentas: number;
      categoriasConVentas: number;
      totalProductosUnicos: number;
    };
    categorias: Array<{
      id: number;
      nombre: string;
      totalVentas: number;
      productosUnicos: number;
      porcentaje: number;
    }>;
  };
}