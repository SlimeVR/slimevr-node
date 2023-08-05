import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.IS_DEV !== 'true' ? './' : '/',
  plugins: [react()],
  build: {
    outDir: path.join(__dirname, 'build')
  }
});
