import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { isAbsolute } from 'node:path';

const privatePackages = [];

export default {
  input: './src/index.mts',
  output: {
    file: 'dist/app.mjs',
    format: 'esm',
    sourcemap: true,
    banner: '#!/usr/bin/env node'
  },
  plugins: [resolve(), commonjs(), typescript()],
  external: (source, importer) => {
    if (privatePackages.includes(source)) return false;

    if (source.includes('node_modules')) return true;

    if (source.startsWith('./') || source.startsWith('../') || isAbsolute(source)) {
      return false;
    }

    return true;
  }
};
