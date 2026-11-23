import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.IS_DEV !== 'true' ? './' : '/',
  plugins: [tailwindcss(), react()],
  build: {
    outDir: 'build'
  }
});
