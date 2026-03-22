'use client';

import { ReactNode } from 'react';

interface MainLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function MainLayout({ sidebar, children }: MainLayoutProps) {
  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="flex flex-row gap-6 p-6 flex-1 min-h-0">
        {/* Sidebar card */}
        <aside
          className="w-[280px] shrink-0 overflow-hidden flex flex-col"
          style={{
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-card)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <div className="flex-1 overflow-y-auto">
            {sidebar}
          </div>
        </aside>

        {/* Board card */}
        <main
          className="flex-1 min-w-0 overflow-hidden flex flex-col"
          style={{
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-card)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
