import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Datos de ejemplo para la distribución por categoría con colores vibrantes
const datosEjemplo = [
  { nombre: 'Alimentos Preparados', valor: 16, color: '#1f3f49' },
  { nombre: 'Aminoácidos', valor: 9, color: '#4cb5f5' },
  { nombre: 'Creatinas', valor: 12, color: '#b3c100' },
  { nombre: 'Pre-entrenos', valor: 14, color: '#ced2cc' },
  { nombre: 'Proteínas', valor: 9, color: '#d32d42' },
  { nombre: 'Recuperación', valor: 16, color: '#6ab187' },
  { nombre: 'Suplementos Vegetales', valor: 11, color: '#1f3f49' },
  { nombre: 'Vitaminas', valor: 13, color: '#d32d42' }
];

interface DistribucionCategoriasProps {
  datos?: Array<{ nombre: string; valor: number; color: string }>;
  titulo?: string;
}

const DistribucionCategorias: React.FC<DistribucionCategoriasProps> = ({ 
  datos = datosEjemplo,
  titulo = 'Distribución de Ventas por Categoría'
}) => {
  // Calcular total para los porcentajes
  const total = React.useMemo(() => 
    datos.reduce((sum, item) => sum + item.valor, 0), 
    [datos]
  );

  // Renderizar labels personalizados con porcentajes
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Solo mostrar porcentaje si es mayor al 7%
    if (percent < 0.07) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ 
          fontSize: '14px', 
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.9)'
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Tooltip personalizado mejorado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const porcentaje = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div style={{ 
          backgroundColor: '#23282d', 
          padding: '12px 16px', 
          border: '2px solid ' + payload[0].payload.color,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
        }}>
          <p className="mb-2" style={{ 
            color: payload[0].payload.color, 
            fontWeight: 'bold', 
            fontSize: '0.95rem' 
          }}>
            {payload[0].name}
          </p>
          <div className="d-flex align-items-center gap-2">
            <div style={{
              width: '14px',
              height: '14px',
              backgroundColor: payload[0].payload.color,
              borderRadius: '3px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}></div>
            <span style={{ color: '#ffffff', fontSize: '0.9rem' }}>
              <strong>{porcentaje}%</strong> del total
            </span>
          </div>
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
            <i className="bi bi-pie-chart-fill me-2"></i>
            {titulo}
          </h5>
        </div>
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={datos}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={110}
                innerRadius={60}
                fill="#8884d8"
                dataKey="valor"
                nameKey="nombre"
                animationBegin={0}
                animationDuration={1500}
                paddingAngle={2}
              >
                {datos.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="#1f3f49"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value: string) => (
                  <span style={{ color: '#ffffff', fontSize: '0.8rem' }}>{value}</span>
                )}
                iconType="circle"
                iconSize={10}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DistribucionCategorias;