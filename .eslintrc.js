module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    'camelcase': 'off',
    'no-useless-escape': 'off',
    'eqeqeq': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'brace-style': 'off'
  },
  globals: {
    process: 'readonly'
  }
}
