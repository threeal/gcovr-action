module.exports = {
  plugins: ["@typescript-eslint"],
  extends: ["plugin:github/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 9,
    project: "tsconfig.json",
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
    node: true,
  },
  ignorePatterns: ["lib/"],
};
