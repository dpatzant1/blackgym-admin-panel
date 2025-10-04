# Manual Técnico - Black Gym Admin Panel (Frontend)

## 1. Introducción

Black Gym Admin Panel es una aplicación frontend en React + TypeScript + Vite diseñada para administrar productos y categorías de la tienda en línea del gimnasio "Black Gym". Proporciona interfaces para listar, crear, editar y eliminar productos y categorías, así como subir imágenes y manejar autenticación básica mediante credenciales almacenadas en el localStorage.

Este manual técnico describe la arquitectura, dependencias, estructura de carpetas, servicios, tipos, hooks, componentes clave, flujos de autenticación y despliegue.

---

## 2. Requisitos y dependencias

- Node.js (recomendado v18+)
- npm (o yarn)

Dependencias principales (definidas en `package.json`):

- react, react-dom (React 19)
- vite (bundler y dev server)
- typescript
- axios (consumo de API)
- react-router-dom (ruteo)
- react-hook-form (formularios)
- bootstrap, bootstrap-icons (UI)
- react-toastify (notificaciones)

Dependencias de desarrollo:
- @vitejs/plugin-react
- eslint y plugins relacionados

---

## 3. Scripts útiles

Los scripts disponibles en `package.json`:

- `npm run dev` - Inicia Vite en modo desarrollo (HMR).
- `npm run build` - Compila TypeScript (`tsc -b`) y construye la aplicación con Vite.
- `npm run lint` - Ejecuta ESLint en el proyecto.
- `npm run preview` - Previsualiza la build de producción con Vite.

---

## 4. Estructura del proyecto (resumen)

Raíz relevante:

- `index.html` - Entrada HTML.
- `src/main.tsx` - Punto de entrada que carga estilos globales y monta `App`.
- `src/App.tsx` - Definición de rutas y envoltura global (`AuthProvider`, `ToastContainer`).
- `src/context/` - Contextos de la app (autenticación).
  - `AuthProvider.tsx`, `AuthContext.ts`
- `src/components/` - Componentes reutilizables y layout.
  - `layout/` (`Header.tsx`, `Layout.tsx`, `Sidebar.tsx`)
  - `common/` (`ConfirmDeleteModal.tsx`, `ProtectedRoute.tsx`)
- `src/pages/` - Páginas por ruta (productos, categorías, auth, home).
- `src/services/` - Cliente API (axios) y funciones para consumir endpoints.
  - `productosService.ts`, `categoriasService.ts`, `authService.ts`
- `src/hooks/` - Custom hooks.
  - `useAuth.ts`, `useConfirmDelete.ts`
- `src/types/` - Interfaces/Tipos TypeScript para las entidades y respuestas.
- `src/utils/` - Utilidades (toasts, formateo, etc.)

---

## 5. Arquitectura y patrones

- Framework: React + TypeScript
- Bundler: Vite
- State local: useState/useEffect/useMemo/useCallback para la mayoría de la lógica de página.
- Global state: Context API para la autenticación (`AuthContext`).
- API client: Axios configurado por servicios especializados (`productosService`, `categoriasService`).
- Autenticación: credenciales básicas (usuario/password) guardadas en `localStorage` y enviadas en headers personalizados (`x-admin-user`, `x-admin-password`). El `AuthProvider` gestiona login/logout y verifica credenciales con el backend en `/api/administradores/verify`.
- Manejo de errores: utilidades de toasts (`src/utils/toast.ts`) y manejo local en cada servicio. `productoClient` añade un interceptor que redirige al login en 401/403.
- UI: Bootstrap 5 y Bootstrap Icons. Componentes reutilizables para modales y layout.

---

## 6. Flujo de autenticación

1. El `AuthProvider` al montar ejecuta `checkAuth()` que busca `admin-user` y `admin-password` en `localStorage`.
2. Si existe, hace POST a `${VITE_API_URL}/api/administradores/verify` con las credenciales.
3. Si la respuesta indica autenticación, el contexto se marca como `isAuthenticated` y se guarda el admin en estado.
4. Si falla la verificación, se limpian las credenciales y el usuario deberá loguearse.
5. En modo `DEV`, si el backend no responde, el provider permite acceso (admin ficticio) para facilitar desarrollo local.
6. Al hacer login (desde `LoginPage`), se llama a `login(credentials)` del provider; si es exitoso se guardan las credenciales en `localStorage`.
7. Los servicios protegidos usan `getAuthHeaders()` para incluir `x-admin-user` y `x-admin-password` en cada petición que requiera autenticación.

Consideraciones de seguridad: almacenar credenciales en `localStorage` no es seguro para producción. Se recomienda migrar a tokens JWT con refresh tokens y https.

---

## 7. Servicios API (detalles técnicos)

Los servicios se encuentran en `src/services` y son wrappers sobre axios o fetch. A continuación se resumen los principales comportamientos:

- productosService.ts
  - `getProductos(filters)` - GET /api/productos - público - soporta filtros y paginación.
  - `getProducto(id)` - GET /api/productos/:id - público - maneja múltiples formatos de respuesta.
  - `createProducto(productoData)` - POST /api/productos - requiere auth.
  - `updateProducto(id, productoData)` - PUT /api/productos/:id - requiere auth.
  - `deleteProducto(id)` - DELETE /api/productos/:id - requiere auth.
  - `uploadImage(file)` - POST /api/uploads/image - usa fetch con FormData y valida tipo/tamaño.
  - `checkStock(productos)` - POST /api/productos/check-stock
  - `searchProductos(query)` - GET /api/productos/search
  - `updateStock(id, stock)` - PATCH /api/productos/:id/stock
  - Manejo de errores: transforma errores Axios en mensajes legibles y lanza Error con texto.

- categoriasService.ts
  - Similar a productosService: endpoints CRUD para categorías y lógica para respuestas.

- authService.ts
  - Wrapper (si existe) para endpoints de administradores. `AuthProvider` usa fetch directo, pero `authService` puede contener utilidades adicionales.

---

## 8. Componentes clave

- `Layout` - Contenedor principal que incluye `Header` y `Sidebar` y define el `main` con margen superior.
- `Header` - Barra superior.
- `Sidebar` - Navegación lateral fija para escritorio con enlaces a Dashboard, Categorías y Productos.
- `ConfirmDeleteModal` - Modal reutilizable para confirmar eliminación de recursos. Permite pasar `loading`, `itemName`, `itemType` y callbacks.
- `ProtectedRoute` - Componente que protege rutas, redirige a `/login` si no hay autenticación.
- `ToastContainer` - Configurado en `App.tsx` para notificaciones globales.

---

## 9. Hooks personalizados

- `useAuth` - Hook que probablemente consuma `AuthContext` y expone `isAuthenticated`, `login`, `logout`, etc.
- `useConfirmDelete<T>` (archivo `src/hooks/useConfirmDelete.ts`) - Hook que maneja estado del modal de confirmación:
  - Estados: `isOpen`, `loading`, `itemToDelete`.
  - Funciones: `openModal(item)`, `closeModal()`, `handleConfirm(deleteFunction)` que ejecuta la función de borrado pasada con el item y controla el loading.

Ejemplo de uso: en `ProductosListPage`, se usa `deleteModal.openModal(producto)` para abrir el modal y luego `deleteModal.handleConfirm(handleEliminarProducto)` para ejecutar la eliminación.

---

## 10. Tipos y contratos (src/types)

El proyecto usa TypeScript con definiciones en `src/types`. Entre los tipos esperados se encuentran:

- Producto: id, nombre, descripcion, precio, stock, imagen_url, categorias: Categoria[]
- Categoria: id, nombre, descripcion, creado_en
- AuthContextType: { isAuthenticated, admin, isLoading, login, logout, checkAuth }
- Forms: ProductoFormData, CategoriaFormData
- Respuestas: ApiErrorResponse, ProductosResponse, etc.

Revisar `src/types` para confirmar campos y tipos exactos si se requiere precisión.

### 10.1 Tipos concretos (extraídos de `src/types`)

Los siguientes tipos fueron extraídos directamente de `src/types` para mayor precisión:

- Producto

```ts
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
  categorias?: Categoria[];
}
```

- ProductoFormData

```ts
export interface ProductoFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen_url?: string;
  disponible: boolean;
  categorias: number[]; // IDs de categorías seleccionadas
}
```

- Categoria

```ts
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  created_at: string;
  updated_at: string;
}
```

- Auth / Admin

```ts
export interface Admin {
  id: number;
  usuario: string;
  creado_en: string;
}

export interface LoginCredentials {
  usuario: string;
  password: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string[] | null;
}
```

### 10.2 Ejemplos de payloads y respuestas

Ejemplos orientativos (ajustar a la API real):

- Crear producto (POST /api/productos) - cuerpo:

```json
{
  "nombre": "Proteína Whey 2kg",
  "descripcion": "Sabor chocolate",
  "precio": 150.0,
  "stock": 25,
  "imagen_url": "https://cdn.example.com/prod.jpg",
  "disponible": true,
  "categorias": [1, 3]
}
```

- Respuesta esperada (201)

```json
{
  "success": true,
  "data": {
    "producto": {
      "id": 123,
      "nombre": "Proteína Whey 2kg",
      "precio": 150.0,
      "stock": 25,
      "imagen_url": "https://cdn.example.com/prod.jpg",
      "disponible": true,
      "categorias": [{ "id": 1, "nombre": "Suplementos" }]
    }
  },
  "message": "Producto creado"
}
```

- Obtener listado de productos (GET /api/productos)

Respuesta esperada:

```json
{
  "success": true,
  "data": {
    "productos": [ /* Producto[] */ ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 42,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "message": "Listado de productos"
}
```

- Error de validación (400) ejemplo:

```json
{
  "success": false,
  "error": "Datos inválidos",
  "details": ["El campo nombre es requerido"]
}
```

Estos ejemplos sirven como guía para testeo y para diseñar mock servers o contract tests.

---

## 11. Desarrollo local

Variables de entorno esperadas (Vite):
- `VITE_API_URL` - URL base del backend (ej. http://localhost:4000)

Pasos rápidos:

1. Clonar el repo y entrar en la carpeta del proyecto.
2. Instalar dependencias: `npm install`.
3. Crear `.env` o `.env.local` con `VITE_API_URL`.
4. Ejecutar en modo desarrollo: `npm run dev`.
5. Abrir `http://localhost:5173` (por defecto) y usar la interfaz.

Notas:
- Para testing sin backend, `AuthProvider` permite acceso en modo `DEV` si el backend no responde, pero los servicios que dependen del API no funcionarán sin el backend.

---

## 12. Build y despliegue

- `npm run build` compila TypeScript y genera la carpeta `dist` con la build de producción.
- `npm run preview` sirve la build localmente para pruebas.

Recomendaciones:
- Configurar `VITE_API_URL` en el entorno de producción (ej. en variables del servidor o CI/CD).
- Servir el contenido estático (`dist`) mediante un CDN, Netlify, Vercel, o un servidor estático (NGINX).
- Asegurar que el backend acepte las cabeceras `x-admin-user` y `x-admin-password` o migrar a un esquema de auth más seguro.

---

## 13. Buenas prácticas y mejoras sugeridas

1. Migrar almacenamiento de credenciales a tokens JWT almacenados en HttpOnly cookies o usar OAuth2 para mejorar seguridad.
2. Centralizar el manejo de errores en un interceptor de axios y mostrar notificaciones de error uniformes.
3. Añadir validaciones y manejo de errores en formularios con `react-hook-form` y mostrar mensajes inline.
4. Añadir pruebas unitarias con Vitest y pruebas E2E con Playwright o Cypress para las rutas críticas.
5. Añadir CI (GitHub Actions) para lint, build y tests.
6. Documentar los contratos del API esperados en OpenAPI/Swagger para alinear frontend/backend.

---

## 14. Archivo de referencias rápidas

- Punto de entrada: `src/main.tsx`
- Rutas y App: `src/App.tsx`
- Autenticación: `src/context/AuthProvider.tsx`, `src/context/AuthContext.ts`
- Servicios: `src/services/productosService.ts`, `src/services/categoriasService.ts`
- Hooks: `src/hooks/useConfirmDelete.ts`, `src/hooks/useAuth.ts`
- Componentes: `src/components/layout/*`, `src/components/common/*`
