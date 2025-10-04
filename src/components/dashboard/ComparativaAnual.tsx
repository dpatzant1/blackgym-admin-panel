import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import type { VentasMensuales } from '../../types/dashboard';

interface ComparativaProps {
  datosActuales: VentasMensuales[];
  datosAnteriores: VentasMensuales[];
  titulo: string;
  periodoActual: number;
  periodoAnterior: number;
}

const ComparativaAnual: React.FC<ComparativaProps> = ({
  datosActuales,
  datosAnteriores,
  titulo,
  periodoActual,
  periodoAnterior
}) => {
  // Combinamos los datos para mostrarlos en un solo gráfico
  const datosCombinados = datosActuales.map((datoActual) => {
    // Encontramos el dato correspondiente al mismo mes del año anterior
    const datoAnterior = datosAnteriores.find(d => d.mes === datoActual.mes) || {
      mes: datoActual.mes,
      ventas: 0,
      ganancia: 0
    };
    
    return {
      mes: datoActual.mes,
      [`Ventas ${periodoActual}`]: datoActual.ventas,
      [`Ventas ${periodoAnterior}`]: datoAnterior.ventas,
      [`Ganancia ${periodoActual}`]: datoActual.ganancia,
      [`Ganancia ${periodoAnterior}`]: datoAnterior.ganancia,
    };
  });
  
  // Calculamos el crecimiento total
  const ventasActuales = datosActuales.reduce((sum, mes) => sum + mes.ventas, 0);
  const ventasAnteriores = datosAnteriores.reduce((sum, mes) => sum + mes.ventas, 0);
  const crecimientoPorcentaje = ventasAnteriores > 0 
    ? ((ventasActuales - ventasAnteriores) / ventasAnteriores) * 100 
    : 0;
  
  const formatoNumero = (num: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="card h-100" style={{ backgroundColor: '#1f3f49', borderRadius: '10px', border: 'none' }}>
      <div className="card-body" style={{ padding: '20px' }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0" style={{ color: '#b3c100', fontSize: '18px', fontWeight: 'bold' }}>
            {titulo}
          </h5>
          <div 
            style={{ 
              backgroundColor: '#4cb5f5', 
              color: 'white',
              fontSize: '14px',
              padding: '8px 12px',
              borderRadius: '6px',
              fontWeight: '500'
            }}
          >
            {crecimientoPorcentaje > 0 ? '+' : ''}
            {crecimientoPorcentaje.toFixed(2)}% vs {periodoAnterior}
          </div>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between mb-2">
            <div>
              <div className="small" style={{ color: '#b3c100', fontSize: '12px' }}>Total {periodoActual}</div>
              <div className="h5 mb-0" style={{ color: 'white', fontWeight: 'bold' }}>{formatoNumero(ventasActuales)}</div>
            </div>
            <div className="text-end">
              <div className="small" style={{ color: '#b3c100', fontSize: '12px' }}>Total {periodoAnterior}</div>
              <div className="h5 mb-0" style={{ color: 'white', fontWeight: 'bold' }}>{formatoNumero(ventasAnteriores)}</div>
            </div>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div 
              className="progress-bar bg-success" 
              role="progressbar" 
              style={{ width: `${crecimientoPorcentaje > 0 ? crecimientoPorcentaje : 0}%` }}
              aria-valuenow={crecimientoPorcentaje > 0 ? crecimientoPorcentaje : 0} 
              aria-valuemin={0} 
              aria-valuemax={100}
            ></div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={datosCombinados}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4a6670" opacity={0.3} />
            <XAxis 
              dataKey="mes" 
              stroke="#b3c100"
              tick={{ fill: '#b3c100', fontSize: 12 }}
            />
            <YAxis 
              stroke="#b3c100"
              tick={{ fill: '#b3c100', fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number) => formatoNumero(value)}
              labelFormatter={(label) => `Mes: ${label}`}
              contentStyle={{ 
                backgroundColor: '#1f3f49', 
                border: '1px solid #b3c100',
                borderRadius: '8px',
                color: '#ffffff'
              }}
              labelStyle={{ color: '#b3c100', fontWeight: 'bold' }}
            />
            <Legend 
              wrapperStyle={{ color: '#ffffff' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey={`Ventas ${periodoActual}`}
              stroke="#4cb5f5"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey={`Ventas ${periodoAnterior}`}
              stroke="#6c757d"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-3">
          <h6 style={{ color: '#b3c100', fontWeight: 'bold', fontSize: '16px' }}>Análisis de Crecimiento</h6>
          <div className="row">
            <div className="col-md-6">
              <ul className="list-group list-group-flush">
                {datosActuales.slice(0, 6).map((datoActual, index) => {
                  const datoAnterior = datosAnteriores.find(d => d.mes === datoActual.mes) || {
                    mes: datoActual.mes,
                    ventas: 0,
                    ganancia: 0
                  };
                  
                  let crecimientoTexto = 'N/A';
                  let badgeClass = 'bg-secondary';
                  
                  if (datoAnterior.ventas > 0 && datoActual.ventas > 0) {
                    // INVERTIDO: datoAnterior es en realidad el periodo base, datoActual es el periodo comparación
                    const crecimientoMes = ((datoAnterior.ventas - datoActual.ventas) / datoActual.ventas) * 100;
                    crecimientoTexto = `${crecimientoMes > 0 ? '+' : ''}${crecimientoMes.toFixed(1)}%`;
                    badgeClass = crecimientoMes >= 0 ? 'bg-success' : 'bg-danger';
                  } else if (datoAnterior.ventas === 0 && datoActual.ventas === 0) {
                    crecimientoTexto = '0.0%';
                    badgeClass = 'bg-secondary';
                  }
                  
                  return (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center px-0" style={{ backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #4a6670' }}>
                      <span style={{ color: '#ffffff', fontSize: '14px' }}>{datoActual.mes}</span>
                      <span className={`badge ${badgeClass}`}>
                        {crecimientoTexto}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="list-group list-group-flush">
                {datosActuales.slice(6).map((datoActual, index) => {
                  const datoAnterior = datosAnteriores.find(d => d.mes === datoActual.mes) || {
                    mes: datoActual.mes,
                    ventas: 0,
                    ganancia: 0
                  };
                  
                  let crecimientoTexto = 'N/A';
                  let badgeClass = 'bg-secondary';
                  
                  if (datoAnterior.ventas > 0 && datoActual.ventas > 0) {
                    // INVERTIDO: datoAnterior es en realidad el periodo base, datoActual es el periodo comparación
                    const crecimientoMes = ((datoAnterior.ventas - datoActual.ventas) / datoActual.ventas) * 100;
                    crecimientoTexto = `${crecimientoMes > 0 ? '+' : ''}${crecimientoMes.toFixed(1)}%`;
                    badgeClass = crecimientoMes >= 0 ? 'bg-success' : 'bg-danger';
                  } else if (datoAnterior.ventas === 0 && datoActual.ventas === 0) {
                    crecimientoTexto = '0.0%';
                    badgeClass = 'bg-secondary';
                  }
                  
                  return (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center px-0" style={{ backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #4a6670' }}>
                      <span style={{ color: '#ffffff', fontSize: '14px' }}>{datoActual.mes}</span>
                      <span className={`badge ${badgeClass}`}>
                        {crecimientoTexto}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparativaAnual;