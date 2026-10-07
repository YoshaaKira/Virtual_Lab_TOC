import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-gray-800 py-4 text-center text-gray-500 text-sm">
        TOC Virtual Lab — Interactive Theory of Computation Simulator
      </footer>
    </div>
  );
}
