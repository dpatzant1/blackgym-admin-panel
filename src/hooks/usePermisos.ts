import { useAuth } from './useAuth';

/**
 * Hook personalizado para manejar permisos basados en roles
 * Verifica los permisos del usuario según su rol asignado
 */
export const usePermisos = () => {
  const { admin } = useAuth();
  const rol = admin?.rol?.nombre;

  // Definición de permisos por rol según la especificación del backend
  const permisosPorRol: Record<string, string[]> = {
    'administrador': ['*'], // Wildcard = todos los permisos
    'gerente': [
      'productos.crear',
      'productos.editar',
      'productos.eliminar',
      'productos.leer',
      'categorias.crear',
      'categorias.editar',
      'categorias.eliminar',
      'categorias.leer',
      'ordenes.crear',
      'ordenes.editar',
      'ordenes.leer',
      'ordenes.cambiar_estado',
      'bitacora.leer',
      'uploads.subir'
    ],
    'asesor de ventas': [
      'productos.leer',
      'categorias.leer',
      'ordenes.leer',
      'ordenes.crear'
    ]
  };

  /**
   * Verifica si el usuario actual tiene permiso para realizar una acción
   * @param accion - Nombre de la acción a verificar (ej: 'productos.crear')
   * @returns true si tiene permiso, false si no
   */
  const puede = (accion: string): boolean => {
    // Si no hay usuario autenticado o no tiene rol, no tiene permisos
    if (!admin || !rol) {
      return false;
    }

    // Obtener los permisos del rol actual
    const permisos = permisosPorRol[rol.toLowerCase()] || [];

    // Si tiene el wildcard '*', tiene todos los permisos
    if (permisos.includes('*')) {
      return true;
    }

    // Verificar si tiene el permiso específico
    return permisos.includes(accion);
  };

  /**
   * Verifica si el usuario es Administrador
   * @returns true si es administrador
   */
  const esAdmin = (): boolean => {
    return rol?.toLowerCase() === 'administrador';
  };

  /**
   * Verifica si el usuario es Gerente
   * @returns true si es gerente
   */
  const esGerente = (): boolean => {
    return rol?.toLowerCase() === 'gerente';
  };

  /**
   * Verifica si el usuario es Asesor de Ventas
   * @returns true si es asesor de ventas
   */
  const esAsesor = (): boolean => {
    return rol?.toLowerCase() === 'asesor de ventas';
  };

  /**
   * Verifica si el usuario tiene un rol asignado
   * @returns true si tiene rol asignado
   */
  const tieneRol = (): boolean => {
    return !!(admin?.rol_id && rol);
  };

  return {
    puede,
    esAdmin,
    esGerente,
    esAsesor,
    tieneRol,
    rol: rol || null,
    rolId: admin?.rol_id || null
  };
};
