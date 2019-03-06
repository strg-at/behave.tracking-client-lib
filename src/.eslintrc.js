module.exports = {
  "rules": {
  }
}
module.exports = {
  env: {
    browser: true,
  },
  parser: "babel-eslint",
  extends: [
    'standard',
  ],
  // plugins: [
  //   'jest',
  // ],
  // add your custom rules here
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // variable declaration
    'one-var': ["error", "never"],
    'no-var': ["error"],
    // allow async-await
    'generator-star-spacing': 0,
    // allow comma-dangle
    "comma-dangle": ["error", "only-multiline"],
    "camelcase": 0,
  },
}
