import { Routes, Route, Link, Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import PetProfile from './pet/Profile.jsx';
import VaccinesPage from './pet/Vaccines.jsx';
import DewormPage from './pet/Deworm.jsx';
import DocumentsPage from './pet/Documents.jsx';
import HistoryPage from './pet/History.jsx';
import Carnet from './pet/Carnet.jsx';
import FriendsPage from '../pages/Friends.jsx';

/**
 * Dashboard layout and nested routes for authenticated users.  Shows a sidebar
 * with navigation to each module.  Each module is a separate component.
 */
function DashboardLayout() {
  return (
    <div className="min-h-screen flex">
      <nav className="w-64 bg-gray-100 p-4 space-y-2">
        <h2 className="text-xl font-bold mb-4">Mi mascota</h2>
        <Link to="profile" className="block py-2 px-3 hover:bg-gray-200 rounded">Perfil</Link>
        <Link to="vaccines" className="block py-2 px-3 hover:bg-gray-200 rounded">Vacunas</Link>
        <Link to="deworm" className="block py-2 px-3 hover:bg-gray-200 rounded">Desparasitación</Link>
        <Link to="documents" className="block py-2 px-3 hover:bg-gray-200 rounded">Documentos</Link>
        <Link to="history" className="block py-2 px-3 hover:bg-gray-200 rounded">Historial</Link>
        <Link to="carnet" className="block py-2 px-3 hover:bg-gray-200 rounded">Carnet</Link>
        <Link to="friends" className="block py-2 px-3 hover:bg-gray-200 rounded">Buscador de amigos</Link>
      </nav>
      <main className="flex-1 p-6 overflow-y-auto">
        <Suspense fallback={<p>Cargando…</p>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

function Placeholder({ title }) {
  return <h3 className="text-2xl font-semibold">{title}</h3>;
}

export default function DashboardPage() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Placeholder title="Panel" />} />
        <Route path="profile" element={<PetProfile />} />
        <Route path="vaccines" element={<VaccinesPage />} />
        <Route path="deworm" element={<DewormPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="history" element={<HistoryPage />} />
      <Route path="carnet" element={<Carnet />} />
      <Route path="friends" element={<FriendsPage />} />
      </Route>
    </Routes>
  );
}