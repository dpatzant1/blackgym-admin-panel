# Guía de Implementación Frontend - Panel de Administración

**Proyecto:** Black Gym - Panel de Administración  
**Fecha de creación:** 1 de octubre de 2025  
**Versión:** 1.0  
**Autor:** Equipo de Desarrollo

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Nuevas Funcionalidades del Backend](#nuevas-funcionalidades-del-backend)
3. [Cambios Requeridos en el Frontend](#cambios-requeridos-en-el-frontend)
4. [Estructura de Fases de Implementación](#estructura-de-fases-de-implementación)
5. [Detalles Técnicos por Módulo](#detalles-técnicos-por-módulo)
6. [Componentes Reutilizables](#componentes-reutilizables)
7. [Guía de Testing](#guía-de-testing)
8. [Consideraciones Importantes](#consideraciones-importantes)

---

## 🎯 Visión General

### Contexto del Backend

El backend de Black Gym ha implementado tres nuevos sistemas críticos que **requieren integración en el frontend**:

1. **Sistema de Bitácora (Auditoría)** 
   - Registro de todas las acciones administrativas
   - Nuevos endpoints: `/api/bitacora/*`
   - Permite rastrear quién hizo qué y cuándo

2. **Sistema de Roles (RBAC - Control de Acceso Basado en Roles)**
   - 3 roles: Administrador, Gerente, Asesor de Ventas
   - Nuevos endpoints: `/api/roles/*`
   - Control granular de permisos por rol
   - Campo `rol_id` agregado a administradores

3. **Estados de Órdenes (Flujo de Vida)**
   - Estados: pendiente → pagado → enviado → completado (o cancelado)
   - Nuevo endpoint: `PUT /api/ordenes/:id/estado`
   - Campo `estado` agregado a todas las órdenes

### Objetivos de la Implementación Frontend

- ✅ **Gestionar roles de administradores** desde el panel
- ✅ **Visualizar y cambiar estados de órdenes** con validación
- ✅ **Consultar bitácora de auditoría** con filtros y exportación
- ✅ **Aplicar control de acceso visual** según el rol del usuario
- ✅ **Mejorar UX** con indicadores visuales y feedback claro

---

## 🔄 Nuevas Funcionalidades del Backend

### 1. Endpoints de Bitácora

```http
# Listar bitácora con filtros y paginación
GET /api/bitacora?page=1&limit=20&adminId=5&accion=LOGIN&fechaInicio=2025-01-01

# Obtener estadísticas de auditoría
GET /api/bitacora/stats

# Exportar bitácora (CSV o JSON)
GET /api/bitacora/export?formato=csv

# Filtrar por administrador específico
GET /api/bitacora/admin/:adminId

# Filtrar por tipo de acción
GET /api/bitacora/accion/:accion

# Filtrar por rango de fechas
GET /api/bitacora/fecha?fechaInicio=2025-01-01&fechaFin=2025-12-31
```

**Estructura de respuesta:**
```json
{
  "success": true,
  "data": {
    "registros": [
      {
        "id": 1,
        "admin_id": 5,
        "admin_usuario": "juan.perez",
        "accion": "CREAR_PRODUCTO",
        "descripcion": "Producto creado: ID=10, Nombre=\"Proteína Whey\", Precio=45.00",
        "fecha": "2025-09-30T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### 2. Endpoints de Roles

```http
# Listar todos los roles disponibles
GET /api/roles

# Obtener rol específico por ID
GET /api/roles/:id

# Obtener rol por nombre
GET /api/roles/nombre/:nombre

# Obtener permisos de un rol
GET /api/roles/:id/permisos?expandir=true

# Listar administradores por rol
GET /api/roles/:id/administradores

# Obtener estadísticas de roles
GET /api/roles/stats

# Asignar rol a un administrador
PUT /api/administradores/:id/rol
Body: { "rol_id": 2 }
```

**Estructura de rol:**
```json
{
  "id": 2,
  "nombre": "gerente",
  "descripcion": "Gestión de productos, categorías y órdenes"
}
```

**Permisos por rol:**
```javascript
// Administrador
['*'] // Wildcard = todos los permisos

// Gerente
[
  'productos.crear', 'productos.editar', 'productos.eliminar',
  'categorias.crear', 'categorias.editar', 'categorias.eliminar',
  'ordenes.editar', 'ordenes.cambiar_estado',
  'bitacora.leer', 'uploads.subir'
]

// Asesor de Ventas
[
  'productos.leer', 'ordenes.leer', 'ordenes.crear', 'categorias.leer'
]
```

### 3. Endpoints de Estados de Órdenes

```http
# Cambiar estado de una orden
PUT /api/ordenes/:id/estado
Body: { "nuevoEstado": "pagado" }

# Las órdenes ahora incluyen campo "estado"
GET /api/ordenes/:id
Response: { "id": 123, "cliente": "Juan", "estado": "pendiente", ... }
```

**Transiciones válidas:**
```
pendiente → pagado, cancelado
pagado → enviado, cancelado
enviado → completado
completado → (ninguno, estado final)
cancelado → (ninguno, estado final)
```

### 4. Endpoint de Perfil Actualizado

```http
# Ahora incluye información del rol
GET /api/auth/perfil
Response: {
  "id": 5,
  "usuario": "juan.perez",
  "rol_id": 2,
  "rol": {
    "id": 2,
    "nombre": "gerente",
    "descripcion": "Gestión de productos, categorías y órdenes"
  }
}
```

---

## 🔧 Cambios Requeridos en el Frontend

### Cambios Mínimos (CRÍTICOS)

1. **Actualizar contexto de autenticación** para incluir información de rol
2. **Agregar selector de rol** en gestión de administradores
3. **Mostrar y cambiar estados** en órdenes
4. **Ocultar/deshabilitar acciones** según permisos del rol

### Cambios Recomendados (IMPORTANTES)

5. **Crear página de Bitácora** para auditoría
6. **Agregar estadísticas** al dashboard
7. **Mejorar UX** con badges, timelines y tooltips
8. **Proteger rutas** según roles

### Cambios Opcionales (NICE TO HAVE)

9. Página de gestión de roles
10. Gráficos de actividad en bitácora
11. Notificaciones en tiempo real
12. Exportación de reportes

---

## 📊 Estructura de Fases de Implementación

### FASE 1: Fundamentos - Autenticación y Roles ⚡ (CRÍTICO)
**Objetivo:** Actualizar el sistema de autenticación para soportar roles  
**Tiempo estimado:** 2-3 horas  
**Prioridad:** 🔴 CRÍTICA

#### 1.1 Actualizar Contexto de Autenticación
- [x] Modificar `AuthContext` o archivo de autenticación
- [x] Actualizar llamada a `/api/auth/perfil` para obtener información de rol
- [x] Agregar campos al estado: `user.rol_id`, `user.rol.nombre`, `user.rol.descripcion`
- [x] Persistir información de rol en localStorage/sessionStorage
- [x] Actualizar función de login para cargar rol automáticamente

**Ejemplo de implementación:**
```typescript
// contexts/AuthContext.tsx
interface User {
  id: number;
  usuario: string;
  rol_id?: number;
  rol?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
}

const login = async (usuario: string, password: string) => {
  const response = await fetch('/api/auth/perfil', {
    headers: {
      'x-admin-user': usuario,
      'x-admin-password': password
    }
  });
  
  const data = await response.json();
  const user = data.data; // Incluye rol_id y rol
  
  setUser(user);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('credentials', JSON.stringify({ usuario, password }));
};
```

#### 1.2 Crear Hook de Permisos
- [x] Crear archivo `hooks/usePermisos.ts` o `hooks/usePermissions.ts`
- [x] Implementar función `puede(accion)` que verifica permisos
- [x] Implementar helpers: `esAdmin()`, `esGerente()`, `esAsesor()`
- [x] Manejar caso especial de usuario sin rol asignado

**Ejemplo de implementación:**
```typescript
// hooks/usePermisos.ts
export const usePermisos = () => {
  const { user } = useAuth();
  const rol = user?.rol?.nombre;
  
  const permisosPorRol = {
    'administrador': ['*'],
    'gerente': [
      'productos.crear', 'productos.editar', 'productos.eliminar',
      'categorias.crear', 'categorias.editar', 'categorias.eliminar',
      'ordenes.editar', 'ordenes.cambiar_estado',
      'bitacora.leer', 'uploads.subir'
    ],
    'asesor de ventas': [
      'productos.leer', 'ordenes.leer', 'ordenes.crear', 'categorias.leer'
    ]
  };
  
  const puede = (accion: string): boolean => {
    if (!rol) return false;
    const permisos = permisosPorRol[rol] || [];
    return permisos.includes('*') || permisos.includes(accion);
  };
  
  const esAdmin = () => rol === 'administrador';
  const esGerente = () => rol === 'gerente';
  const esAsesor = () => rol === 'asesor de ventas';
  
  return { puede, esAdmin, esGerente, esAsesor, rol };
};
```

#### 1.3 Agregar Indicador de Rol en Navbar
- [x] Mostrar rol actual del usuario en el navbar o sidebar
- [x] Agregar tooltip o badge visual del rol
- [x] Considerar código de colores por rol

**Ejemplo visual:**
```tsx
<div className="user-info">
  <Avatar src={user.avatar} />
  <div>
    <p className="font-medium">{user.usuario}</p>
    <Badge variant={getRoleBadgeVariant(user.rol?.nombre)}>
      {user.rol?.nombre || 'Sin rol'}
    </Badge>
  </div>
</div>
```

---

### FASE 2: Gestión de Roles - Asignación de Roles a Admins 🟡
**Objetivo:** Permitir asignar roles a administradores  
**Tiempo estimado:** 3-4 horas  
**Prioridad:** 🔴 ALTA

#### 2.1 Actualizar Tabla de Administradores
- [x] Agregar columna "Rol" en la tabla de administradores
- [x] Mostrar `admin.rol?.nombre || 'Sin rol asignado'`
- [x] Agregar badge visual del rol con colores distintivos
- [x] Ordenar por rol (opcional)

#### 2.2 Crear Componente de Asignación de Rol
- [x] Crear `components/admin/AsignarRol.tsx` o similar
- [x] Implementar selector/dropdown de roles disponibles
- [x] Obtener lista de roles desde `GET /api/roles`
- [x] Implementar función de asignación: `PUT /api/administradores/:id/rol`
- [x] Agregar confirmación antes de cambiar rol
- [x] Mostrar toast de éxito/error

**Ejemplo de implementación:**
```typescript
const AsignarRol = ({ admin, onRolAsignado }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetch('/api/roles')
      .then(r => r.json())
      .then(data => setRoles(data.data.roles));
  }, []);
  
  const handleAsignarRol = async (rolId: number) => {
    setLoading(true);
    const response = await fetch(`/api/administradores/${admin.id}/rol`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-user': credentials.usuario,
        'x-admin-password': credentials.password
      },
      body: JSON.stringify({ rol_id: rolId })
    });
    
    if (response.ok) {
      toast.success('Rol asignado correctamente');
      onRolAsignado();
    } else {
      toast.error('Error al asignar rol');
    }
    setLoading(false);
  };
  
  return (
    <Select 
      value={admin.rol_id || ''} 
      onChange={(e) => handleAsignarRol(Number(e.target.value))}
      disabled={loading}
    >
      <option value="">Sin rol</option>
      {roles.map(rol => (
        <option key={rol.id} value={rol.id}>
          {rol.nombre}
        </option>
      ))}
    </Select>
  );
};
```

#### 2.3 Restringir Acceso a Gestión de Administradores
- [x] Solo administradores pueden ver la lista de administradores
- [x] Ocultar opción de menú si no es administrador
- [x] Redirigir si intenta acceder sin permisos

---

### FASE 3: Estados de Órdenes - Gestión del Ciclo de Vida 🟢
**Objetivo:** Visualizar y cambiar estados de órdenes  
**Tiempo estimado:** 3-4 horas  
**Prioridad:** 🟡 MEDIA-ALTA

#### 3.1 Actualizar Componente de Lista de Órdenes
- [x] Agregar columna "Estado" en la tabla de órdenes
- [x] Crear componente `EstadoBadge` para mostrar estado visual
- [x] Usar colores distintivos por estado:
  - `pendiente`: amarillo/warning
  - `pagado`: azul/info
  - `enviado`: púrpura/primary
  - `completado`: verde/success
  - `cancelado`: rojo/destructive

**Ejemplo de componente:**
```tsx
const EstadoBadge = ({ estado }: { estado: string }) => {
  const config = {
    'pendiente': { color: 'bg-yellow-500', icon: '⏳', label: 'Pendiente' },
    'pagado': { color: 'bg-blue-500', icon: '💳', label: 'Pagado' },
    'enviado': { color: 'bg-purple-500', icon: '📦', label: 'Enviado' },
    'completado': { color: 'bg-green-500', icon: '✅', label: 'Completado' },
    'cancelado': { color: 'bg-red-500', icon: '❌', label: 'Cancelado' }
  };
  
  const { color, icon, label } = config[estado] || config['pendiente'];
  
  return (
    <Badge className={`${color} text-white`}>
      {icon} {label}
    </Badge>
  );
};
```

#### 3.2 Crear Componente de Cambio de Estado
- [x] Crear `components/ordenes/CambiarEstado.tsx`
- [x] Implementar dropdown de estados permitidos según estado actual
- [x] Validar transiciones en el frontend (validación adicional)
- [x] Implementar llamada a `PUT /api/ordenes/:id/estado`
- [x] Manejar errores de transición inválida (backend rechazará)
- [x] Mostrar mensaje de éxito con nuevo estado

**Mapa de transiciones:**
```typescript
const TRANSICIONES_PERMITIDAS = {
  'pendiente': ['pagado', 'cancelado'],
  'pagado': ['enviado', 'cancelado'],
  'enviado': ['completado'],
  'completado': [],
  'cancelado': []
};

const obtenerEstadosPermitidos = (estadoActual: string) => {
  return TRANSICIONES_PERMITIDAS[estadoActual] || [];
};
```

#### 3.3 Mejorar Vista de Detalle de Orden
- [x] Agregar timeline visual del flujo de estado
- [x] Mostrar histórico de cambios (si se guarda)
- [x] Agregar selector de nuevo estado solo si es posible cambiar
- [x] Mostrar mensaje si está en estado final

**Ejemplo de timeline:**
```tsx
const OrdenTimeline = ({ orden }) => {
  const estados = ['pendiente', 'pagado', 'enviado', 'completado'];
  const estadoActualIndex = estados.indexOf(orden.estado);
  
  return (
    <div className="flex items-center gap-2">
      {estados.map((estado, index) => (
        <div key={estado} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${index <= estadoActualIndex ? 'bg-green-500' : 'bg-gray-300'}
          `}>
            {index < estadoActualIndex ? '✓' : index + 1}
          </div>
          {index < estados.length - 1 && (
            <div className={`
              w-12 h-1 
              ${index < estadoActualIndex ? 'bg-green-500' : 'bg-gray-300'}
            `} />
          )}
        </div>
      ))}
    </div>
  );
};
```

#### 3.4 Aplicar Permisos de Cambio de Estado
- [x] Solo administradores y gerentes pueden cambiar estado
- [x] Ocultar botón/selector si no tiene permiso
- [x] Mostrar tooltip explicativo si no tiene permiso

---

### FASE 4: Control de Acceso Visual - Ocultar/Deshabilitar 🔒
**Objetivo:** Aplicar permisos visuales en toda la aplicación  
**Tiempo estimado:** 4-5 horas  
**Prioridad:** 🟡 MEDIA

#### 4.1 Actualizar Módulo de Productos
- [x] Ocultar botón "Crear Producto" si no tiene permiso `productos.crear`
- [x] Ocultar botón "Editar" si no tiene permiso `productos.editar`
- [x] Ocultar botón "Eliminar" si no tiene permiso `productos.eliminar`
- [x] Deshabilitar campos del formulario si solo tiene lectura

**Ejemplo:**
```tsx
const ProductoCard = ({ producto }) => {
  const { puede } = usePermisos();
  
  return (
    <Card>
      <h3>{producto.nombre}</h3>
      <p>{producto.precio}</p>
      
      <div className="actions">
        {puede('productos.editar') && (
          <Button onClick={handleEditar}>Editar</Button>
        )}
        {puede('productos.eliminar') && (
          <Button variant="destructive" onClick={handleEliminar}>
            Eliminar
          </Button>
        )}
        {!puede('productos.editar') && !puede('productos.eliminar') && (
          <p className="text-muted text-sm">
            No tienes permisos para modificar este producto
          </p>
        )}
      </div>
    </Card>
  );
};
```

#### 4.2 Actualizar Módulo de Categorías
- [x] Aplicar misma lógica que productos
- [x] Ocultar botones de creación/edición/eliminación según permisos

#### 4.3 Actualizar Módulo de Órdenes
- [x] Ver órdenes: todos los roles autenticados
- [x] Crear orden: todos los roles autenticados
- [x] Editar orden: solo admin y gerente
- [x] Cancelar orden: solo administrador
- [x] Cambiar estado: solo admin y gerente

#### 4.4 Proteger Rutas del Panel
- [x] Crear componente `ProtectedRoute` o usar librería de routing
- [x] Verificar autenticación antes de mostrar ruta
- [x] Verificar permisos específicos según ruta
- [x] Redirigir a página de "Sin Permisos" o "Acceso Denegado"

**Ejemplo con React Router:**
```tsx
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user } = useAuth();
  const { puede } = usePermisos();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredPermission && !puede(requiredPermission)) {
    return <Navigate to="/sin-permisos" />;
  }
  
  return children;
};

// Uso
<Route path="/administradores" element={
  <ProtectedRoute requiredPermission="admins.leer">
    <AdministradoresPage />
  </ProtectedRoute>
} />
```

#### 4.5 Actualizar Menú de Navegación
- [x] Ocultar opciones de menú según permisos
- [x] Ejemplo: "Administradores" solo visible para admins
- [x] Ejemplo: "Bitácora" solo visible para admins y gerentes

---

### FASE 5: Módulo de Bitácora - Auditoría 📊 (OPCIONAL)
**Objetivo:** Crear módulo completo de consulta de bitácora  
**Tiempo estimado:** 5-6 horas  
**Prioridad:** 🟢 BAJA-MEDIA

#### 5.1 Crear Página de Bitácora
- [ ] Crear archivo `pages/Bitacora.tsx` o similar
- [ ] Implementar tabla de registros con paginación
- [ ] Agregar columnas: Fecha, Admin, Acción, Descripción
- [ ] Implementar carga de datos desde `GET /api/bitacora`

#### 5.2 Implementar Filtros de Búsqueda
- [ ] Filtro por administrador (dropdown)
- [ ] Filtro por acción (dropdown de acciones disponibles)
- [ ] Filtro por rango de fechas (date picker)
- [ ] Botón "Buscar" que actualiza la tabla
- [ ] Botón "Limpiar filtros"

**Acciones disponibles:**
```typescript
const ACCIONES_BITACORA = [
  'LOGIN', 'LOGOUT', 'CAMBIAR_PASSWORD',
  'CREAR_PRODUCTO', 'EDITAR_PRODUCTO', 'ELIMINAR_PRODUCTO', 'ACTUALIZAR_STOCK',
  'CREAR_CATEGORIA', 'EDITAR_CATEGORIA', 'ELIMINAR_CATEGORIA', 'ASIGNAR_CATEGORIAS',
  'CREAR_ORDEN', 'EDITAR_ORDEN', 'CANCELAR_ORDEN', 'CAMBIAR_ESTADO_ORDEN',
  'CREAR_ADMIN', 'ASIGNAR_ROL',
  'SUBIR_IMAGEN', 'ELIMINAR_IMAGEN'
];
```

#### 5.3 Implementar Paginación
- [ ] Controles de paginación (anterior, siguiente, ir a página)
- [ ] Selector de límite por página (10, 20, 50, 100)
- [ ] Mostrar información: "Mostrando X-Y de Z registros"

#### 5.4 Implementar Exportación
- [ ] Botón "Exportar a CSV"
- [ ] Botón "Exportar a JSON" (opcional)
- [ ] Llamar a `GET /api/bitacora/export?formato=csv`
- [ ] Descargar archivo automáticamente
- [ ] Aplicar filtros actuales a la exportación

**Ejemplo de exportación:**
```typescript
const handleExportar = async (formato: 'csv' | 'json') => {
  const params = new URLSearchParams(filtros);
  params.append('formato', formato);
  
  const response = await fetch(`/api/bitacora/export?${params}`, {
    headers: {
      'x-admin-user': credentials.usuario,
      'x-admin-password': credentials.password
    }
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bitacora_${new Date().toISOString()}.${formato}`;
  a.click();
};
```

#### 5.5 Agregar Vista de Detalles de Registro
- [ ] Modal o drawer para ver registro completo
- [ ] Mostrar todos los campos con formato legible
- [ ] Resaltar información importante

---

### FASE 6: Dashboard y Estadísticas 📈 (OPCIONAL)
**Objetivo:** Agregar widgets de estadísticas al dashboard  
**Tiempo estimado:** 3-4 horas  
**Prioridad:** 🟢 BAJA

#### 6.1 Agregar Widgets de Estadísticas de Bitácora
- [ ] Card "Acciones Hoy" - `statsBitacora.accionesHoy`
- [ ] Card "Acciones Esta Semana" - `statsBitacora.accionesEstaSemana`
- [ ] Card "Total Acciones" - `statsBitacora.totalAcciones`
- [ ] Gráfico de barras "Acciones por Tipo"
- [ ] Obtener datos desde `GET /api/bitacora/stats`

#### 6.2 Agregar Widgets de Roles
- [ ] Card "Total Administradores" - `statsRoles.totalAdministradores`
- [ ] Card "Admins sin Rol" - `statsRoles.administradoresSinRol`
- [ ] Gráfico de torta "Distribución por Rol"
- [ ] Obtener datos desde `GET /api/roles/stats`

#### 6.3 Agregar Widget de Órdenes por Estado
- [ ] Card por cada estado con contador
- [ ] Gráfico de flujo de estados
- [ ] Filtrar órdenes por estado con un clic

---

### FASE 7: Mejoras de UX 🎨 (OPCIONAL)
**Objetivo:** Pulir la experiencia de usuario  
**Tiempo estimado:** 3-4 horas  
**Prioridad:** 🟢 BAJA

#### 7.1 Agregar Tooltips Informativos
- [ ] Tooltip en botones deshabilitados explicando por qué
- [ ] Tooltip en badges de rol con descripción del rol
- [ ] Tooltip en estados de orden con siguiente acción sugerida

#### 7.2 Mejorar Feedback Visual
- [ ] Animaciones de transición de estados
- [ ] Loading skeletons en tablas
- [ ] Toast notifications consistentes
- [ ] Confirmaciones antes de acciones destructivas

#### 7.3 Agregar Página de "Sin Permisos"
- [ ] Diseño amigable explicando la situación
- [ ] Mostrar qué rol tiene el usuario
- [ ] Mostrar quién puede darle más permisos
- [ ] Botón de "Volver" o "Ir al Dashboard"

#### 7.4 Agregar Ayuda Contextual
- [ ] Modales o popovers con ayuda de cómo usar cada módulo
- [ ] Documentación inline de permisos requeridos
- [ ] Tour guiado para nuevos usuarios (opcional)

---

## 🧩 Componentes Reutilizables a Crear

### 1. `EstadoBadge` - Badge Visual de Estado
```tsx
interface EstadoBadgeProps {
  estado: 'pendiente' | 'pagado' | 'enviado' | 'completado' | 'cancelado';
  size?: 'sm' | 'md' | 'lg';
}

const EstadoBadge = ({ estado, size = 'md' }: EstadoBadgeProps) => {
  // Implementación con colores e iconos
};
```

### 2. `RolBadge` - Badge Visual de Rol
```tsx
interface RolBadgeProps {
  rol: 'administrador' | 'gerente' | 'asesor de ventas' | null;
  showTooltip?: boolean;
}

const RolBadge = ({ rol, showTooltip = true }: RolBadgeProps) => {
  // Implementación con colores y descripción
};
```

### 3. `PermisoGate` - Componente para Ocultar por Permisos
```tsx
interface PermisoGateProps {
  permiso: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PermisoGate = ({ permiso, children, fallback }: PermisoGateProps) => {
  const { puede } = usePermisos();
  
  if (!puede(permiso)) {
    return fallback || null;
  }
  
  return <>{children}</>;
};

// Uso
<PermisoGate permiso="productos.eliminar">
  <Button onClick={handleEliminar}>Eliminar</Button>
</PermisoGate>
```

### 4. `OrdenTimeline` - Timeline Visual de Estados
```tsx
interface OrdenTimelineProps {
  estadoActual: string;
  vertical?: boolean;
}

const OrdenTimeline = ({ estadoActual, vertical = false }: OrdenTimelineProps) => {
  // Implementación con steps visuales
};
```

### 5. `AsignarRol` - Selector de Rol
```tsx
interface AsignarRolProps {
  adminId: number;
  rolActual?: number;
  onRolAsignado: () => void;
  disabled?: boolean;
}

const AsignarRol = ({ adminId, rolActual, onRolAsignado, disabled }: AsignarRolProps) => {
  // Implementación con dropdown y confirmación
};
```

### 6. `FiltrosBitacora` - Panel de Filtros de Auditoría
```tsx
interface FiltrosBitacoraProps {
  onFiltrosChange: (filtros: FiltrosBitacora) => void;
  onLimpiar: () => void;
}

const FiltrosBitacora = ({ onFiltrosChange, onLimpiar }: FiltrosBitacoraProps) => {
  // Implementación con selects y date pickers
};
```

---

## 🧪 Guía de Testing

### Testing por Rol

#### Test 1: Usuario Administrador
```
✓ Puede ver todos los módulos en el menú
✓ Puede crear/editar/eliminar productos
✓ Puede crear/editar/eliminar categorías
✓ Puede crear/editar órdenes
✓ Puede cancelar órdenes
✓ Puede cambiar estado de órdenes
✓ Puede ver lista de administradores
✓ Puede asignar roles a otros admins
✓ Puede ver bitácora completa
✓ Puede exportar bitácora
✓ Puede ver estadísticas completas
```

#### Test 2: Usuario Gerente
```
✓ Puede ver productos, categorías, órdenes, bitácora en menú
✗ NO puede ver administradores en menú
✓ Puede crear/editar/eliminar productos
✓ Puede crear/editar/eliminar categorías
✓ Puede crear/editar órdenes
✗ NO puede cancelar órdenes (botón oculto o deshabilitado)
✓ Puede cambiar estado de órdenes
✗ NO puede acceder a /administradores (redirige)
✗ NO puede asignar roles
✓ Puede ver bitácora
✗ NO puede ver estadísticas de bitácora
✗ NO puede exportar bitácora
```

#### Test 3: Usuario Asesor de Ventas
```
✓ Puede ver productos, categorías, órdenes en menú
✗ NO puede ver administradores, bitácora en menú
✓ Puede ver lista de productos (solo lectura)
✗ NO puede crear/editar/eliminar productos
✓ Puede ver lista de categorías (solo lectura)
✗ NO puede crear/editar/eliminar categorías
✓ Puede ver lista de órdenes
✓ Puede crear órdenes
✗ NO puede editar órdenes
✗ NO puede cancelar órdenes
✗ NO puede cambiar estado de órdenes
✗ NO puede acceder a /administradores
✗ NO puede acceder a /bitacora
```

### Testing de Estados de Órdenes

```javascript
// Caso 1: Transición válida
Orden con estado "pendiente" → cambiar a "pagado" → ✓ Éxito

// Caso 2: Transición inválida
Orden con estado "pendiente" → cambiar a "enviado" → ✗ Error 400

// Caso 3: Estado final
Orden con estado "completado" → no mostrar selector → ✓ Correcto

// Caso 4: Sin permisos
Usuario "asesor de ventas" intenta cambiar estado → botón oculto → ✓ Correcto
```

### Testing de Bitácora

```javascript
// Caso 1: Registro automático
Admin crea producto → verificar registro en bitácora con acción "CREAR_PRODUCTO" → ✓

// Caso 2: Filtros
Filtrar por acción "LOGIN" → solo ver registros de login → ✓

// Caso 3: Exportación
Exportar bitácora filtrada → descargar CSV con solo datos filtrados → ✓

// Caso 4: Permisos
Usuario sin permiso intenta acceder a /bitacora → redirige → ✓
```

---

## ⚠️ Consideraciones Importantes

### 1. Seguridad

#### Backend Valida Permisos (NO confiar en frontend)
- El frontend oculta/deshabilita botones por UX
- El backend rechaza peticiones sin permisos con 403
- **NUNCA** asumir que el frontend es suficiente para seguridad

#### Manejo de Errores 403
```typescript
// Interceptor global
const handleApiError = (response: Response) => {
  if (response.status === 403) {
    toast.error('No tienes permisos para realizar esta acción');
    // Opcional: actualizar UI o redirigir
  }
  return response;
};
```

### 2. Rendimiento

#### Cachear Lista de Roles
```typescript
// Los roles no cambian frecuentemente
const rolesCache = {
  data: null,
  timestamp: null,
  TTL: 60 * 60 * 1000 // 1 hora
};

const obtenerRoles = async () => {
  const now = Date.now();
  if (rolesCache.data && (now - rolesCache.timestamp) < rolesCache.TTL) {
    return rolesCache.data;
  }
  
  const response = await fetch('/api/roles');
  const data = await response.json();
  rolesCache.data = data.data.roles;
  rolesCache.timestamp = now;
  return rolesCache.data;
};
```

#### Paginación de Bitácora
- No cargar toda la bitácora de una vez
- Usar límites razonables (20-50 registros por página)
- Implementar infinite scroll o paginación clásica

### 3. UX y Accesibilidad

#### Mensajes Claros
```tsx
// ❌ MAL
<Button disabled>Eliminar</Button>

// ✅ BIEN
<Tooltip content="No tienes permisos para eliminar productos">
  <Button disabled>Eliminar</Button>
</Tooltip>
```

#### Indicadores Visuales Consistentes
- Usar siempre los mismos colores para estados
- Usar iconos consistentes
- Mantener estilo de badges uniforme

### 4. Compatibilidad con Sistema Anterior

#### Usuarios sin Rol Asignado
```typescript
// Manejar caso de admin sin rol (sistema legacy)
const { puede } = usePermisos();

if (!user.rol_id) {
  // Mostrar banner: "Tu cuenta no tiene rol asignado. Contacta al administrador."
  return <SinRolAsignado />;
}
```

#### Credenciales en Headers
- El sistema sigue usando `x-admin-user` y `x-admin-password`
- No cambiar este sistema hasta migrar a JWT (futuro)

### 5. Preparación para el Futuro

#### JWT Migration Ready
```typescript
// Diseñar AuthContext preparado para JWT
interface AuthState {
  user: User | null;
  token?: string; // Para JWT futuro
  credentials?: { usuario: string; password: string }; // Sistema actual
  login: (usuario: string, password: string) => Promise<void>;
  logout: () => void;
}
```

#### Websockets para Notificaciones (futuro)
- Dejar espacio en el diseño para notificaciones en tiempo real
- Bitácora podría beneficiarse de actualizaciones live

---

## 📝 Checklist Final de Implementación

### Fase 1: Autenticación y Roles
- [x] Contexto de autenticación actualizado
- [x] Hook `usePermisos()` creado y funcionando
- [x] Indicador de rol en navbar
- [x] Persistencia de rol en localStorage

### Fase 2: Gestión de Roles
- [x] Columna de rol en tabla de administradores
- [x] Componente de asignación de rol funcional
- [x] Carga de roles disponibles desde API
- [x] Restricción de acceso a gestión de admins

### Fase 3: Estados de Órdenes
- [x] Badge de estado en lista de órdenes
- [x] Componente de cambio de estado
- [x] Timeline visual de estados (opcional)
- [x] Validación de transiciones

### Fase 4: Control de Acceso Visual
- [x] Botones ocultos según permisos en productos
- [x] Botones ocultos según permisos en categorías
- [x] Botones ocultos según permisos en órdenes
- [x] Rutas protegidas implementadas
- [x] Menú filtrado por permisos

### Fase 5: Bitácora (Opcional)
- [ ] Página de bitácora creada
- [ ] Filtros de búsqueda funcionando
- [ ] Paginación implementada
- [ ] Exportación a CSV/JSON
- [ ] Restricción de acceso (solo admin y gerente)

### Fase 6: Dashboard (Opcional)
- [ ] Widgets de estadísticas de bitácora
- [ ] Widgets de estadísticas de roles
- [ ] Gráficos visuales

### Fase 7: UX (Opcional)
- [ ] Tooltips informativos
- [ ] Confirmaciones antes de acciones
- [ ] Página de "Sin Permisos"
- [ ] Loading states y feedback visual

---

## 🚀 Orden de Implementación Recomendado

### Día 1: Fundamentos
1. Actualizar contexto de autenticación (1-2h)
2. Crear hook de permisos (1h)
3. Agregar indicador de rol (30min)

### Día 2: Gestión de Roles
4. Actualizar tabla de administradores (1h)
5. Crear componente de asignación de rol (2-3h)

### Día 3: Estados de Órdenes
6. Crear badge de estado (1h)
7. Implementar cambio de estado (2-3h)

### Día 4-5: Control de Acceso
8. Aplicar permisos en productos (1-2h)
9. Aplicar permisos en categorías (1h)
10. Aplicar permisos en órdenes (1-2h)
11. Proteger rutas (1-2h)
12. Filtrar menú (1h)

### Día 6-7: Bitácora (Opcional)
13. Crear página de bitácora (2-3h)
14. Implementar filtros (2h)
15. Implementar exportación (1h)

### Día 8: Dashboard y Pulido (Opcional)
16. Agregar widgets al dashboard (2-3h)
17. Mejorar UX general (1-2h)

**Total: 6-8 días de desarrollo**

---

## 📞 Recursos y Soporte

### Documentación del Backend
- Revisar `GUIA_IMPLEMENTACION_BITACORA_ROLES.md` para entender la API
- Sección "Ejemplos de Peticiones HTTP" tiene todos los endpoints documentados

### Endpoints Clave
```
GET  /api/auth/perfil                  → Obtener usuario con rol
GET  /api/roles                        → Listar roles
PUT  /api/administradores/:id/rol      → Asignar rol
GET  /api/bitacora                     → Listar bitácora
GET  /api/bitacora/export              → Exportar bitácora
PUT  /api/ordenes/:id/estado           → Cambiar estado de orden
```

### Contacto
- Consultar con el equipo de backend para dudas de API
- Revisar el código del backend si algo no está claro
- Testing con Postman antes de implementar en frontend

---

**Última actualización:** 1 de octubre de 2025  
**Versión del documento:** 1.0  
**Estado:** ✅ Listo para implementación
