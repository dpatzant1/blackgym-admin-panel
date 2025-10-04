import { useEffect, useState, useMemo, useCallback, lazy, Suspense, useRef } from 'react';
import type { DashboardData, FiltrosDashboard } from '../types';
import dashboardService from '../services/dashboardService';
import dashboardExport from '../utils/dashboardExport';
import dashboardAccessibility from '../utils/dashboardAccessibility';
import dashboardPreferences from '../utils/dashboardPreferences';

// Colores de la paleta para gráficos
const colorPalette = ['#4cb5f5', '#b3c100', '#6ab187', '#1f3f49', '#d32d42', '#ced2cc', '#23282d'];

// Componentes del dashboard - Importamos solo los esenciales inmediatamente
import { DashboardHeader, KPISection } from '../components/dashboard';

// Lazy loading para componentes más pesados
const EvolucionMensual = lazy(() => import('../components/dashboard/EvolucionMensual'));
const EvolucionDiaria = lazy(() => import('../components/dashboard/EvolucionDiaria'));
const ProductosChart = lazy(() => import('../components/dashboard/ProductosChart'));
// DistribucionVentas eliminado - No soportado por API
const CategoriaDistribucion = lazy(() => import('../components/dashboard/CategoriaDistribucion'));
const DistribucionCategorias = lazy(() => import('../components/dashboard/DistribucionCategorias'));
const ProductosMasVendidos = lazy(() => import('../components/dashboard/ProductosMasVendidos'));
const MapaCalorCategorias = lazy(() => import('../components/dashboard/MapaCalorCategorias'));
const ComparativaAnual = lazy(() => import('../components/dashboard/ComparativaAnual'));
const DashboardPreferences = lazy(() => import('../components/dashboard/DashboardPreferences'));
// Comentamos temporalmente la importación de DashboardAlerts hasta resolver el problema
// const DashboardAlerts = lazy(() => import('../components/dashboard/DashboardAlerts'));

// Funciones para asignar colores coherentes a elementos
const getColorForCategory = (id: number): string => {
  return colorPalette[(id - 1) % colorPalette.length];
};

const getColorForProduct = (index: number): string => {
  return colorPalette[index % colorPalette.length];
};

// Función para determinar el rendimiento de una categoría basado en su porcentaje
const getRendimientoCategoria = (porcentaje: number): 'excelente' | 'bueno' | 'promedio' | 'bajo' | 'crítico' => {
  if (porcentaje >= 30) return 'excelente';
  if (porcentaje >= 20) return 'bueno';
  if (porcentaje >= 15) return 'promedio';
  if (porcentaje >= 10) return 'bajo';
  return 'crítico';
};

