import slimevrConfig from '@slimevr/eslint-config';
import { globalIgnores } from 'eslint/config';

export default [
  globalIgnores([
    '**/*.d.ts',
    '.eslintrc.js',
    'packages/eslint-config/index.js',
    '**/node_modules/**',
    '**/build/**',
    '**/coverage/**',
    '**/dist/**',
    '**/.turbo/**',
    'packages/*/dist/**',
    'apps/*/dist/**',
    'packages/*/build/**',
    'apps/*/build/**'
  ]),
  ...slimevrConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: [
          './packages/*/tsconfig.esm.json',
          './apps/*/tsconfig.json',
          './apps/firmware-protocol-debugger-gui/backend/tsconfig.json',
          './apps/update-config-generator/tsconfig.app.json',
          './apps/update-config-generator/tsconfig.node.json'
        ]
      }
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
  }
];
