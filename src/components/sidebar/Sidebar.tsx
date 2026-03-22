'use client';

import { ThemeToggle } from '@/components/ThemeToggle';
import { RoleList } from './RoleList';

export function Sidebar() {
  return (
    <div className="flex flex-col h-full">
      <header
        className="flex items-center justify-between"
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <h1
          className="font-bold"
          style={{
            fontSize: '24px',
            lineHeight: '1.3',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}
        >
          First Things First
        </h1>
        <ThemeToggle />
      </header>
      <div className="flex-1 overflow-y-auto" style={{ padding: '12px 12px 16px' }}>
        <h2
          className="font-semibold mb-3"
          style={{
            fontSize: '12px',
            lineHeight: '1.4',
            letterSpacing: '0.01em',
            color: 'var(--text-muted)',
          }}
        >
          Roles
        </h2>
        <RoleList />
      </div>
    </div>
  );
}
