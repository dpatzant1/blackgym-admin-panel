import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="container-fluid px-3">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center">
              <h1 className="card-title">
                <i className="bi bi-house-door-fill me-2"></i>
                Panel de Administración
              </h1>
              <p className="card-text lead">
                Bienvenido al panel de administración de Black Gym
              </p>
              <hr />
              <div className="mb-4">
                <div className="card border-info">
                  <div className="card-body">
                    <h5 className="card-title">
                      <i className="bi bi-graph-up-arrow text-info"></i> Dashboard de Ventas
                    </h5>
                    <p className="card-text">
                      Visualiza las estadísticas y métricas de ventas de tu tienda
                    </p>
                    <Link to="/dashboard" className="btn btn-info text-white">
                      <i className="bi bi-bar-chart-fill me-2"></i>
                      Ver Dashboard de Ventas
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="row mt-4 g-3">
                <div className="col-lg-6 col-md-6 col-12">
                  <div className="card h-100 border-primary">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="bi bi-tags text-primary"></i> Categorías
                      </h5>
                      <p className="card-text">
                        Gestiona las categorías de productos del gimnasio
                      </p>
                      <Link to="/categorias" className="btn btn-primary">
                        Ver Categorías
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-12">
                  <div className="card h-100 border-success">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="bi bi-box text-success"></i> Productos
                      </h5>
                      <p className="card-text">
                        Administra el catálogo de productos del gimnasio
                      </p>
                      <Link to="/productos" className="btn btn-success">
                        Ver Productos
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;