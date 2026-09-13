import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, Outlet, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar/Navbar.jsx';
import { Sidebar } from '../components/Sidebar/Sidebar.jsx';
import { useSelector } from 'react-redux';
import { selectSidebarOpen } from '../store/selectors.js';
import { Spinner } from '../components/Spinner/Spinner.jsx';
import { BoardsPage } from '../features/boards/BoardsPage.jsx';
import { BoardPage } from '../features/tasks/BoardPage.jsx';
import { NotFoundPage } from '../features/not-found/NotFoundPage.jsx';
import { useRecentBoards } from '../hooks/useRecentBoards.js';

const AiDemoPage = lazy(() =>
  import('../features/ai-demo/AiDemoPage.jsx').then(m => ({ default: m.AiDemoPage }))
);

function AppShell() {
  const { boardId } = useParams();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const { addRecentBoard } = useRecentBoards();

  // Record each board visit so the sidebar can show recently-visited boards
  useEffect(() => {
    if (boardId) addRecentBoard(boardId);
  }, [boardId, addRecentBoard]);

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex flex-col">
      <Navbar boardId={boardId} />
      <div className="flex flex-1 pt-14 h-[calc(100vh-3.5rem)] overflow-hidden">
        <Sidebar />
        <main
          className={`flex-1 min-w-0 h-full overflow-hidden transition-all duration-300 ease-in-out flex flex-col
                      ${sidebarOpen ? 'ml-60' : 'ml-0'}`}
        >
          <Suspense fallback={
            <div className="flex items-center justify-center h-full py-20">
              <Spinner size="lg" />
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

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
        element: <AiDemoPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
