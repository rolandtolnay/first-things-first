'use client';

import { ReactNode } from 'react';

interface MainLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function MainLayout({ sidebar, children }: MainLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex flex-row flex-1 min-h-0">
        {/* Sidebar */}
        <aside
          className="w-[280px] shrink-0 overflow-hidden flex flex-col bg-sidebar border-r border-border"
        >
          <div className="flex-1 overflow-y-auto">
            {sidebar}
          </div>
        </aside>

        {/* Board */}
        <main className="flex-1 min-w-0 overflow-hidden flex flex-col bg-card">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
