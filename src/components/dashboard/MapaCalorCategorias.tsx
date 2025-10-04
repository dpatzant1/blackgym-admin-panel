import React from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';

// Datos de ejemplo para el mapa de calor
const datosEjemplo = [
  {
    name: 'Proteínas',
    size: 40,
    value: 469314.86,
    percentGrowth: 12.5,
    performance: 'excelente'
  },
  {
    name: 'Creatinas',
    size: 22,
    value: 153000,
    percentGrowth: 8.2,
    performance: 'bueno'
  },
  {
    name: 'Pre-entrenos',
    size: 18,
    value: 83250,
    percentGrowth: 5.4,
    performance: 'promedio'
  },
  {
    name: 'Recuperación',
    size: 11,
    value: 44000,
    percentGrowth: -2.1,
    performance: 'bajo'
  },
  {
    name: 'Vitaminas',
    size: 9,
    value: 33250,
    percentGrowth: -6.5,
    performance: 'crítico'
  },
];

// Mapa de colores basado en rendimiento
const getColorByPerformance = (performance: string): string => {
  switch (performance) {
    case 'excelente': return '#6ab187'; // Verde menta para excelente
    case 'bueno': return '#b3c100'; // Verde-lima para bueno
    case 'promedio': return '#4cb5f5'; // Azul claro para promedio
    case 'bajo': return '#ced2cc'; // Gris claro para bajo
    case 'crítico': return '#d32d42'; // Rojo para crítico
    default: return '#1f3f49'; // Azul oscuro por defecto
  }
};

interface MapaCalorCategoriasProps {
  datos?: Array<{
    name: string;
    size: number;
    value: number;
    percentGrowth: number;
    performance: 'excelente' | 'bueno' | 'promedio' | 'bajo' | 'crítico';
  }>;
  titulo?: string;
}

const MapaCalorCategorias: React.FC<MapaCalorCategoriasProps> = ({
  datos = datosEjemplo,
  titulo = 'Mapa de Rendimiento por Categoría'
}) => {
  // Formatear datos para el treemap
  const datosFormateados = datos.map(item => ({
    ...item,
    fill: getColorByPerformance(item.performance)
  }));

  // Renderizado personalizado de los cuadros del treemap
  const CustomizedContent = (props: any) => {
    const { depth, x, y, width, height, name, value, percentGrowth } = props;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: props.fill,
            stroke: '#23282d',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {width > 50 && height > 50 ? (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 15}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={14}
              fontWeight="bold"
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 5}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={12}
            >
              Q {value.toLocaleString()}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 20}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={10}
            >
              {percentGrowth > 0 ? `+${percentGrowth}%` : `${percentGrowth}%`}
            </text>
          </>
        ) : null}
      </g>
    );
  };

  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: '#23282d', 
          padding: '10px', 
          border: '1px solid #b3c100',
          borderRadius: '5px'
        }}>
          <p className="mb-1 fw-bold" style={{ color: '#b3c100' }}>{data.name}</p>
          <p className="mb-1" style={{ color: '#ffffff' }}>Ventas: Q {data.value.toLocaleString()}</p>
          <p className="mb-1" style={{ color: '#ffffff' }}>Porcentaje del total: {data.size}%</p>
          <p className="mb-1" style={{ color: '#ffffff' }}>Crecimiento: 
            <span style={{ 
              color: data.percentGrowth >= 0 ? '#6ab187' : '#d32d42',
              fontWeight: 'bold'
            }}>
              {' '}{data.percentGrowth > 0 ? `+${data.percentGrowth}` : data.percentGrowth}%
            </span>
          </p>
          <p className="mb-0" style={{ color: '#ffffff' }}>Rendimiento: <strong style={{ color: '#b3c100' }}>{data.performance}</strong></p>
        </div>
      );
    }
    return null;
  };

  // Leyenda de rendimiento
  const renderLegend = () => {
    const performances = [
      { label: 'Excelente', color: getColorByPerformance('excelente') },
      { label: 'Bueno', color: getColorByPerformance('bueno') },
      { label: 'Promedio', color: getColorByPerformance('promedio') },
      { label: 'Bajo', color: getColorByPerformance('bajo') },
      { label: 'Crítico', color: getColorByPerformance('crítico') }
    ];

    return (
      <div className="d-flex justify-content-center mt-3 flex-wrap">
        {performances.map((item, index) => (
          <div key={index} className="d-flex align-items-center me-3 mb-2">
            <div 
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: item.color,
                marginRight: '5px',
                borderRadius: '3px'
              }}
            />
            <span style={{ fontSize: '0.8rem', color: '#ffffff' }}>{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card h-100" style={{ backgroundColor: '#1f3f49', borderRadius: '10px', border: 'none' }}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title m-0" style={{ color: '#b3c100' }}>
            <i className="bi bi-grid-3x3-gap-fill me-2"></i>
            {titulo}
          </h5>
        </div>
        <div>
        <ResponsiveContainer width="100%" height={300}>
          <Treemap
            data={datosFormateados}
            dataKey="size"
            aspectRatio={1}
            stroke="#23282d"
            fill="#8884d8"
            content={<CustomizedContent />}
            animationBegin={0}
            animationDuration={1500}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
        {renderLegend()}
        </div>
      </div>
    </div>
  );
};

export default MapaCalorCategorias;