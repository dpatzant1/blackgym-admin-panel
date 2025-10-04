import { useState, useEffect } from 'react';
import type { VentasMensuales } from '../../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface EvolucionMensualProps {
  ventasMensuales: VentasMensuales[];
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

const EvolucionMensual: React.FC<EvolucionMensualProps> = ({ ventasMensuales }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [animate, setAnimate] = useState<boolean>(false);

  // Formateador para mostrar valores en miles (K)
  const formatYAxis = (value: number) => {
    return `${value/1000}K`;
  };

  // Aplicar animación después del montaje
  useEffect(() => {
    // Activar animación después del montaje
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);

    // Preparar datos para el gráfico
    setChartData(ventasMensuales.map(item => ({
      mes: item.mes,
      ventas: animate ? item.ventas : 0,
      ganancia: animate ? item.ganancia : 0
    })));

    return () => {
      clearTimeout(timer);
    };
  }, [ventasMensuales, animate]);

  // Actualizar datos cuando animate cambie
  useEffect(() => {
    setChartData(ventasMensuales.map(item => ({
      mes: item.mes,
      ventas: animate ? item.ventas : 0,
      ganancia: animate ? item.ganancia : 0
    })));
  }, [animate, ventasMensuales]);

  return (
    <div className="card h-100" style={{ backgroundColor: '#1f3f49', borderRadius: '10px', border: 'none' }}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title m-0" style={{ color: '#b3c100' }}>
            <i className="bi bi-calendar3 me-2"></i> EVOLUCIÓN MENSUAL
          </h5>
        </div>
        
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ced2cc" opacity={0.2} />
              <XAxis 
                dataKey="mes" 
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
              <Bar 
                dataKey="ventas" 
                name="Ventas" 
                fill="#4cb5f5" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500} 
                animationBegin={200}
                isAnimationActive={true}
              />
              <Bar 
                dataKey="ganancia" 
                name="Ganancia" 
                fill="#6ab187" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                animationBegin={700}
                isAnimationActive={true}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-center text-white-50 small mt-2">
          Evolución mensual de ventas y ganancias
        </div>
      </div>
    </div>
  );
};

export default EvolucionMensual;