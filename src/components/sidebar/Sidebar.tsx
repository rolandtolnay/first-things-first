'use client';

import { ThemeToggle } from '@/components/ThemeToggle';

export function Sidebar() {
  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b border-border flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">First Things First</h1>
        <ThemeToggle />
      </header>
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Roles and goals will be added in Phase 3 */}
        <p className="text-muted-foreground text-sm">Roles and goals will appear here</p>
      </div>
    </div>
  );
}
