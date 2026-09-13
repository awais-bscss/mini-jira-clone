import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBoards, createBoard, updateBoard, deleteBoard } from '../api/boards.js';

export function useBoards() {
  return useQuery({
    queryKey: ['boards'],
    queryFn: fetchBoards,
  });
}

export function useCreateBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBoard,
    // Invalidate boards list so the new board appears immediately
    onSuccess: () => qc.invalidateQueries({ queryKey: ['boards'] }),
  });
}

export function useUpdateBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateBoard,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['boards'] }),
  });
}

export function useDeleteBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBoard,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['boards'] }),
  });
}
