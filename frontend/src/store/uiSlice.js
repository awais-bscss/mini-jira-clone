import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  openModalType: null,    // 'createTask' | null
  createTaskStatus: 'todo',
  sidebarOpen: true,
  groupBy: 'status',      // 'status' | 'assignee' | 'label'
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openCreateTaskModal(state, action) {
      state.openModalType = 'createTask';
      state.createTaskStatus = action.payload || 'todo';
    },
    closeModal(state) {
      state.openModalType = null;
      state.createTaskStatus = 'todo';
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    setGroupBy(state, action) {
      state.groupBy = action.payload;
    },
  },
});

export const {
  openCreateTaskModal,
  closeModal,
  toggleSidebar,
  setSidebarOpen,
  setGroupBy,
} = uiSlice.actions;

export default uiSlice.reducer;
