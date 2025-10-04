import React, { useState, useEffect } from 'react';
import type { DashboardConfig, WidgetVisibility } from '../../types/dashboard';
import dashboardPreferences from '../../utils/dashboardPreferences';

interface DashboardPreferencesProps {
  show: boolean;
  onHide: () => void;
  onConfigChange: (newConfig: DashboardConfig) => void;
}

const widgetNames: Record<keyof WidgetVisibility, string> = {
  kpis: 'KPIs Principales',
  evolucionMensual: 'Evolución Mensual',
  evolucionDiaria: 'Evolución Diaria',
  productosMasVendidos: 'Productos Más Vendidos',
  distribucionVentas: 'Distribución de Ventas',
  categoriaDistribucion: 'Distribución por Categoría',
  distribucionCategorias: 'Distribución de Categorías',
  mapaCalorCategorias: 'Mapa de Calor de Categorías'
};

const DashboardPreferences: React.FC<DashboardPreferencesProps> = ({
  show,
  onHide,
  onConfigChange
}) => {
  const [config, setConfig] = useState<DashboardConfig>(dashboardPreferences.getDashboardConfig());

  // Efecto para cargar la configuración al montar el componente
  useEffect(() => {
    if (show) {
      setConfig(dashboardPreferences.getDashboardConfig());
    }
  }, [show]);

  // Manejador de cambio para visibilidad de widgets
  const handleWidgetVisibilityChange = (widgetId: keyof WidgetVisibility) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const isVisible = e.target.checked;
    const newConfig = {
      ...config,
      widgetVisibility: {
        ...config.widgetVisibility,
        [widgetId]: isVisible
      }
    };
    setConfig(newConfig);
  };

  // Manejador de cambio para modo oscuro
  const handleDarkModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isDarkMode = e.target.checked;
    setConfig({
      ...config,
      darkMode: isDarkMode
    });
  };

  // Manejador de cambio para comparación de periodos
  const handleComparacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    setConfig({
      ...config,
      periodosComparacion: {
        ...config.periodosComparacion,
        habilitado: isEnabled
      }
    });
  };

  // Manejador de cambio para el año base de comparación
  const handlePeriodoBaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const periodoBase = parseInt(e.target.value, 10);
    setConfig({
      ...config,
      periodosComparacion: {
        ...config.periodosComparacion,
        periodoBase
      }
    });
  };

  // Manejador de cambio para el año de comparación
  const handlePeriodoComparacionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const periodoComparacion = parseInt(e.target.value, 10);
    setConfig({
      ...config,
      periodosComparacion: {
        ...config.periodosComparacion,
        periodoComparacion
      }
    });
  };

  // Manejador de cambio para alertas
  const handleAlertaChange = (alertaId: keyof DashboardConfig['alertas']) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : parseInt(e.target.value, 10);
    setConfig({
      ...config,
      alertas: {
        ...config.alertas,
        [alertaId]: value
      }
    });
  };

  // Manejador para mover un widget hacia arriba en la lista
  const moveWidgetUp = (index: number) => {
    if (index === 0) return; // Ya está arriba
    
    const newOrder = [...config.ordenWidgets];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    
    setConfig({
      ...config,
      ordenWidgets: newOrder
    });
  };

  // Manejador para mover un widget hacia abajo en la lista
  const moveWidgetDown = (index: number) => {
    if (index === config.ordenWidgets.length - 1) return; // Ya está abajo
    
    const newOrder = [...config.ordenWidgets];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    
    setConfig({
      ...config,
      ordenWidgets: newOrder
    });
  };

  // Manejador para guardar cambios
  const handleSaveChanges = () => {
    dashboardPreferences.saveDashboardConfig(config);
    onConfigChange(config);
    onHide();
  };

  // Manejador para restablecer configuración predeterminada
  const handleResetConfig = () => {
    const defaultConfig = dashboardPreferences.resetConfig();
    setConfig(defaultConfig);
    onConfigChange(defaultConfig);
  };

  // Generamos años para los selectores
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (!show) return null;

  return (
    <div className="modal" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Personalizar Dashboard</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <div className="mb-4">
              <h5>Apariencia</h5>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="dark-mode-switch"
                  checked={config.darkMode}
                  onChange={handleDarkModeChange}
                />
                <label className="form-check-label" htmlFor="dark-mode-switch">
                  Modo oscuro
                </label>
              </div>
            </div>

            <div className="mb-4">
              <h5>Widgets visibles</h5>
              <div className="row">
                {Object.keys(config.widgetVisibility).map((widgetId) => (
                  <div className="col-md-6" key={widgetId}>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`widget-${widgetId}`}
                        checked={config.widgetVisibility[widgetId as keyof WidgetVisibility]}
                        onChange={handleWidgetVisibilityChange(widgetId as keyof WidgetVisibility)}
                      />
                      <label className="form-check-label" htmlFor={`widget-${widgetId}`}>
                        {widgetNames[widgetId as keyof WidgetVisibility]}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h5>Orden de widgets</h5>
              <div className="card">
                <div className="card-body">
                  <p className="text-muted small">Usa los botones para reordenar los widgets</p>
                  <ul className="list-group">
                    {config.ordenWidgets.map((widgetId, index) => (
                      <li key={widgetId} className="list-group-item d-flex justify-content-between align-items-center">
                        {widgetNames[widgetId as keyof WidgetVisibility]}
                        <div>
                          <button
                            className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => moveWidgetUp(index)}
                            disabled={index === 0}
                          >
                            <i className="bi bi-arrow-up"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => moveWidgetDown(index)}
                            disabled={index === config.ordenWidgets.length - 1}
                          >
                            <i className="bi bi-arrow-down"></i>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h5>Comparación de periodos</h5>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="comparacion-switch"
                  checked={config.periodosComparacion.habilitado}
                  onChange={handleComparacionChange}
                />
                <label className="form-check-label" htmlFor="comparacion-switch">
                  Habilitar comparación de periodos
                </label>
              </div>
              
              <div className="row mt-2">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="periodo-base" className="form-label">Periodo base</label>
                    <select
                      className="form-select"
                      id="periodo-base"
                      value={config.periodosComparacion.periodoBase}
                      onChange={handlePeriodoBaseChange}
                      disabled={!config.periodosComparacion.habilitado}
                    >
                      {availableYears.map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="periodo-comparacion" className="form-label">Periodo para comparar</label>
                    <select
                      className="form-select"
                      id="periodo-comparacion"
                      value={config.periodosComparacion.periodoComparacion}
                      onChange={handlePeriodoComparacionChange}
                      disabled={!config.periodosComparacion.habilitado}
                    >
                      {availableYears.map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h5>Alertas</h5>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="stock-bajo-switch"
                  checked={config.alertas.stockBajo}
                  onChange={handleAlertaChange('stockBajo')}
                />
                <label className="form-check-label" htmlFor="stock-bajo-switch">
                  Alertar de stock bajo
                </label>
              </div>
              
              <div className="mb-3 mt-2">
                <label htmlFor="umbral-stock-bajo" className="form-label">Umbral de stock bajo</label>
                <input
                  type="number"
                  className="form-control"
                  id="umbral-stock-bajo"
                  min="1"
                  max="100"
                  value={config.alertas.umbralStockBajo}
                  onChange={handleAlertaChange('umbralStockBajo')}
                  disabled={!config.alertas.stockBajo}
                />
                <div className="form-text text-muted">
                  Unidades mínimas antes de mostrar alerta
                </div>
              </div>
              
              <div className="form-check form-switch mt-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="tendencias-switch"
                  checked={config.alertas.tendenciasNegativas}
                  onChange={handleAlertaChange('tendenciasNegativas')}
                />
                <label className="form-check-label" htmlFor="tendencias-switch">
                  Alertar de tendencias negativas
                </label>
              </div>
              
              <div className="mb-3 mt-2">
                <label htmlFor="umbral-tendencia" className="form-label">Umbral de tendencia negativa (%)</label>
                <input
                  type="number"
                  className="form-control"
                  id="umbral-tendencia"
                  min="1"
                  max="100"
                  value={Math.abs(config.alertas.umbralTendenciaNegativa)}
                  onChange={handleAlertaChange('umbralTendenciaNegativa')}
                  disabled={!config.alertas.tendenciasNegativas}
                />
                <div className="form-text text-muted">
                  Porcentaje de caída antes de mostrar alerta
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-link text-danger" 
              onClick={handleResetConfig}
            >
              Restablecer configuración
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onHide}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSaveChanges}
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreferences;