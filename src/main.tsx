import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
// Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css'
// Bootstrap JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// React Toastify CSS
import 'react-toastify/dist/ReactToastify.css'
import App from './App.tsx'

console.log('Main script is running, mounting React app');

// Verificar que el elemento root existe
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('No se encontró el elemento "root" en el HTML');
}

createRoot(rootElement!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
