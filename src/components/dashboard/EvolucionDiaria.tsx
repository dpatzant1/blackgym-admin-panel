import { useState, useEffect, useRef } from 'react';
import type { VentasDiarias } from '../../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Brush,
  ReferenceArea
} from 'recharts';

interface EvolucionDiariaProps {
  ventasDiarias: VentasDiarias[];
}

// Componente personalizado para el tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ 
        backgroundColor: '#23282d',
        padding: '10px',
        border: '1px solid #ced2cc',
        borderRadius: '5px'
      }}>
        <p className="label" style={{ color: '#ced2cc', marginBottom: '5px' }}>{`${label}`}</p>
        <p style={{ color: '#4cb5f5', margin: 0 }}>
          <span>Ventas: </span>
          <span style={{ fontWeight: 'bold' }}>
            {new Intl.NumberFormat('es-GT', {
              style: 'currency',
              currency: 'GTQ',
              maximumFractionDigits: 2
            }).format(payload[0].value)}
          </span>
        </p>
        <p style={{ color: '#6ab187', margin: 0 }}>
          <span>Ganancia: </span>
          <span style={{ fontWeight: 'bold' }}>
            {new Intl.NumberFormat('es-GT', {
              style: 'currency',
              currency: 'GTQ',
              maximumFractionDigits: 2
            }).format(payload[1].value)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const EvolucionDiaria: React.FC<EvolucionDiariaProps> = ({ ventasDiarias }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [animate, setAnimate] = useState<boolean>(false);
  const [zoomState, setZoomState] = useState<{ startIndex: number | null; endIndex: number | null }>({
    startIndex: null,
    endIndex: null
  });
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const chartRef = useRef<any>(null);

  // Formateador para mostrar valores en miles (K)
  const formatYAxis = (value: number) => {
    return `${value/1000}K`;
  };

  // Función para formatear fecha para el gráfico
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.getDate().toString();
  };

  // Aplicar animación después del montaje
  useEffect(() => {
    // Activar animación después del montaje
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);

    // Preparar datos para el gráfico
    const formattedData = ventasDiarias.map(item => ({
      fecha: formatDate(item.fecha),
      fechaCompleta: item.fecha,
      ventas: animate ? item.ventas : 0,
      ganancia: animate ? item.ganancia : 0
    }));
    
    setChartData(formattedData);

    return () => {
      clearTimeout(timer);
    };
  }, [ventasDiarias, animate]);

  // Funciones para el zoom
  const handleMouseDown = (e: any) => {
    if (e && e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
    }
  };

  const handleMouseMove = (e: any) => {
    if (refAreaLeft && e && e.activeLabel) {
      setRefAreaRight(e.activeLabel);
    }
  };

  const handleMouseUp = () => {
    if (refAreaLeft && refAreaRight) {
      // Asegurarse de que refAreaLeft sea menor que refAreaRight
      let left = parseInt(refAreaLeft);
      let right = parseInt(refAreaRight);
      
      if (left > right) {
        [left, right] = [right, left];
      }
      
      const startIndex = chartData.findIndex(item => parseInt(item.fecha) === left);
      const endIndex = chartData.findIndex(item => parseInt(item.fecha) === right);
      
      if (startIndex !== -1 && endIndex !== -1 && startIndex !== endIndex) {
        setZoomState({ startIndex, endIndex });
      }
    }
    
    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  const handleResetZoom = () => {
    setZoomState({ startIndex: null, endIndex: null });
  };

  // Preparar datos para el gráfico considerando el zoom
  const displayData = zoomState.startIndex !== null && zoomState.endIndex !== null
    ? chartData.slice(zoomState.startIndex, zoomState.endIndex + 1)
    : chartData;

  // Determinar el título del gráfico (mes y año)
  const getTitleDate = () => {
    if (ventasDiarias.length === 0) return 'Evolución Diaria';
    
    const fecha = new Date(ventasDiarias[0].fecha);
    return `${fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
  };

  return (
    <div className="card h-100" style={{ backgroundColor: '#1f3f49', borderRadius: '10px', border: 'none' }}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title m-0" style={{ color: '#b3c100' }}>
            <i className="bi bi-calendar-day me-2"></i> EVOLUCIÓN DIARIA
          </h5>
          {zoomState.startIndex !== null && (
            <button
              className="btn btn-sm"
              style={{ backgroundColor: '#4cb5f5', color: 'white' }}
              onClick={handleResetZoom}
            >
              <i className="bi bi-zoom-out me-1"></i> Reset Zoom
            </button>
          )}
        </div>
        
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              ref={chartRef}
              data={displayData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ced2cc" opacity={0.2} />
              <XAxis 
                dataKey="fecha" 
                tick={{ fill: '#ced2cc' }} 
                axisLine={{ stroke: '#ced2cc' }}
              />
              <YAxis 
                tick={{ fill: '#ced2cc' }} 
                axisLine={{ stroke: '#ced2cc' }}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: '#ced2cc' }}
                formatter={(value) => <span style={{ color: '#ced2cc' }}>{value}</span>}
              />
              <Line 
                type="monotone" 
                dataKey="ventas" 
                name="Ventas"
                stroke="#4cb5f5" 
                activeDot={{ r: 6, fill: '#23282d', stroke: '#4cb5f5', strokeWidth: 2 }}
                strokeWidth={2}
                dot={{ r: 3, fill: '#4cb5f5', stroke: '#1f3f49', strokeWidth: 1 }}
                isAnimationActive={true}
                animationDuration={1500}
                animationBegin={200}
              />
              <Line 
                type="monotone" 
                dataKey="ganancia" 
                name="Ganancia"
                stroke="#6ab187" 
                activeDot={{ r: 6, fill: '#23282d', stroke: '#6ab187', strokeWidth: 2 }}
                strokeWidth={2}
                dot={{ r: 3, fill: '#6ab187', stroke: '#1f3f49', strokeWidth: 1 }}
                isAnimationActive={true}
                animationDuration={1500}
                animationBegin={700}
              />
              {refAreaLeft && refAreaRight && (
                <ReferenceArea 
                  x1={refAreaLeft} 
                  x2={refAreaRight}
                  strokeOpacity={0.3}
                  fill="#4cb5f5" 
                  fillOpacity={0.2} 
                />
              )}
              <Brush 
                dataKey="fecha" 
                height={30} 
                stroke="#b3c100"
                fill="#1f3f49"
                travellerWidth={10}
                y={250}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-center text-white-50 small mt-2">
          {getTitleDate()} • Selecciona un área para hacer zoom
        </div>
      </div>
    </div>
  );
};

export default EvolucionDiaria;