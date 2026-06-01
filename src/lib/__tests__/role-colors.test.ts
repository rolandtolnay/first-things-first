import { describe, expect, it } from "vitest";

import type { RoleColor } from "@/types";
import {
  getRoleColorClass,
  getRoleColorIndex,
  getRoleColorStyle,
  getRoleColorStyleWithOpacity,
  getNextRoleColor,
  ROLE_COLOR_OPTIONS,
} from "@/lib/role-colors";

describe("role color palette", () => {
  it("exposes exactly nine selectable Role colors", () => {
    expect(ROLE_COLOR_OPTIONS).toHaveLength(9);
  });

  it("maps every supported Role color to a CSS role slot", () => {
    const indexes = ROLE_COLOR_OPTIONS.map((option) => getRoleColorIndex(option.value));

    expect(indexes).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const option of ROLE_COLOR_OPTIONS) {
      const index = getRoleColorIndex(option.value);
      expect(getRoleColorClass(option.value)).toBe(`bg-role-${index}`);
      expect(getRoleColorStyle(option.value)).toBe(`var(--role-${index})`);
      expect(getRoleColorStyleWithOpacity(option.value, 0.2)).toBe(
        `color-mix(in oklab, var(--role-${index}), transparent 80%)`,
      );
    }
  });

  it("chooses the first unused color in curated order for a new Role", () => {
    expect(getNextRoleColor([
      { color: "teal" },
      { color: "rose" },
    ])).toBe("violet");
  });

  it("cycles through the curated order after all nine colors are used", () => {
    const allColorsUsed = ROLE_COLOR_OPTIONS.map((option) => ({ color: option.value }));
    const tenthRoleExistingColors = [
      ...allColorsUsed,
      { color: "teal" as RoleColor },
    ];

    expect(getNextRoleColor(allColorsUsed)).toBe("teal");
    expect(getNextRoleColor(tenthRoleExistingColors)).toBe("violet");
  });

  it("ignores duplicate existing colors when finding the first unused color", () => {
    expect(getNextRoleColor([
      { color: "teal" },
      { color: "teal" },
      { color: "violet" },
    ])).toBe("orange");
  });
});
