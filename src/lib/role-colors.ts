/**
 * Role Color Utilities
 *
 * Maps RoleColor type values to Tailwind CSS classes.
 * The CSS variables in globals.css use --role-1 through --role-8 naming,
 * and the @theme inline block defines --color-role-N for Tailwind utilities.
 */

import type { RoleColor } from "@/types";

/**
 * Mapping from RoleColor type to CSS variable number.
 * Based on the color palette in globals.css:
 * - role-1: teal
 * - role-2: violet
 * - role-3: orange
 * - role-4: cyan (maps from "sky")
 * - role-5: rose
 * - role-6: green (maps from "emerald")
 * - role-7: amber
 * - role-8: slate (maps from "fuchsia" - fallback)
 */
const COLOR_TO_INDEX: Record<RoleColor, number> = {
  teal: 1,
  violet: 2,
  orange: 3,
  sky: 4,
  rose: 5,
  emerald: 6,
  amber: 7,
  fuchsia: 8,
};

/**
 * Get the Tailwind background class for a role color.
 * Returns a class like "bg-role-1" that works with the theme system.
 *
 * @param color - The RoleColor value
 * @returns Tailwind class string (e.g., "bg-role-1")
 */
export function getRoleColorClass(color: RoleColor): string {
  const index = COLOR_TO_INDEX[color];
  return `bg-role-${index}`;
}

/**
 * Get the role color index for use with other Tailwind utilities.
 * This allows creating classes like "text-role-1", "border-role-1", etc.
 *
 * @param color - The RoleColor value
 * @returns The role index number (1-8)
 */
export function getRoleColorIndex(color: RoleColor): number {
  return COLOR_TO_INDEX[color];
}

/**
 * Get a CSS variable string for inline styles.
 * Useful for cases where Tailwind classes can't be used dynamically.
 *
 * @param color - The RoleColor value
 * @returns CSS color value string (e.g., "hsl(var(--role-1))")
 */
export function getRoleColorStyle(color: RoleColor): string {
  const index = COLOR_TO_INDEX[color];
  return `hsl(var(--role-${index}))`;
}
