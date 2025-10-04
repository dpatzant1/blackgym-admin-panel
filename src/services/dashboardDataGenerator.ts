/**
 * Generador de datos históricos simulados para el dashboard
 * Crea datos realistas de 5 años con variaciones estacionales y tendencias
 */

import type {
  DashboardData,
  FiltrosDashboard,
  VentasMensuales,
  VentasDiarias,
  ProductoMasVendido,
  VentasPorCategoria
} from '../types';

// Constantes para la generación de datos
const AÑOS_DISPONIBLES = [2021, 2022, 2023, 2024, 2025];
const NOMBRES_MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const TENDENCIA_ANUAL = 1.12; // Crecimiento medio anual (12%)

// Productos predefinidos para consistencia
const PRODUCTOS = [
  { id: 1, nombre: "Proteína Whey Gold Standard" },
  { id: 2, nombre: "Creatina Monohidrato Optimum" },
  { id: 3, nombre: "Pre-entreno C4 Original" },
  { id: 4, nombre: "BCAA Xtend" },
  { id: 5, nombre: "Multivitamínico Animal Pak" },
  { id: 6, nombre: "Proteína Vegana Plant Fusion" },
  { id: 7, nombre: "Barras Proteicas Quest" },
  { id: 8, nombre: "Glutamina Micronizada" },
  { id: 9, nombre: "Omega 3 Fish Oil" },
  { id: 10, nombre: "Colágeno Hidrolizado" },
  { id: 11, nombre: "Termogénico Lipo 6" },
  { id: 12, nombre: "Caseína Nocturna" },
];

// Categorías predefinidas para consistencia
const CATEGORIAS = [
  { id: 1, nombre: "Proteínas" },
  { id: 2, nombre: "Creatinas" },
  { id: 3, nombre: "Pre-entrenos" },
  { id: 4, nombre: "Recuperación" },
  { id: 5, nombre: "Vitaminas" },
  { id: 6, nombre: "Suplementos Vegetales" },
  { id: 7, nombre: "Alimentos Preparados" },
  { id: 8, nombre: "Aminoácidos" },
];

// Funciones auxiliares para generar datos realistas
const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const getVariacionEstacional = (mes: number): number => {
  // Simular estacionalidad: más ventas en enero (propósitos de año nuevo)
  // y en verano (temporada de playa)
  const estacionalidad = [1.3, 0.9, 0.95, 0.9, 1.05, 1.15, 1.2, 1.1, 0.9, 0.85, 0.95, 1.2];
  return estacionalidad[mes];
};

// Generar valores base para cada año (con crecimiento y estacionalidad)
const generarDatosBase = () => {
  const datosBase = new Map<number, number[]>();
  
  // Valor inicial para 2021 (entre 50000 y 70000)
  const valorInicial = getRandomNumber(50000, 70000);
  
  AÑOS_DISPONIBLES.forEach((año, index) => {
    const valoresMensuales = [];
    
    for (let mes = 0; mes < 12; mes++) {
      // Aplicar crecimiento anual y estacionalidad
      const valorBase = valorInicial * Math.pow(TENDENCIA_ANUAL, index);
      const estacionalidad = getVariacionEstacional(mes);
      
      // Añadir variación aleatoria (±10%)
      const variacion = 0.9 + Math.random() * 0.2;
      
      const valorFinal = Math.round(valorBase * estacionalidad * variacion);
      valoresMensuales.push(valorFinal);
    }
    
    datosBase.set(año, valoresMensuales);
  });
  
  return datosBase;
};

// Generar ventas mensuales para un año específico
const generarVentasMensuales = (año: number, datosBase: Map<number, number[]>): VentasMensuales[] => {
  if (!datosBase.has(año)) {
    throw new Error(`No hay datos disponibles para el año ${año}`);
  }
  
  const valoresBase = datosBase.get(año) || [];
  return NOMBRES_MESES.map((mes, index) => ({
    mes,
    ventas: valoresBase[index],
    ganancia: Math.round(valoresBase[index] * 0.6), // 60% de margen de ganancia promedio
  }));
};

