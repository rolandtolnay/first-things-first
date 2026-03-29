'use client';

import { ThemeToggle } from '@/components/ThemeToggle';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RoleList } from './RoleList';

export function Sidebar() {
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-3">
        <h1 className="text-lg font-bold tracking-tight text-foreground">
          First Things First
        </h1>
        <ThemeToggle />
      </header>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-3 pb-4">
          <RoleList />
        </div>
      </ScrollArea>
    </div>
  );
}
