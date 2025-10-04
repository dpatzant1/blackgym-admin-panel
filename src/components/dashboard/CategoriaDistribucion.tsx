import type { VentasPorCategoria } from '../../types';

interface CategoriaDistribucionProps {
  categorias: VentasPorCategoria[];
}

const CategoriaDistribucion: React.FC<CategoriaDistribucionProps> = ({ categorias }) => {
  // Función para formatear números a moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Colores para las categorías
  const colores = [
    '#4cb5f5', '#b3c100', '#6ab187', '#1f3f49', '#d32d42'
  ];
  
  return (
    <div className="card h-100" style={{ backgroundColor: '#1f3f49', borderRadius: '10px', border: 'none' }}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title m-0" style={{ color: '#b3c100' }}>
            <i className="bi bi-grid me-2"></i> CATEGORÍA
          </h5>
        </div>
        
        <div className="categoria-grid" style={{ height: '300px' }}>
          {/* Grid de áreas proporcionales al porcentaje */}
          <div className="categoria-mapa d-flex flex-wrap">
            {categorias.map((categoria, index) => {
              // Cálculo aproximado del tamaño de cada bloque
              const size = Math.ceil(Math.sqrt(categoria.porcentaje)) * 10;
              return (
                <div 
                  key={index}
                  style={{ 
                    backgroundColor: colores[index % colores.length],
                    width: `${size}%`,
                    height: `${size}%`,
                    margin: '2px',
                    padding: '5px',
                    borderRadius: '5px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minWidth: '80px',
                    minHeight: '80px'
                  }}
                >
                  <div className="text-white fw-bold small">{categoria.nombre}</div>
                  <div className="text-white small">{formatCurrency(categoria.ganancia)}</div>
                  <div className="text-white-50 small">{categoria.porcentaje}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriaDistribucion;