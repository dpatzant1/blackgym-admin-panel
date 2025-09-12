# 📋 Guía de Desarrollo - Panel de Administración Black Gym

## 🎯 Objetivo del Proyecto
Desarrollar un panel de administración simple para gestionar productos y categorías del gimnasio Black Gym, con autenticación básica.

### **Funcionalidades Requeridas:**
- ✅ Login/Logout de administradores
- ✅ Gestión de productos (CRUD + upload de imágenes)
- ✅ Gestión de categorías (CRUD)

### **Stack Tecnológico:**
- **Frontend:** React + TypeScript + Vite
- **Estilos:** Bootstrap 5
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Backend:** Node.js + Express (Puerto 3000)
- **Base de Datos:** Supabase (PostgreSQL)

---

## 📦 FASE 1: Configuración e Instalación de Dependencias

### **1.1 Instalar dependencias faltantes** ✅
```bash
npm install react-router-dom @types/react-router-dom react-hook-form react-toastify
```

### **1.2 Verificar dependencias ya instaladas** ✅
- ✅ axios (v1.11.0)
- ✅ react-router-dom (v7.8.2)
- ✅ bootstrap (v5.3.8)
- ✅ react + typescript (v19.1.1 + v5.8.3)

### **1.3 Configurar variables de entorno** ✅
- ✅ Crear archivo `.env` en la raíz del proyecto
- ✅ Agregar variable `VITE_API_URL=http://localhost:3000`

---

## 🏗️ FASE 2: Estructura de Proyecto y Configuración Base

### **2.1 Crear estructura de carpetas** ✅
```
src/
├── components/
│   ├── common/          # Componentes reutilizables ✅
│   ├── layout/          # Layout del panel ✅
│   └── forms/           # Formularios ✅
├── pages/
│   ├── auth/            # Login ✅
│   ├── productos/       # Gestión de productos ✅
│   └── categorias/      # Gestión de categorías ✅
├── services/            # API calls ✅
├── types/               # TypeScript interfaces ✅
├── hooks/               # Custom hooks ✅
├── context/             # Context de autenticación ✅
└── utils/               # Utilidades ✅
```

### **2.2 Configurar Bootstrap** ✅
- ✅ Importar Bootstrap CSS en `main.tsx`
- ✅ Importar Bootstrap JS para componentes interactivos

### **2.3 Configurar React Router** ✅
- ✅ Envolver App con `BrowserRouter`
- ✅ Configurar rutas principales

---

## 🔐 FASE 3: Sistema de Autenticación

### **3.1 Crear tipos TypeScript** ✅
- ✅ Definir interfaces para:
  - `Admin` (usuario administrador)
  - `LoginCredentials` (credenciales de login)
  - `AuthContextType` (contexto de autenticación)

### **3.2 Crear Context de Autenticación** ✅
- ✅ Implementar `AuthContext` con:
  - Estado de autenticación
  - Datos del admin logueado
  - Funciones `login()` y `logout()`
  - Persistencia en localStorage

### **3.3 Crear servicio de autenticación** ✅
- ✅ Implementar funciones en `authService.ts`:
  - `verifyCredentials()` - POST /api/administradores/verify
  - `getProfile()` - GET /api/administradores/profile
  - `changePassword()` - PUT /api/administradores/change-password

### **3.4 Crear componente ProtectedRoute** ✅
- ✅ Componente para proteger rutas que requieren autenticación
- ✅ Redirección automática a login si no está autenticado

### **3.5 Crear página de Login** ✅
- ✅ Formulario con validación usando react-hook-form
- ✅ Manejo de errores y estados de carga
- ✅ Diseño responsivo con Bootstrap
- ✅ Integración con AuthContext

---

## 🎨 FASE 4: Layout y Navegación

### **4.1 Crear componente Layout principal** ✅
- [x] Header/Navbar con:
  - Logo del gimnasio
  - Navegación principal
  - Botón de logout
  - Información del usuario logueado

### **4.2 Crear Sidebar Fijo (opcional)** ✅
- [x] Navegación lateral con enlaces a:
  - Productos
  - Categorías
- [x] Destacar sección activa

### **4.3 Configurar notificaciones**
- [x] Configurar react-toastify
- [x] Estilos personalizados para notificaciones

---

## 🏷️ FASE 5: Gestión de Categorías (PRIMERO - Más Simple)

### **5.1 Crear tipos TypeScript para categorías**
- [x] Interfaces para:
  - `Categoria`
  - `CategoriaFormData`

### **5.2 Crear servicio de categorías**
- [x] Implementar funciones en `categoriasService.ts`:
  - `getCategorias()` - GET /api/categorias
  - `getCategoria()` - GET /api/categorias/:id
  - `createCategoria()` - POST /api/categorias
  - `updateCategoria()` - PUT /api/categorias/:id
  - `deleteCategoria()` - DELETE /api/categorias/:id

### **5.3 Crear página de listado de categorías**
- [x] Lista/cards de categorías
- [x] Botones de acciones (editar, eliminar)
- [x] Botón "Agregar nueva categoría"

### **5.4 Crear formulario de categoría**
- [x] Formulario simple (nombre, descripción)
- [x] Validaciones básicas

### **5.5 Crear modal de confirmación**
- [x] Modal para confirmar eliminación de categorías
- [x] Componente reutilizable (se usará también para productos)

---

## 📦 FASE 6: Gestión de Productos (SEGUNDO - Más Complejo)

### **6.1 Crear tipos TypeScript para productos** ✅
- [x] Interfaces para:
  - `Producto`
  - `ProductoFormData`
  - `PaginationData`

### **6.2 Crear servicio de productos** ✅
- [x] Implementar funciones en `productosService.ts`:
  - `getProductos()` - GET /api/productos (con paginación)
  - `getProducto()` - GET /api/productos/:id
  - `createProducto()` - POST /api/productos
  - `updateProducto()` - PUT /api/productos/:id
  - `deleteProducto()` - DELETE /api/productos/:id
  - `uploadImage()` - POST /api/uploads/image

### **6.3 Crear página de listado de productos** ✅
- [x] Tabla responsiva con Bootstrap
- [x] Paginación
- [x] Búsqueda básica
- [x] Filtro por categoría (usando las categorías ya creadas)
- [x] Botones de acciones (editar, eliminar)
- [x] Botón "Agregar nuevo producto"

### **6.4 Crear formulario de producto** ✅
- [x] Formulario reutilizable para crear/editar
- [x] Validaciones con react-hook-form
- [x] Upload de imagen con preview (obligatorio)
- [x] Selector de categorías (usando las categorías existentes)
- [x] Estados de carga y manejo de errores

---

## 🔧 FASE 7: Utilidades y Helpers

### **7.1 Crear utilidades comunes**
- [ ] `apiClient.ts` - Cliente Axios configurado con interceptors
- [ ] `formatters.ts` - Formateo de fechas, precios, etc.
- [ ] `validators.ts` - Validaciones customizadas

### **7.2 Crear hooks customizados**
- [ ] `useApi.ts` - Hook para llamadas a API
- [ ] `useLocalStorage.ts` - Manejo de localStorage
- [ ] `usePagination.ts` - Lógica de paginación

### **7.3 Configurar interceptors de Axios**
- [ ] Agregar headers de autenticación automáticamente
- [ ] Manejo global de errores 401/403
- [ ] Redirección automática a login en caso de no autorizado

---

## 🎨 FASE 8: Estilos y UX

### **8.1 Personalizar estilos**
- [ ] Variables CSS custom para colores del gimnasio
- [ ] Estilos para componentes específicos
- [ ] Responsive design con Bootstrap

### **8.2 Mejorar experiencia de usuario**
- [ ] Estados de carga (spinners, skeletons)
- [ ] Mensajes de error amigables
- [ ] Confirmaciones antes de acciones destructivas
- [ ] Breadcrumbs para navegación

### **8.3 Optimizaciones**
- [ ] Lazy loading de componentes
- [ ] Optimización de imágenes
- [ ] Debounce en búsquedas

---

## 🧪 FASE 9: Testing y Validación

### **9.1 Testing manual**
- [ ] Probar flujo completo de autenticación
- [ ] CRUD completo de productos
- [ ] CRUD completo de categorías
- [ ] Upload de imágenes
- [ ] Manejo de errores

### **9.2 Validación con backend**
- [ ] Verificar todos los endpoints funcionan correctamente
- [ ] Validar headers de autenticación
- [ ] Probar subida de imágenes a Supabase

---

## 🚀 FASE 10: Despliegue y Documentación

### **10.1 Preparar para producción**
- [ ] Configurar variables de entorno para producción
- [ ] Build del proyecto
- [ ] Optimizaciones finales

### **10.2 Documentación**
- [ ] README.md con instrucciones de instalación
- [ ] Documentar componentes principales
- [ ] Guía de usuario básica

---

## 📋 Checklist de Funcionalidades Principales

### **Autenticación:**
- [ ] Login con validación
- [ ] Logout
- [ ] Persistencia de sesión
- [ ] Protección de rutas

### **Categorías:**
- [ ] Listar categorías
- [ ] Crear nueva categoría
- [ ] Editar categoría existente
- [ ] Eliminar categoría
- [ ] Upload de imagen de categoría (opcional)

### **Productos:**
- [ ] Listar productos con paginación
- [ ] Crear nuevo producto
- [ ] Editar producto existente
- [ ] Eliminar producto
- [ ] Upload de imagen de producto
- [ ] Asignar categorías a productos

### **Generales:**
- [ ] Navegación intuitiva
- [ ] Responsive design
- [ ] Manejo de errores
- [ ] Notificaciones de éxito/error
- [ ] Estados de carga

---

## 🎯 Orden de Desarrollo Recomendado

1. **Configuración base** (Fase 1-2)
2. **Autenticación** (Fase 3)
3. **Layout básico** (Fase 4)
4. **Gestión de categorías** (Fase 5) - ⭐ **PRIMERO: Más simple, sin dependencias**
5. **Gestión de productos** (Fase 6) - ⭐ **SEGUNDO: Más complejo, depende de categorías**
6. **Utilidades y mejoras** (Fase 7-8)
7. **Testing y pulido** (Fase 9-10)

### **🤔 ¿Por qué Categorías antes que Productos?**

**Razones técnicas:**
- Los productos necesitan categorías para asignarse correctamente
- Las categorías son independientes (no dependen de otros módulos)
- Formulario más simple: solo nombre, descripción e imagen opcional

**Razones de desarrollo:**
- Probar el flujo CRUD básico con algo simple primero
- Validar la integración con el backend paso a paso
- El modal de confirmación creado para categorías se reutiliza en productos
- Una vez que funcionen categorías, tendremos datos para probar el selector en productos

**Flujo lógico del negocio:**
1. Crear categorías (Suplementos, Equipos, Ropa, etc.)
2. Crear productos y asignarles esas categorías
3. Los filtros por categoría en productos funcionarán correctamente

---

## 📝 Notas Importantes

- **Headers de autenticación:** Recordar incluir `x-admin-user` y `x-admin-password` en todas las peticiones protegidas
- **CORS:** El backend ya está configurado para `localhost:3001` (puerto por defecto de Vite)
- **Imágenes:** El upload va directo a Supabase Storage, no olvides mostrar previews
- **Validaciones:** El backend ya tiene validaciones, pero agregar validaciones en frontend mejora UX
- **Estados de error:** Manejar especialmente errores 401/403 para redireccionar a login

---

**¡Listo para comenzar el desarrollo! 🚀**