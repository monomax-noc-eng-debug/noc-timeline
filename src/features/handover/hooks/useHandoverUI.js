import { useState, useCallback } from 'react';

export const useHandoverUI = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [viewingLog, setViewingLog] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Form Handlers
  const openCreateForm = useCallback(() => {
    setEditingLog(null);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((log) => {
    setEditingLog(log);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingLog(null);
  }, []);

  // View Modal Handlers
  const openViewModal = useCallback((log) => setViewingLog(log), []);
  const closeViewModal = useCallback(() => setViewingLog(null), []);

  // Delete Confirmation
  const confirmDelete = useCallback((id) => setDeleteId(id), []);
  const cancelDelete = useCallback(() => setDeleteId(null), []);

  // Filters
  const toggleFilters = useCallback(() => setIsFilterOpen(prev => !prev), []);

  return {
    isFormOpen,
    editingLog,
    viewingLog,
    deleteId,
    isFilterOpen,
    openCreateForm,
    openEditForm,
    closeForm,
    openViewModal,
    closeViewModal,
    confirmDelete,
    cancelDelete,
    toggleFilters
  };
};