import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const ourPackages = ['@slimevr/firmware-protocol-debugger-shared', '@slimevr/firmware-protocol-debugger-utils'];

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/app.js',
    format: 'esm',
    sourcemap: true,
    banner: '#!/usr/bin/env node'
  },
  plugins: [resolve(), typescript()],
  external: [(id) => !ourPackages.includes(id)]
};
