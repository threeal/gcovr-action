module.exports = {
  plugins: ["@typescript-eslint", "jest"],
  extends: ["plugin:github/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 9,
    project: "tsconfig.eslint.json",
    sourceType: "module",
  },
  rules: {
    camelcase: "off",
    "i18n-text/no-en": "off",
    "import/no-namespace": "off",
    "no-shadow": "off",
  },
  env: {
    es6: true,
    "jest/globals": true,
    node: true,
  },
  ignorePatterns: ["jest.config.ts", "lib/"],
};
