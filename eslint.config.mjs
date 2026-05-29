import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Allow setState in useEffect for hydration-safe patterns (e.g., useMounted hook)
      // This is the recommended pattern for next-themes and similar libraries
      "react-hooks/set-state-in-effect": "off",
      // React Compiler rules downgraded to warnings: they flag intentional
      // patterns (the DnD DragOverlay reads a ref during render to preserve drag
      // type across the clear re-render) and manual useMemo the compiler can't
      // preserve. Kept visible as warnings rather than blocking errors until the
      // redesign settles the component layer.
      "react-hooks/refs": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Design reference mockups: standalone JSX artifacts for the redesign, not
    // app source (not imported by src/, not in the build). Excluded from lint.
    "design/**",
  ]),
]);

export default eslintConfig;
