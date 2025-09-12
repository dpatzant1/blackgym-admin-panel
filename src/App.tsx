import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './context/AuthProvider'
import { ProtectedRoute } from './components/common'
import Layout from './components/layout/Layout'
import { LoginPage } from './pages/auth'
import HomePage from './pages/HomePage'
import { CategoriasListPage, CategoriaFormPage } from './pages/categorias'
import { ProductosListPage, ProductoCreatePage, ProductoEditPage } from './pages/productos'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Ruta pública - Login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Ruta por defecto - Dashboard principal */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <HomePage />
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
            <ProtectedRoute>
              <Layout>
                <CategoriaFormPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Formulario de categorías - Editar */}
          <Route path="/categorias/:id/editar" element={
            <ProtectedRoute>
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
            <ProtectedRoute>
              <Layout>
                <ProductoCreatePage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Formulario de productos - Editar */}
          <Route path="/productos/editar/:id" element={
            <ProtectedRoute>
              <Layout>
                <ProductoEditPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Rutas que se implementarán más adelante */}
          {/* 
          <Route path="/ordenes" element={
            <ProtectedRoute>
              <Layout>
                <OrdenesPage />
              </Layout>
            </ProtectedRoute>
          } />
          */}
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
