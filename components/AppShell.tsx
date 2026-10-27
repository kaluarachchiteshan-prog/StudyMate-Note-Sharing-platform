'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function AppShell({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSidebarOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <Navbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-x-0 bottom-0 top-16 z-20 bg-slate-950/70 lg:hidden"
            onClick={closeSidebar}
          />
        )}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl overflow-x-hidden">
          {children}
        </main>
      </div>
    </>
  );
}