// Generar ventas diarias para un mes y año específicos
const generarVentasDiarias = (año: number, mes: number, datosBase: Map<number, number[]>): VentasDiarias[] => {
  if (!datosBase.has(año)) {
    throw new Error(`No hay datos disponibles para el año ${año}`);
  }
  
  const valoresBase = datosBase.get(año) || [];
  const valorMensual = valoresBase[mes - 1] || 0;
  
  // Determinar el número de días en el mes
  const diasEnMes = new Date(año, mes, 0).getDate();
  
  const ventasDiarias = [];
  for (let dia = 1; dia <= diasEnMes; dia++) {
    // Variación diaria (más ventas en fines de semana)
    const fecha = new Date(año, mes - 1, dia);
    const diaSemana = fecha.getDay(); // 0 (domingo) a 6 (sábado)
    const esFinDeSemana = diaSemana === 0 || diaSemana === 6;
    
    const factorDia = esFinDeSemana ? 1.4 : 0.9;
    const valorDiario = Math.round(valorMensual / diasEnMes * factorDia * (0.85 + Math.random() * 0.3));
    
    ventasDiarias.push({
      fecha: `${año}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`,
      ventas: valorDiario,
      ganancia: Math.round(valorDiario * 0.6),
    });
  }
  
  return ventasDiarias;
};

// Generar productos más vendidos (con persistencia)
const generarProductosMasVendidos = (año: number, datosBase: Map<number, number[]>): ProductoMasVendido[] => {
  // Determinamos los coeficientes de popularidad para cada producto (persistentes por año)
  const seed = año % 1000; // Usamos el año como semilla para tener consistencia
  const random = (n: number) => ((seed * n) % 97) / 97;
  
  // Asignamos popularidad a cada producto (con cierta variación pero consistencia anual)
  const productosConPopularidad = PRODUCTOS.map(producto => {
    // Cada producto tiene una popularidad base y una variación anual
    const popularidadBase = 0.5 + random(producto.id) * 0.5;
    const variacionAnual = 0.8 + random(producto.id + 10) * 0.4;
    
    // La popularidad evoluciona con los años (algunos productos crecen, otros decrecen)
    const añoIndex = AÑOS_DISPONIBLES.indexOf(año);
    const factorAño = Math.pow(variacionAnual, añoIndex);
    
    return {
      ...producto,
      popularidad: popularidadBase * factorAño
    };
  });
  
  // Ordenamos por popularidad y tomamos los 5 mejores
  const productosOrdenados = [...productosConPopularidad].sort((a, b) => b.popularidad - a.popularidad);
  const top5 = productosOrdenados.slice(0, 5);
  
  // Calculamos valores de ventas basados en la popularidad
  const totalVentas = (datosBase.get(año) || []).reduce((sum, val) => sum + val, 0);
  
  return top5.map(producto => {
    const ventas = Math.round(totalVentas * 0.005 * producto.popularidad);
    return {
      id: producto.id,
      nombre: producto.nombre,
      ventas,
      ganancia: Math.round(ventas * (0.55 + random(producto.id) * 0.1))
    };
  });
};

// Generar ventas por categoría
const generarVentasPorCategoria = (año: number, datosBase: Map<number, number[]>): VentasPorCategoria[] => {
  // Similar al enfoque de productos, pero para categorías
  const seed = año % 1000;
  const random = (n: number) => ((seed * n) % 97) / 97;
  
  const totalVentas = (datosBase.get(año) || []).reduce((sum, val) => sum + val, 0);
  
  // Calculamos popularidad de cada categoría (con evolución anual)
  const categoriasConPopularidad = CATEGORIAS.map(categoria => {
    const popularidadBase = 0.5 + random(categoria.id) * 0.5;
    const variacionAnual = 0.9 + random(categoria.id + 5) * 0.2;
    
    const añoIndex = AÑOS_DISPONIBLES.indexOf(año);
    const factorAño = Math.pow(variacionAnual, añoIndex);
    
    return {
      ...categoria,
      popularidad: popularidadBase * factorAño
    };
  });
  
  // La suma de todas las popularidades
  const totalPopularidad = categoriasConPopularidad.reduce((sum, cat) => sum + cat.popularidad, 0);
  
  // Asignamos porcentajes proporcionales a la popularidad
  return categoriasConPopularidad.map(categoria => {
    const porcentaje = Math.round(categoria.popularidad / totalPopularidad * 100);
    const ventas = Math.round(totalVentas * porcentaje / 100);
    
    return {
      id: categoria.id,
      nombre: categoria.nombre,
      ventas,
      ganancia: Math.round(ventas * (0.55 + random(categoria.id) * 0.1)),
      porcentaje
    };
  }).sort((a, b) => b.porcentaje - a.porcentaje);
};

