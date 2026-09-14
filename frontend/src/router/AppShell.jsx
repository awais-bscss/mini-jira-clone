import { Suspense } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Navbar } from '../components/Navbar/Navbar.jsx';
import { Sidebar } from '../components/Sidebar/Sidebar.jsx';
import { Spinner } from '../components/Spinner/Spinner.jsx';
import { selectSidebarOpen } from '../store/selectors.js';

export function AppShell() {
  const { boardId } = useParams();
  const sidebarOpen = useSelector(selectSidebarOpen);

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
