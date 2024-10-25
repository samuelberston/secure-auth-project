import globals from "globals";
import pluginJs from "@eslint/js";
import pluginSecurity from 'eslint-plugin-security';


export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.node }},
  pluginJs.configs.recommended,
  pluginSecurity.configs.recommended
];