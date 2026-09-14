import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './AppShell.jsx';
import { BoardsPage } from '../features/boards/BoardsPage.jsx';
import { BoardPage } from '../features/tasks/BoardPage.jsx';
import { NotFoundPage } from '../features/not-found/NotFoundPage.jsx';
import { LazyAiDemoPage } from '../features/ai-demo/LazyAiDemoPage.jsx';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: '/',
        element: <BoardsPage />,
      },
      {
        path: '/board/:boardId',
        element: <BoardPage />,
        children: [
          {
            path: 'task/:taskId',
            element: null,
          },
        ],
      },
      {
        path: '/ai-demo',
        element: <LazyAiDemoPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
