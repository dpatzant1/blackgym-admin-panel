import type { VentasKPI, ProductosKPI } from '../../types';

interface KPISectionProps {
  ventasKPI: VentasKPI;
  productosKPI: ProductosKPI;
}

const KPISection: React.FC<KPISectionProps> = ({ ventasKPI, productosKPI }) => {
  // Función para formatear números a moneda (Quetzales guatemaltecos)
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="row g-3">
      {/* KPI de Ventas Totales */}
      <div className="col-md-4 col-lg-2-4">
        <div className="card h-100" style={{ backgroundColor: '#1f3f49', borderRadius: '10px', border: 'none' }}>
          <div className="card-body p-3">
            <h6 className="card-title text-white-50 mb-1 small">VENTAS TOTALES</h6>
            <div className="d-flex align-items-center">
              <h3 className="card-text mb-0" style={{ color: '#b3c100', fontWeight: 'bold' }}>
                {formatCurrency(ventasKPI.totalVentas)} 
              </h3>
              <div className="ms-auto">
                <i className="bi bi-cash-coin" style={{ fontSize: '2rem', color: '#b3c100' }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI de Ganancia Total */}
      <div className="col-md-4 col-lg-2-4">
        <div className="card h-100" style={{ backgroundColor: '#1f3f49', borderRadius: '10px', border: 'none' }}>
          <div className="card-body p-3">
            <h6 className="card-title text-white-50 mb-1 small">GANANCIA TOTAL</h6>
            <div className="d-flex align-items-center">
              <h3 className="card-text mb-0" style={{ color: '#4cb5f5', fontWeight: 'bold' }}>
                {formatCurrency(ventasKPI.gananciaTotal)}
              </h3>
              <div className="ms-auto">
                <i className="bi bi-graph-up-arrow" style={{ fontSize: '2rem', color: '#4cb5f5' }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI de Porcentaje de Ganancia */}
      <div className="col-md-4 col-lg-2-4">
        <div className="card h-100" style={{ backgroundColor: '#1f3f49', borderRadius: '10px', border: 'none' }}>
          <div className="card-body p-3">
            <h6 className="card-title text-white-50 mb-1 small">GANANCIA %</h6>
            <div className="d-flex align-items-center">
              <h3 className="card-text mb-0" style={{ color: '#6ab187', fontWeight: 'bold' }}>
                {ventasKPI.porcentajeGanancia.toFixed(2)} %
              </h3>
              <div className="ms-auto">
                <i className="bi bi-percent" style={{ fontSize: '2rem', color: '#6ab187' }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI de Producto Top */}
      <div className="col-md-6 col-lg-2-4">
        <div className="card h-100" style={{ backgroundColor: '#1f3f49', borderRadius: '10px', border: 'none' }}>
          <div className="card-body p-3">
            <h6 className="card-title text-white-50 mb-1 small">PRODUCTO TOP</h6>
            <h5 className="mb-0" style={{ color: '#4cb5f5' }}>{productosKPI.productoTop.nombre}</h5>
            <div className="d-flex align-items-center mt-1">
              <span className="text-white small">{formatCurrency(productosKPI.productoTop.monto)}</span>
              <div className="ms-auto">
                <i className="bi bi-box-seam" style={{ fontSize: '2rem', color: '#4cb5f5' }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI de Categoría Top */}
      <div className="col-md-6 col-lg-2-4">
        <div className="card h-100" style={{ backgroundColor: '#1f3f49', borderRadius: '10px', border: 'none' }}>
          <div className="card-body p-3">
            <h6 className="card-title text-white-50 mb-1 small">CATEGORÍA TOP</h6>
            <h5 className="mb-0" style={{ color: '#b3c100' }}>{productosKPI.categoriaTop.nombre}</h5>
            <div className="d-flex align-items-center mt-1">
              <span className="text-white small">{formatCurrency(productosKPI.categoriaTop.monto)}</span>
              <div className="ms-auto">
                <i className="bi bi-tags-fill" style={{ fontSize: '2rem', color: '#b3c100' }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPISection;