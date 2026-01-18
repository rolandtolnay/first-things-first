'use client';

import { ThemeToggle } from '@/components/ThemeToggle';
import { RoleList } from './RoleList';

export function Sidebar() {
  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b border-border flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">First Things First</h1>
        <ThemeToggle />
      </header>
      <div className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Roles
        </h2>
        <RoleList />
      </div>
    </div>
  );
}
