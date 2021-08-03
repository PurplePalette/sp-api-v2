module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json']
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    'no-extra-parens': 1,
    'no-multi-spaces': 2,
    'no-multiple-empty-lines': [2, { max: 1 }],
    'func-call-spacing': [2, 'never'],
    'no-unneeded-ternary': 2,
    semi: [2, 'never'],
    quotes: [2, 'single'],
    'no-var': 2,
    indent: [2, 2],
    'space-in-parens': [2, 'never'],
    'no-console': 0,
    'comma-spacing': 2,
    'computed-property-spacing': 2,
    'key-spacing': 2,
    'keyword-spacing': 2
  },
}