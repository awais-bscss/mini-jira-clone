import { useCallback, memo } from 'react';
import { Modal } from '../../components/Modal/Modal.jsx';
import { Spinner } from '../../components/Spinner/Spinner.jsx';
import { useDeleteBoard } from '../../hooks/useBoards.js';

export const DeleteBoardModal = memo(function DeleteBoardModal({ board, onClose }) {
  const deleteBoard = useDeleteBoard();

  const handleConfirmDelete = useCallback(() => {
    if (!board?.id) return;
    deleteBoard.mutate(board.id, {
      onSuccess: () => onClose(),
    });
  }, [deleteBoard, board, onClose]);

  return (
    <Modal
      isOpen={!!board}
      onClose={onClose}
      title="Delete Project"
      size="sm"
      id="confirm-delete-board"
    >
      <div className="p-6 space-y-4">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this board and all its tasks?
          <strong className="block mt-1 text-slate-800">
            {board?.name}
          </strong>
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="btn-danger"
            disabled={deleteBoard.isPending}
          >
            {deleteBoard.isPending ? <Spinner size="sm" /> : 'Yes, delete'}
          </button>
        </div>
        {deleteBoard.isError && (
          <p className="text-xs text-red-500 text-center">{deleteBoard.error?.message || 'Failed to delete project'}</p>
        )}
      </div>
    </Modal>
  );
});
