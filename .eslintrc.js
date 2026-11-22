module.exports = {
  root: true,
  extends: ['@slimevr/eslint-config'],
  parserOptions: {
    project: [
      './packages/*/tsconfig.esm.json',
      './apps/*/tsconfig.json',
      './apps/firmware-protocol-debugger-gui/backend/tsconfig.json',
      './apps/update-config-generator/tsconfig.app.json',
      './apps/update-config-generator/tsconfig.node.json'
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
