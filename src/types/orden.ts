/**
 * Tipos relacionados con las órdenes
 */

// Estados posibles de una orden
export type EstadoOrden = 'pendiente' | 'pagado' | 'enviado' | 'completado' | 'cancelado';

// Interfaz de detalle de producto en una orden
export interface DetalleOrden {
  id: number;
  orden_id: number;
  producto_id: number;
  producto_nombre?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

// Interfaz principal de Orden (campos según respuesta del backend)
export interface Orden {
  id: number;
  cliente: string; // Nombre del cliente (backend usa "cliente" en lugar de "cliente_nombre")
  telefono?: string; // Teléfono (backend usa "telefono" en lugar de "cliente_telefono")
  direccion?: string; // Dirección (backend usa "direccion" en lugar de "cliente_direccion")
  estado: EstadoOrden;
  total: number;
  fecha: string; // Fecha de creación (backend usa "fecha" en lugar de "fecha_creacion")
  admin_id?: number;
  admin_usuario?: string;
  notas?: string;
  detalles?: DetalleOrden[];
  // Campos adicionales cuando include_details=true
  detalle_orden?: DetalleOrden[];
  totalItems?: number;
  productosUnicos?: number;
}

// DTO para crear orden (ajustar según lo que espere el backend)
export interface CrearOrdenDTO {
  cliente: string;
  telefono?: string;
  direccion?: string;
  notas?: string;
  productos: {
    producto_id: number;
    cantidad: number;
  }[];
}

// DTO para actualizar orden (ajustar según lo que espere el backend)
export interface ActualizarOrdenDTO {
  cliente?: string;
  telefono?: string;
  direccion?: string;
  notas?: string;
  productos?: {
    producto_id: number;
    cantidad: number;
  }[];
}

// DTO para cambiar estado
export interface CambiarEstadoDTO {
  nuevoEstado: EstadoOrden;
}
