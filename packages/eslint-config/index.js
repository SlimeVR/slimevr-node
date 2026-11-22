const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = [
  {
    files: ['**/*.{ts,tsx}'],
    ...js.configs.recommended
  },
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ['**/*.{ts,tsx}']
  }))
];
