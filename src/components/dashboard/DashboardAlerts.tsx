import React, { useState, useEffect } from 'react';
import type { DashboardConfig, ProductoMasVendido, VentasMensuales, VentasPorCategoria } from '../../types/dashboard';

interface AlertNotificationType {
  id: string;
  tipo: 'stockBajo' | 'tendenciaNegativa' | 'anomalia';
  mensaje: string;
  detalle: string;
  fecha: Date;
  leido: boolean;
  severidad: 'alta' | 'media' | 'baja';
  icono: string;
}

interface DashboardAlertProps {
  config: DashboardConfig;
  productos: ProductoMasVendido[];
  ventasMensuales: VentasMensuales[];
  categorias: VentasPorCategoria[];
}

const DashboardAlerts: React.FC<DashboardAlertProps> = ({ 
  config, 
  productos, 
  ventasMensuales,
  categorias 
}) => {
  const [alertas, setAlertas] = useState<AlertNotificationType[]>([]);
  const [mostrarAlertas, setMostrarAlertas] = useState<boolean>(false);

  // Función para generar alertas basadas en los datos y la configuración
  useEffect(() => {
    if (!config.alertas) return;
    
    const nuevasAlertas: AlertNotificationType[] = [];
    
    // Verificar alertas de stock bajo si está habilitado
    if (config.alertas.stockBajo) {
      const umbralStock = config.alertas.umbralStockBajo;
      
      // Simulamos datos de stock para productos
      const productosConStock = productos
        .map(prod => {
          // Simulamos que el stock es un número aleatorio entre 1 y 30
          const stockSimulado = Math.floor(Math.random() * 30) + 1;
          return { ...prod, stock: stockSimulado };
        })
        .filter(prod => prod.stock < umbralStock)
        .slice(0, 3); // Limitamos a máximo 3 alertas
      
      productosConStock.forEach(producto => {
        nuevasAlertas.push({
          id: `stock-${producto.id}`,
          tipo: 'stockBajo',
          mensaje: `Stock bajo para ${producto.nombre}`,
          detalle: `El stock actual está por debajo del umbral de ${umbralStock} unidades.`,
          fecha: new Date(),
          leido: false,
          severidad: 'alta',
          icono: 'bi-exclamation-triangle-fill'
        });
      });
    }
    
    // Verificar tendencias negativas si está habilitado
    if (config.alertas.tendenciasNegativas) {
      const umbralTendencia = Math.abs(config.alertas.umbralTendenciaNegativa);
      
      // Análisis de tendencias mensuales
      if (ventasMensuales.length > 2) {
        const ultimoMes = ventasMensuales[ventasMensuales.length - 1];
        const penultimoMes = ventasMensuales[ventasMensuales.length - 2];
        
        if (penultimoMes.ventas > 0) {
          const variacionPorcentual = ((ultimoMes.ventas - penultimoMes.ventas) / penultimoMes.ventas) * 100;
          
          if (variacionPorcentual < -umbralTendencia) {
            nuevasAlertas.push({
              id: `tendencia-mensual-${Date.now()}`,
              tipo: 'tendenciaNegativa',
              mensaje: `Caída en ventas mensuales`,
              detalle: `Las ventas han disminuido un ${Math.abs(variacionPorcentual).toFixed(2)}% respecto al mes anterior.`,
              fecha: new Date(),
              leido: false,
              severidad: 'media',
              icono: 'bi-graph-down'
            });
          }
        }
      }
      
      // Análisis de tendencias por categoría
      categorias.forEach(categoria => {
        // Simulamos una tendencia aleatoria para algunas categorías
        if (Math.random() > 0.7) {
          const variacion = -(Math.random() * 20 + umbralTendencia);
          
          if (variacion < -umbralTendencia) {
            nuevasAlertas.push({
              id: `tendencia-cat-${categoria.id}`,
              tipo: 'tendenciaNegativa',
              mensaje: `Tendencia negativa en ${categoria.nombre}`,
              detalle: `La categoría ha experimentado una caída del ${Math.abs(variacion).toFixed(2)}% en ventas.`,
              fecha: new Date(),
              leido: false,
              severidad: 'media',
              icono: 'bi-graph-down'
            });
          }
        }
      });
      
      // Detección de anomalías
      const datosAtipicos = ventasMensuales.filter(mes => {
        // Simulamos detección simple de valores atípicos
        const medianaVentas = calcularMediana(ventasMensuales.map(m => m.ventas));
        const desviacion = Math.abs(mes.ventas - medianaVentas) / medianaVentas;
        return desviacion > 0.5; // Más de 50% de desviación respecto a la mediana
      });
      
      datosAtipicos.forEach(mes => {
        nuevasAlertas.push({
          id: `anomalia-${mes.mes}`,
          tipo: 'anomalia',
          mensaje: `Anomalía detectada en ${mes.mes}`,
          detalle: `Se ha detectado un valor atípico en las ventas de este periodo.`,
          fecha: new Date(),
          leido: false,
          severidad: 'baja',
          icono: 'bi-question-diamond-fill'
        });
      });
    }
    
    setAlertas(nuevasAlertas);
  }, [config.alertas, productos, ventasMensuales, categorias]);

  // Función para calcular la mediana de un conjunto de números
  const calcularMediana = (numeros: number[]): number => {
    if (numeros.length === 0) return 0;
    
    const ordenados = [...numeros].sort((a, b) => a - b);
    const mitad = Math.floor(ordenados.length / 2);
    
    return ordenados.length % 2 !== 0
      ? ordenados[mitad]
      : (ordenados[mitad - 1] + ordenados[mitad]) / 2;
  };

  // Función para marcar una alerta como leída
  const marcarLeida = (id: string) => {
    setAlertas(prevAlertas => 
      prevAlertas.map(alerta => 
        alerta.id === id ? {...alerta, leido: true} : alerta
      )
    );
  };

  // Filtrar alertas no leídas
  const alertasNoLeidas = alertas.filter(alerta => !alerta.leido);

  return (
    <>
      <div className="position-fixed top-0 end-0 m-3" style={{ zIndex: 1050 }}>
        <button 
          className="btn btn-outline-light position-relative" 
          onClick={() => setMostrarAlertas(!mostrarAlertas)}
        >
          <i className="bi bi-bell-fill"></i>
          {alertasNoLeidas.length > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {alertasNoLeidas.length}
              <span className="visually-hidden">alertas no leídas</span>
            </span>
          )}
        </button>
      </div>
      
      {mostrarAlertas && (
        <div 
          className="position-fixed top-0 end-0 mt-5 me-3 alert-container" 
          style={{ 
            width: '400px', 
            maxWidth: '90vw', 
            maxHeight: '80vh', 
            overflowY: 'auto',
            zIndex: 1040,
            backgroundColor: '#1f3f49', 
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
            <h5 className="m-0">Alertas y Notificaciones</h5>
            <button 
              className="btn-close btn-close-white" 
              onClick={() => setMostrarAlertas(false)}
              aria-label="Cerrar"
            ></button>
          </div>
          <div className="p-2">
            {alertas.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-check-circle fs-1"></i>
                <p className="mt-2">No hay alertas activas</p>
              </div>
            ) : (
              alertas.map(alerta => (
                <div 
                  key={alerta.id} 
                  className={`alert alert-dismissible mb-2 ${
                    alerta.severidad === 'alta' ? 'alert-danger' : 
                    alerta.severidad === 'media' ? 'alert-warning' : 'alert-info'
                  } ${!alerta.leido ? 'border-start border-5' : ''}`}
                  style={{
                    opacity: alerta.leido ? 0.7 : 1,
                  }}
                >
                  <div className="d-flex align-items-start">
                    <div className="me-2">
                      <i className={`bi ${alerta.icono} fs-4`}></i>
                    </div>
                    <div>
                      <div className="fw-bold">{alerta.mensaje}</div>
                      <div className="small text-muted">
                        {alerta.detalle}
                      </div>
                      <div className="mt-1 small text-muted">
                        {alerta.fecha.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => marcarLeida(alerta.id)}
                    aria-label="Marcar como leído"
                  ></button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardAlerts;