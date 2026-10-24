import { fileURLToPath } from "node:url";
import babelParser from "@babel/eslint-parser";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import onlyWarn from "eslint-plugin-only-warn";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          // An absolute path, not the bare name: Babel resolves a name from the
          // project being linted, which may hold another version of it (e.g.
          // Babel 7 brought by the shadcn CLI), breaking this Babel 8 parser.
          // Not the preset function either: the parser sends these options to
          // a worker thread, so they must be serializable.
          presets: [
            fileURLToPath(import.meta.resolve("@babel/preset-typescript")),
          ],
        },
      },
    },
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**"],
  },
];
