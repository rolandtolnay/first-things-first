import { ReactNode } from 'react';

interface MainLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  rail: ReactNode;
}

/**
 * MainLayout — the three-column workspace grid:
 *   Sidebar (296px) · Calendar (1fr) · Rail (304px).
 *
 * Each surface owns its own side border, padding, and internal scroll, so the
 * cells stay bare wrappers (min-h-0 + overflow-hidden) that let the surfaces
 * fill their height. Responsive collapse: Rail hides ≤1280px, Sidebar ≤1024px.
 * Rendered as the flex-1 child of the AppWindow's column.
 */
export function MainLayout({ sidebar, children, rail }: MainLayoutProps) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[296px_1fr_304px] max-[1280px]:grid-cols-[296px_1fr] max-[1024px]:grid-cols-1">
      <div className="min-h-0 overflow-hidden max-[1024px]:hidden">{sidebar}</div>
      <main className="min-h-0 min-w-0 overflow-hidden">{children}</main>
      <div className="min-h-0 overflow-hidden max-[1280px]:hidden">{rail}</div>
    </div>
  );
}
