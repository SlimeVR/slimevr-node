module.exports = {
  extends: ['@slimevr/eslint-config', 'plugin:react/recommended'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/no-unknown-property': ['error', { ignore: ['args', 'position'] }]
  }
};
