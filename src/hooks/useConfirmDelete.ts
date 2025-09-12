import { useState } from 'react';

export interface UseConfirmDeleteReturn<T> {
  // Estados
  isOpen: boolean;
  loading: boolean;
  itemToDelete: T | null;
  
  // Funciones
  openModal: (item: T) => void;
  closeModal: () => void;
  handleConfirm: (deleteFunction: (item: T) => Promise<void>) => Promise<void>;
}

export const useConfirmDelete = <T>(): UseConfirmDeleteReturn<T> => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  const openModal = (item: T) => {
    setItemToDelete(item);
    setIsOpen(true);
  };

  const closeModal = () => {
    if (loading) return; // Prevenir cerrar mientras está eliminando
    setIsOpen(false);
    setItemToDelete(null);
  };

  const handleConfirm = async (deleteFunction: (item: T) => Promise<void>) => {
    if (!itemToDelete) return;

    try {
      setLoading(true);
      await deleteFunction(itemToDelete);
      setIsOpen(false);
      setItemToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    isOpen,
    loading,
    itemToDelete,
    openModal,
    closeModal,
    handleConfirm
  };
};