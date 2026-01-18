import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v4 Configuration
 *
 * Note: Tailwind v4 uses a CSS-first approach.
 * Theme colors, spacing, and other design tokens are defined in globals.css
 * using @theme inline and CSS custom properties.
 *
 * This file provides additional configuration for:
 * - Content paths (automatic in v4)
 * - Plugins (if needed in future)
 * - Any JavaScript-based configuration
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Use class-based dark mode for next-themes compatibility
  theme: {
    extend: {
      // Extended theme configuration
      // CSS variables are defined in globals.css and exposed via @theme inline
    },
  },
  plugins: [],
};

export default config;
