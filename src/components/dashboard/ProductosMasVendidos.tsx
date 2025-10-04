import React from 'react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Datos de ejemplo para productos más vendidos
const datosEjemplo = [
  { nombre: 'Omega 3', valor: 180, porcentaje: 0, acumulado: 0 },
  { nombre: 'BCAA', valor: 150, porcentaje: 0, acumulado: 0 },
  { nombre: 'Glutamina', valor: 120, porcentaje: 0, acumulado: 0 },
  { nombre: 'Pre-entreno', valor: 100, porcentaje: 0, acumulado: 0 },
  { nombre: 'Caseína', valor: 80, porcentaje: 0, acumulado: 0 }
];

interface ProductosMasVendidosProps {
  datos?: Array<{ nombre: string; valor: number; porcentaje?: number; acumulado?: number }>;
  titulo?: string;
}

const ProductosMasVendidos: React.FC<ProductosMasVendidosProps> = ({ 
  datos = datosEjemplo,
  titulo = 'Top 5 Productos Más Vendidos'
}) => {
  // Calcular totales y porcentajes para el diagrama de Pareto
  const datosConPareto = React.useMemo(() => {
    const datosOrdenados = [...datos].sort((a, b) => b.valor - a.valor);
    const total = datosOrdenados.reduce((sum, item) => sum + item.valor, 0);
    
    let acumulado = 0;
    return datosOrdenados.map((item) => {
      const porcentaje = (item.valor / total) * 100;
      acumulado += porcentaje;
      return {
        ...item,
        porcentaje: parseFloat(porcentaje.toFixed(1)),
        acumulado: parseFloat(acumulado.toFixed(1))
      };
    });
  }, [datos]);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: '#23282d', 
          padding: '10px', 
          border: '1px solid #b3c100',
          borderRadius: '5px'
        }}>
          <p className="mb-1" style={{ color: '#b3c100', fontWeight: 'bold' }}>
            {payload[0].payload.nombre}
          </p>
          <p className="mb-1" style={{ color: '#4cb5f5', fontSize: '0.9rem' }}>
            Ventas: {payload[0].value} unidades
          </p>
          <p className="mb-1" style={{ color: '#6ab187', fontSize: '0.9rem' }}>
            Porcentaje: {payload[0].payload.porcentaje}%
          </p>
          <p className="mb-0" style={{ color: '#b3c100', fontSize: '0.9rem' }}>
            Acumulado: {payload[0].payload.acumulado}%
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="card h-100" style={{ backgroundColor: '#1f3f49', borderRadius: '10px', border: 'none' }}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title m-0" style={{ color: '#b3c100' }}>
            <i className="bi bi-graph-up-arrow me-2"></i>
            {titulo}
          </h5>
        </div>
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={datosConPareto}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3e50" />
              <XAxis 
                dataKey="nombre" 
                stroke="#b3c100"
                tick={{ fill: '#ffffff', fontSize: 10 }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                yAxisId="left"
                stroke="#4cb5f5"
                tick={{ fill: '#ffffff', fontSize: 11 }}
                label={{ value: 'Unidades', angle: -90, position: 'insideLeft', fill: '#4cb5f5', fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                stroke="#b3c100"
                tick={{ fill: '#ffffff', fontSize: 11 }}
                label={{ value: '% Acumulado', angle: 90, position: 'insideRight', fill: '#b3c100', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                formatter={(value: string) => <span style={{ color: '#ffffff', fontSize: '0.85rem' }}>{value}</span>}
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <Bar 
                yAxisId="left"
                dataKey="valor" 
                name="Cantidad Vendida" 
                fill="#4cb5f5"
                animationDuration={1500}
                radius={[5, 5, 0, 0]}
              />
              <Line 
                yAxisId="right"
                type="monotone"
                dataKey="acumulado" 
                name="% Acumulado (Pareto)" 
                stroke="#b3c100"
                strokeWidth={3}
                dot={{ fill: '#b3c100', r: 5 }}
                animationDuration={1500}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProductosMasVendidos;