import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './context/AuthProvider'
import { ProtectedRoute } from './components/common'
import Layout from './components/layout/Layout'
import { LoginPage } from './pages/auth'
import HomePage from './pages/HomePage'
import SinPermisosPage from './pages/SinPermisosPage'
import DashboardPage from './pages/DashboardPage'
import { CategoriasListPage, CategoriaFormPage } from './pages/categorias'
import { ProductosListPage, ProductoCreatePage, ProductoEditPage } from './pages/productos'
import { AdministradoresListPage, AdministradorFormPage } from './pages/administradores'
import { OrdenesListPage, OrdenDetallePage } from './pages/ordenes'
import './App.css'

function App() {
  console.log('App component is rendering');
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Ruta pública - Login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Ruta de Sin Permisos */}
          <Route path="/sin-permisos" element={
            <ProtectedRoute>
              <Layout>
                <SinPermisosPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Ruta por defecto - Dashboard principal */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <HomePage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Ruta del Dashboard de Ventas */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Ruta de categorías */}
          <Route path="/categorias" element={
            <ProtectedRoute>
              <Layout>
                <CategoriasListPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Formulario de categorías - Nuevo */}
          <Route path="/categorias/nuevo" element={
            <ProtectedRoute requierePermiso="categorias.crear">
              <Layout>
                <CategoriaFormPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Formulario de categorías - Editar */}
          <Route path="/categorias/:id/editar" element={
            <ProtectedRoute requierePermiso="categorias.editar">
              <Layout>
                <CategoriaFormPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Rutas de productos */}
          <Route path="/productos" element={
            <ProtectedRoute>
              <Layout>
                <ProductosListPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Formulario de productos - Nuevo */}
          <Route path="/productos/nuevo" element={
            <ProtectedRoute requierePermiso="productos.crear">
              <Layout>
                <ProductoCreatePage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Formulario de productos - Editar */}
          <Route path="/productos/editar/:id" element={
            <ProtectedRoute requierePermiso="productos.editar">
              <Layout>
                <ProductoEditPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Rutas de administradores - Solo para administradores */}
          <Route path="/administradores" element={
            <ProtectedRoute requiereAdmin={true}>
              <Layout>
                <AdministradoresListPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Crear administrador */}
          <Route path="/administradores/crear" element={
            <ProtectedRoute requiereAdmin={true}>
              <Layout>
                <AdministradorFormPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Editar administrador */}
          <Route path="/administradores/:id/editar" element={
            <ProtectedRoute requiereAdmin={true}>
              <Layout>
                <AdministradorFormPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Rutas de órdenes */}
          <Route path="/ordenes" element={
            <ProtectedRoute>
              <Layout>
                <OrdenesListPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Detalle de orden */}
          <Route path="/ordenes/:id" element={
            <ProtectedRoute>
              <Layout>
                <OrdenDetallePage />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>

        {/* Configuración de notificaciones */}
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="custom-toast-container"
          toastClassName="custom-toast"
          progressClassName="custom-toast-progress"
        />
      </div>
    </AuthProvider>
  )
}

export default App
