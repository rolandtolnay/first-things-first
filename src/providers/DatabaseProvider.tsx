'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { initializeDatabase } from '@/lib/db';

interface DatabaseProviderProps {
  children: ReactNode;
}

/**
 * DatabaseProvider initializes IndexedDB on app startup.
 *
 * Handles:
 * - Opening the Dexie database
 * - Requesting persistent storage (critical for Safari)
 * - Logging storage estimates
 *
 * Safe to render immediately - initialization happens in background.
 */
export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initializeDatabase()
      .then(() => setIsInitialized(true))
      .catch((err) => {
        console.error('[DatabaseProvider] Initialization failed:', err);
        setError(err);
      });
  }, []);

  // Render children immediately - don't block on DB init
  // The stores handle loading states internally
  if (error) {
    // In production, you might want a more graceful error UI
    console.error('[DatabaseProvider] Database initialization error:', error);
  }

  return <>{children}</>;
}
