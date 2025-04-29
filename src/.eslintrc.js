module.exports = {
  "rules": {
  }
}
module.exports = {
  env: {
    browser: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "jest"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended"

  ],
  rules: {
    "@typescript-eslint/member-delimiter-style": ["error", {
      multiline: {
        delimiter: "none",
        requireLast: true,
      },
      singleline: {
        delimiter: "semi",
        requireLast: false,
      },
    }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/ban-ts-ignore": "warn",
  }
}