const DashboardPage: React.FC = () => {
  // Referencia al contenedor del dashboard para accesibilidad
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  // Estado para datos del dashboard
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Datos para comparativa anual
  const [datosComparativos, setDatosComparativos] = useState<{
    actual: DashboardData['graficos']['ventasMensuales'],
    anterior: DashboardData['graficos']['ventasMensuales']
  } | null>(null);
  
  // Estado para filtros
  const [filtros, setFiltros] = useState<FiltrosDashboard>({
    año: new Date().getFullYear()
    // tipoVenta y tipoPago eliminados - no soportados por API
  });
  
  // Estado para preferencias y modal
  const [dashboardConfig, setDashboardConfig] = useState(dashboardPreferences.getDashboardConfig());
  const [showPreferences, setShowPreferences] = useState(false);

  // Cargar datos del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // ✅ Llamadas en paralelo para optimizar la carga
        const [
          datosGenerales,
          evolucionMensual,
          topProductos,
          analisisCategorias
        ] = await Promise.all([
          dashboardService.getDashboardData(filtros),
          dashboardService.getEvolucionMensual(filtros.año),
          dashboardService.getTopProductos(filtros.año, filtros.mes, 10),
          dashboardService.getAnalisisCategorias(filtros.año, filtros.mes)
        ]);
        
        // Combinar todos los datos en una estructura completa
        const datosCompletos: DashboardData = {
          ...datosGenerales,
          graficos: {
            ...datosGenerales.graficos,
            ventasMensuales: evolucionMensual,
            productosMasVendidos: topProductos,
            categorias: analisisCategorias
          }
        };
        
        setDashboardData(datosCompletos);
      } catch (err) {
        setError('Error al cargar los datos del dashboard. Verifica tu conexión con el servidor.');
        console.error('Error en fetchDashboardData:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [filtros]);
  
  // Cargar evolución diaria cuando hay mes seleccionado
  useEffect(() => {
    const fetchEvolucionDiaria = async () => {
      if (!filtros.mes) return;
      
      try {
        const evolucionDiaria = await dashboardService.getEvolucionDiaria(
          filtros.año, 
          filtros.mes
        );
        
        setDashboardData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            graficos: {
              ...prev.graficos,
              ventasDiarias: evolucionDiaria
            }
          };
        });
      } catch (err) {
        console.error('Error al cargar evolución diaria:', err);
        // No bloqueamos el dashboard por error en datos diarios
      }
    };
    
    fetchEvolucionDiaria();
  }, [filtros.mes, filtros.año]);
  
  // Cargar datos comparativos
  useEffect(() => {
    const fetchComparativeData = async () => {
      if (!dashboardConfig.periodosComparacion.habilitado) {
        setDatosComparativos(null);
        return;
      }
      
      try {
        const { periodoBase, periodoComparacion } = dashboardConfig.periodosComparacion;
        
        // Obtenemos datos comparativos
        const datosComp = await dashboardService.getDatosComparativos(
          periodoBase, 
          periodoComparacion
        );
        
        setDatosComparativos(datosComp);
      } catch (err) {
        console.error('Error al cargar datos comparativos:', err);
        // Deshabilitar comparativa si falla (no bloqueamos todo el dashboard)
        setDatosComparativos(null);
      }
    };
    
    fetchComparativeData();
  }, [dashboardConfig.periodosComparacion]);
  
  // Efecto para mejorar la accesibilidad después de renderizar
  useEffect(() => {
    if (!loading && dashboardData && dashboardRef.current) {
      // Pequeño timeout para asegurar que los gráficos ya estén renderizados
      const timeoutId = setTimeout(() => {
        dashboardAccessibility.enhanceDashboardAccessibility();
        dashboardAccessibility.setupKeyboardNavigation();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading, dashboardData]);

  // Manejador para cambios en los filtros - optimizado con useCallback
  const handleFiltroChange = useCallback((nuevosFiltros: Partial<FiltrosDashboard>) => {
    setFiltros(prevFiltros => ({ ...prevFiltros, ...nuevosFiltros }));
  }, []);

  // Cálculos optimizados con useMemo para evitar recalculos en rerenders
  // IMPORTANTE: Los hooks deben llamarse antes de cualquier return condicional
  const distribucionCategoriasData = useMemo(() => 
    dashboardData?.graficos.categorias.map(cat => ({
      nombre: cat.nombre,
      valor: cat.porcentaje,
      color: getColorForCategory(cat.id)
    })) || [], 
  [dashboardData?.graficos.categorias]);

  const productosMasVendidosData = useMemo(() => 
    dashboardData?.graficos.productosMasVendidos.map((prod, index) => ({
      nombre: prod.nombre,
      valor: prod.ventas,
      color: getColorForProduct(index)
    })) || [], 
  [dashboardData?.graficos.productosMasVendidos]);

  const mapaCalorData = useMemo(() => 
    dashboardData?.graficos.categorias.map(cat => ({
      name: cat.nombre,
      size: cat.porcentaje,
      value: cat.ganancia,
      percentGrowth: Math.round((Math.random() * 30) - 10), // Simulamos datos de crecimiento
      performance: getRendimientoCategoria(cat.porcentaje)
    })) || [], 
  [dashboardData?.graficos.categorias]);

  // Renderizado fallback para Suspense
  const renderLoader = () => (
    <div className="card shadow h-100">
      <div className="card-body d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando gráfico...</span>
        </div>
      </div>
    </div>
  );

  // Funciones de exportación optimizadas
  const handleExportCSV = useCallback(() => {
    if (!dashboardData) return;
    
    // Generar nombre de archivo con fecha y filtros
    const date = new Date().toISOString().slice(0, 10);
    const filename = `dashboard_${date}_${filtros.año}${filtros.mes ? '_' + filtros.mes : ''}.csv`;
    
    // Crear string con filtros aplicados para el reporte
    const filtrosStr = `Año: ${filtros.año}${filtros.mes ? ', Mes: ' + filtros.mes : ''}`;
    
    dashboardExport.exportDetailedCSV(dashboardData, filtrosStr, filename);
  }, [dashboardData, filtros]);
  
  const handleCaptureScreenshot = useCallback(async () => {
    try {
      const date = new Date().toISOString().slice(0, 10);
      const filename = `dashboard_captura_${date}.png`;
      
      await dashboardExport.captureScreenshot('dashboard-container', filename);
    } catch (err) {
      console.error('Error al capturar imagen:', err);
      alert('No se pudo capturar la imagen del dashboard. Asegúrese de tener la librería html2canvas instalada.');
    }
  }, []);
  
  // Manejador para actualizar la configuración desde el modal de preferencias
  const handleConfigChange = useCallback((newConfig: typeof dashboardConfig) => {
    setDashboardConfig(newConfig);
    
    // Si cambia el modo oscuro, actualizamos la apariencia
    const isDarkMode = newConfig.darkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    
    // Si cambia la configuración de comparación de periodos, actualizamos los filtros
    if (newConfig.periodosComparacion.habilitado) {
      setFiltros(prev => ({
        ...prev,
        año: newConfig.periodosComparacion.periodoBase
      }));
    }
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Error al cargar dashboard
          </h4>
          <p>{error || 'No se pudieron cargar los datos del dashboard'}</p>
          <hr />
          <button 
            className="btn btn-outline-danger"
            onClick={() => window.location.reload()}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="dashboard-container" 
      ref={dashboardRef}
      className={`dashboard ${dashboardConfig.darkMode ? 'dark-theme' : 'light-theme'}`}
      role="region"
      aria-label="Panel de control de ventas"
      style={{ 
        backgroundColor: dashboardConfig.darkMode ? '#23282d' : '#ffffff', 
        color: dashboardConfig.darkMode ? 'white' : '#333333', 
        padding: '20px' 
      }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <DashboardHeader 
            filtros={filtros} 
            onFiltroChange={handleFiltroChange} 
            añosDisponibles={dashboardData.metadata.añosDisponibles} 
          />
        </div>
        <div className="d-flex align-items-center">
          <div className="export-options me-2">
            <button 
              onClick={handleExportCSV}
              className="btn btn-sm btn-outline-light me-2"
              aria-label="Exportar datos a CSV"
              title="Exportar datos a CSV"
            >
              <i className="bi bi-file-earmark-spreadsheet me-1"></i>
              Exportar CSV
            </button>
            
            <button 
              onClick={handleCaptureScreenshot}
              className="btn btn-sm btn-outline-light me-2"
              aria-label="Capturar imagen del dashboard"
              title="Capturar imagen del dashboard"
            >
              <i className="bi bi-camera me-1"></i>
              Captura
            </button>
          </div>
          
          <button
            onClick={() => setShowPreferences(true)}
            className="btn btn-sm btn-outline-light"
            aria-label="Personalizar dashboard"
            title="Personalizar dashboard"
          >
            <i className="bi bi-gear me-1"></i>
            Personalizar
          </button>
        </div>
      </div>
      
      {/* Alertas del Dashboard - Comentado temporalmente hasta resolver el problema de importación */}
      {/* {dashboardData && (
        <Suspense fallback={<div>Cargando alertas...</div>}>
          <DashboardAlerts
            config={dashboardConfig}
            productos={dashboardData.graficos.productosMasVendidos}
            ventasMensuales={dashboardData.graficos.ventasMensuales}
            categorias={dashboardData.graficos.categorias}
          />
        </Suspense>
      )} */}
      
      <div className="row mb-4">
        <div className="col-12">
          <KPISection 
            ventasKPI={dashboardData.kpis.ventas} 
            productosKPI={dashboardData.kpis.productos} 
          />
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-lg-8 mb-4 mb-lg-0">
          <Suspense fallback={renderLoader()}>
            <EvolucionMensual ventasMensuales={dashboardData.graficos.ventasMensuales} />
          </Suspense>
        </div>
        <div className="col-lg-4">
          <Suspense fallback={renderLoader()}>
            <ProductosChart productos={dashboardData.graficos.productosMasVendidos} />
          </Suspense>
        </div>
      </div>
      
      {/* Evolución Diaria - Solo se muestra si hay mes seleccionado */}
      {filtros.mes ? (
        <div className="row mb-4" style={{ display: 'none' }}>
          <div className="col-12">
            <Suspense fallback={renderLoader()}>
              <EvolucionDiaria ventasDiarias={dashboardData.graficos.ventasDiarias} />
            </Suspense>
          </div>
        </div>
      ) : (
        <div className="row mb-4" style={{ display: 'none' }}>
          <div className="col-12">
            <div className="card shadow">
              <div className="card-body text-center py-5">
                <i className="bi bi-calendar3 text-muted" style={{ fontSize: '48px' }}></i>
                <h5 className="mt-3 text-muted">Evolución Diaria</h5>
                <p className="text-muted mb-0">
                  Selecciona un mes específico en los filtros superiores para ver la evolución diaria de ventas
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Comparativa Anual - Solo se muestra si está habilitada en la configuración */}
      {dashboardConfig.periodosComparacion.habilitado && datosComparativos && (
        <div className="row mb-4">
          <div className="col-12">
            <Suspense fallback={renderLoader()}>
              <ComparativaAnual
                datosActuales={datosComparativos.actual}
                datosAnteriores={datosComparativos.anterior}
                titulo="Comparativa Anual de Ventas"
                periodoActual={dashboardConfig.periodosComparacion.periodoBase}
                periodoAnterior={dashboardConfig.periodosComparacion.periodoComparacion}
              />
            </Suspense>
          </div>
        </div>
      )}
      
      <div className="row mb-4">
        <div className="col-12">
          <Suspense fallback={renderLoader()}>
            <CategoriaDistribucion categorias={dashboardData.graficos.categorias} />
          </Suspense>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-lg-6 mb-4 mb-lg-0">
          <Suspense fallback={renderLoader()}>
            <DistribucionCategorias 
              datos={distribucionCategoriasData} 
              titulo="Distribución de Ventas por Categoría" 
            />
          </Suspense>
        </div>
        <div className="col-lg-6">
          <Suspense fallback={renderLoader()}>
            <ProductosMasVendidos 
              datos={productosMasVendidosData}
              titulo="Top 5 Productos Más Vendidos" 
            />
          </Suspense>
        </div>
      </div>
      
      <div className="row">
        <div className="col-12">
          <Suspense fallback={renderLoader()}>
            <MapaCalorCategorias 
              datos={mapaCalorData}
              titulo="Mapa de Calor por Rendimiento de Categorías"
            />
          </Suspense>
        </div>
      </div>
      
      {/* Modal de preferencias - Solo lo renderizamos cuando se muestre */}
      {showPreferences && (
        <Suspense fallback={<div>Cargando preferencias...</div>}>
          <DashboardPreferences
            show={showPreferences}
            onHide={() => setShowPreferences(false)}
            onConfigChange={handleConfigChange}
          />
        </Suspense>
      )}
    </div>
  );
};

export default DashboardPage;