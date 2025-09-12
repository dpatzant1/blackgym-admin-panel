# Documentación Backend para Desarrollo Frontend - Black Gym Panel de Administración

## 📋 Información General

**Servidor Backend**: Node.js + Express  
**Base de Datos**: Supabase (PostgreSQL)  
**Puerto**: `3000` (http://localhost:3000)  
**CORS Configurado**: Puertos `3001` (React) y `4321` (Astro)  y `5173` (Vite)
**Estado**: ✅ Completamente funcional y testeado  

---

## 🔐 Sistema de Autenticación

### **Método de Autenticación**
- **Tipo**: Headers personalizados (sin tokens, sin sesiones)
- **Headers requeridos**:
  ```
  x-admin-user: nombre_usuario
  x-admin-password: contraseña_en_texto_plano
  ```
- **Verificación**: En tiempo real con bcrypt
- **Sin estado**: No se mantienen sesiones en el servidor

### **Credenciales de Prueba**
```
Usuario: admin
Contraseña: Admin123!
```

### **Flujo de Autenticación Frontend**
1. **Login inicial**: Usuario ingresa credenciales → Verificar con `POST /api/administradores/verify`
2. **Almacenamiento**: Guardar credenciales en localStorage tras verificación exitosa
3. **Peticiones administrativas**: Incluir headers `x-admin-user` y `x-admin-password` en cada request
4. **Manejo de errores**: 401/403 → Redirigir a login

---

## 📚 Endpoints Disponibles

### **🏠 Información General**

#### `GET /`
Información general del servidor
```json
{
  "success": true,
  "message": "Bienvenido al API de Black Gym - Tienda Online con Panel de Administración",
  "version": "1.0.0",
  "authentication": {
    "method": "Headers personalizados (sin tokens/sesiones)",
    "headers": ["x-admin-user", "x-admin-password"]
  }
}
```

#### `GET /health`
Estado del servidor y conexión a base de datos
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": { "connected": true },
    "uptime": 3600
  }
}
```

#### `GET /api`
Documentación completa de todos los endpoints disponibles

---

### **👨‍💼 Autenticación de Administradores**

#### `POST /api/administradores/verify`
**Función**: Verificar credenciales de administrador  
**Autenticación**: No requerida (endpoint público)  
**Body**:
```json
{
  "usuario": "admin",
  "password": "Admin123!"
}
```
**Respuesta exitosa**:
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": 1,
      "usuario": "admin",
      "creado_en": "2025-09-11T03:39:48.468956"
    },
    "authenticated": true
  },
  "message": "Credenciales válidas"
}
```

#### `GET /api/administradores/profile` 🔒
**Función**: Obtener perfil del administrador autenticado  
**Autenticación**: Requerida  
**Headers**:
```
x-admin-user: admin
x-admin-password: Admin123!
```
**Respuesta**:
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": 1,
      "usuario": "admin",
      "creado_en": "2025-09-11T03:39:48.468956"
    }
  },
  "message": "Perfil obtenido correctamente"
}
```

#### `PUT /api/administradores/change-password` 🔒
**Función**: Cambiar contraseña del administrador  
**Autenticación**: Requerida  
**Body**:
```json
{
  "passwordActual": "Admin123!",
  "passwordNuevo": "NuevoPassword123!"
}
```

---

### **📦 Gestión de Productos**

#### `GET /api/productos`
**Función**: Listar productos con paginación y filtros  
**Autenticación**: No requerida (público)  
**Query Parameters**:
- `page`: Página (default: 1)
- `limit`: Elementos por página (default: 10, max: 100)
- `categoria`: Filtrar por ID de categoría
- `disponible`: true/false
- `search`: Búsqueda en nombre y descripción

**Ejemplo**: `GET /api/productos?page=1&limit=20&categoria=1&disponible=true`

#### `GET /api/productos/search`
**Función**: Búsqueda avanzada de productos  
**Query Parameters**: `q` (término de búsqueda)

#### `GET /api/productos/:id`
**Función**: Obtener producto específico por ID

#### `POST /api/productos` 🔒
**Función**: Crear nuevo producto  
**Autenticación**: Requerida  
**Body**:
```json
{
  "nombre": "Proteína Whey",
  "descripcion": "Proteína de alta calidad",
  "precio": 29.99,
  "stock": 100,
  "imagen_url": "https://example.com/imagen.jpg",
  "disponible": true,
  "categorias": [1, 2]
}
```

#### `PUT /api/productos/:id` 🔒
**Función**: Actualizar producto completo  
**Autenticación**: Requerida

#### `PATCH /api/productos/:id/stock` 🔒
**Función**: Actualizar solo el stock  
**Autenticación**: Requerida  
**Body**:
```json
{
  "stock": 50
}
```

#### `DELETE /api/productos/:id` 🔒
**Función**: Eliminar producto  
**Autenticación**: Requerida

#### `POST /api/productos/check-stock`
**Función**: Verificar stock de múltiples productos  
**Body**:
```json
{
  "productos": [
    { "id": 1, "cantidad": 2 },
    { "id": 2, "cantidad": 1 }
  ]
}
```

---

### **🏷️ Gestión de Categorías**

#### `GET /api/categorias`
**Función**: Listar categorías  
**Query Parameters**: `page`, `limit`, `include_products`

#### `GET /api/categorias/:id`
**Función**: Obtener categoría específica

#### `POST /api/categorias` 🔒
**Función**: Crear nueva categoría  
**Autenticación**: Requerida  
**Body**:
```json
{
  "nombre": "Suplementos",
  "descripcion": "Productos nutritivos",
  "imagen_url": "https://example.com/categoria.jpg"
}
```

#### `PUT /api/categorias/:id` 🔒
**Función**: Actualizar categoría  
**Autenticación**: Requerida

#### `DELETE /api/categorias/:id` 🔒
**Función**: Eliminar categoría  
**Autenticación**: Requerida

#### `GET /api/categorias/:id/productos`
**Función**: Obtener productos de una categoría

#### `POST /api/categorias/productos/:id/assign` 🔒
**Función**: Asignar categorías a un producto  
**Autenticación**: Requerida  
**Body**:
```json
{
  "categorias": [1, 2, 3]
}
```

---

### **🛒 Gestión de Órdenes**

#### `GET /api/ordenes`
**Función**: Listar órdenes  
**Query Parameters**: `page`, `limit`, `estado`, `include_details`

#### `GET /api/ordenes/stats` 🔒
**Función**: Estadísticas de órdenes (solo admins)  
**Autenticación**: Requerida

#### `GET /api/ordenes/:id`
**Función**: Obtener orden específica

#### `POST /api/ordenes`
**Función**: Crear nueva orden  
**Body**:
```json
{
  "cliente_nombre": "Juan Pérez",
  "cliente_email": "juan@email.com",
  "cliente_telefono": "12345678",
  "cliente_direccion": "Dirección completa",
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": 29.99
    }
  ]
}
```

#### `PUT /api/ordenes/:id` 🔒
**Función**: Actualizar orden  
**Autenticación**: Requerida

#### `DELETE /api/ordenes/:id` 🔒
**Función**: Cancelar orden (restaura stock)  
**Autenticación**: Requerida

#### `GET /api/ordenes/:id/detalle`
**Función**: Detalle completo de orden con productos

---

### **📸 Subida de Imágenes**

#### `POST /api/uploads/image` 🔒
**Función**: Subir imagen a Supabase Storage  
**Autenticación**: Requerida  
**Content-Type**: `multipart/form-data`  
**Field**: `image` (archivo)

**Restricciones**:
- **Tamaño máximo**: 5MB
- **Tipos permitidos**: `image/jpeg`, `image/png`, `image/webp`
- **Validación**: Automática de tipo MIME y extensión

**Ejemplo con FormData (JavaScript)**:
```javascript
const formData = new FormData();
formData.append('image', file);

