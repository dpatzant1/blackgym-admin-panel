import React from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  itemType?: string;
  loading?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar eliminación',
  message,
  itemName,
  itemType = 'elemento',
  loading = false
}) => {
  if (!isOpen) return null;

  const defaultMessage = itemName 
    ? `¿Estás seguro de que deseas eliminar ${itemType.toLowerCase()} "${itemName}"?`
    : `¿Estás seguro de que deseas eliminar este ${itemType.toLowerCase()}?`;

  const finalMessage = message || defaultMessage;

  return (
    <>
      {/* Overlay */}
      <div 
        className="modal-backdrop fade show" 
        onClick={onClose}
        style={{ zIndex: 1040 }}
      ></div>

      {/* Modal */}
      <div 
        className="modal fade show d-block" 
        tabIndex={-1} 
        style={{ zIndex: 1050 }}
        role="dialog"
        aria-labelledby="deleteModalLabel"
        aria-hidden="false"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title d-flex align-items-center" id="deleteModalLabel">
                <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                {title}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={loading}
                aria-label="Cerrar"
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body pt-2">
              <div className="text-center mb-3">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '64px', height: '64px' }}>
                  <i className="bi bi-trash3 text-warning" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
              
              <p className="text-muted text-center mb-3">
                {finalMessage}
              </p>
              
              <div className="alert alert-warning d-flex align-items-start" role="alert">
                <i className="bi bi-info-circle-fill me-2 mt-1 flex-shrink-0"></i>
                <div className="small">
                  <strong>¡Atención!</strong> Esta acción no se puede deshacer. 
                  {itemType === 'categoría' && ' Si la categoría tiene productos asociados, no podrá ser eliminada.'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                <i className="bi bi-x-circle me-1"></i>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash3 me-1"></i>
                    Eliminar {itemType}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDeleteModal;