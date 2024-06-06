module.exports = {
  root: true,
  extends: ['@slimevr/eslint-config'],
  parserOptions: {
    project: [
      './packages/*/tsconfig.esm.json',
      './apps/*/tsconfig.json',
      './apps/firmware-protocol-debugger-gui/backend/tsconfig.json'
    ]
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }
    ]
  }
};