fetch('/api/uploads/image', {
  method: 'POST',
  headers: {
    'x-admin-user': 'admin',
    'x-admin-password': 'Admin123!'
  },
  body: formData
});
```

**Respuesta exitosa**:
```json
{
  "success": true,
  "data": {
    "url": "https://supabase-storage-url/imagen.jpg",
    "fileName": "imagen_1694432123.jpg",
    "size": 1024000
  },
  "message": "Imagen subida correctamente"
}
```

---

## 🚫 Manejo de Errores

### **Códigos de Error Comunes**
- **400**: Datos inválidos o faltantes
- **401**: Headers de autenticación faltantes
- **403**: Credenciales inválidas
- **404**: Recurso no encontrado
- **413**: Archivo muy grande (>5MB)
- **415**: Tipo de archivo no permitido
- **500**: Error interno del servidor

### **Estructura de Respuesta de Error**
```json
{
  "success": false,
  "error": "Descripción del error",
  "details": ["Detalle específico 1", "Detalle específico 2"]
}
```

### **Errores de Autenticación**
```json
{
  "success": false,
  "error": "Headers de autenticación requeridos",
  "details": null
}
```

```json
{
  "success": false,
  "error": "Credenciales inválidas",
  "details": null
}
```

---

## 🎨 Consideraciones para el Frontend

### **Estado de Autenticación**
```javascript
// Verificar credenciales al inicio
const verificarCredenciales = async () => {
  const usuario = localStorage.getItem('admin-user');
  const password = localStorage.getItem('admin-password');
  
  if (!usuario || !password) {
    // Redirigir a login
    return false;
  }
  
  try {
    const response = await fetch('/api/administradores/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    return false;
  }
};
```

### **Headers de Autenticación**
```javascript
// Función helper para incluir headers
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'x-admin-user': localStorage.getItem('admin-user'),
  'x-admin-password': localStorage.getItem('admin-password')
});

// Uso en requests
fetch('/api/productos', {
  method: 'POST',
  headers: getAuthHeaders(),
  body: JSON.stringify(productoData)
});
```

### **Upload de Imágenes**
```javascript
const subirImagen = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/uploads/image', {
    method: 'POST',
    headers: {
      'x-admin-user': localStorage.getItem('admin-user'),
      'x-admin-password': localStorage.getItem('admin-password')
      // NO incluir Content-Type para FormData
    },
    body: formData
  });
  
  return response.json();
};
```

### **Paginación**
```javascript
// Manejar respuestas paginadas
const cargarProductos = async (page = 1, limit = 20) => {
  const response = await fetch(`/api/productos?page=${page}&limit=${limit}`);
  const data = await response.json();
  
  return {
    productos: data.data.productos,
    pagination: data.data.pagination
  };
};
```

---

## 📋 Funcionalidades Sugeridas para el Panel

### **Dashboard Principal**
- Estadísticas generales (`GET /api/ordenes/stats`)
- Productos con stock bajo
- Órdenes recientes
- Resumen de ventas

### **Gestión de Productos**
- Lista con paginación y filtros
- Formulario crear/editar producto
- Upload de imágenes con preview
- Gestión de stock
- Asignación de categorías

### **Gestión de Categorías**
- CRUD completo de categorías
- Vista de productos por categoría
- Upload de imagen de categoría

### **Gestión de Órdenes**
- Lista de órdenes con filtros por estado
- Detalle de orden con productos
- Cambio de estado de órdenes
- Cancelación de órdenes

### **Upload de Imágenes**
- Drag & drop interface
- Preview antes de subir
- Validación de tamaño y tipo
- Cropping opcional
- Galería de imágenes subidas

### **Autenticación**
- Login con validación
- Cambio de contraseña
- Logout (limpiar localStorage)
- Protección de rutas

---

## 🔧 Variables de Entorno Requeridas

```env
# Supabase
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_anon_key

# Servidor
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:4321,http://localhost:3001,http://localhost:5173
```

---

## 🚀 Para Iniciar el Backend

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start

# El servidor estará disponible en http://localhost:3000
```

---

## ✅ Estado Actual del Backend

- ✅ **Sistema de autenticación completo**
- ✅ **CRUD de productos con categorías**
- ✅ **Sistema de órdenes con transacciones**
- ✅ **Upload de imágenes a Supabase Storage**
- ✅ **Middleware de protección implementado**
- ✅ **Validaciones y manejo de errores**
- ✅ **CORS configurado para frontend**
- ✅ **Documentación de API completa**
- ✅ **Testeado y funcionando correctamente**

**El backend está 100% listo para el desarrollo del frontend del panel de administración.**