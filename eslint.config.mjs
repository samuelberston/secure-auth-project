// eslint.config.js
import globals from "globals";
import pluginJs from "@eslint/js";
import pluginSecurity from 'eslint-plugin-security';

export default [
  // Backend Configuration: CommonJS
  {
    files: ["backend/**/*.js", "**/*.cjs"], // Adjust paths as needed
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
    plugins: {
      security: pluginSecurity,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginSecurity.configs.recommended.rules,
    },
  },
  
  // Frontend Configuration: ES Modules
  {
    files: ["frontend/**/*.js", "**/*.mjs"], // Adjust paths and extensions as needed
    languageOptions: {
      sourceType: "module",
      globals: globals.browser,
    },
    plugins: {
      security: pluginSecurity,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginSecurity.configs.recommended.rules,
    },
  },
  
  // Optional: Additional Global Configuration
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: {
      ecmaVersion: 2021, // or your preferred ECMAScript version
      sourceType: "module", // Default to module; can be overridden by specific configurations
    },
    plugins: {
      security: pluginSecurity,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginSecurity.configs.recommended.rules,
    },
  },
];
