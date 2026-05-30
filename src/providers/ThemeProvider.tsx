'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      // The Dark Workspace aesthetic IS the default; light is the opt-in.
      // Map the next-themes value to the class the tokens key off of:
      // dark → `.dark` (keeps `dark:` Tailwind variants live), light → `.ds-light`.
      value={{ dark: 'dark', light: 'ds-light' }}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
