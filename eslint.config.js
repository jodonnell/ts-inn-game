import js from "@eslint/js"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    ignores: ["dist", "node_modules"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: true,
        document: true,
        describe: true,
        it: true,
        expect: true,
      },
    },
  },
  {
    files: ["electron/**/*.js"],
    languageOptions: {
      globals: {
        console: true,
        process: true,
        URL: true,
      },
    },
  },
)
