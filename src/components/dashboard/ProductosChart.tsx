import type { ProductoMasVendido } from '../../types';

interface ProductosChartProps {
  productos: ProductoMasVendido[];
}

const ProductosChart: React.FC<ProductosChartProps> = ({ productos }) => {
  // Limitar a los top 8 productos para evitar desbordamiento
  const topProductos = productos.slice(0, 8);
  
  // Encontrar el valor máximo de GANANCIA para escalar las barras correctamente
  const maxGanancia = Math.max(...topProductos.map(p => p.ganancia), 1);
  
  // Función para formatear números a moneda (Quetzales guatemaltecos)
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      maximumFractionDigits: 2
    }).format(value);
  };
  
  return (
    <div className="card h-100" style={{ backgroundColor: '#1f3f49', borderRadius: '10px', border: 'none' }}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title m-0" style={{ color: '#b3c100' }}>
            <i className="bi bi-box me-2"></i> PRODUCTO
          </h5>
        </div>
        
        <div 
          className="productos-chart" 
          style={{ 
            height: '320px', 
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: '5px'
          }}
        >
          {topProductos.map((producto, index) => (
            <div key={index} className="d-flex align-items-center mb-3">
              <div 
                className="producto-name text-white small" 
                style={{ 
                  width: '80px', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  fontSize: '13px'
                }}
                title={producto.nombre}
              >
                {producto.nombre}
              </div>
              <div className="flex-grow-1 ms-2">
                <div className="progress" style={{ height: '20px', backgroundColor: '#23282d' }}>
                  <div 
                    className="progress-bar" 
                    role="progressbar"
                    style={{ 
                      width: `${(producto.ganancia / maxGanancia) * 100}%`, 
                      backgroundColor: '#4cb5f5',
                      transition: 'width 0.5s ease'
                    }}
                    aria-valuenow={(producto.ganancia / maxGanancia) * 100}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                  </div>
                </div>
              </div>
              <div className="ms-2 text-white" style={{ width: '90px', textAlign: 'right', fontSize: '13px' }}>
                {formatCurrency(producto.ganancia)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductosChart;