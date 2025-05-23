// vite.config.js
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import glob from 'glob'; // Import the default export from glob
import { fileURLToPath } from 'url'; // Needed for __dirname in ES modules

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

// Automatically find all HTML files in src/pages
// Use glob.sync as the method for synchronous globbing
const pageEntryPoints = glob.sync('src/pages/**/*.html').reduce((acc, file) => {
  // Create an entry name that preserves the directory structure relative to 'src'
  // e.g., src/pages/dirac_propagator/index.html -> pages/dirac_propagator/index
  const entryName = file.replace('src/', '').replace('.html', '');
  acc[entryName] = resolve(__dirname, file);
  return acc;
}, {});

export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          ...pageEntryPoints
        }
      }
    }
  };

  if (command === 'build') {
    config.base = '/tgdmemory/';
  }
  return config;
});
