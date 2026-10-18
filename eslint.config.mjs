import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "next-env.d.ts",
      "public/**",
      ".tmp-*/**",
      ".tmp-ref/**",
      ".tmp-tool-test/**",
      ".phase1-refs/**",
      "node_modules/**",
      "**/*.min.js",
      "**/engine-bundle.mjs",
      "scripts/**/*.mjs",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
