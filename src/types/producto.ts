/**
 * Interfaces para la gestión de productos
 */

import type { Categoria } from './categoria';

/**
 * Interfaz principal del producto
 */
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen_url: string | null;
  disponible: boolean;
  creado_en: string;
  actualizado_en: string;
  categorias?: Categoria[]; // Categorías asociadas al producto
}

/**
 * Datos para formulario de producto (crear/editar)
 */
export interface ProductoFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen_url?: string;
  disponible: boolean;
  categorias: number[]; // IDs de categorías seleccionadas
}

/**
 * Datos de paginación
 */
export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Respuesta del backend para listado de productos
 */
export interface ProductosResponse {
  success: boolean;
  data: {
    productos: Producto[];
    pagination: PaginationData;
  };
  message: string;
}

/**
 * Respuesta del backend para un producto específico
 */
export interface ProductoResponse {
  success: boolean;
  data: {
    producto: Producto;
  };
  message: string;
}

/**
 * Parámetros para búsqueda y filtrado de productos
 */
export interface ProductoFilters {
  page?: number;
  limit?: number;
  categoria?: number;
  disponible?: boolean;
  search?: string;
}

/**
 * Datos para verificación de stock
 */
export interface StockCheck {
  id: number;
  cantidad: number;
}

/**
 * Respuesta de verificación de stock
 */
export interface StockCheckResponse {
  success: boolean;
  data: {
    disponible: boolean;
    productos: Array<{
      id: number;
      disponible: boolean;
      stock_actual: number;
      cantidad_solicitada: number;
    }>;
  };
  message: string;
}

/**
 * Respuesta de subida de imagen
 */
export interface ImageUploadResponse {
  success: boolean;
  data: {
    url: string;
    fileName: string;
    size: number;
  };
  message: string;
}