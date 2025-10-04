import type { DistribucionVentas as DistribucionVentasType } from '../../types';

interface DistribucionVentasProps {
  distribucion: DistribucionVentasType;
}

const DistribucionVentas: React.FC<DistribucionVentasProps> = ({ distribucion }) => {
  // Creamos dos gráficos de pastel simples para representar la distribución
  
  return (
    <div className="card h-100" style={{ backgroundColor: '#1f3f49', borderRadius: '10px', border: 'none' }}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title m-0" style={{ color: '#b3c100' }}>
            <i className="bi bi-pie-chart me-2"></i> TIPO VENTA
          </h5>
        </div>
        
        <div className="row">
          {/* Gráfico para Tipo de Venta */}
          <div className="col-12 mb-4">
            <div className="d-flex justify-content-center">
              <div style={{ width: '150px', height: '150px', position: 'relative' }}>
                {/* Gráfico circular SVG */}
                <svg width="150" height="150" viewBox="0 0 150 150">
                  <circle cx="75" cy="75" r="75" fill="#23282d" />
                  <circle cx="75" cy="75" r="37.5" fill="#1f3f49" />
                  
                  {/* Segmento Online */}
                  <path 
                    d={`M 75 75 L 75 0 A 75 75 0 ${distribucion.porTipo.online > 50 ? 1 : 0} 1 ${
                      75 + 75 * Math.sin((distribucion.porTipo.online / 100) * 2 * Math.PI)
                    } ${
                      75 - 75 * Math.cos((distribucion.porTipo.online / 100) * 2 * Math.PI)
                    } Z`}
                    fill="#4cb5f5"
                  />
                  
                  {/* Leyenda */}
                  <text x="75" y="70" textAnchor="middle" fontSize="14" fill="#fff">{distribucion.porTipo.online}%</text>
                  <text x="75" y="85" textAnchor="middle" fontSize="10" fill="#fff">Online</text>
                </svg>
              </div>
            </div>
            
            {/* Leyenda */}
            <div className="d-flex justify-content-around mt-3">
              <div className="d-flex align-items-center">
                <div style={{ width: '12px', height: '12px', backgroundColor: '#4cb5f5', borderRadius: '2px', marginRight: '5px' }}></div>
                <span className="small text-white">Online ({distribucion.porTipo.online}%)</span>
              </div>
              <div className="d-flex align-items-center">
                <div style={{ width: '12px', height: '12px', backgroundColor: '#23282d', borderRadius: '2px', marginRight: '5px' }}></div>
                <span className="small text-white">Local ({distribucion.porTipo.local}%)</span>
              </div>
            </div>
          </div>
          
          {/* Gráfico para Tipo de Pago */}
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title m-0" style={{ color: '#b3c100', fontSize: '1rem' }}>
                <i className="bi bi-cash me-2"></i> TIPO PAGO
              </h5>
            </div>
            
            <div className="d-flex justify-content-center">
              <div style={{ width: '150px', height: '150px', position: 'relative' }}>
                {/* Gráfico circular SVG */}
                <svg width="150" height="150" viewBox="0 0 150 150">
                  <circle cx="75" cy="75" r="75" fill="#23282d" />
                  <circle cx="75" cy="75" r="37.5" fill="#1f3f49" />
                  
                  {/* Segmento Transferencia */}
                  <path 
                    d={`M 75 75 L 75 0 A 75 75 0 ${distribucion.porPago.transferencia > 50 ? 1 : 0} 1 ${
                      75 + 75 * Math.sin((distribucion.porPago.transferencia / 100) * 2 * Math.PI)
                    } ${
                      75 - 75 * Math.cos((distribucion.porPago.transferencia / 100) * 2 * Math.PI)
                    } Z`}
                    fill="#6ab187"
                  />
                  
                  {/* Leyenda */}
                  <text x="75" y="70" textAnchor="middle" fontSize="14" fill="#fff">{distribucion.porPago.transferencia}%</text>
                  <text x="75" y="85" textAnchor="middle" fontSize="10" fill="#fff">Transferencia</text>
                </svg>
              </div>
            </div>
            
            {/* Leyenda */}
            <div className="d-flex justify-content-around mt-3">
              <div className="d-flex align-items-center">
                <div style={{ width: '12px', height: '12px', backgroundColor: '#6ab187', borderRadius: '2px', marginRight: '5px' }}></div>
                <span className="small text-white">Transferencia ({distribucion.porPago.transferencia}%)</span>
              </div>
              <div className="d-flex align-items-center">
                <div style={{ width: '12px', height: '12px', backgroundColor: '#23282d', borderRadius: '2px', marginRight: '5px' }}></div>
                <span className="small text-white">Efectivo ({distribucion.porPago.efectivo}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistribucionVentas;