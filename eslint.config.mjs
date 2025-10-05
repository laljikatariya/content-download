import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Base Next.js + TypeScript rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Ignore build and output directories
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  // --- Overrides for backend API ---
  {
    files: ["src/app/api/resolve/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",     // allow any types
      "@typescript-eslint/ban-ts-comment": "off",     // allow @ts-ignore / @ts-expect-error
      "@typescript-eslint/no-unused-vars": "off",     // ignore unused variables
      "prefer-const": "off",                          // allow let where never reassigned
    },
  },

  // --- Overrides for frontend page ---
  {
    files: ["src/app/page.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",    // ignore unused functions/vars
      "@next/next/no-img-element": "off",           // allow <img> tags
    },
  },
];

export default eslintConfig;
