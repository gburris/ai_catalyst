module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react', 'react-hooks'],
  settings: { react: { version: '18' } },
  rules: {
    'no-console': 'error',
    'react/prop-types': 'warn',
    'react/react-in-jsx-scope': 'off',
  },
}
