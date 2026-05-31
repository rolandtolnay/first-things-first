'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { RoleList } from './RoleList';
import { WeeklyBalance } from './WeeklyBalance';

/**
 * Sidebar — the left workspace column (Weekly Balance + Roles & Goals).
 *
 * Global controls live in the week toolbar, so the Sidebar starts directly
 * with the Weekly Balance.
 */
export function Sidebar() {
  return (
    <div className="flex h-full flex-col border-r border-border">
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-5 px-4 py-5">
          <WeeklyBalance />
          <RoleList />
        </div>
      </ScrollArea>
    </div>
  );
}
