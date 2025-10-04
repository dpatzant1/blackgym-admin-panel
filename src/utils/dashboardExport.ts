/**
 * Utilidades para exportación de datos del dashboard
 */

import type { DashboardData } from '../types';

/**
 * Convierte datos del dashboard a formato CSV
 */
export const convertToCSV = (dashboardData: DashboardData): string => {
  // Headers para el CSV
  const headers = ['Mes', 'Ventas', 'Ganancia'];
  
  // Convertir datos mensuales a filas CSV
  const dataRows = dashboardData.graficos.ventasMensuales.map(item => 
    `${item.mes},${item.ventas},${item.ganancia}`
  );
  
  // Generar el CSV completo
  return [headers.join(','), ...dataRows].join('\n');
};

/**
 * Genera y descarga un archivo CSV con los datos del dashboard
 */
export const exportToCSV = (dashboardData: DashboardData, filename = 'dashboard_data.csv'): void => {
  // Convertir datos a CSV
  const csvContent = convertToCSV(dashboardData);
  
  // Crear un blob con el contenido CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Crear URL para el blob
  const url = URL.createObjectURL(blob);
  
  // Crear elemento anchor para la descarga
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Añadir el link al DOM, hacer clic y luego removerlo
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Liberar la URL
  URL.revokeObjectURL(url);
};

/**
 * Genera y descarga un archivo CSV más detallado para todos los datos del dashboard
 */
export const exportDetailedCSV = (dashboardData: DashboardData, filtros: string, filename = 'dashboard_detailed.csv'): void => {
  // Construir el CSV con múltiples secciones
  let csvContent = `Reporte Dashboard - ${new Date().toLocaleDateString()}\n`;
  csvContent += `Filtros: ${filtros}\n\n`;
  
  // KPIs
  csvContent += 'KPIs\n';
  csvContent += 'Indicador,Valor\n';
  csvContent += `Ventas Totales,${dashboardData.kpis.ventas.totalVentas}\n`;
  csvContent += `Ganancia Total,${dashboardData.kpis.ventas.gananciaTotal}\n`;
  csvContent += `Porcentaje de Ganancia,${dashboardData.kpis.ventas.porcentajeGanancia}%\n`;
  csvContent += `Comparativa Período Anterior,${dashboardData.kpis.ventas.comparativaAnterior}%\n\n`;
  
  // Producto y Categoría Top
  csvContent += 'Producto Top\n';
  csvContent += 'ID,Nombre,Ventas,Monto\n';
  csvContent += `${dashboardData.kpis.productos.productoTop.id},${dashboardData.kpis.productos.productoTop.nombre},${dashboardData.kpis.productos.productoTop.ventas},${dashboardData.kpis.productos.productoTop.monto}\n\n`;
  
  csvContent += 'Categoría Top\n';
  csvContent += 'ID,Nombre,Ventas,Monto\n';
  csvContent += `${dashboardData.kpis.productos.categoriaTop.id},${dashboardData.kpis.productos.categoriaTop.nombre},${dashboardData.kpis.productos.categoriaTop.ventas},${dashboardData.kpis.productos.categoriaTop.monto}\n\n`;
  
  // Ventas mensuales
  csvContent += 'Ventas Mensuales\n';
  csvContent += 'Mes,Ventas,Ganancia\n';
  dashboardData.graficos.ventasMensuales.forEach(item => {
    csvContent += `${item.mes},${item.ventas},${item.ganancia}\n`;
  });
  csvContent += '\n';
  
  // Productos más vendidos
  csvContent += 'Productos Más Vendidos\n';
  csvContent += 'ID,Nombre,Ventas,Ganancia\n';
  dashboardData.graficos.productosMasVendidos.forEach(item => {
    csvContent += `${item.id},${item.nombre},${item.ventas},${item.ganancia}\n`;
  });
  csvContent += '\n';
  
  // Categorías
  csvContent += 'Categorías\n';
  csvContent += 'ID,Nombre,Ventas,Ganancia,Porcentaje\n';
  dashboardData.graficos.categorias.forEach(item => {
    csvContent += `${item.id},${item.nombre},${item.ventas},${item.ganancia},${item.porcentaje}%\n`;
  });
  
  // Crear un blob con el contenido CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Crear URL para el blob
  const url = URL.createObjectURL(blob);
  
  // Crear elemento anchor para la descarga
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Añadir el link al DOM, hacer clic y luego removerlo
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Liberar la URL
  URL.revokeObjectURL(url);
};

/**
 * Utilidad para capturar una imagen del dashboard
 * Requiere la librería html2canvas (se debe instalar)
 */
export const captureScreenshot = async (elementId: string, filename = 'dashboard_screenshot.png'): Promise<void> => {
  try {
    // Importar dinámicamente html2canvas solo cuando se necesite
    const html2canvas = await import('html2canvas');
    
    // Obtener el elemento a capturar
    const element = document.getElementById(elementId);
    
    if (!element) {
      throw new Error(`No se encontró el elemento con ID: ${elementId}`);
    }
    
    // Capturar el elemento
    const canvas = await html2canvas.default(element, {
      scale: 2, // Escala para mejor calidad
      logging: false,
      useCORS: true, // Permitir recursos de origen cruzado
      allowTaint: true
    });
    
    // Convertir a imagen y descargar
    const image = canvas.toDataURL('image/png');
    
    // Crear link de descarga
    const link = document.createElement('a');
    link.setAttribute('href', image);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Añadir el link al DOM, hacer clic y luego removerlo
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('Error al capturar la pantalla:', error);
    alert('No se pudo capturar la imagen. Asegúrese de que html2canvas esté instalado.');
  }
};

export default {
  exportToCSV,
  exportDetailedCSV,
  captureScreenshot
};