// Generar datos completos del dashboard según filtros
export const generarDatosDashboard = (filtros: FiltrosDashboard): DashboardData => {
  // Generar datos base para todos los años (reutilizables)
  const datosBase = generarDatosBase();
  
  // Calcular totales anuales
  const valoresAnuales = datosBase.get(filtros.año) || [];
  let totalVentas = 0;
  let totalGanancia = 0;
  
  if (filtros.mes) {
    // Si hay filtro de mes, solo considerar ese mes
    totalVentas = valoresAnuales[filtros.mes - 1] || 0;
    totalGanancia = Math.round(totalVentas * 0.6);
  } else {
    // Si no hay filtro de mes, sumar todos los meses
    totalVentas = valoresAnuales.reduce((sum, val) => sum + val, 0);
    totalGanancia = Math.round(totalVentas * 0.6);
  }
  
  // Calcular porcentaje de ganancia
  const porcentajeGanancia = Math.round((totalGanancia / (totalVentas - totalGanancia)) * 100);
  
  // Calcular comparativa con período anterior
  let comparativaAnterior = 0;
  
  if (filtros.mes) {
    // Comparativa mensual: comparar con el mismo mes del año anterior
    const añoAnterior = filtros.año - 1;
    if (datosBase.has(añoAnterior)) {
      const ventasMesActual = valoresAnuales[filtros.mes - 1] || 0;
      const ventasMesAnterior = (datosBase.get(añoAnterior) || [])[filtros.mes - 1] || 0;
      
      if (ventasMesAnterior > 0) {
        comparativaAnterior = Math.round(((ventasMesActual - ventasMesAnterior) / ventasMesAnterior) * 100);
      }
    }
  } else {
    // Comparativa anual: comparar con año anterior
    const añoAnterior = filtros.año - 1;
    if (datosBase.has(añoAnterior)) {
      const ventasAñoActual = valoresAnuales.reduce((sum, val) => sum + val, 0);
      const ventasAñoAnterior = (datosBase.get(añoAnterior) || []).reduce((sum, val) => sum + val, 0);
      
      if (ventasAñoAnterior > 0) {
        comparativaAnterior = Math.round(((ventasAñoActual - ventasAñoAnterior) / ventasAñoAnterior) * 100);
      }
    }
  }
  
  // Generar productos más vendidos
  const productosMasVendidos = generarProductosMasVendidos(filtros.año, datosBase);
  
  // Generar ventas por categoría
  const categorias = generarVentasPorCategoria(filtros.año, datosBase);
  
  // Obtener producto y categoría top
  const productoTop = {
    id: productosMasVendidos[0].id,
    nombre: productosMasVendidos[0].nombre,
    ventas: productosMasVendidos[0].ventas,
    monto: productosMasVendidos[0].ganancia
  };
  
  const categoriaTop = {
    id: categorias[0].id,
    nombre: categorias[0].nombre,
    ventas: categorias[0].ventas,
    monto: categorias[0].ganancia
  };
  
  // Datos de distribución
  const distribucion = {
    porTipo: {
      online: getRandomNumber(45, 55),
      local: getRandomNumber(45, 55)
    },
    porPago: {
      efectivo: getRandomNumber(43, 57),
      transferencia: getRandomNumber(43, 57)
    }
  };
  
  // Ajustar distribución para que los pares sumen 100
  distribucion.porTipo.local = 100 - distribucion.porTipo.online;
  distribucion.porPago.transferencia = 100 - distribucion.porPago.efectivo;
  
  // Datos completos del dashboard
  return {
    kpis: {
      ventas: {
        totalVentas,
        gananciaTotal: totalGanancia,
        porcentajeGanancia,
        comparativaAnterior
      },
      productos: {
        productoTop,
        categoriaTop
      }
    },
    graficos: {
      ventasMensuales: generarVentasMensuales(filtros.año, datosBase),
      ventasDiarias: filtros.mes 
        ? generarVentasDiarias(filtros.año, filtros.mes, datosBase)
        : generarVentasDiarias(filtros.año, new Date().getMonth() + 1, datosBase),
      productosMasVendidos,
      distribucion,
      categorias
    },
    metadata: {
      añosDisponibles: AÑOS_DISPONIBLES,
      ultimaActualizacion: new Date().toISOString()
    }
  };
};

// Función para guardar preferencias de dashboard en localStorage
export const guardarPreferenciasDashboard = (filtros: FiltrosDashboard): void => {
  try {
    localStorage.setItem('dashboardFiltros', JSON.stringify(filtros));
    console.log('Preferencias de dashboard guardadas correctamente');
  } catch (error) {
    console.error('Error al guardar preferencias:', error);
  }
};

// Función para cargar preferencias de dashboard desde localStorage
export const cargarPreferenciasDashboard = (): FiltrosDashboard | null => {
  try {
    const filtrosGuardados = localStorage.getItem('dashboardFiltros');
    if (filtrosGuardados) {
      return JSON.parse(filtrosGuardados) as FiltrosDashboard;
    }
    return null;
  } catch (error) {
    console.error('Error al cargar preferencias:', error);
    return null;
  }
};

export default {
  generarDatosDashboard,
  guardarPreferenciasDashboard,
  cargarPreferenciasDashboard
};