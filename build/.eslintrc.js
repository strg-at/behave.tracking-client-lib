module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'standard',
  ],
  // add your custom rules here
  rules: {
    "no-unused-expressions": 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-console': 'off',
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // variable declaration
    'one-var': ["error", "never"],
    'no-var': ["error"],
    // allow comma-dangle
    "comma-dangle": ["error", "only-multiline"],
  }
}
