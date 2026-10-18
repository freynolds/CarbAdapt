import js from "@eslint/js";
import tseslint from "typescript-eslint";

// Shared lint rules for every workspace package. Lives at the repo root because
// ESLint resolves plugins from the config file's directory. See packages/config.

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "apps/web/next-env.d.ts",
      "**/dist/**",
      "**/coverage/**",
      "design/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["packages/db/scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
  },
);
