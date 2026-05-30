/**
 * Role Color Utilities
 *
 * Maps RoleColor type values to CSS custom properties. Colors are defined as
 * oklch values in globals.css (--role-1..8); opacity modifiers are built with
 * color-mix() since oklch can't be expressed as rgb triplets (ADR-0002).
 */

import type { RoleColor } from "@/types";

/**
 * Maps each RoleColor name to a stable, arbitrary slot index (1-8).
 *
 * The index is just a slot — the rendered HUE is owned entirely by `--role-N`
 * in globals.css and is intentionally decoupled from the stored name (ADR-0002):
 * a role persisted as "teal" may render as a different hue. Do not infer the
 * hue from the name here; globals.css is the single source for what each slot
 * looks like. This map must stay stable to avoid re-hueing persisted weeks.
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
 * Get a CSS color string with opacity for inline background styles.
 * Mixes the role's oklch color with transparent (oklch has no rgb triplet).
 *
 * @param color - The RoleColor value
 * @param opacity - Opacity value between 0 and 1 (e.g., 0.2)
 * @returns CSS color value string (e.g., "color-mix(in oklab, var(--role-1), transparent 80%)")
 */
export function getRoleColorStyleWithOpacity(color: RoleColor, opacity: number): string {
  const index = COLOR_TO_INDEX[color];
  const transparentPct = Math.round((1 - opacity) * 100);
  return `color-mix(in oklab, var(--role-${index}), transparent ${transparentPct}%)`;
}
