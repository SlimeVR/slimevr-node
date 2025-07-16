import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { isAbsolute } from 'node:path';

const privatePackages = ['@slimevr/firmware-protocol-debugger-shared', '@slimevr/firmware-protocol-debugger-utils'];

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/app.js',
    format: 'esm',
    sourcemap: true,
    banner: '#!/usr/bin/env node'
  },
  plugins: [resolve(), typescript()],
  external: (source, importer) => {
    if (privatePackages.includes(source)) return false;

    if (source.includes('node_modules')) return true;

    if (source.startsWith('./') || source.startsWith('../') || isAbsolute(source)) {
      return false;
    }

    return true;
  }
};
