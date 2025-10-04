import React from 'react';
import dashboardExport from '../../utils/dashboardExport';
import type { DashboardData, FiltrosDashboard } from '../../types';

interface ExportOptionsProps {
  dashboardData: DashboardData;
  filtros: FiltrosDashboard;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ dashboardData, filtros }) => {
  const handleExportCSV = () => {
    // Generar nombre de archivo con fecha y filtros
    const date = new Date().toISOString().slice(0, 10);
    const filename = `dashboard_${date}_${filtros.año}${filtros.mes ? '_' + filtros.mes : ''}.csv`;
    
    // Crear string con filtros aplicados para el reporte
    const filtrosStr = `Año: ${filtros.año}${filtros.mes ? ', Mes: ' + filtros.mes : ''}, Tipo Venta: ${filtros.tipoVenta}, Tipo Pago: ${filtros.tipoPago}`;
    
    dashboardExport.exportDetailedCSV(dashboardData, filtrosStr, filename);
  };
  
  const handleCaptureScreenshot = async () => {
    try {
      const date = new Date().toISOString().slice(0, 10);
      const filename = `dashboard_captura_${date}.png`;
      
      await dashboardExport.captureScreenshot('dashboard-container', filename);
    } catch (err) {
      console.error('Error al capturar imagen:', err);
      alert('No se pudo capturar la imagen del dashboard. Asegúrese de tener la librería html2canvas instalada.');
    }
  };
  
  return (
    <div className="export-options d-flex justify-content-end mb-3">
      <button 
        onClick={handleExportCSV}
        className="btn btn-sm btn-outline-light me-2"
        aria-label="Exportar datos a CSV"
        title="Exportar datos a CSV"
      >
        <i className="bi bi-file-earmark-spreadsheet me-1"></i>
        Exportar CSV
      </button>
      
      <button 
        onClick={handleCaptureScreenshot}
        className="btn btn-sm btn-outline-light"
        aria-label="Capturar imagen del dashboard"
        title="Capturar imagen del dashboard"
      >
        <i className="bi bi-camera me-1"></i>
        Captura
      </button>
    </div>
  );
};

export default ExportOptions;