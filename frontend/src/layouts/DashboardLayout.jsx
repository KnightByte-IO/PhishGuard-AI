/**
 * layouts/DashboardLayout.jsx
 *
 * Shell layout for all protected dashboard pages.
 * Uses React Router <Outlet /> to render nested child routes.
 */

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-cyber-dark">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
