export default [
  {
    ignores: ["functions/**"],
  },
  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      "max-len": "off", // Disable max-len rule
      "arrow-parens": "off", // Disable arrow-parens rule
      "object-curly-spacing": "off", // Disable object-curly-spacing rule
      "@typescript-eslint/no-explicit-any": "off" // Disable no-explicit-any rule
    },
  },
];
