import type { FiltrosDashboard } from '../../types';
import { MonthSelector } from './';

interface DashboardHeaderProps {
  filtros: FiltrosDashboard;
  onFiltroChange: (filtros: Partial<FiltrosDashboard>) => void;
  añosDisponibles: number[];
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  filtros,
  onFiltroChange,
  añosDisponibles
}) => {
  return (
    <div className="dashboard-header mb-4" style={{ backgroundColor: '#1f3f49', borderRadius: '10px', padding: '20px' }}>
      <div className="row align-items-center">
        <div className="col-lg-6">
          <div className="d-flex align-items-center">
            <img src="/logo-principal-optimizado.webp" alt="Logo" height="60" />
            <div className="ms-3">
              <h1 className="mb-0" style={{ color: '#b3c100', fontSize: '28px', fontWeight: 'bold' }}>
                DASHBOARD DE VENTAS
              </h1>
              <h3 className="mb-0" style={{ color: '#4cb5f5', fontSize: '16px' }}>
                TU NEGOCIO
              </h3>
            </div>
          </div>
        </div>

        <div className="col-lg-6 mt-3 mt-lg-0">
          <div className="row g-2 justify-content-end">
            <div className="col-md-4 col-lg-5">
              <div className="form-group">
                <label htmlFor="yearSelector" className="small text-light mb-1">Año</label>
                <select
                  id="yearSelector"
                  className="form-select"
                  value={filtros.año}
                  onChange={(e) => onFiltroChange({ año: parseInt(e.target.value) })}
                >
                  {añosDisponibles.map((año) => (
                    <option key={año} value={año}>
                      {año}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-4 col-lg-5">
              <MonthSelector 
                selectedMonth={filtros.mes}
                onChange={(mes) => onFiltroChange({ mes })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;