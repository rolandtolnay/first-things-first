'use client';

import { ReactNode } from 'react';

interface MainLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function MainLayout({ sidebar, children }: MainLayoutProps) {
  return (
    <div className="grid grid-cols-[minmax(280px,25%)_1fr] min-h-screen bg-background">
      <aside className="border-r border-border overflow-y-auto">
        {sidebar}
      </aside>
      <main className="overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
