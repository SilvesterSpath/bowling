import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  /** Slightly tighter layout for in-app pages (not the home screen). */
  compact?: boolean;
}

export function AppShell({ children, compact = false }: AppShellProps) {
  return (
    <div className={compact ? 'app-shell app-shell--compact' : 'app-shell'}>
      <main className="app-shell__main">{children}</main>
    </div>
  );
}
