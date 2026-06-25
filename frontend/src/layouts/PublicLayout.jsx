/**
 * layouts/PublicLayout.jsx
 *
 * Layout for public pages (Landing, Login, Register).
 * Includes navbar and footer — no sidebar.
 */

import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
