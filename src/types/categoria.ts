// Tipos TypeScript para el módulo de Categorías

/**
 * Interfaz principal para una categoría del gimnasio
 */
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Datos del formulario para crear/editar categorías
 * Omite campos auto-generados como id, timestamps
 */
export interface CategoriaFormData {
  nombre: string;
  descripcion?: string;
}

/**
 * Datos para crear una nueva categoría (envío a API)
 */
export interface CreateCategoriaRequest {
  nombre: string;
  descripcion?: string;
}

/**
 * Datos para actualizar una categoría existente
 */
export interface UpdateCategoriaRequest {
  nombre?: string;
  descripcion?: string;
}

/**
 * Respuesta de la API al obtener categorías
 */
export interface CategoriasResponse {
  success: boolean;
  data: {
    categorias: Categoria[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message: string;
}

/**
 * Parámetros para filtrar/buscar categorías
 */
export interface CategoriaFilters {
  search?: string;
  page?: number;
  limit?: number;
}