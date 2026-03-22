/**
 * Role Color Utilities
 *
 * Maps RoleColor type values to CSS custom properties.
 * Colors are defined as hex values in globals.css with RGB component
 * variants (--role-N-rgb) for opacity modifiers.
 */

import type { RoleColor } from "@/types";

/**
 * Mapping from RoleColor type to CSS variable number.
 * Based on the color palette in globals.css:
 * - role-1: teal
 * - role-2: violet
 * - role-3: amber
 * - role-4: sky
 * - role-5: rose
 * - role-6: emerald
 * - role-7: orange
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
 * Returns the hex color value from the CSS variable.
 *
 * @param color - The RoleColor value
 * @returns CSS color value string (e.g., "var(--role-1)")
 */
export function getRoleColorStyle(color: RoleColor): string {
  const index = COLOR_TO_INDEX[color];
  return `var(--role-${index})`;
}

/**
 * Get a CSS variable string with opacity for inline background styles.
 * Uses the RGB component CSS variables for rgba() construction.
 *
 * @param color - The RoleColor value
 * @param opacity - Opacity value between 0 and 1 (e.g., 0.2)
 * @returns CSS color value string with opacity (e.g., "rgba(var(--role-1-rgb), 0.2)")
 */
export function getRoleColorStyleWithOpacity(color: RoleColor, opacity: number): string {
  const index = COLOR_TO_INDEX[color];
  return `rgba(var(--role-${index}-rgb), ${opacity})`;
}
